import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FieldType {
    type: string;
    label: string;
    icon: string;
}

export interface FormField {
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

export interface Form {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
    createdAt: Date;
    updatedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class FormService {
    private forms = new BehaviorSubject<Form[]>([]);
    private storageKey = 'forms';

    constructor() {
        this.loadForms();
    }

    private loadForms(): void {
        const storedForms = localStorage.getItem(this.storageKey);
        if (storedForms) {
            const parsedForms = JSON.parse(storedForms);
            // Convert string dates back to Date objects
            parsedForms.forEach((form: Form) => {
                form.createdAt = new Date(form.createdAt);
                form.updatedAt = new Date(form.updatedAt);
            });
            this.forms.next(parsedForms);
        }
    }

    private saveForms(forms: Form[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(forms));
        this.forms.next(forms);
    }

    getForms(): Observable<Form[]> {
        return this.forms.asObservable();
    }

    getForm(id: string): Form | undefined {
        return this.forms.value.find(form => form.id === id);
    }

    saveForm(formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): void {
        const forms = this.forms.value;
        const newForm: Form = {
            ...formData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.saveForms([...forms, newForm]);
    }

    updateForm(id: string, formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): void {
        const forms = this.forms.value;
        const index = forms.findIndex(form => form.id === id);
        if (index !== -1) {
            const updatedForm: Form = {
                ...formData,
                id,
                createdAt: forms[index].createdAt,
                updatedAt: new Date()
            };
            forms[index] = updatedForm;
            this.saveForms(forms);
        }
    }

    deleteForm(id: string): void {
        const forms = this.forms.value.filter(form => form.id !== id);
        this.saveForms(forms);
    }
} 