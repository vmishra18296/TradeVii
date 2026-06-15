import type { Trade, Investor, InterestInfo } from '@/types';

/**
 * Calculate investor interest: 9% annual fixed + 10% trade profit share.
 * Uses fractional days for real-time accrual.
 */
export function calcInvestorInterestPrecise(
  principal: number,
  joinDate: string | undefined,
  trades: Trade[],
  totalPool: number
): InterestInfo {
  const now = new Date();
  const start = joinDate ? new Date(joinDate) : now;
  const msElapsed = Math.max(0, now.getTime() - start.getTime());
  const msPerDay = 1000 * 60 * 60 * 24;
  const preciseDays = msElapsed / msPerDay;
  const wholeDays = Math.floor(preciseDays);

  const dailyFixedRate = 0.09 / 365;
  const dailyFixedInterest = principal * dailyFixedRate;
  const totalFixedInterest = dailyFixedInterest * preciseDays;

  const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);
  const share = totalPool > 0 ? principal / totalPool : 0;
  const tradeProfitShare = totalPL > 0 ? totalPL * 0.10 * share : 0;

  const totalInterest = totalFixedInterest + tradeProfitShare;
  const totalAmount = principal + totalInterest;

  return {
    preciseDays,
    wholeDays,
    dailyFixedInterest,
    totalFixedInterest,
    tradeProfitShare,
    totalInterest,
    totalAmount,
  };
}

export function calcInvestorInterest(
  principal: number,
  joinDate: string | undefined,
  trades: Trade[],
  totalPool: number
): InterestInfo {
  return calcInvestorInterestPrecise(principal, joinDate, trades, totalPool);
}
