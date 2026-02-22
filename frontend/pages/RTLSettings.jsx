import React, { useState, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Checkbox,
  Banner,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

export default function RTLSettings() {
  const [settings, setSettings] = useState({
    rtlEnabled: true,
    rtlDirection: "rtl",
  });
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadSettings = useCallback(async () => {
    try {
      const data = await get("/settings");
      setSettings({
        rtlEnabled: data.settings.rtlEnabled,
        rtlDirection: data.settings.rtlDirection,
      });
    } catch (e) {
      console.error(e);
    }
  }, [get]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      await put("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Page
      title="הגדרות RTL"
      backAction={{ content: "חזרה", url: "/" }}
      primaryAction={{ content: "שמור", onAction: saveSettings, loading }}
    >
      <Layout>
        {saved && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setSaved(false)}>
              <p>ההגדרות נשמרו בהצלחה!</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">כיוון הטקסט</Text>
              <Text tone="subdued">
                הפוך את כיוון האתר שלך מימין לשמאל (RTL) בלחיצה אחת.
                כל האלמנטים באתר יתאימו את עצמם אוטומטית.
              </Text>

              <Checkbox
                label="הפעל RTL (ימין לשמאל)"
                checked={settings.rtlEnabled}
                onChange={(val) => setSettings({ ...settings, rtlEnabled: val })}
                helpText="מפעיל את כיוון הטקסט מימין לשמאל בכל האתר"
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">מה RTL משנה באתר?</Text>
              <BlockStack gap="200">
                <Text>- כיוון הטקסט מימין לשמאל</Text>
                <Text>- יישור אלמנטים מימין לשמאל</Text>
                <Text>- היפוך תפריטים וניווט</Text>
                <Text>- היפוך גלריות ומצגות</Text>
                <Text>- התאמת טפסים ושדות קלט</Text>
                <Text>- היפוך חיצים ואייקונים</Text>
                <Text>- התאמת Grid ו-Flexbox</Text>
                <Text>- תמיכה בכל הדפדפנים</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
