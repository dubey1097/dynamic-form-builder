import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPreviewDialogComponent } from './form-preview-dialog.component';

describe('FormPreviewDialogComponent', () => {
  let component: FormPreviewDialogComponent;
  let fixture: ComponentFixture<FormPreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormPreviewDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
