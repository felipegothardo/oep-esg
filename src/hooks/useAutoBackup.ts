import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface BackupData {
  timestamp: Date;
  schoolName: string;
  data: any;
}

const BACKUP_KEY_PREFIX = 'autoBackup_';
const MAX_BACKUPS = 5;
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

export function useAutoBackup(schoolName: string, data: any) {
  // Função para criar backup
  const createBackup = useCallback(() => {
    if (!data || !schoolName) return;

    const backupKey = `${BACKUP_KEY_PREFIX}${schoolName}`;
    
    try {
      // Recuperar backups existentes
      const existingBackups: BackupData[] = JSON.parse(
        localStorage.getItem(backupKey) || '[]'
      );

      // Criar novo backup
      const newBackup: BackupData = {
        timestamp: new Date(),
        schoolName,
        data: JSON.parse(JSON.stringify(data)) // Deep clone
      };

      // Adicionar novo backup e manter apenas os últimos MAX_BACKUPS
      const updatedBackups = [newBackup, ...existingBackups].slice(0, MAX_BACKUPS);

      // Salvar no localStorage
      localStorage.setItem(backupKey, JSON.stringify(updatedBackups));
      
      console.log(`Backup automático criado para ${schoolName}`);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    }
  }, [schoolName, data]);

  // Função para restaurar backup
  const restoreBackup = useCallback((backupIndex: number = 0) => {
    const backupKey = `${BACKUP_KEY_PREFIX}${schoolName}`;
    
    try {
      const backups: BackupData[] = JSON.parse(
        localStorage.getItem(backupKey) || '[]'
      );

      if (backups.length > backupIndex) {
        const backup = backups[backupIndex];
        toast.success(
          `Backup restaurado de ${new Date(backup.timestamp).toLocaleString('pt-BR')}`
        );
        return backup.data;
      } else {
        toast.error('Backup não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup');
      return null;
    }
  }, [schoolName]);

  // Função para listar backups disponíveis
  const listBackups = useCallback((): BackupData[] => {
    const backupKey = `${BACKUP_KEY_PREFIX}${schoolName}`;
    
    try {
      return JSON.parse(localStorage.getItem(backupKey) || '[]');
    } catch {
      return [];
    }
  }, [schoolName]);

  // Função para limpar backups antigos
  const clearOldBackups = useCallback(() => {
    const allKeys = Object.keys(localStorage);
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    allKeys.forEach(key => {
      if (key.startsWith(BACKUP_KEY_PREFIX)) {
        try {
          const backups: BackupData[] = JSON.parse(localStorage.getItem(key) || '[]');
          const recentBackups = backups.filter(backup => {
            const backupTime = new Date(backup.timestamp).getTime();
            return now - backupTime < oneWeek;
          });

          if (recentBackups.length < backups.length) {
            localStorage.setItem(key, JSON.stringify(recentBackups));
            console.log(`Limpeza de backups antigos para ${key}`);
          }
        } catch (error) {
          console.error(`Erro ao limpar backups para ${key}:`, error);
        }
      }
    });
  }, []);

  // Criar backup inicial ao montar o componente
  useEffect(() => {
    createBackup();
  }, []);

  // Configurar backup automático periódico
  useEffect(() => {
    const intervalId = setInterval(() => {
      createBackup();
    }, BACKUP_INTERVAL);

    // Limpar backups antigos uma vez por dia
    const cleanupIntervalId = setInterval(() => {
      clearOldBackups();
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(cleanupIntervalId);
    };
  }, [createBackup, clearOldBackups]);

  // Salvar backup quando a página for fechada
  useEffect(() => {
    const handleBeforeUnload = () => {
      createBackup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [createBackup]);

  return {
    createBackup,
    restoreBackup,
    listBackups,
    hasBackups: listBackups().length > 0
  };
}