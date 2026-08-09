'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Stopwatch({ onTimeUpdate }: { onTimeUpdate: (timeStr: string) => void }) {
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      intervalId = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  // Sync to parent format in minutes
  useEffect(() => {
    if (time > 0) {
      const minutes = Math.ceil(time / 60);
      onTimeUpdate(minutes.toString());
    }
  }, [time, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : null,
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  return (
    <div className="panel mb-6 flex items-center justify-between" style={{ padding: '1.5rem', background: 'var(--bg-panel-light)' }}>
      <div className="flex items-center gap-4">
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '-1px' }}>
          {formatTime(time)}
        </div>
        <div className="text-muted text-sm uppercase tracking-wider font-semibold">Live Timer</div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => setIsRunning(!isRunning)} 
          className={isRunning ? "btn-secondary" : "btn-primary"}
          style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px', justifyContent: 'center' }}
          type="button"
        >
          {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
        </button>
        <button 
          onClick={() => { setIsRunning(false); setTime(0); onTimeUpdate(''); }} 
          className="btn-secondary"
          style={{ padding: '0.75rem' }}
          type="button"
          title="Reset Timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
