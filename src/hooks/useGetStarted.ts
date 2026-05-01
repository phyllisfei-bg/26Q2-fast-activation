import { useState, useCallback, useRef, useEffect } from 'react';
import type { GsTask, UserRole } from '../types';
import { ROLE_TASKS } from '../types';

export function useGetStarted(role: UserRole) {
  const tasks = ROLE_TASKS[role];
  const [done, setDone] = useState<GsTask[]>([]);

  const prevRoleRef = useRef(role);
  useEffect(() => {
    if (prevRoleRef.current !== role) {
      setDone([]);
      prevRoleRef.current = role;
    }
  }, [role]);

  const markDone = useCallback((task: GsTask) => {
    setDone(prev => prev.includes(task) ? prev : [...prev, task]);
  }, []);

  const allDone = tasks.length > 0 && tasks.every(t => done.includes(t));

  return { done, markDone, allDone, tasks };
}
