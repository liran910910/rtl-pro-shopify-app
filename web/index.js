// RTL Pro - Main Server
const { join, resolve } = require("path");
const { readFileSync } = require("fs");
const express = require("express");
const compression = require("compression");
const serveStatic = require("serve-static");
const shopify = require("./shopify.js");
const { setupBilling } = require("./helpers/billing.js");
const { apiRoutes } = require("./routes/api.js");
const { webhookRoutes } = require("./routes/webhooks.js");
const { proxyRoutes } = require("./routes/proxy.js");

const PORT = parseInt(process.env.PORT || "3000", 10);
const STATIC_PATH = resolve("frontend/dist");
const isProd = process.env.NODE_ENV === "production";

const app = express();

// Trust proxy for secure cookies behind load balancers
app.set("trust proxy", true);

// Webhook routes (must be before body parsing)
app.post(
  shopify.config.webhooks.path,
  ...shopify.processWebhooks({ webhookHandlers: webhookRoutes })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Auth
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

// Ensure installed middleware for API routes
app.use("/api/*", shopify.validateAuthenticatedSession());

// API Routes
app.use("/api", apiRoutes);

// App Proxy Routes (public, no auth)
app.use("/api/proxy", proxyRoutes);

// Compression
app.use(compression());

// Serve static frontend
app.use(serveStatic(STATIC_PATH, { index: false }));

// Serve frontend for all other routes (SPA)
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  try {
    const htmlPath = join(STATIC_PATH, "index.html");
    const html = readFileSync(htmlPath, "utf-8");
    res.status(200).set("Content-Type", "text/html").send(html);
  } catch (e) {
    res.status(500).send("App loading error. Please refresh.");
  }
});

app.listen(PORT, () => {
  console.log(`RTL Pro server running on port ${PORT}`);
});
