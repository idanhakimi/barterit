# BARTER4U – מדריך Deployment מלא
## Supabase + Vercel | עלות: $0/חודש

---

## שלב 1: הקמת Supabase

1. לך ל-**https://supabase.com** → "Start your project" → התחבר עם GitHub
2. לחץ **"New project"**
   - Organization: שלך
   - Project name: `barter4u`
   - Database password: **שמור סיסמה חזקה!**
   - Region: **West EU (Frankfurt)** (הכי קרוב לישראל)
3. חכה 2 דקות עד שהפרויקט עולה

---

## שלב 2: הרצת ה-Schema

1. בתפריט שמאל: **SQL Editor** → **New query**
2. פתח את הקובץ `schema.sql` מהפרויקט
3. העתק את כל התוכן → הדבק ב-SQL Editor → **Run**
4. אמור לראות "Success" בירוק

---

## שלב 3: הגדרת Storage

1. בתפריט שמאל: **Storage** → **New bucket**
   - Bucket name: `avatars`
   - Public bucket: **✅ פעיל**
2. לחץ **"Create bucket"**
3. לך ל-**Storage → Policies** ולחץ על `avatars`:
   - Add policy → For full customization → Select operation: **INSERT**
   - Policy name: `Allow authenticated uploads`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     (bucket_id = 'avatars'::text)
     ```

---

## שלב 4: הגדרת Google Auth

1. לך ל-**Authentication → Providers → Google**
2. הפעל את Google
3. לך ל-**https://console.cloud.google.com**:
   - APIs & Services → Credentials → Create OAuth 2.0 Client
   - Application type: Web application
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. קבל **Client ID** ו-**Client Secret** → הדבק ב-Supabase
5. ב-Supabase Authentication → URL Configuration:
   - Site URL: `https://barter4u.com`
   - Redirect URLs: הוסף `https://barter4u.com/**`

---

## שלב 5: קבלת ה-API Keys

1. **Project Settings** → **API**
2. העתק:
   - **Project URL** (יראה כך: `https://xxxxx.supabase.co`)
   - **anon public key** (מפתח ארוך מאוד)

---

## שלב 6: Deploy ל-Vercel

1. Push הקוד ל-GitHub:
   ```
   git add .
   git commit -m "migrate to Supabase"
   git push
   ```

2. לך ל-**https://vercel.com** → התחבר עם GitHub
3. **"Add New Project"** → בחר `barterit`
4. Framework preset: **Vite**
5. **Environment Variables** → הוסף:
   ```
   VITE_SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key_here
   ```
6. לחץ **"Deploy"** → חכה 2 דקות

---

## שלב 7: חיבור הדומיין barter4u.com

1. ב-Vercel: **Project Settings → Domains**
2. הוסף `barter4u.com`
3. Vercel יתן לך **DNS records** – עדכן אותם אצל רשם הדומיין שלך
4. חכה עד 24 שעות ל-propagation (בדרך כלל תוך שעה)

---

## שלב 8: הגדרת Admin

1. הירשם לאפליקציה עם האימייל שלך
2. ב-Supabase: **Table Editor → users**
3. מצא את השורה שלך → ערוך → שנה `role` ל-`admin`
4. שמור

---

## צ'קליסט בדיקה

- [ ] הרשמה עם Google עובדת
- [ ] הרשמה עם Email עובדת
- [ ] כרטיסי משתמשים מוצגים ב-Dashboard
- [ ] Swipe Like / Dislike שומר ב-DB
- [ ] Match popup מופיע כשמאצ'ים הדדי
- [ ] Chat נפתח אחרי מאצ'
- [ ] הודעות Real-time מגיעות מיידית
- [ ] תמונות פרופיל מועלות ל-Supabase Storage
- [ ] Admin Dashboard מציג נתונים

---

## עלויות

| שירות | Free Tier | מתי משלמים |
|-------|-----------|------------|
| **Supabase** | 500MB DB, 50K users/month, 1GB storage | מעל 500MB DB |
| **Vercel** | ∞ deployments, 100GB bandwidth | מעל 100GB/month |
| **סה"כ** | **$0/חודש** | כשגדל משמעותית |

---

## גיבוי נתונים

Supabase מגבה אוטומטית (daily backups בחינם).
לגיבוי ידני: **Database → Backups** או דרך Dashboard:
```
supabase db dump --db-url "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" > backup.sql
```
