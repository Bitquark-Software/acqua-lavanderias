import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerServiciosComponent } from './ver-servicios.component';

describe('VerServiciosComponent', () => {
  let component: VerServiciosComponent;
  let fixture: ComponentFixture<VerServiciosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerServiciosComponent],
    });
    fixture = TestBed.createComponent(VerServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
