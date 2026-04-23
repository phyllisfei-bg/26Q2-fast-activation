import { useState, useEffect } from 'react';

export function useTheme() {
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    if (isLight) document.body.classList.add('light-mode');
    else         document.body.classList.remove('light-mode');
  }, [isLight]);

  const toggle = () => setIsLight(v => !v);
  return { isLight, toggle };
}
