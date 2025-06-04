import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { FormService } from '../services/form.service';
import { FormPreviewDialogComponent } from './form-preview-dialog/form-preview-dialog.component';
import { MatDatepicker } from '@angular/material/datepicker';

interface FieldType {
  type: string;
  label: string;
  icon: string;
}

interface FormField {
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  pattern?: string;
  options?: { value: string }[];
  defaultValue?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  @ViewChild('fieldTypesList') fieldTypesList!: CdkDropList;
  @ViewChild('formCanvasList') formCanvasList!: CdkDropList;
  @ViewChild('minPicker') minPicker!: MatDatepicker<Date>;
  @ViewChild('maxPicker') maxPicker!: MatDatepicker<Date>;

  formName = '';
  formDescription = '';
  formFields: FormField[] = [];
  selectedField: FormField | null = null;
  selectedFieldIndex: number | null = null;
  fieldForm: FormGroup;
  formId: string | null = null;
  
  availableFields: FieldType[] = [
    { type: 'text', label: 'Text Input', icon: 'short_text' },
    { type: 'textarea', label: 'Text Area', icon: 'notes' },
    { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
    { type: 'radio', label: 'Radio Buttons', icon: 'radio_button_checked' },
    { type: 'checkbox', label: 'Checkbox', icon: 'check_box' },
    { type: 'date', label: 'Date Picker', icon: 'calendar_today' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private formService: FormService
  ) {
    this.fieldForm = this.fb.group({
      label: ['', Validators.required],
      placeholder: [''],
      helpText: [''],
      required: [false],
      pattern: [''],
      options: this.fb.array([]),
      defaultValue: [false],
      minDate: [null],
      maxDate: [null]
    });

    this.fieldForm.valueChanges.subscribe(value => {
      this.updateSelectedField(value);
    });
  }

  ngOnInit(): void {
    this.formId = this.route.snapshot.params['id'];
    if (this.formId) {
      const form = this.formService.getForm(this.formId);
      if (form) {
        this.formName = form.name;
        this.formDescription = form.description || '';
        this.formFields = form.fields;
      }
    }
  }

  get optionsArray(): FormArray {
    return this.fieldForm.get('options') as FormArray;
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const fieldType = event.item.data as FieldType;
      
      const getBaseLabel = (type: string): string => {
        switch (type) {
          case 'select':
            return 'Dropdown';
          case 'radio':
            return 'Radio Button';
          case 'checkbox':
            return 'Checkbox';
          default:
            return fieldType.label;
        }
      };

      const existingFieldsCount = this.formFields.filter(field => 
        field.type.type === fieldType.type
      ).length;

      const baseLabel = getBaseLabel(fieldType.type);
      const newField: FormField = {
        type: fieldType,
        label: existingFieldsCount > 0 ? 
          `${baseLabel} ${existingFieldsCount + 1}` : 
          baseLabel,
        required: false
      };

      if (fieldType.type === 'select' || fieldType.type === 'radio') {
        newField.options = [
          { value: 'Option 1' },
          { value: 'Option 2' }
        ];
      }

      this.formFields.splice(event.currentIndex, 0, newField);
      this.selectedFieldIndex = event.currentIndex;
      this.selectedField = newField;
      this.updateFieldForm();
    }
  }

  selectField(index: number): void {
    this.selectedFieldIndex = index;
    this.selectedField = this.formFields[index];
    this.updateFieldForm();
  }

  updateFieldForm(): void {
    if (this.selectedField) {
      this.fieldForm.patchValue({
        label: this.selectedField.label,
        placeholder: this.selectedField.placeholder || '',
        helpText: this.selectedField.helpText || '',
        required: this.selectedField.required,
        pattern: this.selectedField.pattern || '',
        defaultValue: this.selectedField.defaultValue || false,
        minDate: this.selectedField.minDate || null,
        maxDate: this.selectedField.maxDate || null
      });

      if ((this.selectedField.type.type === 'select' || this.selectedField.type.type === 'radio')) {
        if (!this.selectedField.options || this.selectedField.options.length === 0) {
          this.selectedField.options = [{ value: '' }];
        }
        this.optionsArray.clear();
        this.selectedField.options.forEach(option => {
          this.optionsArray.push(this.fb.group({ value: option.value }));
        });
      }
    }
  }

  moveField(index: number, direction: number): void {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.formFields.length) {
      moveItemInArray(this.formFields, index, newIndex);
      if (this.selectedFieldIndex === index) {
        this.selectedFieldIndex = newIndex;
      }
    }
  }

  removeField(index: number): void {
    this.formFields.splice(index, 1);
    if (this.selectedFieldIndex === index) {
      this.selectedFieldIndex = null;
      this.selectedField = null;
    }
  }

  addOption(): void {
    this.optionsArray.push(this.fb.group({ value: '' }));
    if (this.selectedField && (this.selectedField.type.type === 'select' || this.selectedField.type.type === 'radio')) {
      this.selectedField.options = this.optionsArray.controls.map(control => ({
        value: control.get('value')?.value || ''
      }));
    }
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
    if (this.selectedField && (this.selectedField.type.type === 'select' || this.selectedField.type.type === 'radio')) {
      this.selectedField.options = this.optionsArray.controls.map(control => ({
        value: control.get('value')?.value || ''
      }));
    }
  }

  previewForm(): void {
    this.dialog.open(FormPreviewDialogComponent, {
      width: '500px',
      data: this.formFields
    });
  }

  saveForm(): void {
    if (!this.formName) {
      alert('Please enter a form name');
      return;
    }

    const cleanedFields = this.formFields.map(field => {
      if (field.type.type === 'select' || field.type.type === 'radio') {
        return {
          ...field,
          options: field.options?.filter(opt => opt.value.trim() !== '') || []
        };
      }
      return field;
    });

    const form = {
      name: this.formName,
      description: this.formDescription,
      fields: cleanedFields
    };

    if (!this.formId) {
      this.formService.saveForm(form);
    } else {
      this.formService.updateForm(this.formId, form);
    }
    
    this.router.navigate(['/forms']);
  }

  updateSelectedField(value: any): void {
    if (this.selectedField && this.selectedFieldIndex !== null) {
      this.selectedField.label = value.label;
      this.selectedField.placeholder = value.placeholder;
      this.selectedField.helpText = value.helpText;
      this.selectedField.required = value.required;
      this.selectedField.pattern = value.pattern;
      this.selectedField.defaultValue = value.defaultValue;
      this.selectedField.minDate = value.minDate;
      this.selectedField.maxDate = value.maxDate;

      if (this.selectedField.type.type === 'select' || this.selectedField.type.type === 'radio') {
        if (value.options) {
          this.selectedField.options = value.options.map((opt: { value: string }) => ({
            value: opt.value
          }));
        } else {
          this.selectedField.options = [{ value: '' }];
        }
      } else {
        delete this.selectedField.options;
      }

      this.formFields[this.selectedFieldIndex] = { ...this.selectedField };
    }
  }
}
