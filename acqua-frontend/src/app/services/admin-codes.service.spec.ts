import { TestBed } from '@angular/core/testing';

import { AdminCodesService } from './admin-codes.service';

describe('AdminCodesService', () =>
{
  let service: AdminCodesService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCodesService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});
