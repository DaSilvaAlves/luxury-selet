import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

const defaultCategories: Omit<Category, 'id' | 'createdAt'>[] = [
  {
    name: 'Perfumes Mulher',
    slug: 'perfumes-mulher',
    description: 'Fragrâncias femininas',
    order: 1,
    isActive: true,
  },
  {
    name: 'Perfumes Homem',
    slug: 'perfumes-homem',
    description: 'Fragrâncias masculinas',
    order: 2,
    isActive: true,
  },
  {
    name: 'Maquilhagem',
    slug: 'maquilhagem',
    description: 'Produtos de maquilhagem',
    order: 3,
    isActive: true,
  },
  {
    name: 'Cuidados de Pele',
    slug: 'cuidados-pele',
    description: 'Cremes e tratamentos',
    order: 4,
    isActive: true,
  },
  {
    name: 'Cabelos',
    slug: 'cabelos',
    description: 'Produtos capilares',
    order: 5,
    isActive: true,
  },
];

// Convert database row to Category type
function dbToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    order: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// Convert Category to database row format
function categoryToDb(category: Partial<Category>): any {
  const row: any = {};
  if (category.name !== undefined) row.name = category.name;
  if (category.slug !== undefined) row.slug = category.slug;
  if (category.description !== undefined) row.description = category.description;
  if (category.order !== undefined) row.sort_order = category.order;
  if (category.isActive !== undefined) row.is_active = category.isActive;
  return row;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load categories from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('luxury-selet-categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCategories(parsed);
        return true;
      }
      // If no data in localStorage, seed with defaults
      return false;
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      return false;
    }
  }, []);

  // Save categories to localStorage
  const saveToLocalStorage = useCallback((cats: Category[]) => {
    try {
      localStorage.setItem('luxury-selet-categories', JSON.stringify(cats));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }, []);

  // Load categories from Supabase with localStorage fallback
  const loadCategories = useCallback(async () => {
    console.log('[useCategories] Loading categories...');
    let useLocalStorage = false;

    try {
      console.log('[useCategories] Attempting to load from Supabase...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('[useCategories] Supabase error, falling back to localStorage:', error);
        useLocalStorage = true;
      } else if (data && data.length > 0) {
        const loadedCategories = data.map(dbToCategory);
        setCategories(loadedCategories);
        saveToLocalStorage(loadedCategories);
        setIsLoaded(true);
        return;
      } else {
        // Seed default categories if empty
        await seedDefaultCategories();
        setIsLoaded(true);
        return;
      }
    } catch (error) {
      console.warn('Error loading categories from Supabase, falling back to localStorage:', error);
      useLocalStorage = true;
    }

    // Fallback to localStorage
    if (useLocalStorage) {
      const loaded = loadFromLocalStorage();
      if (loaded) {
        setIsLoaded(true);
        return;
      }

      // No localStorage data, seed with defaults to localStorage
      const defaultCatsWithIds = defaultCategories.map((cat, idx) => ({
        ...cat,
        id: `cat-${idx + 1}`,
        createdAt: new Date().toISOString(),
        order: idx + 1,
      }));
      setCategories(defaultCatsWithIds);
      saveToLocalStorage(defaultCatsWithIds);
    }

    setIsLoaded(true);
  }, [loadFromLocalStorage, saveToLocalStorage]);

  // Seed default categories
  const seedDefaultCategories = async () => {
    const defaultCatsWithIds = defaultCategories.map((cat, idx) => ({
      ...cat,
      id: `cat-${idx + 1}`,
      createdAt: new Date().toISOString(),
      order: idx + 1,
    }));

    try {
      const toInsert = defaultCategories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sort_order: cat.order,
        is_active: cat.isActive,
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(toInsert)
        .select()
        ;

      if (!error && data) {
        const loaded = data.map(dbToCategory);
        setCategories(loaded);
        saveToLocalStorage(loaded);
        return;
      }
    } catch (error) {
      console.warn('Error seeding categories in Supabase, using localStorage:', error);
    }

    // Fallback to localStorage
    setCategories(defaultCatsWithIds);
    saveToLocalStorage(defaultCatsWithIds);
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'createdAt' | 'order'>) => {
    console.log('[useCategories] Adding category:', category);
    const newCategoryId = `cat-${Date.now()}`;
    const newCategory: Category = {
      id: newCategoryId,
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      description: category.description,
      order: categories.length + 1,
      isActive: category.isActive,
      createdAt: new Date().toISOString(),
    };

    // Try to save to Supabase first
    try {
      const dbRow = {
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        sort_order: newCategory.order,
        is_active: newCategory.isActive,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([dbRow])
        .select()
        .single();

      if (!error && data) {
        console.log('[useCategories] Supabase success:', data);
        const savedCategory = dbToCategory(data);
        const updated = [...categories, savedCategory];
        setCategories(updated);
        saveToLocalStorage(updated);
        return savedCategory;
      }
      if (error) {
        console.warn('[useCategories] Supabase error:', error);
      }
    } catch (error) {
      console.warn('[useCategories] Supabase exception:', error);
    }

    // Fallback to localStorage
    console.log('[useCategories] Using localStorage fallback for:', newCategory);
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveToLocalStorage(updated);
    console.log('[useCategories] Category added to localStorage, categories:', updated);
    return newCategory;
  }, [categories, saveToLocalStorage]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    // Update local state immediately
    const updated = categories.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    setCategories(updated);
    saveToLocalStorage(updated);

    // Try to sync to Supabase
    try {
      const dbUpdates = categoryToDb(updates);
      const { error } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id)
        ;

      if (error) {
        console.warn('Error updating category in Supabase:', error);
        // Continue anyway since we updated locally
      }
    } catch (error) {
      console.warn('Error syncing category update to Supabase:', error);
      // Continue anyway since we updated locally
    }
  }, [categories, saveToLocalStorage]);

  const deleteCategory = useCallback(async (id: string) => {
    // Update local state immediately
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveToLocalStorage(updated);

    // Try to sync to Supabase
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        ;

      if (error) {
        console.warn('Error deleting category in Supabase:', error);
        // Continue anyway since we deleted locally
      }
    } catch (error) {
      console.warn('Error syncing category deletion to Supabase:', error);
      // Continue anyway since we deleted locally
    }
  }, [categories, saveToLocalStorage]);

  const reorderCategories = useCallback(async (reorderedCategories: Category[]) => {
    // Update local state immediately
    const updated = reorderedCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }));
    setCategories(updated);
    saveToLocalStorage(updated);

    // Try to sync to Supabase
    try {
      const updates = updated.map((cat) => ({
        id: cat.id,
        sort_order: cat.order,
      }));

      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
          ;
      }
    } catch (error) {
      console.warn('Error syncing category reorder to Supabase:', error);
      // Continue anyway since we updated locally
    }
  }, [saveToLocalStorage]);

  const getActiveCategories = useCallback(() => {
    return categories
      .filter(cat => cat.isActive)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  return {
    categories,
    isLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getActiveCategories,
    getCategoryById,
    refresh: loadCategories,
  };
}
