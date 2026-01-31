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

  // Load categories from Supabase
  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading categories:', error);
        setIsLoaded(true);
        return;
      }

      if (data && data.length > 0) {
        setCategories(data.map(dbToCategory));
      } else {
        // Seed default categories if empty
        await seedDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Seed default categories
  const seedDefaultCategories = async () => {
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
      .select();

    if (error) {
      console.error('Error seeding categories:', error);
      return;
    }

    if (data) {
      setCategories(data.map(dbToCategory));
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'createdAt' | 'order'>) => {
    const dbRow = {
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      description: category.description,
      sort_order: categories.length + 1,
      is_active: category.isActive,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    if (data) {
      const newCategory = dbToCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    }
    return null;
  }, [categories.length]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const dbUpdates = categoryToDb(updates);

    const { data, error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return;
    }

    if (data) {
      const updatedCategory = dbToCategory(data);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return;
    }

    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const reorderCategories = useCallback(async (reorderedCategories: Category[]) => {
    // Update each category's order in the database
    const updates = reorderedCategories.map((cat, index) => ({
      id: cat.id,
      sort_order: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from('categories')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }

    // Update local state
    setCategories(reorderedCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    })));
  }, []);

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
