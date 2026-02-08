
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface WorkoutModeProps {
  onFinish: (durationSeconds: number) => void;
  onCancel: () => void;
}

const MOTIVATIONS = [
  "Pain is temporary. Glory is forever.",
  "Don't stop when you're tired. Stop when you're done.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "Sweat is just fat crying.",
];

export function WorkoutMode({ onFinish, onCancel }: WorkoutModeProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivation, setMotivation] = useState(MOTIVATIONS[0]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Hydration Reminder every 15 mins
  useEffect(() => {
    if (seconds > 0 && seconds % 900 === 0) {
      alert("Hydration Check! Take a sip of water.");
    }
    // Change quote every 5 mins
    if (seconds > 0 && seconds % 300 === 0) {
      setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
    }
  }, [seconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    setShowConfetti(true);
    setTimeout(() => {
      onFinish(seconds);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="text-center space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <h2 className="text-gray-400 text-sm tracking-widest uppercase">Workout in Progress</h2>
          <div className="text-7xl font-bold font-mono text-white tabular-nums">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <p className="text-xl text-blue-400 font-medium italic">"{motivation}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition-colors"
          >
            {isActive ? <Pause size={32} className="text-yellow-500" /> : <Play size={32} className="text-green-500" />}
            <span className="text-xs mt-2 text-gray-400">{isActive ? 'Pause' : 'Resume'}</span>
          </button>
          
          <button 
            onClick={() => alert("Remember to drink water!")}
            className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition-colors"
          >
            <Droplet size={32} className="text-blue-500" />
            <span className="text-xs mt-2 text-gray-400">Hydrate</span>
          </button>
        </div>

        <button
          onClick={handleFinish}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg uppercase tracking-wide shadow-lg shadow-green-900/20"
        >
          Finish Workout
        </button>

        <button 
          onClick={onCancel}
          className="text-gray-600 text-sm hover:text-white"
        >
          Cancel Session
        </button>
      </div>
    </div>
  );
}
