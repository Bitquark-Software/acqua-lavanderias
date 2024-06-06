import { TestBed } from '@angular/core/testing';
import { CajaStateService } from './caja-state.service';

describe('CajaStateService', () =>
{
  let service: CajaStateService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CajaStateService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});
