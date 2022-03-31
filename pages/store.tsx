import { Display, Page, Text, Image, Grid, Button } from "@geist-ui/core";
import { useAuth } from "hooks/useAuth";
import { useStore } from "hooks/useStore";
import type { GetServerSideProps, NextPage } from "next";
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
    <Page>
      <Text h1>Your Store</Text>
      {storeLoading ? (
        <span>loading...</span>
      ) : (
        <div>
          <Text>
            Time remaining:{" "}
            <Countdown date={Date.now() + store!.storefrontReset * 1000} />
          </Text>
          <Grid.Container gap={2} justify="center">
            {/* if not loading, not null */}
            {store!.offers.map((offer) => (
              <Grid xs={6} key={offer.displayName}>
                <Display shadow caption={offer.displayName}>
                  <Image height="16rem" src={offer.image} padding="1rem" />
                </Display>
              </Grid>
            ))}
          </Grid.Container>
          {storeError && <span>Error fetching store: {storeError}</span>}
          <Button onClick={() => logout()} ghost>
            Log Out
          </Button>
        </div>
      )}
    </Page>
  );
};

export default Store;
