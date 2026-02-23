import React, { useState, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  Banner,
  BlockStack,
  InlineStack,
  Box,
  Button,
  Icon,
  Spinner,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
} from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi.js";

export default function Dashboard() {
  const [settings, setSettings] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const { get, loading } = useApi();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings(data.settings);
      setPlan(data.plan);
    } catch (e) {
      console.error(e);
      setLoadError(true);
      setSettings({});
      setPlan({ key: "basic", name: "Basic", price: "7.75" });
    }
  }, [get]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !settings && !loadError) {
    return (
      <Page title="RTL Pro">
        <Box padding="800" minHeight="300px">
          <InlineStack align="center">
            <Spinner size="large" />
          </InlineStack>
        </Box>
      </Page>
    );
  }

  const planBadge = {
    basic: <Badge tone="info">Basic</Badge>,
    pro: <Badge tone="attention">Pro</Badge>,
    premium: <Badge tone="success">Premium</Badge>,
  };

  const features = [
    { key: "rtlEnabled", label: "RTL Layout", path: "/rtl" },
    { key: "translationEnabled", label: "\u05ea\u05e8\u05d2\u05d5\u05dd \u05dc\u05e2\u05d1\u05e8\u05d9\u05ea", path: "/translations" },
    { key: "notificationsEnabled", label: "\u05ea\u05e8\u05d2\u05d5\u05dd \u05d4\u05ea\u05e8\u05d0\u05d5\u05ea", path: "/notifications" },
    { key: "fontEnabled", label: "\u05e4\u05d5\u05e0\u05d8 \u05de\u05d5\u05ea\u05d0\u05dd", path: "/fonts" },
    { key: "paymentIconsEnabled", label: "\u05d0\u05d9\u05d9\u05e7\u05d5\u05e0\u05d9 \u05ea\u05e9\u05dc\u05d5\u05dd", path: "/payment-icons" },
    { key: "accessibilityEnabled", label: "\u05e0\u05d2\u05d9\u05e9\u05d5\u05ea", path: "/accessibility", plan: "pro" },
    { key: "customCssEnabled", label: "CSS \u05de\u05d5\u05ea\u05d0\u05dd", path: "/custom-css", plan: "premium" },
    { key: "postcodeDetection", label: "\u05d6\u05d9\u05d4\u05d5\u05d9 \u05de\u05d9\u05e7\u05d5\u05d3", path: "/postcode", plan: "premium" },
  ];

  return (
    <Page title="RTL Pro - \u05d3\u05e9\u05d1\u05d5\u05e8\u05d3">
      <Layout>
        <Layout.Section>
          {loadError ? (
            <Banner tone="warning">
              <p>\u05dc\u05d0 \u05e0\u05d9\u05ea\u05df \u05dc\u05d8\u05e2\u05d5\u05df \u05d0\u05ea \u05d4\u05d4\u05d2\u05d3\u05e8\u05d5\u05ea. \u05de\u05e6\u05d9\u05d2 \u05e2\u05e8\u05db\u05d9\u05dd \u05d1\u05e8\u05d9\u05e8\u05ea \u05de\u05d7\u05d3\u05dc.</p>
            </Banner>
          ) : (
            <Banner tone="success">
              <p>\u05d1\u05e8\u05d5\u05da \u05d4\u05d1\u05d0 \u05dc-RTL Pro! \u05d4\u05d0\u05e4\u05dc\u05d9\u05e7\u05e6\u05d9\u05d4 \u05e9\u05dc\u05da \u05e4\u05e2\u05d9\u05dc\u05d4 \u05d5\u05de\u05d5\u05db\u05e0\u05d4 \u05dc\u05e9\u05d9\u05de\u05d5\u05e9.</p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">\u05e1\u05d8\u05d8\u05d5\u05e1</Text>
                {plan && planBadge[plan.key]}
              </InlineStack>

              <BlockStack gap="200">
                {features.map((feature) => {
                  const isEnabled = settings?.[feature.key];
                  const needsUpgrade = feature.plan && plan?.key === "basic" && feature.plan !== "basic";
                  const needsProUpgrade = feature.plan === "pro" && plan?.key === "basic";
                  const needsPremiumUpgrade = feature.plan === "premium" && !["premium"].includes(plan?.key);

                  return (
                    <InlineStack key={feature.key} align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon
                          source={isEnabled ? CheckCircleIcon : XCircleIcon}
                          tone={isEnabled ? "success" : "subdued"}
                        />
                        <Text>{feature.label}</Text>
                        {(needsProUpgrade || needsPremiumUpgrade) && (
                          <Badge tone="warning" size="small">
                            {feature.plan === "premium" ? "Premium" : "Pro"}
                          </Badge>
                        )}
                      </InlineStack>
                      <Button
                        size="slim"
                        onClick={() => navigate(feature.path)}
                      >
                        \u05d4\u05d2\u05d3\u05e8\u05d5\u05ea
                      </Button>
                    </InlineStack>
                  );
                })}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">\u05d4\u05de\u05e0\u05d5\u05d9 \u05e9\u05dc\u05da</Text>
              <BlockStack gap="200">
                <Text>
                  <strong>\u05ea\u05d5\u05db\u05e0\u05d9\u05ea:</strong> {plan?.name || "Basic"}
                </Text>
                <Text>
                  <strong>\u05de\u05d7\u05d9\u05e8:</strong> ${plan?.price || "7.75"}/\u05d7\u05d5\u05d3\u05e9
                </Text>
                <Button onClick={() => navigate("/billing")}>
                  \u05e0\u05d9\u05d4\u05d5\u05dc \u05de\u05e0\u05d5\u05d9
                </Button>
              </BlockStack>
            </BlockStack>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">\u05e4\u05e2\u05d5\u05dc\u05d5\u05ea \u05de\u05d4\u05d9\u05e8\u05d5\u05ea</Text>
                <BlockStack gap="200">
                  <Button onClick={() => navigate("/rtl")} variant="primary" fullWidth>
                    \u05d4\u05e4\u05e2\u05dc RTL
                  </Button>
                  <Button onClick={() => navigate("/translations")} fullWidth>
                    \u05e0\u05d4\u05dc \u05ea\u05e8\u05d2\u05d5\u05de\u05d9\u05dd
                  </Button>
                  <Button onClick={() => navigate("/fonts")} fullWidth>
                    \u05d1\u05d7\u05e8 \u05e4\u05d5\u05e0\u05d8 \u05e2\u05d1\u05e8\u05d9
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">\u05e6\u05e8\u05d9\u05db\u05d9\u05dd \u05e2\u05d6\u05e8\u05d4?</Text>
              <Text>
                \u05d0\u05dd \u05d9\u05e9 \u05dc\u05da \u05e9\u05d0\u05dc\u05d5\u05ea \u05d0\u05d5 \u05e9\u05d0\u05ea\u05d4 \u05e6\u05e8\u05d9\u05da \u05e2\u05d6\u05e8\u05d4 \u05e2\u05dd \u05d4\u05d4\u05d2\u05d3\u05e8\u05d5\u05ea, \u05e6\u05d5\u05e8 \u05e7\u05e9\u05e8 \u05e2\u05dd \u05d4\u05e6\u05d5\u05d5\u05ea \u05e9\u05dc\u05e0\u05d5.
                \u05d0\u05e0\u05d7\u05e0\u05d5 \u05db\u05d0\u05df \u05dc\u05e2\u05d6\u05d5\u05e8!
              </Text>
              <InlineStack gap="200">
                <Button url="mailto:support@rtlpro.app">\u05e9\u05dc\u05d7 \u05d0\u05d9\u05de\u05d9\u05d9\u05dc</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
