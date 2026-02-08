
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface JournalProps {
  userId?: string;
  onClose: () => void;
}

const MOODS = ['🔥', '💪', '😐', '😴', '🤕'];

export function Journal({ userId, onClose }: JournalProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('💪');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || !userId) return;
    setSaving(true);
    
    try {
      await supabase.from('journal_entries').insert({
        user_id: userId,
        content,
        mood,
        tags: [] 
      });
      setContent('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">Quick Journal</h3>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-xl p-1 rounded hover:bg-white/10 ${mood === m ? 'bg-white/20' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="How did today's session go?"
        className="w-full bg-black/20 text-white rounded-xl p-3 min-h-[100px] border-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
      />
      
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}
