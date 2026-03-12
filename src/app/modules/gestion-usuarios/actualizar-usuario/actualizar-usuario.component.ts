import { AutenticacionService } from './../../../services/autenticacion.service';
import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HistoricoUsuariosMidService } from 'src/app/services/historico-usuarios-mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { ModalService } from 'src/app/services/modal.service';

import { ImplicitAuthenticationService } from 'src/app/services/implicit-authentication.service';
import { esFechaFinValida } from 'src/app/shared/utils/fecha';
import { AlertService } from 'src/app/services/alert.service';

export interface RolRegistro {
  Nombre: string;
  NombreWso2: string;
  Id: number;
}

@Component({
  selector: 'app-actualizar-usuario',
  templateUrl: './actualizar-usuario.component.html',
  styleUrls: ['./actualizar-usuario.component.scss'],
})
export class ActualizarUsuarioComponent {
  loading = false;
  @ViewChild('documentoInput') documentoInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('rolInput') rolInput!: ElementRef;

  roles: RolRegistro[] = [];
  nombreCompleto: string = '';
  identificacion: string = '';
  fechaInicioRol: Date | null = null;
  fechaFinRol: Date | null = null;
  nombreRol!: string;
  email!: string;
  idPeriodo!: number;
  idRol!: number;
  usuarioId!: number;
  estadoPeriodo: string = '';
  permisoEdicion: boolean = false;
  permisoConsulta: boolean = false;
  // fecha mínima para el datepicker de fecha fin
  fechaFinMinima!: Date;

  constructor(
    private readonly alertaService: AlertService,
    private readonly historico_service: HistoricoUsuariosMidService,
    private readonly terceros_service: TercerosService,
    private readonly autenticacionService: AutenticacionService,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly authService: ImplicitAuthenticationService,
    private readonly modalService: ModalService,
    private readonly router: Router
  ) {}

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params) => {
      const documento = params['documento'];
      const id_periodo = params['id_periodo'];
      if (documento && id_periodo) {
        this.documentoInput.nativeElement.value = documento;
        this.BuscarDocumento(documento, id_periodo);
        this.changeDetector.detectChanges();
      }
    });

    this.authService
      .getRole()
      .then((roles) => {
        this.permisoEdicion = this.authService.PermisoEdicion(roles);
        this.permisoConsulta = this.authService.PermisoConsulta(roles);
      })
      .catch((error) => {
        console.error('Error al obtener los roles del usuario:', error);
      });
  }

  // fecha fin mínima = fecha inicio + 1 día (sin restricción del día de hoy)
  onFechaInicioChange() {
    if (this.fechaInicioRol) {
      const minFin = new Date(this.fechaInicioRol);
      minFin.setDate(minFin.getDate() + 1);
      this.fechaFinMinima = minFin;
    }
    this.fechaFinRol = null;
  }

  BuscarTercero(documento: string) {
    this.loading = true;
    this.terceros_service
      .get(`tercero/identificacion?query=${documento}`)
      .subscribe({
        next: (data: any) => {
          if (
            data &&
            data.length > 0 &&
            data[0].Tercero &&
            data[0].Tercero.NombreCompleto
          ) {
            this.nombreCompleto = data[0].Tercero.NombreCompleto;
            this.changeDetector.detectChanges();
          } else {
            this.modalService.mostrarModal(
              'Usuario no encontrado.',
              'warning',
              'error'
            );
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.modalService.mostrarModal(
            'Error al buscar usuario.',
            'warning',
            'error'
          );
          this.loading = false;
        },
      });
  }

  BuscarDocumento(documento: string, idPeriodo: number) {
    if (!documento) {
      this.modalService.mostrarModal(
        'Por favor, ingresa un documento válido.',
        'warning',
        'error'
      );
      return;
    }
    this.loading = true;
    this.idPeriodo = idPeriodo;

    this.autenticacionService
      .getDocumento(`token/documentoToken`, documento)
      .subscribe({
        next: (data: any) => {
          if (data && data.documento) {
            this.identificacion = data.documento;
            this.emailInput.nativeElement.value = data.email;
            this.BuscarTercero(this.identificacion);
            this.changeDetector.detectChanges();
            this.InfoPeriodo(idPeriodo);
          } else {
            this.modalService.mostrarModal(
              'Usuario no encontrado.',
              'warning',
              'error'
            );
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.modalService.mostrarModal(
            'Error al buscar el documento.',
            'warning',
            'error'
          );
          this.loading = false;
        },
      });
  }

  InfoPeriodo(idPeriodo: number) {
    this.loading = true;
    this.historico_service.get(`periodos-rol-usuarios/${idPeriodo}`).subscribe({
      next: (data: any) => {
        this.idRol = data.Data.RolId.Id;
        this.fechaInicioRol = new Date(data.Data.FechaInicio + 'T00:00:00');
        this.fechaFinRol = new Date(data.Data.FechaFin + 'T00:00:00');
        this.usuarioId = data.Data.UsuarioId.Id;
        this.nombreRol = data.Data.RolId.NombreWso2;
        this.rolInput.nativeElement.value = data.Data.RolId.Nombre;
        this.email = this.emailInput?.nativeElement?.value || '';
        this.idPeriodo = idPeriodo;
        // fecha mínima = fecha inicio + 1 día
        if (this.fechaInicioRol) {
          const minFin = new Date(this.fechaInicioRol);
          minFin.setDate(minFin.getDate() + 1);
          this.fechaFinMinima = minFin;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el periodo:', err);
        this.modalService.mostrarModal(
          'Error al cargar el periodo.',
          'warning',
          'error'
        );
        this.loading = false;
      },
    });
  }

  ActualizarPeriodo() {
    if (!esFechaFinValida(this.fechaInicioRol, this.fechaFinRol)) {
      this.alertaService.showAlert(
        'Atención',
        'La fecha final debe ser posterior a la inicial'
      );
      return;
    }

    if (this.estadoPeriodo === 'Finalizado') {
      this.autenticacionService
        .PostRol('rol/remove', this.nombreRol, this.email)
        .subscribe({
          next: (response: any) => {
            this.historico_service
              .put(`periodos-rol-usuarios/${this.idPeriodo}`, {
                FechaInicio: this.fechaInicioRol?.toISOString().split('T')[0],
                FechaFin: this.fechaFinRol?.toISOString().split('T')[0],
                Finalizado: true,
                RolId: {
                  Id: this.idRol,
                },
                UsuarioId: {
                  Id: this.usuarioId,
                },
              })
              .subscribe({
                next: (response: any) => {
                  this.loading = false;
                  this.modalService.mostrarModal(
                    'Periodo actualizado exitosamente.',
                    'success',
                    'Actualizado'
                  );
                  this.router.navigate(['gestion-usuarios/consulta-usuarios']);
                },
                error: (err: any) => {
                  console.error('Error al actualizar periodo:', err);
                  this.modalService.mostrarModal(
                    'Error al actualizar el periodo.',
                    'warning',
                    'error'
                  );
                },
                complete: () => (this.loading = false),
              });
          },
          error: (err: any) => {
            console.error('Error al eliminar rol:', err);
            this.modalService.mostrarModal(
              'Error al eliminar el rol.',
              'warning',
              'error'
            );
            this.loading = false;
          },
        });
    } else {
      this.historico_service
        .put(`periodos-rol-usuarios/${this.idPeriodo}`, {
          FechaInicio: this.fechaInicioRol?.toISOString().split('T')[0],
          FechaFin: this.fechaFinRol?.toISOString().split('T')[0],
          Finalizado: false,
          RolId: {
            Id: this.idRol,
          },
          UsuarioId: {
            Id: this.usuarioId,
          },
        })
        .subscribe({
          next: (response: any) => {
            this.modalService.mostrarModal(
              'Periodo actualizado exitosamente.',
              'success',
              'Actualizado'
            );
            this.router.navigate(['gestion-usuarios/consulta-usuarios']);
          },
          error: (err: any) => {
            console.error('Error al actualizar periodo:', err);
            this.modalService.mostrarModal(
              'Error al actualizar el periodo.',
              'warning',
              'error'
            );
          },
          complete: () => (this.loading = false),
        });
    }
  }

  regresar() {
    this.router.navigate(['gestion-usuarios/consulta-usuarios']);
  }

  estados = ['Finalizado'];
}