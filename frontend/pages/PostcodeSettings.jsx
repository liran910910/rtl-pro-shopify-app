import React, { useState, useEffect, useCallback } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Checkbox, Banner,
} from "@shopify/polaris";
import { useApi } from "../hooks/useApi.js";

export default function PostcodeSettings() {
  const [enabled, setEnabled] = useState(false);
  const [plan, setPlan] = useState("basic");
  const [saved, setSaved] = useState(false);
  const { get, put, loading } = useApi();

  const loadSettings = useCallback(async () => {
    try {
      const data = await get("/settings");
      setEnabled(data.settings.postcodeDetection);
      setPlan(data.settings.plan);
    } catch (e) { console.error(e); }
  }, [get]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      await put("/settings", { postcodeDetection: enabled });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const needsUpgrade = plan !== "premium";

  return (
    <Page
      title="זיהוי מיקוד אוטומטי"
      backAction={{ content: "חזרה", url: "/" }}
      primaryAction={needsUpgrade ? undefined : { content: "שמור", onAction: saveSettings, loading }}
    >
      <Layout>
        {saved && (
          <Layout.Section><Banner tone="success" onDismiss={() => setSaved(false)}><p>נשמר!</p></Banner></Layout.Section>
        )}

        {needsUpgrade && (
          <Layout.Section>
            <Banner tone="warning" action={{ content: "שדרג ל-Premium", url: "/billing" }}>
              <p>זיהוי מיקוד אוטומטי זמין רק בתוכנית Premium.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">זיהוי מיקוד ישראלי</Text>
              <Text tone="subdued">
                כאשר הלקוח מזין מיקוד ישראלי, המערכת תזהה אוטומטית את העיר
                ותמלא אותה בשדה הכתובת. חוסך זמן ומפחית שגיאות!
              </Text>

              <Checkbox
                label="הפעל זיהוי מיקוד אוטומטי"
                checked={enabled}
                onChange={setEnabled}
                disabled={needsUpgrade}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">ערים נתמכות</Text>
              <Text tone="subdued">
                המערכת תומכת במיקודים של כל הערים הגדולות בישראל:
              </Text>
              <BlockStack gap="100">
                <Text>תל אביב-יפו, ירושלים, חיפה, באר שבע, נתניה</Text>
                <Text>ראשון לציון, פתח תקווה, אשדוד, הרצליה, רמת גן</Text>
                <Text>חולון, בני ברק, בת ים, רחובות, אשקלון</Text>
                <Text>כפר סבא, רעננה, מודיעין, אילת, נצרת</Text>
                <Text>עכו, טבריה, כרמיאל, חדרה, ועוד...</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
