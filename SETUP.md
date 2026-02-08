
# FitFlow OS - Backend Setup

Since this is a PWA powered by Supabase, you need to set up the database schema.
Run the following SQL in your Supabase Dashboard > SQL Editor.

```sql
-- Create a table for public user profiles
create table profiles (
  id uuid references auth.users not null,
  email text,
  username text,
  xp integer default 0,
  level integer default 1,
  current_streak integer default 0,
  last_activity_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Habits Table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  icon text,
  target_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table habits enable row level security;

create policy "Users can CRUD own habits."
  on habits for all
  using ( auth.uid() = user_id );

-- Habit Logs (for tracking completion)
create table habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits on delete cascade not null,
  user_id uuid references auth.users not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date_logged date default current_date
);

alter table habit_logs enable row level security;

create policy "Users can CRUD own habit logs."
  on habit_logs for all
  using ( auth.uid() = user_id );

-- Journal Entries
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content text,
  mood text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table journal_entries enable row level security;

create policy "Users can CRUD own journal entries."
  on journal_entries for all
  using ( auth.uid() = user_id );

-- Triggers for XP/Leveling (Optional - managed in frontend for simplicity in this demo, 
-- but ideally should be here for security)
```

## Notifications (Edge Functions)
To support Push Notifications, you will need to:
1. Set up Firebase Cloud Messaging (FCM) separately.
2. Store the FCM server key in Supabase Secrets.
3. Deploy a Supabase Edge Function to send notifications.

## WhatsApp Integration (Twilio)
1. Get Twilio Account SID and Auth Token.
2. Store in Supabase Secrets.
3. Deploy Edge Function to handle scheduling.
