-- ============================================================
-- BARTER4U - Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  age           INTEGER,
  location      TEXT,
  bio           TEXT,
  phone         TEXT,
  services_offered  TEXT[] DEFAULT '{}',
  services_wanted   TEXT[] DEFAULT '{}',
  profile_image TEXT,
  rating_score  NUMERIC(3,2) DEFAULT 0,
  role          TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  super_likes   INTEGER DEFAULT 3,
  consent_accepted  BOOLEAN DEFAULT FALSE,
  consent_date  TIMESTAMPTZ,
  created_date  TIMESTAMPTZ DEFAULT NOW(),
  updated_date  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_date)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user1_liked BOOLEAN DEFAULT FALSE,
  user2_liked BOOLEAN DEFAULT FALSE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
  matched_at  TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS matches_user1_idx ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS matches_user2_idx ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS matches_status_idx ON public.matches(status);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id   UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_match_idx ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_date);

-- ============================================================
-- BLOCKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type          TEXT,
  title         TEXT,
  body          TEXT,
  from_user_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  related_id    UUID,
  read          BOOLEAN DEFAULT FALSE,
  created_date  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx  ON public.notifications(user_id, read);

-- ============================================================
-- RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rated_user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating_user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score            NUMERIC(3,1) NOT NULL CHECK (score >= 1 AND score <= 5),
  comment          TEXT,
  barter_description TEXT,
  created_date     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ratings_rated_idx ON public.ratings(rated_user_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason       TEXT,
  match_id     UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  status       TEXT DEFAULT 'new',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BARTER MEETINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.barter_meetings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title          TEXT,
  proposed_date  TIMESTAMPTZ,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes          TEXT,
  created_date   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS barter_meetings_org_idx  ON public.barter_meetings(organizer_id);
CREATE INDEX IF NOT EXISTS barter_meetings_part_idx ON public.barter_meetings(participant_id);

-- ============================================================
-- BARTERS (completed exchanges)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.barters (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id    UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  description TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS barters_user1_idx ON public.barters(user1_id);
CREATE INDEX IF NOT EXISTS barters_user2_idx ON public.barters(user2_id);

-- ============================================================
-- SUPER LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.super_likes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, recipient_id)
);

-- ============================================================
-- PROFILE VIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profile_views (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  viewed_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profile_views_viewed_idx ON public.profile_views(viewed_id);

-- ============================================================
-- BUG REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_email   TEXT,
  reporter_name    TEXT,
  bug_description  TEXT,
  page_url         TEXT,
  status           TEXT DEFAULT 'new',
  priority         TEXT DEFAULT 'medium',
  created_date     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT,
  email        TEXT,
  message      TEXT,
  status       TEXT DEFAULT 'new',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEADS (CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT,
  email        TEXT,
  phone        TEXT,
  source       TEXT DEFAULT 'contact_form',
  status       TEXT DEFAULT 'new',
  notes        TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT,
  subject          TEXT,
  body             TEXT,
  status           TEXT DEFAULT 'draft',
  recipient_count  INTEGER DEFAULT 0,
  sent_at          TIMESTAMPTZ,
  created_date     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAGE VIEWS (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_name    TEXT,
  user_agent   TEXT,
  referrer     TEXT,
  session_id   TEXT,
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barter_meetings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_likes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views        ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- USERS policies
CREATE POLICY "Users are publicly readable"      ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile"     ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"     ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can delete users"          ON public.users FOR DELETE USING (public.is_admin());

-- MATCHES policies
CREATE POLICY "Users see their matches"          ON public.matches FOR SELECT USING (auth.uid() IN (user1_id, user2_id) OR public.is_admin());
CREATE POLICY "Users create matches"             ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users update their matches"       ON public.matches FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));
CREATE POLICY "Admins see all matches"           ON public.matches FOR SELECT USING (public.is_admin());

-- MESSAGES policies
CREATE POLICY "Users see messages in their matches" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND auth.uid() IN (m.user1_id, m.user2_id)));
CREATE POLICY "Users send messages in their matches" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND auth.uid() IN (m.user1_id, m.user2_id)));

-- BLOCKS policies
CREATE POLICY "Users see own blocks"             ON public.blocks FOR SELECT USING (auth.uid() IN (blocker_id, blocked_id));
CREATE POLICY "Users create blocks"              ON public.blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users delete own blocks"          ON public.blocks FOR DELETE USING (auth.uid() = blocker_id);

-- NOTIFICATIONS policies
CREATE POLICY "Users see own notifications"      ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can create notifs"  ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users update own notifications"   ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RATINGS policies
CREATE POLICY "Ratings are publicly readable"    ON public.ratings FOR SELECT USING (TRUE);
CREATE POLICY "Auth users can rate"              ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rating_user_id);

-- REPORTS policies
CREATE POLICY "Auth users can report"            ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins see reports"               ON public.reports FOR SELECT USING (public.is_admin());

-- BARTER MEETINGS policies
CREATE POLICY "Meeting participants can see"     ON public.barter_meetings FOR SELECT USING (auth.uid() IN (organizer_id, participant_id));
CREATE POLICY "Organizer creates meeting"        ON public.barter_meetings FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Meeting participants can update"  ON public.barter_meetings FOR UPDATE USING (auth.uid() IN (organizer_id, participant_id));

-- BARTERS policies
CREATE POLICY "Barter users can see"             ON public.barters FOR SELECT USING (auth.uid() IN (user1_id, user2_id) OR public.is_admin());
CREATE POLICY "Auth users create barters"        ON public.barters FOR INSERT WITH CHECK (auth.uid() IN (user1_id, user2_id));
CREATE POLICY "Barter users update"              ON public.barters FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

-- SUPER LIKES policies
CREATE POLICY "Super like sender sees own"       ON public.super_likes FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));
CREATE POLICY "Auth users send super likes"      ON public.super_likes FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- PROFILE VIEWS policies
CREATE POLICY "Profile owners see views"         ON public.profile_views FOR SELECT USING (auth.uid() = viewed_id);
CREATE POLICY "Auth users create views"          ON public.profile_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Public write policies (no auth needed for forms)
CREATE POLICY "Anyone can submit bugs"           ON public.bug_reports FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins see bug reports"           ON public.bug_reports FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update bug reports"        ON public.bug_reports FOR UPDATE USING (public.is_admin());

CREATE POLICY "Anyone can submit contact"        ON public.contact_submissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins see contacts"              ON public.contact_submissions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update contacts"           ON public.contact_submissions FOR UPDATE USING (public.is_admin());

CREATE POLICY "Anyone can create leads"          ON public.leads FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage leads"              ON public.leads FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update leads"              ON public.leads FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete leads"              ON public.leads FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins manage campaigns"          ON public.email_campaigns FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can log page views"        ON public.page_views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins see page views"            ON public.page_views FOR SELECT USING (public.is_admin());

-- ============================================================
-- REALTIME: enable for messaging and notifications
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
