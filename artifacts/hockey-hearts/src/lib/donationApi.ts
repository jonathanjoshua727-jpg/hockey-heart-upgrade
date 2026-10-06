export async function adminServerLogin(
  username: string,
  password: string,
): Promise<boolean> {
  const { token } = await jsonFetch<{ token: string }>(
    "/admin/login",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );

  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  return true;
}
