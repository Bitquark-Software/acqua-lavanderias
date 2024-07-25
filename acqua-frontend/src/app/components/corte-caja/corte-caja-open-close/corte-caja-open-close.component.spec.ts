import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorteCajaOpenCloseComponent } from './corte-caja-open-close.component';

describe('CorteCajaOpenCloseComponent', () =>
{
  let component: CorteCajaOpenCloseComponent;
  let fixture: ComponentFixture<CorteCajaOpenCloseComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [CorteCajaOpenCloseComponent],
    });
    fixture = TestBed.createComponent(CorteCajaOpenCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
