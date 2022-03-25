import { AuthTokensResponse } from "pages/api/getAuthTokens";
import { useEffect, useState } from "react";

const __store_LocalStorageKey = "__store_RiotAuthBundle";

export type RiotAuthBundle = AuthTokensResponse & { expires: Date };

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

    const getAuthTokens: AuthTokensResponse =
      await getAuthTokensResponse.json();

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
      const expiration = new Date(authBundle.expires);
      console.log(expiration);

      if (authBundle !== null && expiration > new Date()) {
        // Convert LocalStorage date string to Date for state
        authBundle.expires = expiration;
        setAuthBundle(authBundle);
      }
    }
  }, []);

  return { authBundle, createAuthBundle, clearAuthBundle, error };
};
