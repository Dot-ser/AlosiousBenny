'use server';

import { cookies } from 'next/headers';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const AUTH_COOKIE_NAME = 'admin-auth';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(credentials: { username?: string; password?: string }): Promise<ActionResult> {
  if (!credentials.username || !credentials.password) {
    return { success: false, error: 'Username and password are required.' };
  }

  if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
    const cookieStore = cookies(); // ✅ This is synchronous inside server actions
    cookieStore.set(AUTH_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return { success: true };
  } else {
    return { success: false, error: 'Invalid credentials.' };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  const cookieStore = cookies(); // ✅ Fix: must get cookie store first
  cookieStore.delete(AUTH_COOKIE_NAME); // ✅ Delete using that store
  return { success: true };
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies(); // ✅ Fix: must get cookie store first
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME); // ✅ Read from store
  return !!authCookie && authCookie.value === 'true';
}

export async function getAdminUser() {
  return {
    name: ADMIN_USERNAME,
    avatarUrl: `/images/logo.jpg`,
  };
}
