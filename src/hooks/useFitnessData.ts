
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Habit, HabitLog } from '../types';
import { startOfDay, format } from 'date-fns';

export function useFitnessData(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, email: (await supabase.auth.getUser()).data.user?.email }])
          .select()
          .single();
          
        if (!createError) profileData = newProfile;
      }

      setProfile(profileData);

      // Fetch Habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);
        
      setHabits(habitsData || []);

      // Fetch Today's Logs
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date_logged', today);

      setHabitLogs(logsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!userId) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const existingLog = habitLogs.find(log => log.habit_id === habitId);

    if (existingLog) {
      // Untoggle (delete log)
      await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      setHabitLogs(prev => prev.filter(l => l.id !== existingLog.id));
    } else {
      // Toggle (create log)
      const { data } = await supabase
        .from('habit_logs')
        .insert([{ habit_id: habitId, user_id: userId, date_logged: today }])
        .select()
        .single();
      
      if (data) {
        setHabitLogs(prev => [...prev, data]);
        // Add XP
        await addXp(10);
      }
    }
  };

  const addXp = async (amount: number) => {
    if (!profile || !userId) return;
    
    const newXp = (profile.xp || 0) + amount;
    const currentLevel = Math.floor(newXp / 100) + 1;
    const isLevelUp = currentLevel > (profile.level || 1);

    const { data } = await supabase
      .from('profiles')
      .update({ xp: newXp, level: currentLevel })
      .eq('id', userId)
      .select()
      .single();

    if (data) setProfile(data);
    
    return isLevelUp;
  };

  return {
    profile,
    habits,
    habitLogs,
    loading,
    toggleHabit,
    addXp,
    refresh: fetchData
  };
}
