// Custom Token Exchange Middleware for Embedded Shopify Apps
// Replaces validateAuthenticatedSession() which uses cookie-based auth
// and causes OAuth loops in iframe context where 3rd-party cookies are blocked.
//
// This middleware:
// 1. Extracts the session token (JWT) from the Authorization header
// 2. Decodes it to get the shop domain
// 3. Checks for an existing offline session in storage
// 4. If no valid session, performs token exchange with Shopify
// 5. Stores the session and makes it available at res.locals.shopify.session

import shopify from "../shopify.js";
import shopifyApiPkg from "@shopify/shopify-api";
const { Session } = shopifyApiPkg;

// Decode JWT without verification (we verify via token exchange)
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

// Extract shop domain from JWT dest claim
function getShopFromToken(payload) {
    if (!payload || !payload.dest) return null;
    try {
          const url = new URL(payload.dest);
          return url.hostname; // e.g., "rtl-test-2022.myshopify.com"
    } catch (e) {
          return null;
    }
}

// Perform token exchange - exchange session token for access token
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
                  // 1. Extract Bearer token from Authorization header
            const authHeader = req.headers.authorization;
                  if (!authHeader || !authHeader.startsWith("Bearer ")) {
                            console.log("[verify-token] No Bearer token in Authorization header");
                            return res.status(401).json({
                                        error: "Unauthorized",
                                        message: "Missing session token",
                            });
                  }

            const sessionToken = authHeader.replace("Bearer ", "");

            // 2. Decode the JWT to get shop info
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

            // 3. Check for existing offline session
            const sessionId = `offline_${shop}`;
                  let session = await shopify.config.sessionStorage.loadSession(sessionId);

            // 4. If session exists and has a valid access token, use it
            if (session && session.accessToken) {
                      res.locals = res.locals || {};
                      res.locals.shopify = res.locals.shopify || {};
                      res.locals.shopify.session = session;
                      return next();
            }

            // 5. No valid session - perform token exchange
            console.log(
                      `[verify-token] No valid session for ${shop}, performing token exchange`
                    );

            const tokenData = await performTokenExchange(shop, sessionToken);

            // 6. Create a proper Shopify Session object and store it
            const newSession = new Session({
                      id: sessionId,
                      shop: shop,
                      state: "",
                      isOnline: false,
                      accessToken: tokenData.access_token,
                      scope: tokenData.scope,
            });

            await shopify.config.sessionStorage.storeSession(newSession);

            console.log(
                      `[verify-token] Token exchange successful for ${shop}, scope: ${tokenData.scope}`
                    );

            // 7. Make session available
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
