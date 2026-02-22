// RTL Pro - Shopify Configuration
const shopifyAppExpress = require("@shopify/shopify-app-express");
const { LATEST_API_VERSION, shopifyApp } = shopifyAppExpress;
const prismaSessionStorage = require("@shopify/shopify-app-session-storage-prisma");
const { PrismaSessionStorage } = prismaSessionStorage;
const prismaClient = require("@prisma/client");
const { PrismaClient } = prismaClient;
const shopifyApiRest = require("@shopify/shopify-api/rest/admin/2024-10");
const { restResources } = shopifyApiRest;

const prisma = new PrismaClient();

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: {
      // Basic Plan
      "RTL Pro Basic": {
        amount: 7.75,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 5,
      },
      // Pro Plan
      "RTL Pro Pro": {
        amount: 9.95,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 5,
      },
      // Premium Plan
      "RTL Pro Premium": {
        amount: 14.75,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 5,
      },
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new PrismaSessionStorage(prisma),
});

module.exports = shopify;
module.exports.prisma = prisma;
