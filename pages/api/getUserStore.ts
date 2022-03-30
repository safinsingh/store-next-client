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
  const skinsPanelRaw = storefrontResponse.data.SkinsPanelLayout;

  const skinsMapRaw = await fs.readFile(SKINS_JSON, "utf-8");
  const skinsMap = JSON.parse(skinsMapRaw);

  const store = {
    storefrontReset: Number.parseInt(
      skinsPanelRaw.SingleItemOffersRemainingDurationInSeconds
    ),
    offers: skinsPanelRaw.SingleItemOffers.map(
      (uuid: string) => skinsMap[uuid]
    ),
  };
  res.status(200).send(store);
}

export type UserStoreResponse = {
  storefrontReset: number;
  offers: UpdateStoreResponse[];
};
