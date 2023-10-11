import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDFPreviewComponent } from './pdfpreview.component';

describe('PDFPreviewComponent', () => {
  let component: PDFPreviewComponent;
  let fixture: ComponentFixture<PDFPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PDFPreviewComponent]
    });
    fixture = TestBed.createComponent(PDFPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
