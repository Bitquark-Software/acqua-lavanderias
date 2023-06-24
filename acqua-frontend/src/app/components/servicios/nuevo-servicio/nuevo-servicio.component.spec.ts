import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoServicioComponent } from './nuevo-servicio.component';

describe('NuevoServicioComponent', () =>
{
  let component: NuevoServicioComponent;
  let fixture: ComponentFixture<NuevoServicioComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [NuevoServicioComponent],
    });
    fixture = TestBed.createComponent(NuevoServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
