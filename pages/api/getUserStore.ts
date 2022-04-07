import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { SKINS_JSON, UpdateStoreResponse } from "./updateStore";

export default async function getUserStore(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { authorizationToken, entitlementsToken, puuid } = req.body;

  const storefrontResponse = await axios.get(
    `https://pd.na.a.pvp.net/store/v2/storefront/${puuid}`,
    {
      headers: {
        "X-Riot-Entitlements-JWT": entitlementsToken,
        Authorization: `Bearer ${authorizationToken}`,
      },
    }
  );
  const storefrontData = storefrontResponse.data;
  const skinsPanelRaw = storefrontResponse.data.SkinsPanelLayout;

  const skinsMapRaw = await fs.readFile(SKINS_JSON, "utf-8");
  const skinsMap: { [uuid: string]: UpdateStoreResponse } =
    JSON.parse(skinsMapRaw);

  const store: UserStoreResponse = {
    storefrontReset: Number.parseInt(
      skinsPanelRaw.SingleItemOffersRemainingDurationInSeconds
    ),
    offers: skinsPanelRaw.SingleItemOffers.map(
      (uuid: string) => skinsMap[uuid]
    ),
  };

  if (storefrontData.BonusStore) {
    store.nightMarket = {
      nightMarketReset:
        storefrontData.BonusStore.BonusStoreRemainingDurationInSeconds,
      offers: storefrontData.BonusStore.BonusStoreOffers.map(
        (item: BonusStoreOffer) => ({
          storeItem: skinsMap[item.Offer.OfferID],
          price: item.Offer.Cost[0],
          discountPrice: item.DiscountCosts[0],
        })
      ),
    };
  }

  res.status(200).send(store);
}

type BonusStoreOffer = {
  Offer: {
    Cost: number[];
    OfferID: string;
  };
  DiscountCosts: number[];
};

export type NightMarketItem = {
  storeItem: UpdateStoreResponse;
  price: number;
  discountPrice: number;
};

export type UserStoreResponse = {
  storefrontReset: number;
  offers: UpdateStoreResponse[];
  nightMarket?: {
    nightMarketReset: number;
    offers: NightMarketItem[];
  };
};
