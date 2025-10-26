export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const DASHBOARD_URL = `${SITE_URL}/dashboard`;

// Auth 
export const LOGIN_URL = `${SITE_URL}/login`;
export const SIGNUP_URL = `${SITE_URL}/sign-up`;

// Chat 
export const CHAT_URL = `${DASHBOARD_URL}/chat`;