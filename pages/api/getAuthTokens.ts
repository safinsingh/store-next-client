import axios from "axios";

import { wrapper } from "axios-cookiejar-support";
import { NextApiRequest, NextApiResponse } from "next";
import { CookieJar } from "tough-cookie";

export default async function getAuthTokens(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("no creds?");
    return;
  }

  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      withCredentials: true,
      validateStatus: (s) => s == 200,
      jar,
    })
  );

  // Setup session for obtaining Riot ID
  await client.post("https://auth.riotgames.com/api/v1/authorization", {
    client_id: "play-valorant-web-prod",
    nonce: "1",
    redirect_uri: "https://playvalorant.com/opt_in",
    response_type: "token id_token",
  });

  const authorizationResponse = await client.put(
    "https://auth.riotgames.com/api/v1/authorization",
    {
      type: "auth",
      username,
      password,
      remember: true,
      language: "en_US",
    }
  );
  if (authorizationResponse.data.error) {
    res.status(400).send("Error authenticating user, check your credentials");
    return;
  }

  const authorizationUri = authorizationResponse.data.response.parameters.uri;
  const authorizationUriHash = new URL(authorizationUri).hash.substring(1); // trim leading #
  const authorizationToken = new URLSearchParams(authorizationUriHash).get(
    "access_token"
  );
  if (!authorizationToken) {
    throw new Error(
      "Error retrieving authentication token from authorization URI"
    );
  }

  const entitlementsResponse = await client.post(
    "https://entitlements.auth.riotgames.com/api/token/v1",
    {},
    { headers: { Authorization: `Bearer ${authorizationToken}` } }
  );
  const entitlementsToken = entitlementsResponse.data.entitlements_token;

  const userinfoResponse = await client.get(
    "https://auth.riotgames.com/userinfo",
    {
      headers: { Authorization: `Bearer ${authorizationToken}` },
    }
  );
  const puuid = userinfoResponse.data.sub;

  res.status(200).json({
    authorizationToken,
    entitlementsToken,
    puuid,
  });
}

export type AuthTokensResponse = {
  authorizationToken: string;
  entitlementsToken: string;
  puuid: string;
};
