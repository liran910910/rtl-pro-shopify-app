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
  const { get, loading } = useApi();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings(data.settings);
      setPlan(data.plan);
    } catch (e) {
      console.error(e);
    }
  }, [get]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !settings) {
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
    { key: "translationEnabled", label: "תרגום לעברית", path: "/translations" },
    { key: "notificationsEnabled", label: "תרגום התראות", path: "/notifications" },
    { key: "fontEnabled", label: "פונט מותאם", path: "/fonts" },
    { key: "paymentIconsEnabled", label: "אייקוני תשלום", path: "/payment-icons" },
    { key: "accessibilityEnabled", label: "נגישות", path: "/accessibility", plan: "pro" },
    { key: "customCssEnabled", label: "CSS מותאם", path: "/custom-css", plan: "premium" },
    { key: "postcodeDetection", label: "זיהוי מיקוד", path: "/postcode", plan: "premium" },
  ];

  return (
    <Page title="RTL Pro - דשבורד">
      <Layout>
        <Layout.Section>
          <Banner tone="success">
            <p>ברוך הבא ל-RTL Pro! האפליקציה שלך פעילה ומוכנה לשימוש.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">סטטוס</Text>
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
                        הגדרות
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
              <Text variant="headingMd" as="h2">המנוי שלך</Text>
              <BlockStack gap="200">
                <Text>
                  <strong>תוכנית:</strong> {plan?.name || "Basic"}
                </Text>
                <Text>
                  <strong>מחיר:</strong> ${plan?.price || "7.75"}/חודש
                </Text>
                <Button onClick={() => navigate("/billing")}>
                  ניהול מנוי
                </Button>
              </BlockStack>
            </BlockStack>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">פעולות מהירות</Text>
                <BlockStack gap="200">
                  <Button onClick={() => navigate("/rtl")} variant="primary" fullWidth>
                    הפעל RTL
                  </Button>
                  <Button onClick={() => navigate("/translations")} fullWidth>
                    נהל תרגומים
                  </Button>
                  <Button onClick={() => navigate("/fonts")} fullWidth>
                    בחר פונט עברי
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">צריכים עזרה?</Text>
              <Text>
                אם יש לך שאלות או שאתה צריך עזרה עם ההגדרות, צור קשר עם הצוות שלנו.
                אנחנו כאן לעזור!
              </Text>
              <InlineStack gap="200">
                <Button url="mailto:support@rtlpro.app">שלח אימייל</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
