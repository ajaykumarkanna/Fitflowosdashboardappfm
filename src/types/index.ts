
export interface Profile {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  current_streak: number;
  last_activity_date: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  target_count: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  date_logged: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  tags: string[];
  created_at: string;
}
