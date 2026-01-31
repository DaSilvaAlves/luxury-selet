import { useCallback } from 'react';

const STORAGE_KEYS = {
  products: 'luxury-selet-products',
  categories: 'luxury-selet-categories',
  cart: 'luxury-selet-cart',
};

interface BackupData {
  version: string;
  exportedAt: string;
  products: unknown[];
  categories: unknown[];
}

export function useDataBackup() {
  const exportData = useCallback(() => {
    const products = localStorage.getItem(STORAGE_KEYS.products);
    const categories = localStorage.getItem(STORAGE_KEYS.categories);

    const backupData: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: products ? JSON.parse(products) : [],
      categories: categories ? JSON.parse(categories) : [],
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup-Loja-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  }, []);

  const importData = useCallback((file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as BackupData;

          // Validate backup structure
          if (!data.version || !data.products || !data.categories) {
            resolve({ success: false, message: 'Este ficheiro não é uma cópia válida da loja.' });
            return;
          }

          // Import data
          localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(data.products));
          localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(data.categories));

          resolve({
            success: true,
            message: `Dados recuperados! ${data.products.length} produtos e ${data.categories.length} categorias.`
          });
        } catch {
          resolve({ success: false, message: 'Erro ao ler o ficheiro de backup' });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, message: 'Erro ao ler o ficheiro' });
      };

      reader.readAsText(file);
    });
  }, []);

  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  }, []);

  const getStorageSize = useCallback(() => {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length;
      }
    });
    return {
      bytes: total,
      formatted: total < 1024
        ? `${total} B`
        : total < 1024 * 1024
          ? `${(total / 1024).toFixed(2)} KB`
          : `${(total / 1024 / 1024).toFixed(2)} MB`
    };
  }, []);

  return {
    exportData,
    importData,
    clearAllData,
    getStorageSize,
  };
}
