import { useAuth } from "hooks/useAuth";
import { useStore } from "hooks/useStore";
import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Countdown from "react-countdown";

const Store: NextPage = () => {
  const router = useRouter();
  const { loading: authLoading, authBundle, clearAuthBundle } = useAuth();

  // Store only ever renders if the authBundle is present
  const {
    loading: storeLoading,
    store,
    error: storeError,
  } = useStore(authBundle!);

  useEffect(() => {
    if (!authLoading && !authBundle) {
      router.push("/");
    }
  }, [authLoading]);

  const logout = () => {
    clearAuthBundle();
    router.push("/");
  };

  return (
    <>
      {storeLoading ? (
        <span>loading...</span>
      ) : (
        <div>
          <Countdown date={Date.now() + store!.storefrontReset * 1000} />
          {/* if not loading, not null */}
          {store!.offers.map((offer) => (
            <div key={offer.displayName}>
              <h1>{offer.displayName}</h1>
              <Image src={offer.image} layout="fill" />
              <p>Tier: {offer.skinTier}</p>
            </div>
          ))}
          {storeError && <span>Error fetching store: {storeError}</span>}
        </div>
      )}
      <button onClick={() => logout()}>Log Out</button>
    </>
  );
};

export default Store;
