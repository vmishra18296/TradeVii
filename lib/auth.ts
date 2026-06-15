import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from './firebase';
import type { UserRole, SignupRequest } from '@/types';

// ========== Admin PIN ==========
const ADMIN_PIN_HASH = '9654804bfa592bbe12aaafb52e692dd416033b7476852d80b353ab848997032f';

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === ADMIN_PIN_HASH;
}

// ========== Investor Auth ==========
export async function signUpInvestor(
  email: string,
  password: string,
  name: string,
  mobile: string,
  profilePic?: string
): Promise<{ uid: string }> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  const signupData: SignupRequest = {
    uid,
    name,
    email,
    mobile,
    status: 'pending',
    approved: false,
    createdAt: Date.now(),
    ...(profilePic ? { profilePic } : {}),
  };

  await set(ref(database, `tradevii/signupRequests/${uid}`), signupData);
  return { uid };
}

export async function signInInvestor(
  email: string,
  password: string
): Promise<{ uid: string; approved: boolean }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  const snapshot = await get(ref(database, `tradevii/signupRequests/${uid}`));
  const data = snapshot.val() as SignupRequest | null;

  if (!data) {
    throw new Error('No signup request found. Please sign up first.');
  }
  if (!data.approved) {
    await signOut(auth);
    throw new Error('Your account is pending admin approval.');
  }

  return { uid, approved: true };
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ========== Role Detection ==========
export function getRoleFromSession(): UserRole {
  if (typeof window === 'undefined') return null;
  return (sessionStorage.getItem('tradevii_role') as UserRole) || null;
}

export function setRoleInSession(role: UserRole): void {
  if (typeof window === 'undefined') return;
  if (role) {
    sessionStorage.setItem('tradevii_role', role);
  } else {
    sessionStorage.removeItem('tradevii_role');
  }
}

export function getLoggedInvestorName(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('tradevii_investor_name') || '';
}

export function setLoggedInvestorName(name: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('tradevii_investor_name', name);
}

export function getLoggedInvestorMobile(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('tradevii_investor_mobile') || '';
}

export function setLoggedInvestorMobile(mobile: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('tradevii_investor_mobile', mobile);
}
