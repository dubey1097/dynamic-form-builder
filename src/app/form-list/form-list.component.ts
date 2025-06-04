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
        });
    }

    private cleanupSubscriptions(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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

    getFieldCount(fields: any[]): number {
        return fields.length;
    }

    logout(): void {
        this.authService.logout();
    }
} 