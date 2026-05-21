import { supabase } from '@/lib/supabase';
import { createEntity } from './createEntity';

const base = createEntity('users');

export const User = {
  ...base,

  /** Get the currently logged-in user's profile */
  async me() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError ?? new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return { ...data, email: user.email };
  },

  /** Update the currently logged-in user's profile */
  async updateMyUserData(payload) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError ?? new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Filter users by conditions (overrides base to add public read) */
  async filter(conditions = {}, orderBy = '-created_date', limit = 1000) {
    return base.filter(conditions, orderBy, limit);
  },

  /** Redirect to Supabase Google login */
  async login() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/Dashboard` },
    });
    if (error) throw error;
  },

  /** Sign out */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Update any user (admin only in practice, enforced by RLS) */
  async update(id, payload) {
    return base.update(id, payload);
  },
};
