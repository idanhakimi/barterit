/**
 * Compatibility shim: replaces the BASE44 SDK with Supabase equivalents.
 * Pages that still use `base44.entities.X` or `base44.auth.*` will work
 * through this shim while we migrate them to direct Supabase imports.
 */
import { supabase } from '@/lib/supabase';
import { createEntity } from '@/entities/createEntity';

const entities = {
  User:               createEntity('users'),
  Match:              createEntity('matches'),
  Message:            createEntity('messages'),
  Block:              createEntity('blocks'),
  Notification:       createEntity('notifications'),
  Rating:             createEntity('ratings'),
  Report:             createEntity('reports'),
  BarterMeeting:      createEntity('barter_meetings'),
  Barter:             createEntity('barters'),
  SuperLike:          createEntity('super_likes'),
  ProfileView:        createEntity('profile_views'),
  BugReport:          createEntity('bug_reports'),
  ContactSubmission:  createEntity('contact_submissions'),
  Lead:               createEntity('leads'),
  EmailCampaign:      createEntity('email_campaigns'),
  PageView:           createEntity('page_views'),
};

const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error ?? new Error('Not authenticated');
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
    return { ...(profile ?? {}), id: user.id, email: user.email };
  },

  async redirectToLogin(redirectTo) {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo ?? window.location.origin + '/Dashboard' },
    });
  },

  async logout(redirectTo) {
    await supabase.auth.signOut();
    window.location.href = redirectTo ?? '/Home';
  },
};

const appLogs = {
  logUserInApp: () => Promise.resolve(),
};

export const base44 = { entities, auth, appLogs };
export default base44;
