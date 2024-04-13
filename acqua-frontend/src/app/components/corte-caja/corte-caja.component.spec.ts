import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorteCajaComponent } from './corte-caja.component';

describe('CorteCajaComponent', () =>
{
  let component: CorteCajaComponent;
  let fixture: ComponentFixture<CorteCajaComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [CorteCajaComponent],
    });
    fixture = TestBed.createComponent(CorteCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
