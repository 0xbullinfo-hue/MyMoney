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

const MAX_PAYOFF_MONTHS = 600; // 50-year cap, just to bound the loop

interface PayoffSimulation {
  months: number;
  totalInterest: number;
  /** false if the payment never exceeds the interest accruing each month — the
   *  balance grows forever and `months`/`totalInterest` are not a real payoff. */
  payoffAchieved: boolean;
}

function simulatePayoff(balance: number, monthlyRate: number, payment: number): PayoffSimulation {
  // Bug fix: the original loop had no negative-amortization guard. If `payment` doesn't
  // cover the first month's interest, `balanceWithout` grows every iteration, and the old
  // code would silently run all 600 iterations and report "50 years to pay off" with a
  // meaningless interest figure instead of telling the caller the debt will never clear.
  if (payment <= balance * monthlyRate) {
    return { months: MAX_PAYOFF_MONTHS, totalInterest: 0, payoffAchieved: false };
  }

  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  while (bal > 0 && months < MAX_PAYOFF_MONTHS) {
    const interest = bal * monthlyRate;
    totalInterest += interest;
    bal = bal + interest - payment;
    months++;
  }
  return { months, totalInterest, payoffAchieved: bal <= 0 };
}

export function calculateDebtPayoff(
  balance: number,
  apr: number,
  minPayment: number,
  extraPayment: number
): {
  monthsWithout: number;
  monthsWith: number;
  interestSaved: number;
  /** True unless the minimum payment alone never clears the balance. */
  payoffAchievedWithout: boolean;
  /** True unless even the boosted payment never clears the balance. */
  payoffAchievedWith: boolean;
} {
  const monthlyRate = apr / 100 / 12;

  const without = simulatePayoff(balance, monthlyRate, minPayment);
  const withExtra = simulatePayoff(balance, monthlyRate, minPayment + extraPayment);

  return {
    monthsWithout: without.months,
    monthsWith: withExtra.months,
    // Only meaningful when both scenarios actually pay the debt off; otherwise 0 rather
    // than a nonsensical difference between two "never pays off" placeholder values.
    interestSaved:
      without.payoffAchieved && withExtra.payoffAchieved
        ? Math.round(without.totalInterest - withExtra.totalInterest)
        : 0,
    payoffAchievedWithout: without.payoffAchieved,
    payoffAchievedWith: withExtra.payoffAchieved,
  };
}
