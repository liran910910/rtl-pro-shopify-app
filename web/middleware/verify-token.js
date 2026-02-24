// Custom Token Exchange Middleware for Embedded Shopify Apps
// Replaces validateAuthenticatedSession() which uses cookie-based auth
// and causes OAuth loops in iframe context where 3rd-party cookies are blocked.
import shopify from "../shopify.js";

function decodeSessionToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    return payload;
  } catch (e) {
    return null;
  }
}

function getShopFromToken(payload) {
  if (!payload || !payload.dest) return null;
  try {
    const url = new URL(payload.dest);
    return url.hostname;
  } catch (e) {
    return null;
  }
}

async function performTokenExchange(shop, sessionToken) {
  const response = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token: sessionToken,
        subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
        requested_token_type:
          "urn:shopify:params:oauth:token-type:offline-access-token",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Token exchange failed (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}

export function verifyToken() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("[verify-token] No Bearer token in Authorization header");
        return res.status(401).json({
          error: "Unauthorized",
          message: "Missing session token",
        });
      }

      const sessionToken = authHeader.replace("Bearer ", "");

      const payload = decodeSessionToken(sessionToken);
      if (!payload) {
        console.log("[verify-token] Failed to decode session token");
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid session token",
        });
      }

      const shop = getShopFromToken(payload);
      if (!shop) {
        console.log("[verify-token] No shop found in session token");
        return res.status(401).json({
          error: "Unauthorized",
          message: "No shop in session token",
        });
      }

      const sessionId = `offline_${shop}`;
      let session = await shopify.config.sessionStorage.loadSession(sessionId);

      if (session && session.accessToken) {
        res.locals = res.locals || {};
        res.locals.shopify = res.locals.shopify || {};
        res.locals.shopify.session = session;
        return next();
      }

      console.log(
        `[verify-token] No valid session for ${shop}, performing token exchange`
      );

      const tokenData = await performTokenExchange(shop, sessionToken);

      const newSession = {
        id: sessionId,
        shop: shop,
        state: "",
        isOnline: false,
        accessToken: tokenData.access_token,
        scope: tokenData.scope,
      };

      await shopify.config.sessionStorage.storeSession(newSession);

      console.log(
        `[verify-token] Token exchange successful for ${shop}`
      );

      res.locals = res.locals || {};
      res.locals.shopify = res.locals.shopify || {};
      res.locals.shopify.session = newSession;

      return next();
    } catch (error) {
      console.error("[verify-token] Error:", error.message);
      return res.status(401).json({
        error: "Unauthorized",
        message: error.message,
      });
    }
  };
        }
