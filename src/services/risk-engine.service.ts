import type { Transaction, SubscriptionItem } from '@/types';

export function calculateRiskScore(transaction: Transaction): number {
  let score = 0;
  if (transaction.amount > 1000000) score += 30;
  else if (transaction.amount > 500000) score += 15;
  if (transaction.isFlaggedZombie) score += 25;
  if (transaction.isSubscription && transaction.type === 'debit') score += 10;
  if (transaction.category === 'Transfers' && transaction.amount > 500000) score += 20;
  return Math.min(score, 100);
}

export function flagSuspiciousActivity(transaction: Transaction): boolean {
  return calculateRiskScore(transaction) > 50;
}

export function getSubscriptionHealth(subscriptions: SubscriptionItem[]): {
  active: number;
  zombie: number;
  blocked: number;
  totalMonthlyBurn: number;
  zombieBurn: number;
} {
  const active = subscriptions.filter((s) => s.status === 'active').length;
  const zombie = subscriptions.filter((s) => s.status === 'flagged_zombie').length;
  const blocked = subscriptions.filter((s) => s.status === 'blocked').length;
  const totalMonthlyBurn = subscriptions
    .filter((s) => s.status !== 'blocked')
    .reduce((sum, s) => sum + (s.billingCycle === 'annual' ? s.amount / 12 : s.amount), 0);
  const zombieBurn = subscriptions
    .filter((s) => s.status === 'flagged_zombie')
    .reduce((sum, s) => sum + (s.billingCycle === 'annual' ? s.amount / 12 : s.amount), 0);

  return { active, zombie, blocked, totalMonthlyBurn: Math.round(totalMonthlyBurn), zombieBurn: Math.round(zombieBurn) };
}

export function calculateDebtPayoff(
  balance: number,
  apr: number,
  minPayment: number,
  extraPayment: number
): { monthsWithout: number; monthsWith: number; interestSaved: number } {
  const monthlyRate = apr / 100 / 12;

  let balanceWithout = balance;
  let monthsWithout = 0;
  let totalInterestWithout = 0;
  while (balanceWithout > 0 && monthsWithout < 600) {
    const interest = balanceWithout * monthlyRate;
    totalInterestWithout += interest;
    balanceWithout = balanceWithout + interest - minPayment;
    monthsWithout++;
    if (balanceWithout <= 0) break;
  }

  let balanceWith = balance;
  let monthsWith = 0;
  let totalInterestWith = 0;
  const totalPayment = minPayment + extraPayment;
  while (balanceWith > 0 && monthsWith < 600) {
    const interest = balanceWith * monthlyRate;
    totalInterestWith += interest;
    balanceWith = balanceWith + interest - totalPayment;
    monthsWith++;
    if (balanceWith <= 0) break;
  }

  return {
    monthsWithout,
    monthsWith,
    interestSaved: Math.round(totalInterestWithout - totalInterestWith),
  };
}
