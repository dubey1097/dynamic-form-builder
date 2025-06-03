import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormService, Form } from '../services/form.service';
import { AuthService, User } from '../services/auth.service';
import { FormPreviewDialogComponent } from '../form-builder/form-preview-dialog/form-preview-dialog.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-form-list',
    templateUrl: './form-list.component.html',
    styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit, OnDestroy, AfterViewInit {
    dataSource: MatTableDataSource<Form> = new MatTableDataSource<Form>([]);
    displayedColumns: string[] = ['name', 'description', 'fields', 'createdAt', 'updatedAt', 'actions'];
    private subscription!: Subscription;
    searchQuery = '';
    sortBy = 'updatedAt';
    sortOrder: 'asc' | 'desc' = 'desc';
    currentUser: User | null = null;

    
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private formService: FormService,
        private dialog: MatDialog,
        private authService: AuthService
    ) {
        this.setupFormSubscription();
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnDestroy(): void {
        this.cleanupSubscriptions();
    }

    private setupFormSubscription(): void {
        this.subscription = this.formService.getForms().subscribe(forms => {
            this.dataSource.data = forms;
            this.applyFilter();
        });
    }

    private cleanupSubscriptions(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    applyFilter(): void {
        let filtered = [...this.dataSource.data];

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(form =>
                form.name.toLowerCase().includes(query) ||
                (form.description && form.description.toLowerCase().includes(query))
            );
        }

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (this.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'fields':
                    comparison = a.fields.length - b.fields.length;
                    break;
            }
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });

        this.dataSource.data = filtered;
    }

    previewForm(form: Form): void {
        this.dialog.open(FormPreviewDialogComponent, {
            width: '500px',
            data: form.fields
        });
    }

    deleteForm(id: string): void {
        if (confirm('Are you sure you want to delete this form?')) {
            this.formService.deleteForm(id);
        }
    }

    duplicateForm(form: Form): void {
        const duplicatedForm: Partial<Form> = {
            name: `${form.name} (Copy)`,
            description: form.description ? `${form.description} (Copy)` : undefined,
            fields: form.fields.map(field => ({ ...field }))
        };

        this.formService.saveForm(duplicatedForm as Form);
    }

    getFieldCount(fields: any[]): number {
        return fields.length;
    }

    logout(): void {
        this.authService.logout();
    }
} 