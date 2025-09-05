import { useState, useCallback } from 'react';

export interface Action {
  id: string;
  type: 'add' | 'update' | 'delete';
  category: 'recycling' | 'consumption' | 'goal';
  description: string;
  timestamp: Date;
  data: any;
  schoolName: string;
}

const MAX_HISTORY_SIZE = 50;

export function useActionHistory() {
  const [history, setHistory] = useState<Action[]>(() => {
    const saved = localStorage.getItem('actionHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = useCallback((action: Omit<Action, 'id' | 'timestamp'>) => {
    const newAction: Action = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    setHistory(prev => {
      const updated = [newAction, ...prev].slice(0, MAX_HISTORY_SIZE);
      localStorage.setItem('actionHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('actionHistory');
  }, []);

  const getRecentActions = useCallback((schoolName?: string, limit = 10) => {
    let filtered = history;
    if (schoolName) {
      filtered = history.filter(action => action.schoolName === schoolName);
    }
    return filtered.slice(0, limit);
  }, [history]);

  const undoLastAction = useCallback(() => {
    if (history.length === 0) return null;
    
    const [lastAction, ...rest] = history;
    setHistory(rest);
    localStorage.setItem('actionHistory', JSON.stringify(rest));
    
    return lastAction;
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getRecentActions,
    undoLastAction,
    hasHistory: history.length > 0
  };
}