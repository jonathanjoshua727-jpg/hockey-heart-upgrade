// Admin authentication utilities
// No hardcoded passwords — all credentials stored as SHA-256 hashes

const KEYS = {
  credentials: "hhi_admin_credentials",
  session: "hhi_admin_session",
};

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

interface Credentials {
  username: string;
  passwordHash: string;
}

interface Session {
  token: string;
  username: string;
  expiresAt: number;
}

async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hasAdminAccount(): boolean {
  return !!localStorage.getItem(KEYS.credentials);
}

export async function setupAdmin(
  username: string,
  password: string
): Promise<void> {
  const passwordHash = await sha256(password);
  const creds: Credentials = { username: username.toLowerCase().trim(), passwordHash };
  localStorage.setItem(KEYS.credentials, JSON.stringify(creds));
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const raw = localStorage.getItem(KEYS.credentials);
  if (!raw) return { ok: false, error: "No admin account found." };

  const creds: Credentials = JSON.parse(raw);
  const hash = await sha256(password);

  if (
    username.toLowerCase().trim() !== creds.username ||
    hash !== creds.passwordHash
  ) {
    return { ok: false, error: "Invalid username or password." };
  }

  const session: Session = {
    token: randomToken(),
    username: creds.username,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  sessionStorage.setItem(KEYS.session, JSON.stringify(session));
  return { ok: true };
}

export function getAdminSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEYS.session);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(KEYS.session);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminSession();
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(KEYS.session);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const raw = localStorage.getItem(KEYS.credentials);
  if (!raw) return { ok: false, error: "No admin account found." };

  const creds: Credentials = JSON.parse(raw);
  const currentHash = await sha256(currentPassword);

  if (currentHash !== creds.passwordHash) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const newHash = await sha256(newPassword);
  const updated: Credentials = { ...creds, passwordHash: newHash };
  localStorage.setItem(KEYS.credentials, JSON.stringify(updated));
  return { ok: true };
}

export function getAdminUsername(): string {
  try {
    const raw = localStorage.getItem(KEYS.credentials);
    if (!raw) return "Admin";
    return (JSON.parse(raw) as Credentials).username;
  } catch {
    return "Admin";
  }
}
