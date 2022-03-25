import { useEffect, useState } from "react";

const __store_LocalStorageKey = "__store_RiotAuthBundle";

type RiotAuthBundle = {
  authorizationToken: string;
  entitlementsToken: string;
  puuid: string;
} & { expires: string }; // Riot token lives for 3600 seconds

export const useAuth = () => {
  const [authBundle, setAuthBundle] = useState<RiotAuthBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createAuthBundle = async (username: string, password: string) => {
    const getAuthTokensResponse = await fetch("/api/getAuthTokens", {
      body: JSON.stringify({ username, password }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (getAuthTokensResponse.status != 200) {
      setError(await getAuthTokensResponse.text());
      return;
    } else {
      setError(null);
    }

    const getAuthTokens = JSON.parse(await getAuthTokensResponse.text());

    const now = new Date();
    // now + 55 minutes (well within the 60 minute riot key expiration time)
    const expires = new Date(now.getTime() + 55 * 60 * 1000);

    const finalBundle = { ...getAuthTokens, expires };
    setAuthBundle(finalBundle);
    localStorage.setItem(__store_LocalStorageKey, JSON.stringify(finalBundle));
  };

  const clearAuthBundle = () => {
    setAuthBundle(null);
    localStorage.setItem(__store_LocalStorageKey, "null");
  };

  useEffect(() => {
    const authBundleStorage = localStorage.getItem(__store_LocalStorageKey);
    if (authBundleStorage) {
      const authBundle = JSON.parse(authBundleStorage) as RiotAuthBundle;
      if (authBundle !== null && new Date(authBundle.expires) > new Date()) {
        setAuthBundle(authBundle);
      }
    }
  }, []);

  return { authBundle, createAuthBundle, clearAuthBundle, error };
};
