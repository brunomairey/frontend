import {
  InvestmentInputs,
  CalculationResult,
  TAX_BRACKETS_2024,
} from '../interfaces/calculation.model';

// Calculate tax based on income using progressive tax brackets
const calculateTaxForIncome = (
  taxableIncome: number,
  numberOfChildren: number,
): number => {
  let totalTax = 0;
  let remainingIncome = taxableIncome;
  let previousThreshold = 0;

  for (const bracket of TAX_BRACKETS_2024) {
    const taxableInBracket = Math.min(
      Math.max(remainingIncome, 0),
      bracket.threshold - previousThreshold,
    );

    totalTax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;

    if (remainingIncome <= 0) break;
    previousThreshold = bracket.threshold;
  }

  // Subtract child tax credit: 166€ per month per child
  const childTaxCredit = numberOfChildren * 166 * 12;
  return Math.max(0, totalTax - childTaxCredit);
};

const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number,
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

// Calculate taxable rental income after deductions
const calculateTaxableRentalIncome = (
  rentalIncome: number,
  propertyValue: number,
  interestPaid: number,
): number => {
  // 1.5% depreciation on 80% of property value (building value)
  const depreciation = propertyValue * 0.8 * 0.015;
  return rentalIncome - depreciation - interestPaid;
};

export const calculateNetIncome = (
  grossIncome: number,
  numberOfChildren: number,
): number => {
  const tax = calculateTaxForIncome(grossIncome, numberOfChildren);
  // Approximate social security contributions
  const socialSecurity = grossIncome * 0.1765;
  return grossIncome - tax - socialSecurity;
};

// Calculate maximum property price based on monthly payment
export const calculateMaxPropertyPrice = (
  monthlyPayment: number,
  interestRate: number,
  loanTerm: number,
): number => {
  const monthlyRate = interestRate / 12 / 100;
  const numberOfPayments = loanTerm * 12;
  // Formula to calculate maximum loan amount from monthly payment
  const maxLoanAmount =
    monthlyPayment *
    ((Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)));

  // Total property price (loan amount represents 80% as 20% is required down payment)
  return maxLoanAmount / 0.8;
};

export const calculateInvestment = (
  inputs: InvestmentInputs,
): CalculationResult[] => {
  const {
    propertyPrice,
    downPayment,
    loanTerm,
    interestRate,
    propertyAppreciation,
    rentalYield,
    rentIncrease,
    numberOfChildren,
  } = inputs;

  const loanAmount = propertyPrice - downPayment;
  const monthlyMortgage = calculateMonthlyPayment(
    loanAmount,
    interestRate,
    loanTerm,
  );
  const results: CalculationResult[] = [];

  let currentLoanBalance = loanAmount;
  let currentPropertyValue = propertyPrice;
  let currentRentalIncome = (propertyPrice * rentalYield) / 100;

  for (let year = 1; year <= loanTerm; year++) {
    // Calculate yearly values
    const yearlyMortgage = monthlyMortgage * 12;
    const yearlyRentalIncome = currentRentalIncome;
    const interestPaid = currentLoanBalance * (interestRate / 100);
    const principalPaid = yearlyMortgage - interestPaid;

    // Calculate taxable income and tax
    const taxableIncome = calculateTaxableRentalIncome(
      yearlyRentalIncome,
      currentPropertyValue,
      interestPaid,
    );

    // Calculate tax using progressive tax brackets
    const tax = calculateTaxForIncome(
      Math.max(0, taxableIncome),
      numberOfChildren,
    );

    // Calculate net income (after tax and mortgage payment)
    const netIncome =
      yearlyRentalIncome - yearlyMortgage - (taxableIncome > 0 ? tax : 0);

    // Update loan balance and property value
    currentLoanBalance = Math.max(0, currentLoanBalance - principalPaid);
    currentPropertyValue *= 1 + propertyAppreciation / 100;

    // Update rental income for next year
    currentRentalIncome *= 1 + rentIncrease / 100;

    results.push({
      year,
      propertyValue: currentPropertyValue,
      loanBalance: currentLoanBalance,
      netWorth: currentPropertyValue - currentLoanBalance,
      rentalIncome: yearlyRentalIncome,
      mortgagePayment: yearlyMortgage,
      taxableIncome,
      tax: taxableIncome > 0 ? tax : taxableIncome * 0.4, // If loss, tax deduction at marginal rate
      netIncome,
    });
  }

  return results;
};
