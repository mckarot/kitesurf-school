// src/hooks/useUserDataExport.ts

import { useState, useCallback } from 'react';
import type { UserProfileExport } from '../types';
import { downloadJsonFile, generateUserDataFilename } from '../utils/exportUserData';

export interface UseUserDataExportReturn {
  isExporting: boolean;
  exportError: Error | null;
  triggerExport: (data: UserProfileExport) => Promise<void>;
}

export function useUserDataExport(): UseUserDataExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  const triggerExport = useCallback(async (data: UserProfileExport) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const filename = generateUserDataFilename();
      downloadJsonFile(data, filename);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Échec de l\'export');
      setExportError(errorObj);
      throw errorObj;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportError,
    triggerExport,
  };
}
