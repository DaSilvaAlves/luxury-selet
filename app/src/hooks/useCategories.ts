import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/types';

const STORAGE_KEY = 'luxury-selet-categories';

const defaultCategories: Category[] = [
  {
    id: 'perfumes-mulher',
    name: 'Perfumes Mulher',
    slug: 'perfumes-mulher',
    description: 'Fragrâncias femininas',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'perfumes-homem',
    name: 'Perfumes Homem',
    slug: 'perfumes-homem',
    description: 'Fragrâncias masculinas',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'maquilhagem',
    name: 'Maquilhagem',
    slug: 'maquilhagem',
    description: 'Produtos de maquilhagem',
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cuidados-pele',
    name: 'Cuidados de Pele',
    slug: 'cuidados-pele',
    description: 'Cremes e tratamentos',
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cabelos',
    name: 'Cabelos',
    slug: 'cabelos',
    description: 'Produtos capilares',
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load categories from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        // Initialize with default categories
        setCategories(defaultCategories);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(defaultCategories);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever categories change
  const saveCategories = useCallback((newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt' | 'order'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      order: categories.length + 1,
      createdAt: new Date().toISOString(),
    };
    saveCategories([...categories, newCategory]);
    return newCategory;
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updated = categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    saveCategories(updated);
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id: string) => {
    const filtered = categories.filter(cat => cat.id !== id);
    saveCategories(filtered);
  }, [categories, saveCategories]);

  const reorderCategories = useCallback((reorderedCategories: Category[]) => {
    const updated = reorderedCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }));
    saveCategories(updated);
  }, [saveCategories]);

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
  };
}
