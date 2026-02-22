import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, Select, Banner,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

const PAYMENT_OPTIONS = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "Mastercard" },
  { key: "amex", label: "American Express" },
  { key: "paypal", label: "PayPal" },
  { key: "apple_pay", label: "Apple Pay" },
  { key: "google_pay", label: "Google Pay" },
  { key: "bit", label: "Bit (ישראל)" },
  { key: "isracard", label: "ישראכרט" },
  { key: "diners", label: "Diners Club" },
  { key: "max", label: "Max (לאומי קארד)" },
];

const POSITION_OPTIONS = [
  { label: "בפוטר", value: "footer" },
  { label: "בדף מוצר", value: "product" },
  { label: "בסל הקניות", value: "cart" },
  { label: "בכל המקומות", value: "all" },
];

export default function PaymentIcons() {
  const [settings, setSettings] = useState({
    paymentIconsEnabled: false,
    paymentIcons: [],
    paymentIconsPosition: "footer",
  });
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadSettings = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings({
        paymentIconsEnabled: data.settings.paymentIconsEnabled,
        paymentIcons: JSON.parse(data.settings.paymentIcons || "[]"),
        paymentIconsPosition: data.settings.paymentIconsPosition,
      });
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      await put("/settings", {
        paymentIconsEnabled: settings.paymentIconsEnabled,
        paymentIcons: JSON.stringify(settings.paymentIcons),
        paymentIconsPosition: settings.paymentIconsPosition,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const toggleIcon = (key) => {
    setSettings((prev) => ({
      ...prev,
      paymentIcons: prev.paymentIcons.includes(key)
        ? prev.paymentIcons.filter((k) => k !== key)
        : [...prev.paymentIcons, key],
    }));
  };

  return (
    <Page
      title="אייקוני תשלום"
      backAction={{ content: "חזרה", url: "/" }}
      primaryAction={{ content: "שמור", onAction: saveSettings, loading }}
    >
      <Layout>
        {saved && (
          <Layout.Section><Banner tone="success" onDismiss={() => setSaved(false)}><p>נשמר!</p></Banner></Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">אייקוני אמצעי תשלום</Text>
              <Text tone="subdued">
                הוסף אייקוני אמצעי תשלום לאתר שלך כדי לבנות אמון עם הלקוחות.
              </Text>

              <Checkbox
                label="הצג אייקוני תשלום"
                checked={settings.paymentIconsEnabled}
                onChange={(v) => setSettings({ ...settings, paymentIconsEnabled: v })}
              />

              <Select
                label="מיקום"
                options={POSITION_OPTIONS}
                value={settings.paymentIconsPosition}
                onChange={(v) => setSettings({ ...settings, paymentIconsPosition: v })}
                disabled={!settings.paymentIconsEnabled}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">בחר אמצעי תשלום</Text>
              {PAYMENT_OPTIONS.map((option) => (
                <Checkbox
                  key={option.key}
                  label={option.label}
                  checked={settings.paymentIcons.includes(option.key)}
                  onChange={() => toggleIcon(option.key)}
                  disabled={!settings.paymentIconsEnabled}
                />
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
