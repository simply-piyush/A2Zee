/**
 * Calculates earnings for completed jobs based on scheduledEndTime.
 * 
 * - Only jobs with status === 'COMPLETED' are included.
 * - Grouped by month using scheduledEndTime (or fallback to scheduledDate/createdAt).
 * - Worker payout = 85% of final price (basePrice + extraAmount).
 * - Welfare trust = 5% of final price.
 * - Cooperative admin = 10% of final price.
 */

export function calculateMonthlyEarningsBreakdown(jobs = []) {
  const breakdown = {};

  jobs
    .filter((job) => job.status === 'COMPLETED')
    .forEach((job) => {
      const dateStr = job.scheduledEndTime || job.scheduledDate || job.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

      const finalPrice = Number(job.finalPrice) || (Number(job.basePrice || 0) + Number(job.extraAmount || 0));
      const payout = job.workerPayout !== undefined ? Number(job.workerPayout) : (finalPrice * 0.85);
      const welfare = finalPrice * 0.05;
      const platformFee = finalPrice * 0.10;

      if (!breakdown[monthKey]) {
        breakdown[monthKey] = {
          monthKey,
          monthLabel,
          key: monthKey,
          label: monthLabel,
          year: d.getFullYear(),
          month: d.getMonth(),
          totalPayout: 0,
          totalGross: 0,
          welfareTotal: 0,
          totalWelfare: 0,
          platformTotal: 0,
          totalPlatform: 0,
          completedCount: 0,
          jobs: [],
        };
      }

      breakdown[monthKey].totalPayout += payout;
      breakdown[monthKey].totalGross += finalPrice;
      breakdown[monthKey].welfareTotal += welfare;
      breakdown[monthKey].totalWelfare += welfare;
      breakdown[monthKey].platformTotal += platformFee;
      breakdown[monthKey].totalPlatform += platformFee;
      breakdown[monthKey].completedCount += 1;
      breakdown[monthKey].jobs.push({
        ...job,
        computedPayout: payout,
        computedGross: finalPrice,
      });
    });

  return breakdown;
}

export function getCurrentMonthEarnings(jobs = [], targetDate = new Date()) {
  const breakdown = calculateMonthlyEarningsBreakdown(jobs);
  const currentKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
  return breakdown[currentKey]?.totalPayout || 0;
}
