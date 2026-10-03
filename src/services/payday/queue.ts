import { PaydayConfig, PaydayExecutionBreakdown, PaydayExecutionLog } from '@/types/payday';
import { executePaydaySplits } from './engine';

export interface PendingPaydayJob {
  id: string;
  userId: string;
  config: PaydayConfig;
  inflowAmount: number;
  narration: string;
  receivingBank: string;
  enqueuedAt: number;
  delayMs: number;
  expiresAt: number;
  status: 'WAITING_SAFETY_WINDOW' | 'EXECUTING' | 'ABORTED' | 'COMPLETED';
  timerHandle?: NodeJS.Timeout;
}

// In-memory registry of active safety window jobs
const activeJobs = new Map<string, PendingPaydayJob>();

// Subscriptions for UI real-time status/countdown
type JobStatusListener = (job: PendingPaydayJob) => void;
const listeners = new Set<JobStatusListener>();

export function subscribeToJobUpdates(listener: JobStatusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(job: PendingPaydayJob) {
  listeners.forEach((fn) => {
    try {
      fn(job);
    } catch (e) {
      console.error('[PaydayQueue] Listener error:', e);
    }
  });
}

/**
 * Enqueue a payday split into the 30-second safety delay buffer.
 * During this safety window, the user can inspect the incoming credit and abort before vendor API dispatch.
 */
export function enqueuePendingPayday(
  userId: string,
  config: PaydayConfig,
  inflowAmount: number,
  narration: string = 'SALARY INFLOW',
  receivingBank: string = 'Primary Bank Node',
  delayMs: number = 30000 // 30-second safety window
): PendingPaydayJob {
  const jobId = `job_payday_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const job: PendingPaydayJob = {
    id: jobId,
    userId,
    config,
    inflowAmount,
    narration,
    receivingBank,
    enqueuedAt: now,
    delayMs,
    expiresAt: now + delayMs,
    status: 'WAITING_SAFETY_WINDOW',
  };

  // Schedule timer to execute when 30s safety window elapses
  const timerHandle = setTimeout(async () => {
    const current = activeJobs.get(jobId);
    if (!current || current.status !== 'WAITING_SAFETY_WINDOW') return;

    current.status = 'EXECUTING';
    notifyListeners(current);

    try {
      await executePaydaySplits(current.config, current.inflowAmount, current.narration, current.receivingBank);
      current.status = 'COMPLETED';
      notifyListeners(current);
    } catch (err) {
      console.error(`[PaydayQueue] Job ${jobId} failed execution:`, err);
    } finally {
      activeJobs.delete(jobId);
    }
  }, delayMs);

  job.timerHandle = timerHandle;
  activeJobs.set(jobId, job);
  notifyListeners(job);

  return job;
}

/**
 * Emergency Kill Switch: Aborts a queued payday job within the 30-second safety window
 * before any Bridgecard/VTPass/Anchor API request is dispatched.
 */
export function cancelPendingPayday(jobId: string, reason: string = 'Aborted by user via Kill Switch'): boolean {
  const job = activeJobs.get(jobId);
  if (!job) {
    // If not found in active jobs, check if there's any active job for user
    return false;
  }

  if (job.status !== 'WAITING_SAFETY_WINDOW') {
    return false;
  }

  // Clear timeout
  if (job.timerHandle) {
    clearTimeout(job.timerHandle);
  }

  job.status = 'ABORTED';
  notifyListeners(job);
  activeJobs.delete(jobId);

  return true;
}

/**
 * Retrieves the currently active job for a user (if one is in the safety window)
 */
export function getActiveJobForUser(userId: string): PendingPaydayJob | null {
  for (const job of activeJobs.values()) {
    if (job.userId === userId && job.status === 'WAITING_SAFETY_WINDOW') {
      return job;
    }
  }
  return null;
}

/**
 * Retrieves all currently active jobs
 */
export function getAllActiveJobs(): PendingPaydayJob[] {
  return Array.from(activeJobs.values()).filter((j) => j.status === 'WAITING_SAFETY_WINDOW');
}
