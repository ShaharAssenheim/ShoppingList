"use client";
import { useState, useEffect } from 'react';
import { getGroupMembers, addUserToGroup, removeUserFromGroup, getAllUsers, UserProfile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ManageGroupMembersProps {
  groupId: string;
  groupOwnerId: string;
  onClose: () => void;
}

interface MemberWithProfile {
  id: string;
  user_id: string;
  role: string;
  profile?: UserProfile;
}

export const ManageGroupMembers = ({ groupId, groupOwnerId, onClose }: ManageGroupMembersProps) => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOwner = currentUser?.id === groupOwnerId;

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      // Load all users first
      const users = await getAllUsers();
      setAllUsers(users);
      
      // Load members
      const memberData = await getGroupMembers(groupId);
      
      // Enrich members with profile info
      const enrichedMembers = memberData.map(member => ({
        ...member,
        profile: users.find(u => u.id === member.user_id)
      }));
      setMembers(enrichedMembers);
      
      // Filter available users
      const memberIds = new Set(memberData.map(m => m.user_id));
      const available = users.filter(user => !memberIds.has(user.id));
      setAvailableUsers(available);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !isOwner) return;

    setLoading(true);
    setError('');

    try {
      await addUserToGroup(groupId, selectedUserId);
      await loadData();
      setSelectedUserId('');
    } catch (e: any) {
      setError(e.message || 'שגיאה בהוספת משתמש');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!isOwner || userId === groupOwnerId) return;
    
    if (!window.confirm('האם אתה בטוח שברצונך להסיר משתמש זה מהקבוצה?')) return;

    try {
      await removeUserFromGroup(groupId, userId);
      await loadData();
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">ניהול חברי קבוצה</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add User Form (Owner Only) */}
        {isOwner && (
          <form onSubmit={handleAddUser} className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              הוסף משתמש לקבוצה
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              >
                <option value="">בחר משתמש...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !selectedUserId}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                הוסף
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            {availableUsers.length === 0 && (
              <p className="text-slate-500 text-sm mt-2">אין משתמשים זמינים להוספה</p>
            )}
          </form>
        )}

        {/* Members List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            חברי הקבוצה ({members.length})
          </h3>
          
          {members.length === 0 ? (
            <p className="text-slate-400 text-center py-4">אין חברים בקבוצה</p>
          ) : (
            members.map((member) => {
              const displayName = member.profile?.full_name || member.profile?.email || member.user_id.substring(0, 8);
              const initial = member.profile?.email?.[0]?.toUpperCase() || member.user_id[0]?.toUpperCase() || '?';
              
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {initial}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {displayName}
                        {member.user_id === groupOwnerId && ' (בעלים)'}
                      </div>
                      {member.profile?.email && (
                        <div className="text-xs text-slate-500">
                          {member.profile.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {isOwner && member.user_id !== groupOwnerId && (
                    <button
                      onClick={() => handleRemoveUser(member.user_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="הסר מהקבוצה"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700">
            💡 ניתן להוסיף משתמשים רשומים שיש להם חשבון במערכת
          </p>
        </div>
      </div>
    </div>
  );
};
