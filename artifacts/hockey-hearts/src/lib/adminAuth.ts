// Admin authentication utilities
// Server-backed admin authentication with a local UI session.
import {
  adminServerLogin,
  adminUpdateServerCredentials,
  clearAdminApiToken,
} from "./donationApi";

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
  password: string,
): Promise<void> {
  const normalizedUsername = username.toLowerCase().trim();
  const passwordHash = await sha256(password);

  const creds: Credentials = {
    username: normalizedUsername,
    passwordHash,
  };

  // Keep the local credential for the existing admin UI.
  localStorage.setItem(KEYS.credentials, JSON.stringify(creds));

  // Create/update the verified server-side admin account.
  try {
    await adminServerLogin(normalizedUsername, password);
  } catch (error) {
    // Do not leave a local admin account behind if server setup failed.
    localStorage.removeItem(KEYS.credentials);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to create the server admin account.",
    );
  }
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const raw = localStorage.getItem(KEYS.credentials);

  if (!raw) {
    return {
      ok: false,
      error: "No admin account found.",
    };
  }

  let creds: Credentials;

  try {
    creds = JSON.parse(raw) as Credentials;
  } catch {
    return {
      ok: false,
      error: "Admin account data is invalid.",
    };
  }

  const normalizedUsername = username.toLowerCase().trim();
  const hash = await sha256(password);

  if (
    normalizedUsername !== creds.username ||
    hash !== creds.passwordHash
  ) {
    return {
      ok: false,
      error: "Invalid username or password.",
    };
  }

  try {
    // Authenticate against the backend first.
    await adminServerLogin(creds.username, password);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to authenticate with the server.",
    };
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

    if (!raw) {
      return null;
    }

    const session: Session = JSON.parse(raw);

    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(KEYS.session);
      clearAdminApiToken();
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
  clearAdminApiToken();
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const raw = localStorage.getItem(KEYS.credentials);

  if (!raw) {
    return {
      ok: false,
      error: "No admin account found.",
    };
  }

  let creds: Credentials;

  try {
    creds = JSON.parse(raw) as Credentials;
  } catch {
    return {
      ok: false,
      error: "Admin account data is invalid.",
    };
  }

  const currentHash = await sha256(currentPassword);

  if (currentHash !== creds.passwordHash) {
    return {
      ok: false,
      error: "Current password is incorrect.",
    };
  }

  if (newPassword.length < 8) {
    return {
      ok: false,
      error: "New password must be at least 8 characters.",
    };
  }

  try {
    await adminUpdateServerCredentials(
      creds.username,
      currentPassword,
      newPassword,
    );
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update the server credentials.",
    };
  }

  const newPasswordHash = await sha256(newPassword);

  const updatedCreds: Credentials = {
    username: creds.username,
    passwordHash: newPasswordHash,
  };

  localStorage.setItem(
    KEYS.credentials,
    JSON.stringify(updatedCreds),
  );

  return { ok: true };
}

export function getAdminUsername(): string | null {
  const session = getAdminSession();
  return session?.username ?? null;
}
