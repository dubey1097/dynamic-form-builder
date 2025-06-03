import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormListComponent } from './form-list/form-list.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'forms',
        component: FormListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'create-form',
        component: FormBuilderComponent,
        canActivate: [AuthGuard],
        data: { role: 'admin' }
    },
    {
        path: 'edit-form/:id',
        component: FormBuilderComponent,
        canActivate: [AuthGuard],
        data: { role: 'admin' }
    },
    { path: '**', redirectTo: '/login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { } 