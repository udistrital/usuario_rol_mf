import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { HistoricoUsuariosMidService } from 'src/app/services/historico-usuarios-mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { environment } from 'src/environments/environment';
import { ModalService } from 'src/app/services/modal.service';

import { Router } from '@angular/router';
import { ImplicitAuthenticationService } from 'src/app/services/implicit-authentication.service';
import { catchError, map, of, forkJoin, switchMap } from 'rxjs';
import * as moment from 'moment';
import 'moment/locale/es';

interface UserData {
  nombre: string;
  documento: string;
  correo: string;
  rol_usuario: string;
  estado: boolean;
  fecha_inicial: string;
  fecha_final: string;
  finalizado: boolean;
}
interface ApiResponse {
  Success: boolean;
  Status: number;
  Message: string;
  Metadata: any;
  Data: UserData[];
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './consulta-usuarios.component.html',
  styleUrls: ['./consulta-usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  @ViewChild('documentoInput') documentInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  formUsuarios!: FormGroup;
  identificacion: string = '';
  nombreCompleto: string = '';
  displayedColumns: string[] = [
    'nombre',
    'documento',
    'correo',
    'rolUsuario',
    'periodo',
    'estado',
    'acciones',
  ];
  dataSource = new MatTableDataSource<UserData>([]);
  sistemaInformacion!: number;
  total!: number;
  opcionesPagina: number[] = [10, 15, 20];
  permisoEdicion: boolean = false;
  permisoConsulta: boolean = false;

  roles: string[] = ['Administrador', 'Usuario Estándar'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly autenticacionService: AutenticacionService,
    private readonly historico_service: HistoricoUsuariosMidService,
    private readonly terceros_service: TercerosService,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly authService: ImplicitAuthenticationService,
    private readonly modalService: ModalService
  ) {}

  ngOnInit() {
    this.authService
      .getRole()
      .then((roles) => {
        this.permisoEdicion = this.authService.PermisoEdicion(roles);
        this.permisoConsulta = this.authService.PermisoConsulta(roles);
        if (!this.permisoEdicion) {
          this.displayedColumns = this.displayedColumns.filter(
            (col) => col !== 'acciones'
          );
        }
      })
      .catch((error) => {
        console.error('Error al obtener los roles del usuario:', error);
      });

    this.formUsuarios = this.fb.group({
      documento: ['', [Validators.required]],
    //  fecha_inicio: ['', [Validators.required]]
    });

    this.formUsuarios.valueChanges.subscribe((value) => {});

    this.sistemaInformacion = environment.SISTEMA_INFORMACION_ID;
    this.PeriodosUsuario(this.sistemaInformacion, this.opcionesPagina[0], 0);
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'Elementos por página';
    this.paginator._intl.nextPageLabel = 'Página siguiente';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';

    this.paginator._intl.getRangeLabel = (
      page: number,
      pageSize: number,
      length: number
    ) => {
      if (length === 0 || pageSize === 0) {
        return `0 de ${length}`;
      }
      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, length);
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };

    this.paginator.page.subscribe(() => {
      const limit = this.paginator.pageSize;
      const offset = this.paginator.pageIndex * limit;
      if (this.formUsuarios.get('documento')?.value) {
        this.BuscarUsuarios(
          limit,
          offset
        );
      } else {
        this.PeriodosUsuario(this.sistemaInformacion, limit, offset);
      }
    });
  }

  onSubmit() {
    if (this.formUsuarios.valid) {
      console.log('Formulario válido:', this.formUsuarios.value);
    } else {
      console.log('Formulario no válido');
    }
  }

  IniciarPaginacion() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.opcionesPagina[0];
  }

  PeriodosUsuario(sistema: number, limit: number, offset: number) {
    this.autenticacionService
      .getPeriodos(
        `rol/periods?query=sistema_informacion:${sistema}&limit=${limit}&offset=${offset}`
      )
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.Success && response.Data && response.Data.length > 0) {
            this.dataSource.data = response.Data;
            this.total = response.Metadata.Count;
            this.changeDetector.detectChanges();
          } else {
            this.modalService.mostrarModal(
              'No se encontraron periodos.',
              'warning',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.modalService.mostrarModal(
            'Ocurrió un error al intentar obtener los periodos. Inténtalo nuevamente.',
            'warning',
            'error'
          );
        },
      });
  }

  BuscarUsuarios(limit: number, offset: number) {
    const input = this.formUsuarios.get("documento")?.value as string
    if (!input) {
      this.modalService.mostrarModal(
        'Por favor, ingresa un dato valido.',
        'warning',
        'error'
      );
      return;
    }
    const esEmail = (dato: string): boolean => dato.includes('@');
    const esDocumento = (dato: string): boolean => /^\d+$/.test(dato);

    const documento$ = esDocumento(input) ? of([input]) : 
      esEmail(input)
      ? this.BuscarDocumentoPorCorreo(input)
      : this.BuscarDocumentoPorNombre(input);

    this.BuscarPorDocumento(documento$, limit, offset);
  }

  BuscarPorDocumento(documento$: any, limit: number, offset: number) {
    documento$
      .pipe(
        switchMap((documentos: string[]) => {
          if (!documentos || documentos.length === 0) {
            return of([]);
          }
          const periods = documentos?.map((documento) => {
            return this.autenticacionService.getPeriodos(
              `rol/user/${documento}/periods?query=sistema_informacion:${this.sistemaInformacion}&limit=${limit}&offset=${offset}`
            ).pipe(
              catchError((error) => {
                const noResp: ApiResponse = {
                  Success: true,
                  Status: 200,
                  Message: "No se encontraron periodos para el documento consultado",
                  Data: [],
                  Metadata: {Count: 0}
                };
                return of(noResp);
              })
            );
          });
          return forkJoin(periods);
        }),
        catchError((error) => {
          console.error('Error en switchMap:', error);
          return of([]); // Retorna array vacío silenciosamente
        })
      )
      .subscribe({
        next: (responses: ApiResponse[]) => {
          if (responses.length === 0) {
            this.modalService.mostrarModal(
              `No se encontraron periodos para el usuario buscado.`,
              'warning',
              'error'
            );
          } else {
            this.total = 0;
            const newData: UserData[] = [];
            responses.forEach((response) => {
              if (response.Success && response.Data.length > 0) {
                newData.push(...response.Data);
                this.total += response.Metadata.Count;
              }
            });
            this.dataSource.data = newData;
            this.changeDetector.detectChanges();
          }
        },
        error: (err: any) => {
          this.modalService.mostrarModal(
            `Ocurrió un error al buscar el documento ingresado. Inténtalo nuevamente.`,
            'warning',
            'error'
          );
        },
      });
  }

  BuscarDocumentoPorNombre(nombre: string) {
    const url = `datos_identificacion?fields=Numero&query=Activo:true,TipoDocumentoId.CodigoAbreviacion:CC,` +
      `TerceroId.NombreCompleto.icontainsall:${nombre.replaceAll(" ", "|")}`
    return this.terceros_service.get(url).pipe(
      map((data: any[]) => {
        if (data.length === 0 || Object.keys(data[0]).length === 0) {
          this.modalService.mostrarModal(
            'No se encontraron datos de la persona buscada.',
            'warning',
            'error'
          );
          return [];
        }
        const docs = data.map((tercero) => tercero?.Numero);
        const docsUnicos = new Set(docs);
        const documentos = [...docsUnicos]
        return documentos
      }),
      catchError((error) => {
        this.modalService.mostrarModal(
          'No se pudo procesar la solicitud.',
          'warning',
          'error'
        );
        return [];
      })
    );
  }

  BuscarDocumentoPorCorreo(email: string) {
    return this.autenticacionService.getEmail(`token/userRol`, email).pipe(
      map((data: any) => {
        if (data?.documento) {
          return [data.documento];
        } else if (data?.System?.Error === 'Usuario no registrado') {
          throw new Error('Usuario no encontrado.');
        } else {
          throw new Error(data?.Message);
        }
      }),
      catchError((error) => {
        this.modalService.mostrarModal(
          'No se pudo procesar la solicitud.',
          'warning',
          'error'
        );
        return of(null);
      })
    )
  }

  EliminarPeriodo(id_periodo: number) {
    this.modalService
      .modalConfirmacion(
        'El periodo del usuario será eliminado',
        'warning',
        '¿Deseas continuar?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.historico_service
            .delete('periodos-rol-usuarios/', id_periodo)
            .subscribe({
              next: (data: any) => {
                this.IniciarPaginacion();
                this.PeriodosUsuario(
                  this.sistemaInformacion,
                  this.opcionesPagina[0],
                  0
                );
                this.modalService.mostrarModal(
                  'El periodo del usuario ha sido eliminado.',
                  'success',
                  'Eliminado'
                );
              },
              error: (err: any) => {
                this.modalService.mostrarModal(
                  'Ocurrio un error al intentar eliminar el periodo del usuario. Intente nuevamente.',
                  'error',
                  'error'
                );
              },
            });
        }
      });
  }

  edit(documento: string, id_periodo: number) {
    this.router.navigate(['/gestion-usuarios/actualizar-usuario'], {
      queryParams: { documento, id_periodo },
    });
  }

  formatFecha(fecha: Date): string {
    return moment(fecha).format('DD [de] MMMM [de] YYYY');
  }
}
