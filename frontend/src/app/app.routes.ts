import { Routes } from '@angular/router';
import { CalculatorComponent } from './calculator/calculator.component';

export const routes: Routes = [
  { path: 'calculator', component: CalculatorComponent },
  { path: '', redirectTo: '/calculator', pathMatch: 'full' },
];
