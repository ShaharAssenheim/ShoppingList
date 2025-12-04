// Next.js-compatible Supabase client and helpers.
// Uses NEXT_PUBLIC_* env vars so client can run in the browser.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') as string;
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '') as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

export type DbItem = {
  id: string;
  group_id: string;
  name: string;
  is_completed: boolean;
  emoji: string;
  category: string;
  created_at: string;
};

export type DbGroup = {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
};

export type DbGroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
};

// CRUD helpers for groups
export async function createGroup(name: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_group', { p_name: name });
  if (error) throw error;
  return data as string;
}

// Diagnostic function to check database state
export async function debugUserGroupMembership() {
  const { data: user } = await supabase.auth.getUser();
  console.log('Current user:', user?.user?.id, user?.user?.email);
  
  // Check all groups (ignoring RLS)
  const { data: allGroups } = await supabase
    .from('groups')
    .select('*');
  console.log('All groups in database:', allGroups);
  
  // Check all group members
  const { data: allMembers } = await supabase
    .from('group_members')
    .select('*');
  console.log('All group_members in database:', allMembers);
  
  // Check what groups RLS allows
  const { data: myGroups } = await supabase
    .from('groups')
    .select('*');
  console.log('Groups visible via RLS:', myGroups);
  
  return { user: user?.user, allGroups, allMembers, myGroups };
}

export async function listUserGroups(): Promise<DbGroup[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error('Error getting user:', userError);
    return [];
  }

  // Fetch groups the current user belongs to
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
  return data ?? [];
}

export async function getUserFirstGroup(): Promise<DbGroup | null> {
  const groups = await listUserGroups();
  return groups.length > 0 ? groups[0] : null;
}

export async function fetchGroup(groupId: string): Promise<DbGroup | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();
  
  if (error) {
    console.error('Error fetching group:', error);
    return null;
  }
  return data;
}

export async function joinGroup(groupId: string): Promise<void> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) {
    throw userError || new Error('No authenticated user');
  }

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userResult.user.id, role: 'member' });
  if (error) throw error;
}

// CRUD helpers for items
export async function fetchItems(groupId: string): Promise<DbItem[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addItem(groupId: string, name: string, emoji = '🛒', category = 'כללי'): Promise<DbItem> {
  const { data, error } = await supabase
    .from('items')
    .insert({ group_id: groupId, name, emoji, category })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding item:', error);
    throw error;
  }
  
  return data as DbItem;
}

export async function toggleItemCompleted(id: string, isCompleted: boolean): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({ is_completed: isCompleted })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCompletedItems(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('group_id', groupId)
    .eq('is_completed', true);
  if (error) throw error;
}

export async function deleteAllItems(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('group_id', groupId);
  if (error) throw error;
}

// User management
export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
};

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('email');
  
  if (error) throw error;
  return data ?? [];
}

export async function createOrUpdateUserProfile(userId: string, email: string, fullName?: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, email, full_name: fullName });
  
  if (error) throw error;
}

export async function getGroupMembers(groupId: string): Promise<DbGroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId);
  
  if (error) throw error;
  return data ?? [];
}

export async function addUserToGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId, role: 'member' });
  
  if (error) throw error;
}

export async function removeUserFromGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  
  if (error) throw error;
}
