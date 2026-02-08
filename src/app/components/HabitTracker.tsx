
import React from 'react';
import { Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Habit, HabitLog } from '../../types';
import { supabase } from '../../lib/supabase';

interface HabitTrackerProps {
  habits: Habit[];
  logs: HabitLog[];
  onToggle: (id: string) => void;
  userId?: string;
  onRefresh: () => void;
}

export function HabitTracker({ habits, logs, onToggle, userId, onRefresh }: HabitTrackerProps) {
  
  const handleCreateDefaults = async () => {
    if (!userId) return;
    const defaults = [
      { title: 'Gym Visit', icon: 'dumbbell', target_count: 1 },
      { title: 'Drink 3L Water', icon: 'droplet', target_count: 1 },
      { title: 'Clean Diet', icon: 'utensils', target_count: 1 },
      { title: 'Journal', icon: 'book', target_count: 1 },
    ];

    for (const h of defaults) {
      await supabase.from('habits').insert({
        user_id: userId,
        title: h.title,
        icon: h.icon,
        target_count: h.target_count
      });
    }
    onRefresh();
  };

  if (habits.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400 mb-4">No habits set up yet.</p>
        <button 
          onClick={handleCreateDefaults}
          className="bg-blue-600 px-4 py-2 rounded-lg text-white text-sm font-medium"
        >
          Setup Default Habits
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Daily Habits</h3>
      {habits.map((habit) => {
        const isCompleted = logs.some(l => l.habit_id === habit.id);
        return (
          <motion.div
            key={habit.id}
            initial={false}
            animate={{ backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.5)' }}
            className="flex items-center justify-between p-4 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                 {/* Simple icon mapping based on string could go here, simplifying for now */}
                 <span className="capitalize">{habit.title[0]}</span>
              </div>
              <div>
                <p className={`font-medium ${isCompleted ? 'text-white' : 'text-gray-300'}`}>{habit.title}</p>
                <p className="text-xs text-gray-500">{isCompleted ? 'Completed' : 'Pending'}</p>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggle(habit.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}
            >
              {isCompleted && <Check size={16} className="text-white" />}
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
