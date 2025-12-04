"use client";
import React, { useState } from 'react';
import { createGroup } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GroupSetupProps {
  onGroupSelected: (groupId: string, groupName: string) => void;
}

export const GroupSetup: React.FC<GroupSetupProps> = ({ onGroupSelected }) => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !currentUser) return;

    setLoading(true);
    try {
      const groupId = await createGroup(groupName);
      onGroupSelected(groupId, groupName);
    } catch (error) {
      console.error("Error creating group:", error);
      alert(`שגיאה ביצירת הקבוצה: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 w-full max-w-md border border-white/50 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          👥
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">יצירת קבוצה חדשה</h2>
        <p className="text-slate-500 mb-8">
          כדי להתחיל, תן שם לרשימת הקניות המשותפת שלך
        </p>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="שם הקבוצה (למשל: בית משפחת כהן)"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-center"
            autoFocus
          />
          <button
            type="submit"
            disabled={!groupName.trim() || loading}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'יוצר קבוצה...' : 'צור והתחל לקנות'}
          </button>
        </form>

        <button 
          onClick={() => logout()}
          className="mt-6 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          התנתק והחלף משתמש
        </button>
      </div>
    </div>
  );
};