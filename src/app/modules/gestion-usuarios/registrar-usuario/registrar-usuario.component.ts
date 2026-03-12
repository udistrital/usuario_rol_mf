import { AutenticacionService } from './../../../services/autenticacion.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HistoricoUsuariosMidService } from 'src/app/services/historico-usuarios-mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { ModalService } from 'src/app/services/modal.service';
import { esFechaFinValida } from 'src/app/shared/utils/fecha';
import { AlertService } from 'src/app/services/alert.service';

export interface RolRegistro {
  Nombre: string;
  NombreWso2: string;
  Id: number;
}

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.scss'],
})
export class RegistrarUsuarioComponent {
  @ViewChild('documentoInput') documentoInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  roles: RolRegistro[] = [];
  nombreCompleto: string = '';
  identificacion: string = '';
  fechaInicioValue!: Date;
  fechaFinValue!: Date;
  // fecha mínima para el datepicker de fecha fin (día siguiente a fecha inicio)
  fechaFinMinima!: Date;
  loading = false;

  constructor(
    private readonly alertaService: AlertService,
    private readonly historico_service: HistoricoUsuariosMidService,
    private readonly terceros_service: TercerosService,
    private readonly autenticacionService: AutenticacionService,
    private readonly modalService: ModalService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerRoles();
  }

  // al cambiar fecha inicio, recalcula el mínimo de fecha fin y limpia fecha fin
  onFechaInicioChange() {
    if (this.fechaInicioValue) {
      const minFin = new Date(this.fechaInicioValue);
      minFin.setDate(minFin.getDate() + 1);
      this.fechaFinMinima = minFin;
    }
    this.fechaFinValue = null!;
  }

  obtenerRoles(): void {
    this.loading = true;
    this.historico_service.get('roles/').subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.Data)) {
          this.roles = response.Data;
        } else {
          console.error(
            'La respuesta no contiene una propiedad Data que sea un array.'
          );
          this.roles = [];
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al obtener roles:', err);
        this.modalService.mostrarModal(
          'Error al obtener los roles. Por favor, intenta nuevamente.',
          'warning',
          'error'
        );
        this.loading = false;
      },
    });
  }

  crearUsuario(
    documento: string,
    fechaInicio: Date,
    fechaFin: Date,
    rolId: number,
    email: string
  ) {
    if (!esFechaFinValida(fechaInicio, fechaFin)) {
      this.alertaService.showAlert(
        'Atención',
        'La fecha final debe ser posterior a la inicial'
      );
      return;
    }

    const fechaInicioFormato = this.formatDate(fechaInicio);
    const fechaFinFormato = this.formatDate(fechaFin);
    const usuario = { Documento: documento };
    const nombreRol = this.roles.find((r) => r.Id === rolId)?.NombreWso2 || '';

    this.historico_service
      .get(`usuarios?query=documento:${documento}`)
      .subscribe({
        next: (response: any) => {
          if (response?.Data?.length > 0) {
            const usuarioExistente = response.Data[0];
            this.verificarPeriodos(
              usuarioExistente.Id,
              documento,
              fechaInicioFormato,
              fechaFinFormato,
              rolId,
              nombreRol,
              email
            );
          } else {
            this.crearNuevoUsuario(
              usuario,
              fechaInicioFormato,
              fechaFinFormato,
              rolId,
              nombreRol,
              email
            );
          }
        },
        error: () => this.mostrarError('Error al verificar el usuario.'),
        complete: () => (this.loading = false),
      });
  }

  private verificarPeriodos(
    usuarioId: number,
    documento: string,
    fechaInicio: string,
    fechaFin: string,
    rolId: number,
    nombreRol: string,
    email: string
  ) {
    this.historico_service.get(`usuarios/${documento}/periodos`).subscribe({
      next: (response: any) => {
        const periodos = response?.Data || [];

        const periodoVigente = periodos.find((p: any) => {
          return p.RolId.Id === Number(rolId) && p.Finalizado === false;
        });

        if (periodoVigente) {
          this.mostrarError('El usuario ya tiene vigente el rol asignado.');
        } else {
          this.crearPeriodoRol(
            usuarioId,
            fechaInicio,
            fechaFin,
            rolId,
            nombreRol,
            email
          );
        }
      },
      error: () =>
        this.mostrarError('Error al verificar los periodos del usuario.'),
    });
  }

  private crearNuevoUsuario(
    usuario: any,
    fechaInicio: string,
    fechaFin: string,
    rolId: number,
    nombreRol: string,
    email: string
  ) {
    this.historico_service.post('usuarios/', usuario).subscribe({
      next: (response: any) => {
        this.crearPeriodoRol(
          response.Data.Id,
          fechaInicio,
          fechaFin,
          rolId,
          nombreRol,
          email
        );
      },
      error: () => this.mostrarError('Error al crear el usuario.'),
    });
  }

  private crearPeriodoRol(
    usuarioId: number,
    fechaInicio: string,
    fechaFin: string,
    rolId: number,
    nombreRol: string,
    email: string
  ) {
    const periodo = {
      FechaFin: fechaFin,
      FechaInicio: fechaInicio,
      finalizado: false,
      RolId: { Id: rolId },
      UsuarioId: { Id: usuarioId },
    };

    this.historico_service.post('periodos-rol-usuarios/', periodo).subscribe({
      next: () => {
        this.asignarRol(nombreRol, email);
      },
      error: () => this.mostrarError('Error al crear el periodo.'),
    });
  }

  private asignarRol(nombreRol: string, email: string) {
    this.autenticacionService.PostRol('rol/add', nombreRol, email).subscribe({
      next: () => {
        this.modalService.mostrarModal(
          'Rol asignado exitosamente.',
          'success',
          'Creado'
        );
        this.router.navigate(['gestion-usuarios/consulta-usuarios']);
      },
      error: (err: any) => {
        const mensajeWso2 =
          err?.error?.Message || err?.error?.message || err?.message || '';
        const yaExiste =
          mensajeWso2.toLowerCase().includes('role') &&
          (mensajeWso2.toLowerCase().includes('exists') ||
            mensajeWso2.toLowerCase().includes('already') ||
            mensajeWso2.toLowerCase().includes('duplicate'));

        if (yaExiste) {
          this.modalService.mostrarModal(
            'El usuario ya cuenta con este rol asignado en WSO2. El registro fue guardado en el sistema.',
            'warning',
            'Atención'
          );
          this.router.navigate(['gestion-usuarios/consulta-usuarios']);
        } else {
          this.mostrarError('Error al asignar el rol al usuario.');
        }
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private mostrarError(mensaje: string) {
    this.modalService.mostrarModal(mensaje, 'warning', 'error');
    this.loading = false;
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
            this.loading = false;
          } else {
            this.modalService.mostrarModal(
              'No se encontraron datos del usuario con el documento proporcionado.',
              'warning',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.modalService.mostrarModal(
            'No se encontraron datos del usuario ingresado',
            'warning',
            'error'
          );
          this.loading = false;
        },
      });
  }

  BuscarDocumento(documento: string) {
    if (!documento) {
      this.modalService.mostrarModal(
        'Por favor, ingresa un documento válido.',
        'warning',
        'error'
      );
      return;
    }

    this.nombreCompleto = '';
    this.emailInput.nativeElement.value = '';

    this.loading = true;
    this.autenticacionService
      .getDocumento(`token/documentoToken`, documento)
      .subscribe({
        next: (data: any) => {
          if (data && data.documento) {
            this.identificacion = data.documento;
            this.BuscarTercero(this.identificacion);
            this.emailInput.nativeElement.value = data.email;
            this.loading = false;
          } else {
            this.modalService.mostrarModal(
              'No se encontraron datos del documento proporcionado.',
              'warning',
              'error'
            );
            this.loading = false;
          }
        },
        error: (err: any) => {
          this.modalService.mostrarModal(
            'No se encontraron datos del usuario ingresado',
            'warning',
            'error'
          );
          this.loading = false;
        },
      });
  }

  BuscarCorreo(correo: string) {
    if (!correo) {
      this.modalService.mostrarModal(
        'Por favor, ingresa un correo válido.',
        'warning',
        'error'
      );
      return;
    }

    this.nombreCompleto = '';
    this.identificacion = '';

    this.loading = true;
    this.autenticacionService.getEmail(`token/userRol`, correo).subscribe({
      next: (data: any) => {
        if (data && data.documento) {
          this.identificacion = data.documento;
          this.BuscarTercero(this.identificacion);
          this.documentoInput.nativeElement.value = this.identificacion;
          this.loading = false;
        } else {
          this.modalService.mostrarModal(
            'No se encontraron datos asociados al correo proporcionado.',
            'warning',
            'error'
          );
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.modalService.mostrarModal(
          'Error al buscar el correo. Verifica los datos e intenta nuevamente.',
          'warning',
          'error'
        );
        this.loading = false;
      },
    });
  }

  regresar() {
    this.router.navigate(['gestion-usuarios/consulta-usuarios']);
  }

  evitarLetraE(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }
}