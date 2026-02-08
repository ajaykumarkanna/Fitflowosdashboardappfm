
import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, Activity, Music, FileText, MessageSquare, Camera, Plus, Trash2, Edit2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Map string names to components for persistence
const ICON_MAP: Record<string, any> = {
  Dumbbell,
  Activity,
  Music,
  FileText,
  MessageSquare,
  Camera,
  LinkIcon
};

interface AppLink {
  id: string;
  name: string;
  iconName: string;
  url: string;
  color: string;
}

const DEFAULT_APPS: AppLink[] = [
  { id: '1', name: 'Cult Fit', iconName: 'Dumbbell', url: 'cultfit://', color: 'bg-orange-500' },
  { id: '2', name: 'Hevy', iconName: 'Activity', url: 'hevy://', color: 'bg-blue-600' },
  { id: '3', name: 'Music', iconName: 'Music', url: 'music://', color: 'bg-cyan-500' },
  { id: '4', name: 'Notion', iconName: 'FileText', url: 'notion://', color: 'bg-black' },
  { id: '5', name: 'ChatGPT', iconName: 'MessageSquare', url: 'https://chat.openai.com', color: 'bg-green-600' },
  { id: '6', name: 'Insta Cam', iconName: 'Camera', url: 'instagram://camera', color: 'bg-pink-600' },
];

export function DeepLinkGrid() {
  const [apps, setApps] = useState<AppLink[]>(() => {
    const saved = localStorage.getItem('fitflow_apps');
    return saved ? JSON.parse(saved) : DEFAULT_APPS;
  });
  
  const [editingApp, setEditingApp] = useState<AppLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    localStorage.setItem('fitflow_apps', JSON.stringify(apps));
  }, [apps]);

  const handleStartPress = (app: AppLink) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setEditingApp(app);
      setIsDialogOpen(true);
    }, 600); // 600ms for long press
  };

  const handleEndPress = (url: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Only launch if it wasn't a long press
    if (!isLongPress.current && url) {
      window.location.href = url;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setApps(apps.map(a => a.id === editingApp.id ? editingApp : a));
    setIsDialogOpen(false);
    setEditingApp(null);
  };

  const handleDelete = () => {
    if (!editingApp) return;
    if (confirm('Are you sure you want to delete this shortcut?')) {
      setApps(apps.filter(a => a.id !== editingApp.id));
      setIsDialogOpen(false);
      setEditingApp(null);
    }
  };

  const resetDefaults = () => {
    if (confirm('Reset to default shortcuts?')) {
      setApps(DEFAULT_APPS);
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Quick Actions</h3>
          <button onClick={resetDefaults} className="text-[10px] text-gray-600 hover:text-gray-400">Reset</button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <AnimatePresence>
            {apps.map((app) => {
              const Icon = ICON_MAP[app.iconName] || LinkIcon;
              return (
                <motion.button
                  layout
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onPointerDown={() => handleStartPress(app)}
                  onPointerUp={() => handleEndPress(app.url)}
                  onPointerLeave={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Optional: handle right click as edit
                    setEditingApp(app);
                    setIsDialogOpen(true);
                  }}
                  className="flex flex-col items-center justify-center gap-2 relative group"
                >
                  <div className={`${app.color} p-4 rounded-2xl shadow-lg text-white w-16 h-16 flex items-center justify-center relative overflow-hidden`}>
                    <Icon size={28} />
                    {/* Ripple hint or edit hint could go here */}
                  </div>
                  <span className="text-xs font-medium text-gray-400">{app.name}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-4">Long press to edit shortcuts</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shortcut</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the details for your quick action shortcut.
            </DialogDescription>
          </DialogHeader>
          
          {editingApp && (
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-400">Name</Label>
                <Input
                  id="name"
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="bg-gray-950 border-gray-800 text-white"
                  placeholder="App Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url" className="text-gray-400">Deep Link / URL</Label>
                <Input
                  id="url"
                  value={editingApp.url}
                  onChange={(e) => setEditingApp({ ...editingApp, url: e.target.value })}
                  className="bg-gray-950 border-gray-800 text-white font-mono text-xs"
                  placeholder="myapp://"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <div className="flex gap-2">
                   <DialogClose asChild>
                    <button type="button" className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                  </DialogClose>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
