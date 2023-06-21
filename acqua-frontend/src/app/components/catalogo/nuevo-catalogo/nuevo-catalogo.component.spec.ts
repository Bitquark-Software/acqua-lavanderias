import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoCatalogoComponent } from './nuevo-catalogo.component';

describe('NuevoCatalogoComponent', () => {
  let component: NuevoCatalogoComponent;
  let fixture: ComponentFixture<NuevoCatalogoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevoCatalogoComponent],
    });
    fixture = TestBed.createComponent(NuevoCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
