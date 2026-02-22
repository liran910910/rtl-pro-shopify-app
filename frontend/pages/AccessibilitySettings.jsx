import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, TextField, Select,
  Banner, Box,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    accessibilityEnabled: false,
    accessibilityWidget: false,
    accessibilityStatement: false,
    accessibilityStatementContent: "",
  });
  const [plan, setPlan] = useState("basic");
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadSettings = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings({
        accessibilityEnabled: data.settings.accessibilityEnabled,
        accessibilityWidget: data.settings.accessibilityWidget,
        accessibilityStatement: data.settings.accessibilityStatement,
        accessibilityStatementContent: data.settings.accessibilityStatementContent || "",
      });
      setPlan(data.settings.plan);
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      await put("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const needsUpgrade = plan === "basic";

  return (
    <Page
      title="הגדרות נגישות"
      backAction={{ content: "חזרה", url: "/" }}
      primaryAction={needsUpgrade ? undefined : { content: "שמור", onAction: saveSettings, loading }}
    >
      <Layout>
        {saved && (
          <Layout.Section><Banner tone="success" onDismiss={() => setSaved(false)}><p>נשמר!</p></Banner></Layout.Section>
        )}

        {needsUpgrade && (
          <Layout.Section>
            <Banner tone="warning" action={{ content: "שדרג ל-Pro", url: "/billing" }}>
              <p>תכונות הנגישות זמינות מתוכנית Pro ומעלה. שדרג כדי לגשת לכל תכונות הנגישות.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">מודול נגישות</Text>
              <Text tone="subdued">
                הוסף כפתור נגישות לאתר שלך בהתאם לחוק הנגישות הישראלי.
                הכפתור מאפשר ללקוחות שלך לשנות גודל פונט, ניגודיות, ועוד.
              </Text>

              <Checkbox
                label="הפעל מודול נגישות"
                checked={settings.accessibilityEnabled}
                onChange={(v) => setSettings({ ...settings, accessibilityEnabled: v })}
                disabled={needsUpgrade}
              />

              <Checkbox
                label="הצג כפתור נגישות צף"
                checked={settings.accessibilityWidget}
                onChange={(v) => setSettings({ ...settings, accessibilityWidget: v })}
                disabled={needsUpgrade || !settings.accessibilityEnabled}
                helpText="כפתור נגישות שמופיע בכל דפי האתר"
              />

              <Checkbox
                label="הצג הצהרת נגישות"
                checked={settings.accessibilityStatement}
                onChange={(v) => setSettings({ ...settings, accessibilityStatement: v })}
                disabled={needsUpgrade || !settings.accessibilityEnabled}
                helpText="הצהרת נגישות לפי חוק שוויון זכויות לאנשים עם מוגבלות"
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">תכונות הנגישות</Text>
              <BlockStack gap="200">
                <Text>&#x2705; שינוי גודל טקסט</Text>
                <Text>&#x2705; ניגודיות גבוהה</Text>
                <Text>&#x2705; גווני אפור</Text>
                <Text>&#x2705; הדגשת קישורים</Text>
                <Text>&#x2705; סמן גדול</Text>
                <Text>&#x2705; סרגל קריאה</Text>
                <Text>&#x2705; עצירת אנימציות</Text>
                <Text>&#x2705; ריווח טקסט</Text>
                <Text>&#x2705; הצהרת נגישות מלאה בעברית</Text>
                <Text>&#x2705; תואם WCAG 2.1 AA</Text>
                <Text>&#x2705; תואם תקן 5568</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
