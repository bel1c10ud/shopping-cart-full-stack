import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    const value = localStorage.getItem(key);

    if (value === null) {
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }

    return JSON.parse(value);
  });

  const setStorage = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    setState(value);
  };

  return { storage: state, setStorage };
}
