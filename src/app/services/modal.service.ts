import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() { }

  mostrarModal(
    mensaje: string, 
    icono: 'success' | 'error' | 'warning' | 'info', 
    titulo: string): void {
    Swal.fire({
      title: titulo.toUpperCase(),
      text: mensaje,
      icon: icono,
      confirmButtonText: 'OK',
      confirmButtonColor: 'rgb(100, 21, 21)',
    });
  }

  modalConfirmacion(
    mensaje: string, 
    icono: 'success' | 'error' | 'warning' | 'info', 
    titulo: string): Promise<any> {
    return Swal.fire({
      title: titulo.toUpperCase(),
      text: mensaje,
      icon: icono,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: 'rgb(100, 21, 21)',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: 'rgb(100, 21, 21)',
    });  
  }

  showAlert(title: string, text: string) {
    Swal.fire({
      icon: "info",
      title: title,
      text: text,
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "alertaConfirmarBoton",
        cancelButton: "alertaCancelarBoton",
        icon: "alertaIconoWarn",
      },
    });
  }

  showSuccessAlert(text: string, title: string = "Operación exitosa") {
    Swal.fire({
      icon: "success",
      title: title,
      text: text,
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "alertaConfirmarBoton",
        cancelButton: "alertaCancelarBoton",
        icon: "alertaIconoSuccess",
      },
    });
  }

  showErrorAlert(text: string) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: text,
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "alertaConfirmarBoton",
        cancelButton: "alertaCancelarBoton",
      },
    });
  }

  showConfirmAlert(text: string, title: string = "Atención"): Promise<any> {
    return Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "alertaConfirmarBoton",
        cancelButton: "alertaCancelarBoton",
        icon: "alertaIconoConfirmacion",
      },
    });
  }
}
