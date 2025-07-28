import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  FormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyPipe } from '@angular/common';
import {
  calculateInvestment,
  calculateMaxPropertyPrice,
  calculateNetIncome,
} from '../../shared/utils/calculation';

@Component({
  selector: 'app-calculator',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    CurrencyPipe,
  ],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent {
  calculatorForm: FormGroup;
  monthlyNetIncome: number = 0;
  maxPropertyPrice: number = 0;
  monthlyMortgage: number = 0;
  monthlyRent: number = 0;
  finalResult: any = {};

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      annualGrossIncome: [60000],
      existingLoanPayment: [0],
      propertyPrice: [450000],
      downPayment: [90000],
      rentalYield: [3.5],
      loanTerm: [25],
      interestRate: [3.5],
      propertyAppreciation: [2.5],
      rentIncrease: [2],
      additionalCosts: [5000],
      numberOfChildren: [0],
    });
  }

  ngOnInit(): void {
    this.calculatorForm.valueChanges.subscribe((values) => {
      this.calculate(values);
    });
    this.calculate(this.calculatorForm.value);
  }

  calculate(values: any): void {
    const yearlyNetIncome = calculateNetIncome(
      values.annualGrossIncome,
      values.numberOfChildren,
    );
    this.monthlyNetIncome = yearlyNetIncome / 12;

    const availableMonthlyPayment =
      this.monthlyNetIncome * 0.4 - values.existingLoanPayment;
    this.maxPropertyPrice = calculateMaxPropertyPrice(
      availableMonthlyPayment,
      values.interestRate,
      values.loanTerm,
    );

    const results = calculateInvestment(values);
    this.finalResult = results[results.length - 1];
    this.monthlyMortgage = this.finalResult.mortgagePayment / 12;
    this.monthlyRent = this.finalResult.rentalIncome / 12;
  }
}
