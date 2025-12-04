"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ItemInput } from './components/ItemInput';
import { ShoppingItemRow } from './components/ShoppingItemRow';
import { AuthPage } from './components/AuthPage';
import { GroupSetup } from './components/GroupSetup';
import { ManageGroupMembers } from './components/ManageGroupMembers';
import { ShoppingItem } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getItemIcon, getItemCategory } from './utils/iconMapper';
import { fetchItems, addItem, toggleItemCompleted, deleteItem, deleteCompletedItems, deleteAllItems, fetchGroup, getUserFirstGroup, supabase, DbItem } from './services/supabase';

// --- Inner Component for the Actual Shopping List ---
const ShoppingListApp: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentGroupName, setCurrentGroupName] = useState<string>('');
  const [loadingGroup, setLoadingGroup] = useState(false);

  // Items State
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [analyzingCount, setAnalyzingCount] = useState(0);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [currentGroupOwnerId, setCurrentGroupOwnerId] = useState<string>('');

  // Load Group from LocalStorage or fetch user's first group
  useEffect(() => {
    const loadGroup = async () => {
      if (!currentUser) {
        // Clear state if user logged out
        setCurrentGroupId(null);
        setCurrentGroupName('');
        setItems([]);
        return;
      }
      
      // Try to load from localStorage first
      const lastGroupId = localStorage.getItem(`lastGroup_${currentUser.id}`);
      if (lastGroupId) {
         setLoadingGroup(true);
         const group = await fetchGroup(lastGroupId);
         if (group) {
             setCurrentGroupId(group.id);
             setCurrentGroupName(group.name);
             setCurrentGroupOwnerId(group.owner_user_id);
             setLoadingGroup(false);
             return;
         } else {
             localStorage.removeItem(`lastGroup_${currentUser.id}`);
             setLoadingGroup(false);
         }
      }
      
      // If no group in localStorage, try to fetch user's first group
      setLoadingGroup(true);
      try {
        const firstGroup = await getUserFirstGroup();
        if (firstGroup) {
            setCurrentGroupId(firstGroup.id);
            setCurrentGroupName(firstGroup.name);
            setCurrentGroupOwnerId(firstGroup.owner_user_id);
            localStorage.setItem(`lastGroup_${currentUser.id}`, firstGroup.id);
        }
      } catch (error) {
        console.error('Error loading group:', error);
      } finally {
        setLoadingGroup(false);
      }
    };
    
    loadGroup();
  }, [currentUser]);

  // Load items when group changes
  useEffect(() => {
    if (!currentGroupId) return;

    const loadItems = async () => {
      try {
        const dbItems = await fetchItems(currentGroupId);
        const mappedItems: ShoppingItem[] = dbItems.map(i => ({
          id: i.id,
          name: i.name,
          isCompleted: i.is_completed,
          emoji: i.emoji,
          category: i.category,
          createdAt: new Date(i.created_at).getTime(),
          isAnalysing: false
        }));
        setItems(mappedItems);
      } catch (e) {
        console.error("Failed to load items", e);
      }
    };
    loadItems();
  }, [currentGroupId]);

  // Real-time subscription for items
  useEffect(() => {
    if (!currentGroupId) return;

    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `group_id=eq.${currentGroupId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as DbItem;
            setItems(prev => {
              if (prev.some(i => i.id === newItem.id)) return prev;
              return [{
                id: newItem.id,
                name: newItem.name,
                isCompleted: newItem.is_completed,
                emoji: newItem.emoji,
                category: newItem.category,
                createdAt: new Date(newItem.created_at).getTime(),
                isAnalysing: false
              }, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as DbItem;
            setItems(prev => prev.map(item => 
              item.id === updatedItem.id 
                ? {
                    ...item,
                    name: updatedItem.name,
                    isCompleted: updatedItem.is_completed,
                    emoji: updatedItem.emoji,
                    category: updatedItem.category,
                    createdAt: new Date(updatedItem.created_at).getTime(),
                  }
                : item
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setItems(prev => prev.filter(item => item.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGroupId]);

  // Enhanced badge logic with persistence and cross-platform support
  useEffect(() => {
    const updateAppBadge = async () => {
      const activeCount = items.filter(i => !i.isCompleted).length;
      
      // Store badge count in localStorage for persistence
      try {
        localStorage.setItem('app_badge_count', activeCount.toString());
      } catch (e) {
        console.error('Failed to save badge count:', e);
      }
      
      // Badging API (Chrome, Edge, Safari 17+)
      if ('setAppBadge' in navigator) {
        try {
          if (activeCount > 0) {
            await (navigator as any).setAppBadge(activeCount);
          } else {
            await (navigator as any).clearAppBadge();
          }
        } catch (e) {
          console.error('Badge API failed:', e);
        }
      }
      
      // Service Worker badge (fallback for older browsers)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'UPDATE_BADGE',
          count: activeCount
        });
      }
      
      // Update document title with count (universal fallback)
      if (activeCount > 0) {
        document.title = `(${activeCount}) רשימת קניות`;
      } else {
        document.title = 'רשימת קניות חכמה';
      }
    };
    
    updateAppBadge();
  }, [items]);
  
  // Clear badge when app comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Optional: Clear badge when user opens the app
        // Uncomment if you want badge to clear on app open
        // if ('clearAppBadge' in navigator) {
        //   (navigator as any).clearAppBadge();
        // }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleGroupSelected = (groupId: string, groupName: string) => {
    setCurrentGroupId(groupId);
    setCurrentGroupName(groupName);
    localStorage.setItem(`lastGroup_${currentUser?.id}`, groupId);
  };

  const handleAddItem = useCallback(async (name: string) => {
    if (!currentGroupId) return;
    
    const emoji = getItemIcon(name);
    const category = getItemCategory(name);
    
    // Optimistic update
    const tempId = Date.now().toString();
    const tempItem: ShoppingItem = {
      id: tempId,
      name,
      isCompleted: false,
      emoji,
      category,
      createdAt: Date.now(),
      isAnalysing: true,
    };
    setItems(prev => [tempItem, ...prev]);

    try {
      const dbItem = await addItem(currentGroupId, name, emoji, category);
      setItems(prev => prev.map(i => i.id === tempId ? {
        ...i,
        id: dbItem.id,
        createdAt: new Date(dbItem.created_at).getTime(),
        isAnalysing: false
      } : i));
    } catch (e) {
      console.error("Failed to add item", e);
      alert(`שגיאה בהוספת המוצר: ${e instanceof Error ? e.message : 'שגיאה לא ידועה'}`);
      setItems(prev => prev.filter(i => i.id !== tempId));
    }
  }, [currentGroupId]);

  const handleToggleItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i));
    
    try {
      await toggleItemCompleted(id, !item.isCompleted);
    } catch (e) {
      console.error("Failed to toggle item", e);
      // Revert
      setItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: item.isCompleted } : i));
    }
  };

  const handleDeleteItem = async (id: string) => {
    // Optimistic update
    const prevItems = [...items];
    setItems(prev => prev.filter(item => item.id !== id));
    
    try {
      await deleteItem(id);
    } catch (e) {
      console.error("Failed to delete item", e);
      setItems(prevItems);
    }
  };

  const handleClearCompleted = async () => {
    if (!currentGroupId) return;
    if (window.confirm('למחוק את כל המוצרים שסומנו כנרכשו?')) {
      // Optimistic update
      const prevItems = [...items];
      setItems(prev => prev.filter(item => !item.isCompleted));
      
      try {
        await deleteCompletedItems(currentGroupId);
      } catch (e) {
        console.error("Failed to clear completed", e);
        setItems(prevItems);
      }
    }
  };

  const handleClearAllClick = async () => {
    if (!currentGroupId) return;
    if (isConfirmingClearAll) {
      // Optimistic update
      const prevItems = [...items];
      setItems([]);
      setIsConfirmingClearAll(false);
      
      try {
        await deleteAllItems(currentGroupId);
      } catch (e) {
        console.error("Failed to clear all", e);
        setItems(prevItems);
      }
    } else {
      setIsConfirmingClearAll(true);
      setTimeout(() => setIsConfirmingClearAll(false), 3000);
    }
  };

  // --- RENDER LOGIC ---

  if (loadingGroup) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">טוען את הקבוצה...</div>;
  }

  if (!currentGroupId) {
    return <GroupSetup onGroupSelected={handleGroupSelected} />;
  }

  const sortedItems = [...items].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return b.createdAt - a.createdAt;
    return a.isCompleted ? 1 : -1;
  });
  const completedCount = items.filter(i => i.isCompleted).length;

  return (
    <div className="min-h-screen pb-20 px-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Modern Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/60 shadow-sm mb-6">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section: User Profile */}
            <div className="flex items-center gap-3 group">
              {/* Avatar with Animated Border */}
              <div className="relative">
                {/* Outer Glow - Multiple Layers */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 opacity-60 blur-lg group-hover:opacity-90 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 opacity-50 blur-md group-hover:opacity-80 transition-opacity"></div>
                
                {/* Main Avatar with Vibrant Gradient */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-xl border-2 border-white ring-2 ring-purple-200 group-hover:ring-purple-300 transition-all">
                  {/* Inner Shine Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
                  
                  <span className="relative text-lg font-bold drop-shadow-lg">
                    {currentUser?.user_metadata?.full_name?.[0] || currentUser?.email?.[0]?.toUpperCase() || '👤'}
                  </span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight tracking-tight">
                  {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0]}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {currentGroupName}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {/* Manage Members Button */}
              <button
                onClick={() => setShowManageMembers(true)}
                className="group relative px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-100 text-indigo-600 hover:text-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                title="ניהול חברי קבוצה"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </button>
              
              {/* Logout Button */}
              {/* Logout Button */}
              <button 
                onClick={logout}
                className="group relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-100 text-red-600 hover:text-red-700 transition-all shadow-sm hover:shadow-md active:scale-95 overflow-hidden"
                title="התנתק"
              > {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                <div className="relative flex items-center gap-2">
                  <span className="text-sm font-bold">יציאה</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <Header />
      
      <main className="max-w-2xl mx-auto">
        <ItemInput onAdd={handleAddItem} isBusy={false} />

        <div className="bg-white rounded-[2rem] shadow-sm p-2 min-h-[400px] border border-white flex flex-col transition-all duration-300">
          <div className="p-4 space-y-1 flex-1">
            {items.length === 0 ? (
               <div className="flex flex-col items-center justify-center min-h-[400px] py-16 text-slate-400 select-none">
                 {/* Centered Icon with Glow */}
                 <div className="relative mb-8">
                    {/* Glowing background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse-glow"></div>
                    
                    {/* Main cart icon - centered */}
                    <div className="relative w-32 h-32 bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-[2rem] shadow-xl border border-white/80 flex items-center justify-center">
                        <span className="text-7xl filter drop-shadow-lg">🛒</span>
                    </div>
                 </div>
                 
                 {/* Centered Text Content */}
                 <div className="text-center space-y-3 max-w-md mx-auto">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        הרשימה ריקה
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-lg">
                        מתכננים את הקניות?
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-indigo-700 font-bold text-base">הוסיפו מוצרים למעלה</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-4">
                        ונסדר אותם עבורכם בקטגוריות ✨
                    </p>
                 </div>
               </div>
            ) : (
              sortedItems.map(item => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                />
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-slate-50 mt-2 flex flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
              <div>
                {completedCount > 0 && (
                  <button type="button" onClick={handleClearCompleted} className="flex items-center gap-2 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#FEF2F2] px-6 py-2 rounded-xl transition-colors text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    נקה שנרכשו ({completedCount})
                  </button>
                )}
              </div>
              <button 
                type="button"
                onClick={handleClearAllClick}
                title={isConfirmingClearAll ? "בטוח? לחץ שוב למחיקת הכל" : "מחק את כל הרשימה"}
                className={`p-3 rounded-2xl transition-all duration-200 ${isConfirmingClearAll ? 'bg-red-100 text-red-600 scale-110 shadow-sm' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Manage Members Modal */}
      {showManageMembers && (
        <ManageGroupMembers
          groupId={currentGroupId}
          groupOwnerId={currentGroupOwnerId}
          onClose={() => setShowManageMembers(false)}
        />
      )}
    </div>
  );
};

// --- Main Root Component ---
const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FE]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <div className="text-slate-600 text-lg">טוען...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return <ShoppingListApp />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;