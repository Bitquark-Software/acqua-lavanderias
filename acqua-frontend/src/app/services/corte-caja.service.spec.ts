import { TestBed } from '@angular/core/testing';

import { CorteCajaService } from './corte-caja.service';

describe('CorteCajaService', () =>
{
  let service: CorteCajaService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorteCajaService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});
