import { useState, useCallback } from 'react';
import { 
  getOrCreateSession, 
  saveToSession, 
  downloadFromSession, 
  StorageSession 
} from '@/lib/storage';

export function useStorage() {
  const [session, setSession] = useState<StorageSession>(() => getOrCreateSession());

  const saveItem = useCallback((type: 'screenshot' | 'recording' | 'printscreen', data: string) => {
    const id = saveToSession(type, data);
    setSession(getOrCreateSession());
    return id;
  }, []);

  const downloadItem = useCallback((id: string, filename: string) => {
    return downloadFromSession(id, filename);
  }, []);

  return {
    session,
    saveItem,
    downloadItem
  };
}