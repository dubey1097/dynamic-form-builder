import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormField } from '../../services/form.service';

@Component({
  selector: 'app-form-preview-dialog',
  templateUrl: './form-preview-dialog.component.html',
  styleUrls: ['./form-preview-dialog.component.scss']
})
export class FormPreviewDialogComponent implements OnInit {
  previewForm: FormGroup;
  fields: FormField[];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FormField[]
  ) {
    this.fields = data;
    this.previewForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.fields.forEach((field, index) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }
      this.previewForm.addControl(`field${index}`, this.fb.control('', validators));
    });
  }

  onSubmit(): void {
    if (this.previewForm.valid) {
      const formData: { [key: string]: any } = {};
      this.fields.forEach((field, index) => {
        formData[field.label] = this.previewForm.get(`field${index}`)?.value;
      });
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
