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
import { environment } from 'src/environments/environment';
import { ModalService } from 'src/app/services/modal.service';

import { Router } from '@angular/router';
import { ImplicitAuthenticationService } from 'src/app/services/implicit-authentication.service';
import { catchError, map, of, switchMap } from 'rxjs';
import * as moment from 'moment';
import 'moment/locale/es';
import * as XLSX from 'xlsx-js-style';

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
  @ViewChild('documentoInput') documentoInput!: ElementRef;
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
  // bandera para saber si hay una búsqueda activa
  hayBusquedaActiva: boolean = false;

  roles: string[] = ['Administrador', 'Usuario Estándar'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly autenticacionService: AutenticacionService,
    private readonly historico_service: HistoricoUsuariosMidService,
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
    });

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
      if (this.hayBusquedaActiva && this.formUsuarios.get('documento')?.value) {
        this.BuscarDocumento(
          this.formUsuarios.get('documento')?.value,
          limit,
          offset
        );
      } else {
        this.PeriodosUsuario(this.sistemaInformacion, limit, offset);
      }
    });
  }

  IniciarPaginacion() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.opcionesPagina[0];
  }

  // limpiar búsqueda y regresar al listado completo
  LimpiarBusqueda() {
    this.formUsuarios.get('documento')?.setValue('');
    this.hayBusquedaActiva = false;
    this.IniciarPaginacion();
    this.PeriodosUsuario(this.sistemaInformacion, this.opcionesPagina[0], 0);
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

  BuscarDocumento(input: string, limit: number, offset: number) {
    if (!input) {
      this.modalService.mostrarModal(
        'Por favor, ingresa un dato valido.',
        'warning',
        'error'
      );
      return;
    }

    // marcar búsqueda activa
    this.hayBusquedaActiva = true;

    const esEmail = (dato: string): boolean => dato.includes('@');

    const documento$ = esEmail(input)
      ? this.autenticacionService.getEmail(`token/userRol`, input).pipe(
          map((data: any) => {
            if (data?.documento) {
              return data.documento;
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
      : of(input);

    documento$
      .pipe(
        switchMap((documento: string | null) => {
          if (!documento) {
            return of(null);
          }
          return this.autenticacionService.getPeriodos(
            `rol/user/${documento}/periods?query=sistema_informacion:${this.sistemaInformacion}&limit=${limit}&offset=${offset}`
          );
        })
      )
      .subscribe({
        next: (response: ApiResponse | null) => {
          if (!response) return;
          if (response.Success && response.Data.length > 0) {
            this.dataSource.data = response.Data;
            this.total = response.Metadata.Count;
            this.changeDetector.detectChanges();
          } else {
            this.modalService.mostrarModal(
              `No se encontraron periodos para el documento ingresado.`,
              'warning',
              'error'
            );
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

  //botón para ir a registro de usuario
  irARegistro() {
    this.router.navigate(['gestion-usuarios/registrar-usuario']);
  }

  // Descarga el histórico completo de usuarios desde el MID y genera el Excel en el cliente
  // con la misma plantilla visual del endpoint del back (colores, filas alternas, estilos)
  descargarHistorico() {
    this.autenticacionService
      .getPeriodos(
        `rol/periods?query=sistema_informacion:${this.sistemaInformacion}&limit=99999&offset=0`
      )
      .subscribe({
        next: (response: ApiResponse) => {
          if (!response.Success || !response.Data || response.Data.length === 0) {
            this.modalService.mostrarModal(
              'No hay datos para descargar.',
              'warning',
              'Atención'
            );
            return;
          }

          const datos = response.Data;
          const wb = XLSX.utils.book_new();
          const ws: XLSX.WorkSheet = {};

          const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          const headers = [
            'Nombre', 'Documento', 'Correo',
            'Rol Usuario', 'Fecha Inicio', 'Fecha Fin', 'Estado'
          ];

          // --- Estilos reutilizables ---
          const tituloStyle = {
            font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' }, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: '1F4E79' } },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
          const subtituloStyle = {
            font: { italic: true, sz: 10, color: { rgb: '595959' }, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: 'D6E4F0' } },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
          const headerStyle = {
            font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' }, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: '2E75B6' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              left:   { style: 'thin', color: { rgb: 'FFFFFF' } },
              right:  { style: 'thin', color: { rgb: 'FFFFFF' } },
              bottom: { style: 'medium', color: { rgb: 'FFFFFF' } },
            },
          };
          const filaPar = {
            font: { sz: 10, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: 'DEEAF1' } },
            alignment: { vertical: 'center' },
            border: {
              left:   { style: 'thin', color: { rgb: 'BDD7EE' } },
              right:  { style: 'thin', color: { rgb: 'BDD7EE' } },
              bottom: { style: 'thin', color: { rgb: 'BDD7EE' } },
            },
          };
          const filaImpar = {
            font: { sz: 10, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
            alignment: { vertical: 'center' },
            border: {
              left:   { style: 'thin', color: { rgb: 'BDD7EE' } },
              right:  { style: 'thin', color: { rgb: 'BDD7EE' } },
              bottom: { style: 'thin', color: { rgb: 'BDD7EE' } },
            },
          };
          const vigenteStyle = {
            font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: '70AD47' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              left:   { style: 'thin', color: { rgb: 'BDD7EE' } },
              right:  { style: 'thin', color: { rgb: 'BDD7EE' } },
              bottom: { style: 'thin', color: { rgb: 'BDD7EE' } },
            },
          };
          const finalizadoStyle = {
            font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: 'C00000' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              left:   { style: 'thin', color: { rgb: 'BDD7EE' } },
              right:  { style: 'thin', color: { rgb: 'BDD7EE' } },
              bottom: { style: 'thin', color: { rgb: 'BDD7EE' } },
            },
          };
          const totalStyle = {
            font: { bold: true, sz: 10, color: { rgb: '1F4E79' }, name: 'Arial' },
            fill: { patternType: 'solid', fgColor: { rgb: 'BDD7EE' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: 'medium', color: { rgb: '2E75B6' } } },
          };

          const setCell = (addr: string, value: any, style: any) => {
            ws[addr] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style };
          };

          // --- Fila 1: Título mergeado A1:G1 ---
          setCell('A1', 'Histórico de Usuarios - SISIFO - Universidad Distrital', tituloStyle);
          cols.slice(1).forEach(c => { ws[`${c}1`] = { v: '', t: 's', s: tituloStyle }; });

          // --- Fila 2: Subtítulo mergeado A2:G2 ---
          const ahora = moment().format('DD/MM/YYYY HH:mm:ss');
          setCell('A2', `Generado el: ${ahora}   |   Total de registros: ${datos.length}`, subtituloStyle);
          cols.slice(1).forEach(c => { ws[`${c}2`] = { v: '', t: 's', s: subtituloStyle }; });

          // --- Fila 3: espacio visual ---
          cols.forEach(c => { ws[`${c}3`] = { v: '', t: 's' }; });

          // --- Fila 4: Encabezados ---
          headers.forEach((h, i) => {
            setCell(`${cols[i]}4`, h, headerStyle);
          });

          // --- Filas de datos desde fila 5 ---
          datos.forEach((u: any, i: number) => {
            const rowNum = i + 5;
            const estilo = i % 2 === 0 ? filaPar : filaImpar;
            const finalizado = u.finalizado;
            const estadoLabel = finalizado ? 'Finalizado' : 'Vigente';
            const estadoStyle = finalizado ? finalizadoStyle : vigenteStyle;

            setCell(`A${rowNum}`, u.nombre || '', estilo);
            setCell(`B${rowNum}`, u.documento || '', estilo);
            setCell(`C${rowNum}`, u.correo || '', estilo);
            setCell(`D${rowNum}`, u.rol_usuario || '', estilo);
            setCell(`E${rowNum}`, u.fecha_inicial ? moment(u.fecha_inicial).format('DD/MM/YYYY') : '', estilo);
            setCell(`F${rowNum}`, u.fecha_final  ? moment(u.fecha_final).format('DD/MM/YYYY')  : '', estilo);
            setCell(`G${rowNum}`, estadoLabel, estadoStyle);
          });

          // --- Fila de totales ---
          const totalRow = datos.length + 5;
          setCell(`A${totalRow}`, 'Total de registros', totalStyle);
          ['B', 'C', 'D', 'E', 'F'].forEach(c => {
            ws[`${c}${totalRow}`] = { v: '', t: 's', s: totalStyle };
          });
          setCell(`G${totalRow}`, datos.length, totalStyle);

          // --- Merges: título, subtítulo ---
          ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Fila 1
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Fila 2
            { s: { r: totalRow - 1, c: 0 }, e: { r: totalRow - 1, c: 5 } }, // Total label
          ];

          // --- Anchos de columna ---
          ws['!cols'] = [
            { wch: 35 }, // Nombre
            { wch: 15 }, // Documento
            { wch: 35 }, // Correo
            { wch: 20 }, // Rol Usuario
            { wch: 15 }, // Fecha Inicio
            { wch: 15 }, // Fecha Fin
            { wch: 14 }, // Estado
          ];

          // --- Alturas de fila ---
          ws['!rows'] = [
            { hpt: 32 },  // Fila 1 título
            { hpt: 20 },  // Fila 2 subtítulo
            { hpt: 6 },   // Fila 3 espacio
            { hpt: 24 },  // Fila 4 encabezados
            ...datos.map(() => ({ hpt: 18 })),
            { hpt: 22 },  // Fila totales
          ];

          // --- Freeze pane desde fila 5 ---
          ws['!freeze'] = { xSplit: 0, ySplit: 4, topLeftCell: 'A5' } as any;

          // --- Rango de la hoja ---
          ws['!ref'] = `A1:G${totalRow}`;

          XLSX.utils.book_append_sheet(wb, ws, 'Histórico Usuarios');

          const nombreArchivo = `historico_usuarios_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
          XLSX.writeFile(wb, nombreArchivo);
        },
        error: () => {
          this.modalService.mostrarModal(
            'Error al generar el histórico. Inténtalo nuevamente.',
            'warning',
            'error'
          );
        },
      });
  }

  formatFecha(fecha: Date): string {
    return moment(fecha).format('DD [de] MMMM [de] YYYY');
  }
}