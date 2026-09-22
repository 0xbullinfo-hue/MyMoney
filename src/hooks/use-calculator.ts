'use client';

import { useState, useMemo } from 'react';

interface CalculatorResult {
  zombieClawback: number;
  debtSavings: number;
  velocityLift: string;
}

export function useCalculator(defaultIncome = 3500000, defaultNodes = 4) {
  const [income, setIncome] = useState<number>(defaultIncome);
  const [bankNodes, setBankNodes] = useState<number>(defaultNodes);

  const results: CalculatorResult = useMemo(() => ({
    zombieClawback: Math.round(income * 0.08 + bankNodes * 18000),
    debtSavings: Math.round(income * 0.22 + bankNodes * 32000),
    velocityLift: (12.4 + bankNodes * 1.5).toFixed(1),
  }), [income, bankNodes]);

  return {
    income,
    setIncome,
    bankNodes,
    setBankNodes,
    ...results,
  };
}
