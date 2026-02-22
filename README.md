# RTL Pro - Shopify RTL & Hebrew App

אפליקציית Shopify להפיכת חנויות לעברית עם תמיכה מלאה ב-RTL.

## תכונות

### Basic Plan ($7.75/חודש)
- **RTL Layout** - היפוך כיוון האתר מימין לשמאל בלחיצה אחת
- **תרגום לעברית** - תרגום אוטומטי של כפתורים, ניווט, סל קניות, חיפוש, פילטרים ועוד
- **תרגום התראות** - תרגום מלא של כל ההתראות והאימיילים ללקוחות
- **פונטים עבריים** - 12 פונטים עבריים מ-Google Fonts
- **תרגום כפתורי קנייה** - "הוסף לסל", "קנה עכשיו" ועוד
- **אייקוני תשלום** - Visa, Mastercard, PayPal, Bit, Apple Pay ועוד
- **תמיכה באימייל/צ'אט**
- **עדכוני תמה**

### Pro Plan ($9.95/חודש)
- כל תכונות Basic
- **מודול נגישות** - כפתור נגישות צף עם 8 תכונות
- **הצהרת נגישות** - הצהרה מלאה בעברית לפי חוק הנגישות הישראלי
- **תואם WCAG 2.1 AA ותקן 5568**

### Premium Plan ($14.75/חודש)
- כל תכונות Pro
- **עורך CSS מותאם** - עריכת CSS ישירות מהאפליקציה
- **זיהוי מיקוד אוטומטי** - זיהוי עיר לפי מיקוד ישראלי

## התקנה

### דרישות מוקדמות
- Node.js 18+
- חשבון Shopify Partners
- Shopify CLI

### שלבים

1. **שכפל את הפרויקט:**
```bash
git clone <repo-url>
cd rtl-pro
```

2. **התקן תלויות:**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **הגדר משתני סביבה:**
```bash
cp .env.example .env
# ערוך את .env עם הפרטים שלך
```

4. **הגדר את מסד הנתונים:**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **עדכן את shopify.app.toml:**
- הכנס את ה-client_id שלך
- הכנס את ה-application_url שלך
- הכנס את ה-dev_store_url שלך

6. **הפעל בסביבת פיתוח:**
```bash
npm run dev
```

## מבנה הפרויקט

```
rtl-pro/
├── package.json              # תלויות הפרויקט
├── shopify.app.toml          # הגדרות אפליקציית Shopify
├── .env.example              # דוגמה למשתני סביבה
├── web/                      # Backend
│   ├── index.js              # שרת Express ראשי
│   ├── shopify.js            # הגדרות Shopify API + Billing
│   ├── database/
│   │   └── schema.prisma     # סכמת מסד נתונים
│   ├── routes/
│   │   ├── api.js            # API Routes (הגדרות, תרגומים, מיקוד)
│   │   ├── webhooks.js       # Webhook Handlers
│   │   └── proxy.js          # App Proxy (ציבורי)
│   ├── helpers/
│   │   └── billing.js        # ניהול תשלומים ומנויים
│   └── translations/
│       ├── hebrew.json       # מילון תרגומים מלא
│       └── notifications.json # תבניות התראות
├── frontend/                 # Admin Dashboard
│   ├── App.jsx               # React App ראשי
│   ├── hooks/
│   │   └── useApi.js         # API Hook
│   ├── components/
│   │   └── AppFrame.jsx      # Navigation Frame
│   └── pages/
│       ├── Dashboard.jsx      # דשבורד ראשי
│       ├── RTLSettings.jsx    # הגדרות RTL
│       ├── TranslationSettings.jsx # תרגומים
│       ├── NotificationSettings.jsx # התראות
│       ├── FontSettings.jsx   # פונטים
│       ├── AccessibilitySettings.jsx # נגישות
│       ├── CustomCSSEditor.jsx # CSS מותאם
│       ├── PaymentIcons.jsx   # אייקוני תשלום
│       ├── PostcodeSettings.jsx # זיהוי מיקוד
│       └── BillingPage.jsx    # מנוי ותשלום
└── extensions/               # Theme App Extension
    └── rtl-pro-theme-extension/
        ├── shopify.extension.toml
        ├── blocks/
        │   ├── rtl-core.liquid           # בלוק RTL ראשי
        │   └── accessibility-widget.liquid # בלוק נגישות
        └── assets/
            ├── rtl-core.css              # CSS RTL מלא
            ├── rtl-core.js               # מנוע RTL + תרגום
            ├── accessibility-widget.css   # CSS נגישות
            └── accessibility-widget.js    # וידג'ט נגישות
```

## פריסה ל-Shopify App Store

1. **צור אפליקציה ב-Shopify Partners:**
   - היכנס ל-https://partners.shopify.com
   - צור App חדשה
   - העתק את ה-API Key ו-Secret

2. **פרוס את השרת:**
   - פרוס ל-Railway, Heroku, Fly.io, או שרת משלך
   - הגדר את משתני הסביבה

3. **דפלוי:**
```bash
shopify app deploy
```

4. **שלח לבדיקה:**
   - היכנס ל-Partner Dashboard
   - שלח את האפליקציה לבדיקת Shopify

## טכנולוגיות

- **Backend:** Node.js, Express, Prisma, SQLite
- **Frontend:** React, Shopify Polaris, Vite
- **Shopify:** Shopify API, App Bridge, Theme App Extensions
- **תשלומים:** Shopify Billing API

## רישיון

Private - All rights reserved.
