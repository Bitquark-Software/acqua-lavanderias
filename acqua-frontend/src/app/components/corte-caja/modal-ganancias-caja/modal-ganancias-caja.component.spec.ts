import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGananciasCajaComponent } from './modal-ganancias-caja.component';

describe('ModalGananciasCajaComponent', () =>
{
  let component: ModalGananciasCajaComponent;
  let fixture: ComponentFixture<ModalGananciasCajaComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [ModalGananciasCajaComponent],
    });
    fixture = TestBed.createComponent(ModalGananciasCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
