import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarDireccionComponent } from './modal-agregar-direccion.component';

describe('ModalAgregarDireccionComponent', () =>
{
  let component: ModalAgregarDireccionComponent;
  let fixture: ComponentFixture<ModalAgregarDireccionComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [ModalAgregarDireccionComponent],
    });
    fixture = TestBed.createComponent(ModalAgregarDireccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
