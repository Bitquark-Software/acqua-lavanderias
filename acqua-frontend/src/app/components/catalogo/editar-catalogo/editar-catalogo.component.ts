/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Catalogo } from 'src/app/dtos/catalogo';

@Component({
  selector: 'app-editar-catalogo',
  templateUrl: './editar-catalogo.component.html',
  styleUrls: ['./editar-catalogo.component.scss'],
})
export class EditarCatalogoComponent {
  catalogo: Catalogo;

  updateCategoriaForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
  ){
    const catalogoId = this.route.snapshot.params['id'];
    this.catalogo = new Catalogo(catalogoId, 'Categoria existente');
    this.updateCategoriaForm = this.fb.group({
      nombre: [this.catalogo.nombre ?? '', Validators.required],
    });
  }

  async updateCategoria(){
    this.toast.success('Categoría actualizada', { icon: '✅' });
  }

  back() {
    this.location.back();
  }

  get nombre(){
    return this.updateCategoriaForm.controls['nombre'];
  }
}
