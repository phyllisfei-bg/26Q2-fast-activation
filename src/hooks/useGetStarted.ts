import { useState, useCallback } from 'react';
import type { GsTask } from '../types';
import { GS_TASKS } from '../types';

export function useGetStarted() {
  const [done, setDone] = useState<GsTask[]>([]);

  const markDone = useCallback((task: GsTask) => {
    setDone(prev => prev.includes(task) ? prev : [...prev, task]);
  }, []);

  const allDone = GS_TASKS.every(t => done.includes(t));

  return { done, markDone, allDone };
}
