import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-nuevo-catalogo',
  templateUrl: './nuevo-catalogo.component.html',
  styleUrls: ['./nuevo-catalogo.component.scss'],
})
export class NuevoCatalogoComponent {
  nuevaCategoriaForm = this.fb.group({
    nombre: ['', [Validators.required]],
  });

  // eslint-disable-next-line no-unused-vars
  constructor(private fb: FormBuilder, private toast: HotToastService) {
    //
  }

  get nombre(){
    return this.nuevaCategoriaForm.controls['nombre'];
  }

  async registrarCategoria(){
    this.toast.success('Categoría registrada', {
      icon: '✅',
    });
  }
}
