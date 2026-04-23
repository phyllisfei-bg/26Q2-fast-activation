import { useState, useCallback } from 'react';
import type { GsTask } from '../types';
import { GS_TASKS } from '../types';

const LS_KEY = 'bitgo-gs-done';

function load(): GsTask[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function save(tasks: GsTask[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
}

export function useGetStarted() {
  const [done, setDone] = useState<GsTask[]>(load);

  const markDone = useCallback((task: GsTask) => {
    setDone(prev => {
      if (prev.includes(task)) return prev;
      const next = [...prev, task];
      save(next);
      return next;
    });
  }, []);

  const allDone = GS_TASKS.every(t => done.includes(t));

  return { done, markDone, allDone };
}
