// Admin authentication utilities
// Server-backed admin authentication with a local UI session.
import {
  adminServerLogin,
  adminUpdateServerCredentials,
  clearAdminApiToken,
  getAdminApiToken,
} from "./donationApi";
const KEYS = {
  credentials: "hhi_admin_credentials",
  session: "hhi_admin_session",
};
interface Credentials {
  username: string;
  passwordHash: string;
}
interface Session {
  username: string;
  expiresAt: number;
}
async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
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
  // Store the local credential only after the server account
  // has been created successfully.
  try {
    const expiresAt = await adminServerLogin(normalizedUsername, password);
    sessionStorage.setItem(
      KEYS.session,
      JSON.stringify({ username: normalizedUsername, expiresAt }),
    );
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to create the server admin account.",
    );
  }
  localStorage.setItem(KEYS.credentials, JSON.stringify(creds));
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
  // The backend must authenticate successfully before creating
  // the local admin session.
  try {
    const expiresAt = await adminServerLogin(creds.username, password);
    const session: Session = {
      username: creds.username,
      expiresAt,
    };
    sessionStorage.setItem(KEYS.session, JSON.stringify(session));
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to authenticate with the server.",
    };
  }
  return { ok: true };
}
export function getAdminSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEYS.session);
    if (!raw) {
      return null;
    }
    const session: Session = JSON.parse(raw);
    if (
      typeof session.username !== "string" ||
      typeof session.expiresAt !== "number" ||
      !Number.isFinite(session.expiresAt) ||
      Date.now() >= session.expiresAt ||
      !getAdminApiToken()
    ) {
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
    const expiresAt = await adminUpdateServerCredentials(
      creds.username,
      newPassword,
    );
    if (!expiresAt) {
      throw new Error("Unable to update the server credentials.");
    }
    const session = getAdminSession();
    if (session) {
      sessionStorage.setItem(
        KEYS.session,
        JSON.stringify({ ...session, expiresAt }),
      );
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update the server credentials.",
    };
  }
  const newHash = await sha256(newPassword);
  const updatedCreds: Credentials = {
    username: creds.username,
    passwordHash: newHash,
  };
  localStorage.setItem(
    KEYS.credentials,
    JSON.stringify(updatedCreds),
  );
  return { ok: true };
}
export function getAdminUsername(): string {
  try {
    const raw = localStorage.getItem(KEYS.credentials);
    if (!raw) {
      return "Admin";
    }
    return (JSON.parse(raw) as Credentials).username;
  } catch {
    return "Admin";
  }
}
