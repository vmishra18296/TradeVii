import { ref, get, set, onValue, off, Unsubscribe } from 'firebase/database';
import { database } from './firebase';
import type { Trade, Investor, Account, SignupRequest, AdminLog } from '@/types';

// ========== READ ==========

export async function loadAllData(): Promise<{
  trades: Trade[];
  investors: Investor[];
  account: Account | null;
}> {
  const snapshot = await get(ref(database, 'tradevii'));
  const data = snapshot.val() || {};
  return {
    trades: data.trades
      ? Array.isArray(data.trades)
        ? data.trades
        : Object.values(data.trades)
      : [],
    investors: data.investors
      ? Array.isArray(data.investors)
        ? data.investors
        : Object.values(data.investors)
      : [],
    account: data.account || null,
  };
}

// ========== REAL-TIME LISTENERS ==========

export function listenTrades(callback: (trades: Trade[]) => void): Unsubscribe {
  const tradesRef = ref(database, 'tradevii/trades');
  const unsubscribe = onValue(tradesRef, (snapshot) => {
    const data = snapshot.val();
    const trades: Trade[] = data
      ? Array.isArray(data)
        ? data
        : Object.values(data)
      : [];
    callback(trades);
  });
  return unsubscribe;
}

export function listenInvestors(callback: (investors: Investor[]) => void): Unsubscribe {
  const investorsRef = ref(database, 'tradevii/investors');
  const unsubscribe = onValue(investorsRef, (snapshot) => {
    const data = snapshot.val();
    const investors: Investor[] = data
      ? Array.isArray(data)
        ? data
        : Object.values(data)
      : [];
    callback(investors);
  });
  return unsubscribe;
}

// ========== WRITE ==========

export async function saveTrades(trades: Trade[]): Promise<void> {
  await set(ref(database, 'tradevii/trades'), trades);
}

export async function saveInvestors(investors: Investor[]): Promise<void> {
  await set(ref(database, 'tradevii/investors'), investors);
}

export async function saveAccount(account: Account): Promise<void> {
  await set(ref(database, 'tradevii/account'), account);
}

// ========== SIGNUP REQUESTS ==========

export async function getSignupRequests(): Promise<SignupRequest[]> {
  const snapshot = await get(ref(database, 'tradevii/signupRequests'));
  const data = snapshot.val();
  if (!data) return [];
  return Object.values(data) as SignupRequest[];
}

export async function approveSignupRequest(uid: string): Promise<void> {
  await set(ref(database, `tradevii/signupRequests/${uid}/approved`), true);
  await set(ref(database, `tradevii/signupRequests/${uid}/status`), 'approved');
}

export async function rejectSignupRequest(uid: string): Promise<void> {
  await set(ref(database, `tradevii/signupRequests/${uid}/status`), 'rejected');
}

// ========== WITHDRAWALS & PAYOUTS ==========

export async function getWithdrawalRequests() {
  const snapshot = await get(ref(database, 'tradevii/withdrawalRequests'));
  const data = snapshot.val();
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
}

export async function saveWithdrawalRequests(requests: unknown[]): Promise<void> {
  await set(ref(database, 'tradevii/withdrawalRequests'), requests);
}

export async function getPayouts() {
  const snapshot = await get(ref(database, 'tradevii/payouts'));
  const data = snapshot.val();
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
}

export async function savePayouts(payouts: unknown[]): Promise<void> {
  await set(ref(database, 'tradevii/payouts'), payouts);
}

// ========== ADMIN LOGS ==========

export async function logAdminAction(action: string, details?: Record<string, unknown>): Promise<void> {
  const snapshot = await get(ref(database, 'admin_logs'));
  const logs: AdminLog[] = snapshot.val()
    ? Array.isArray(snapshot.val())
      ? snapshot.val()
      : Object.values(snapshot.val())
    : [];
  logs.push({ action, details, timestamp: Date.now() });
  await set(ref(database, 'admin_logs'), logs);
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  const snapshot = await get(ref(database, 'admin_logs'));
  const data = snapshot.val();
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
}
