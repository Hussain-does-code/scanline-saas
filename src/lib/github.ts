import { prisma } from "@/lib/db";

export async function getValidGitHubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" }
  });

  if (!account?.access_token) return null;

  // Check if token is expired (or expires in the next 60 seconds)
  const isExpired = account.expires_at ? (account.expires_at * 1000) <= (Date.now() + 60000) : false;

  if (isExpired && account.refresh_token) {
    const refreshed = await refreshGitHubToken(account.id, account.refresh_token);
    if (refreshed) return refreshed;
  }

  return account.access_token;
}

export async function refreshGitHubToken(accountId: string, refreshToken: string): Promise<string | null> {
  const clientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID;
  const clientSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing GitHub Client ID/Secret for token refresh");
    return null;
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Scanline-App"
      },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error("Failed to refresh GitHub token:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.access_token) {
      console.error("GitHub token refresh did not return access_token:", data);
      return null;
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_at: data.expires_in ? Math.floor(Date.now() / 1000) + Number(data.expires_in) : null,
        scope: data.scope || undefined,
      }
    });

    return data.access_token;
  } catch (err) {
    console.error("Error refreshing GitHub token:", err);
    return null;
  }
}
