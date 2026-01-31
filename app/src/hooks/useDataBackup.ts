import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface BackupData {
  version: string;
  exportedAt: string;
  products: unknown[];
  categories: unknown[];
}

export function useDataBackup() {
  const exportData = useCallback(async () => {
    try {
      // Fetch data from Supabase
      const { data: products } = await supabase.from('products').select('*');
      const { data: categories } = await supabase.from('categories').select('*');

      const backupData: BackupData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        products: products || [],
        categories: categories || [],
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
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  }, []);

  const importData = useCallback(async (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as BackupData;

          // Validate backup structure
          if (!data.version || !data.products || !data.categories) {
            resolve({ success: false, message: 'Este ficheiro não é uma cópia válida da loja.' });
            return;
          }

          // Import categories first (products depend on them)
          if (data.categories.length > 0) {
            const { error: catError } = await supabase
              .from('categories')
              .upsert(data.categories as any[], { onConflict: 'id' });

            if (catError) {
              console.error('Error importing categories:', catError);
            }
          }

          // Import products
          if (data.products.length > 0) {
            const { error: prodError } = await supabase
              .from('products')
              .upsert(data.products as any[], { onConflict: 'id' });

            if (prodError) {
              console.error('Error importing products:', prodError);
            }
          }

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

  const clearAllData = useCallback(async () => {
    try {
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }, []);

  const getStorageInfo = useCallback(async () => {
    try {
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: categoryCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      return {
        products: productCount || 0,
        categories: categoryCount || 0,
        isCloud: true,
      };
    } catch {
      return {
        products: 0,
        categories: 0,
        isCloud: true,
      };
    }
  }, []);

  return {
    exportData,
    importData,
    clearAllData,
    getStorageInfo,
  };
}
