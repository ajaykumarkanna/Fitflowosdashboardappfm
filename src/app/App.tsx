
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from './components/Auth';
import { DeepLinkGrid } from './components/DeepLinkGrid';
import { HabitTracker } from './components/HabitTracker';
import { WorkoutMode } from './components/WorkoutMode';
import { Journal } from './components/Journal';
import { useFitnessData } from '../hooks/useFitnessData';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, User, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [workoutMode, setWorkoutMode] = useState(false);
  
  // Data Hook
  const { profile, habits, habitLogs, toggleHabit, addXp, refresh } = useFitnessData(session?.user?.id);

  useEffect(() => {
    // Inject Manifest for PWA
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(err => console.log('SW failed', err));
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleWorkoutFinish = async (duration: number) => {
    // Grant XP based on duration (e.g., 1 XP per minute)
    const xpEarned = Math.max(10, Math.floor(duration / 60));
    await addXp(xpEarned);
    
    // Refresh to update UI
    setWorkoutMode(false);
    refresh();
  };

  if (loadingSession) return <div className="bg-black min-h-screen" />;

  if (!session) return <Auth />;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 pb-20">
      
      {/* Workout Overlay */}
      <AnimatePresence>
        {workoutMode && (
          <WorkoutMode 
            onFinish={handleWorkoutFinish} 
            onCancel={() => setWorkoutMode(false)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto relative">
        
        {/* Header */}
        <header className="p-6 pb-2 flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-sm font-medium">{format(new Date(), 'EEEE, MMM do')}</p>
            <h1 className="text-2xl font-bold">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <br/>
              <span className="text-blue-500">{profile?.username || 'Athlete'}</span>
            </h1>
          </div>
          
          <button onClick={() => supabase.auth.signOut()} className="p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
            <LogOut size={16} className="text-gray-500" />
          </button>
        </header>

        {/* Stats Bar */}
        <div className="px-6 py-4">
          <div className="bg-gray-900 rounded-2xl p-4 flex justify-between items-center border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Trophy size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Level {profile?.level || 1}</p>
                <p className="font-bold text-lg">{profile?.xp || 0} XP</p>
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-800"></div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Flame size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Streak</p>
                <p className="font-bold text-lg">{profile?.current_streak || 0} Days</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((profile?.xp || 0) % 100)}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>

        {/* Main Action */}
        <div className="px-6 py-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setWorkoutMode(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 text-lg"
          >
            Start Session
          </motion.button>
        </div>

        {/* App Launcher */}
        <DeepLinkGrid />

        {/* Habits */}
        <HabitTracker 
          habits={habits} 
          logs={habitLogs} 
          onToggle={toggleHabit} 
          userId={session.user.id}
          onRefresh={refresh}
        />

        {/* Quick Journal */}
        <div className="px-4 py-4 mb-8">
          <Journal userId={session.user.id} onClose={() => {}} />
        </div>

      </div>
    </div>
  );
}
