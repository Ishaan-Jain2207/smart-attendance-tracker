import { AttendanceStats, TARGET_PERCENTAGE } from './types';

/**
 * Calculates detailed attendance statistics for a subject.
 * 
 * Percentage: (Attended / Conducted) * 100
 * Safe/Warning projections: Based on Fixed Total.
 */
export const calculateStats = (attended: number, conducted: number, fixedTotal: number): AttendanceStats => {
  // 1. Current Percentage
  const percentage = conducted === 0 ? 100 : (attended / conducted) * 100;
  const missed = conducted - attended;

  // 2. Status determination (Running average)
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentage < 75) status = 'danger';
  else if (percentage < TARGET_PERCENTAGE) status = 'warning';

  // 3. Projections based on Fixed Total
  // Target: End the semester with >= 80% of Fixed Total.
  
  // Total classes required to be attended by end of semester to hit 80% of fixedTotal:
  const targetAttended = Math.ceil((TARGET_PERCENTAGE / 100) * fixedTotal);
  
  // Remaining classes in semester
  const remaining = Math.max(0, fixedTotal - conducted);

  // How many consecutive classes needed?
  // If current < 80%, we calculate against running total to get back on track.
  let classesNeeded = 0;
  if (percentage < TARGET_PERCENTAGE) {
     // Solve: (attended + x) / (conducted + x) >= 0.8
     // x >= (0.8 * conducted - attended) / 0.2
     const rawNeeded = (TARGET_PERCENTAGE * conducted - 100 * attended) / (100 - TARGET_PERCENTAGE);
     classesNeeded = Math.ceil(Math.max(0, rawNeeded));
  }

  // How many can miss?
  // We calculate this based on the Fixed Total to answer: "How many bunks do I have left in the entire semester?"
  // Formula: (Attended + Remaining - CanMiss) / FixedTotal >= 0.8
  // Max possible final attended = Attended + Remaining
  // We need FinalAttended >= 0.8 * FixedTotal
  // So (Attended + Remaining - x) >= TargetAttended
  // x <= Attended + Remaining - TargetAttended
  const potentialFinalAttended = attended + remaining;
  let classesCanMiss = 0;
  
  if (potentialFinalAttended >= targetAttended) {
    classesCanMiss = Math.max(0, potentialFinalAttended - targetAttended);
  } else {
    // Impossible to reach target even if attending all remaining
    classesCanMiss = 0; 
  }

  // Override status if mathematically impossible to recover
  if (potentialFinalAttended < targetAttended) {
      status = 'danger';
  }

  return {
    percentage,
    classesMissed: missed,
    status,
    classesNeededToReachTarget: classesNeeded,
    classesCanMiss,
  };
};

export const formatPercent = (val: number) => val.toFixed(2) + '%';
