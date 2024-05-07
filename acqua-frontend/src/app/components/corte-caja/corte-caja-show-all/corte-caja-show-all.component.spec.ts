import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorteCajaShowAllComponent } from './corte-caja-show-all.component';

describe('CorteCajaShowAllComponent', () =>
{
  let component: CorteCajaShowAllComponent;
  let fixture: ComponentFixture<CorteCajaShowAllComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [CorteCajaShowAllComponent],
    });
    fixture = TestBed.createComponent(CorteCajaShowAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
