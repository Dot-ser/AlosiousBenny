
'use server';

import { cookies } from 'next/headers';
// import bcrypt from 'bcryptjs'; // For password hashing if using DB users
// import User from '@/models/User'; // If checking against DB users
// import dbConnect from '@/lib/mongodb'; // If checking against DB users

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

  // In a real app, you'd fetch the user from DB and compare hashed passwords
  // await dbConnect();
  // const user = await User.findOne({ username: credentials.username });
  // if (!user || !bcrypt.compareSync(credentials.password, user.passwordHash)) {
  //   return { success: false, error: 'Invalid credentials.' };
  // }

  if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
    // Set a simple cookie for demo purposes. Use JWT or a proper session library in production.
    cookies().set(AUTH_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  } else {
    return { success: false, error: 'Invalid credentials.' };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  cookies().delete(AUTH_COOKIE_NAME);
  return { success: true };
}

export async function isAuthenticated(): Promise<boolean> {
  const authCookie = cookies().get(AUTH_COOKIE_NAME);
  return !!authCookie && authCookie.value === 'true';
}

export async function getAdminUser() {
  // This is a placeholder. In a real app, you'd get this from the session/token.
  // For now, we'll return a static admin profile.
  // If you created an admin user in MongoDB with an avatar:
  // await dbConnect();
  // const adminUserDoc = await User.findOne({ username: ADMIN_USERNAME });
  // if (adminUserDoc) {
  //   return { name: adminUserDoc.username, avatarUrl: adminUserDoc.avatarUrl || `/images/logo.jpg` };
  // }
  return {
    name: ADMIN_USERNAME,
    avatarUrl: `/images/logo.jpg`, // Placeholder avatar
  };
}
