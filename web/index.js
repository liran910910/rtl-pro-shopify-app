// RTL Pro - Main Server
import { join, resolve } from "path";
import { readFileSync } from "fs";
import express from "express";
import compression from "compression";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import { setupBilling } from "./helpers/billing.js";
import { apiRoutes } from "./routes/api.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { proxyRoutes } from "./routes/proxy.js";
import { verifyToken } from "./middleware/verify-token.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const STATIC_PATH = resolve("frontend/dist");
const isProd = process.env.NODE_ENV === "production";

const app = express();

// Trust proxy for secure cookies behind load balancers
app.set("trust proxy", true);

// Health check endpoint (no auth needed)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Webhook routes (must be before body parsing)
app.post(
  shopify.config.webhooks.path,
  ...shopify.processWebhooks({ webhookHandlers: webhookRoutes })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Auth routes - keep for initial OAuth install flow
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res, next) => {
    // After auth, check billing
    try {
      const session = res.locals.shopify.session;
      await setupBilling(session);
    } catch (e) {
      console.error("Billing setup error:", e);
    }
    next();
  },
  shopify.redirectToShopifyOrAppRoot()
);

// App Proxy Routes (public, no auth - must be before auth middleware)
app.use("/api/proxy", proxyRoutes);

// API Routes - use custom token exchange middleware instead of
// validateAuthenticatedSession() which causes OAuth loops in iframe context
app.use("/api/*", verifyToken());

// API Routes
app.use("/api", apiRoutes);

// Compression
app.use(compression());

// Serve static frontend
app.use(serveStatic(STATIC_PATH, { index: false }));

// Serve frontend for all other routes (SPA)
// No ensureInstalledOnShop - App Bridge handles auth via session tokens
app.use("/*", async (_req, res, _next) => {
  try {
    const htmlPath = join(STATIC_PATH, "index.html");
    let html = readFileSync(htmlPath, "utf-8");
    html = html.replace(
      "%SHOPIFY_API_KEY%",
      process.env.SHOPIFY_API_KEY || ""
    );
    res.status(200).set("Content-Type", "text/html").send(html);
  } catch (e) {
    res.status(500).send("App loading error. Please refresh.");
  }
});

app.listen(PORT, () => {
  console.log(`RTL Pro server running on port ${PORT}`);
});

