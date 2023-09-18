import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPreviewComponent } from './ticket-preview.component';

describe('TicketPreviewComponent', () =>
{
  let component: TicketPreviewComponent;
  let fixture: ComponentFixture<TicketPreviewComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [TicketPreviewComponent],
    });
    fixture = TestBed.createComponent(TicketPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
