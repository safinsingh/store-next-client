import { UserStoreResponse } from "pages/api/getUserStore";
import { useEffect, useState } from "react";
import { RiotAuthBundle } from "hooks/useAuth";

export const useStore = (authBundle: RiotAuthBundle | null) => {
  const [store, setStore] = useState<UserStoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authBundle) {
      setError("Internal error: authBundle is empty!");
      return;
    }

    // prevent race condition where between the authBundle fetch
    // and store hook, the auth bundle expires
    if (authBundle.expires < new Date()) {
      setError("Your access token has expired, please reload.");
      return;
    }

    const getStore = async () => {
      const storeResponse = await fetch("/api/getUserStore", {
        body: JSON.stringify(authBundle),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const storeObject: UserStoreResponse = await storeResponse.json();
      setStore(storeObject);
    };

    getStore();
  }, [authBundle]);

  return { store, error };
};
