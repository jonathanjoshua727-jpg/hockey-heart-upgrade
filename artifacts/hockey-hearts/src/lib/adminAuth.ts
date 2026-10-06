export async function setupAdmin(
  username: string,
  password: string
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
  const serverLoginSucceeded = await adminServerLogin(
    normalizedUsername,
    password,
  );

  if (!serverLoginSucceeded) {
    localStorage.removeItem(KEYS.credentials);
    throw new Error("Unable to create the server admin account.");
  }
}
