export interface InvestmentInputs {
  annualGrossIncome: number;
  existingLoanPayment: number;
  propertyPrice: number;
  downPayment: number;
  rentalYield: number;
  loanTerm: number;
  interestRate: number;
  propertyAppreciation: number;
  rentIncrease: number;
  additionalCosts: number;
  numberOfChildren: number;
}

export interface CalculationResult {
  year: number;
  propertyValue: number;
  loanBalance: number;
  netWorth: number;
  rentalIncome: number;
  mortgagePayment: number;
  taxableIncome: number;
  tax: number;
  netIncome: number;
}

export const TAX_BRACKETS_2024 = [
  { threshold: 11693, rate: 0 },
  { threshold: 19134, rate: 0.2 },
  { threshold: 32075, rate: 0.3 },
  { threshold: 62080, rate: 0.4 },
  { threshold: 93120, rate: 0.48 },
  { threshold: 1000000, rate: 0.5 },
  { threshold: Infinity, rate: 0.55 },
];
