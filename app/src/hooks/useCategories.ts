import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get auth token for API calls
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('admin-token');
  }, []);

  // Load categories from Backend API first, then Supabase, then localStorage
  const loadCategories = useCallback(async () => {
    console.log('[useCategories] Loading categories...');
    let loadedData: Category[] | null = null;

    // 1. Try Backend API first
    try {
      const token = getAuthToken();
      if (token) {
        console.log('[useCategories] Trying Backend API...');
        const response = await fetch(`${API_URL}/api/admin/categories`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          loadedData = await response.json();
          console.log('[useCategories] Loaded from Backend:', loadedData?.length, 'categories');
        }
      }
    } catch (error) {
      console.warn('[useCategories] Backend API error:', error);
    }

    // 2. Try Supabase if Backend failed or returned no categories
    if (!loadedData || loadedData.length === 0) {
      try {
        console.log('[useCategories] Trying Supabase...');
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          loadedData = data.map(dbToCategory);
          console.log('[useCategories] Loaded from Supabase:', loadedData.length, 'categories');
        }
      } catch (error) {
        console.warn('[useCategories] Supabase error:', error);
      }
    }

    // 3. Fallback to localStorage as last resort
    if (!loadedData || loadedData.length === 0) {
      try {
        console.log('[useCategories] Trying localStorage fallback...');
        const stored = localStorage.getItem('luxury-selet-categories');
        if (stored) {
          loadedData = JSON.parse(stored) as Category[];
          console.log('[useCategories] Loaded from localStorage:', loadedData.length, 'categories');
        }
      } catch (error) {
        console.warn('[useCategories] localStorage error:', error);
      }
    }

    // Finalize: Set state and update cache
    if (loadedData) {
      setCategories(loadedData);
      localStorage.setItem('luxury-selet-categories', JSON.stringify(loadedData));
    } else {
      console.log('[useCategories] All sources failed/empty');
      setCategories([]);
    }
    setIsLoaded(true);
  }, [getAuthToken]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'createdAt' | 'order'>) => {
    console.log('[useCategories] Adding category:', category.name);

    // Try Backend API first
    try {
      const token = getAuthToken();
      if (token) {
        const response = await fetch(`${API_URL}/api/admin/categories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: category.name,
            slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            description: category.description,
            isActive: category.isActive,
            order: categories.length + 1,
          }),
        });

        if (response.ok) {
          const newCategory = await response.json();
          console.log('[useCategories] Backend API success');
          const updated = [...categories, newCategory];
          setCategories(updated);
          localStorage.setItem('luxury-selet-categories', JSON.stringify(updated));
          return newCategory;
        }
      }
    } catch (error) {
      console.warn('[useCategories] Backend API error:', error);
    }

    // Fallback: create locally
    console.log('[useCategories] Using local fallback');
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      description: category.description,
      order: categories.length + 1,
      isActive: category.isActive,
      createdAt: new Date().toISOString(),
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem('luxury-selet-categories', JSON.stringify(updated));
    return newCategory;
  }, [categories, getAuthToken]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    console.log('[useCategories] Updating category:', id);

    // Try Backend API first
    try {
      const token = getAuthToken();
      if (token) {
        const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const updated = await response.json();
          console.log('[useCategories] Backend API success');
          const newList = categories.map(c => c.id === id ? updated : c);
          setCategories(newList);
          localStorage.setItem('luxury-selet-categories', JSON.stringify(newList));
          return;
        }
      }
    } catch (error) {
      console.warn('[useCategories] Backend API error:', error);
    }

    // Fallback: update locally
    console.log('[useCategories] Using local fallback');
    const newList = categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    setCategories(newList);
    localStorage.setItem('luxury-selet-categories', JSON.stringify(newList));
  }, [categories, getAuthToken]);

  const deleteCategory = useCallback(async (id: string) => {
    console.log('[useCategories] Deleting category:', id);

    // Try Backend API first
    try {
      const token = getAuthToken();
      if (token) {
        const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          console.log('[useCategories] Backend API success');
          const newList = categories.filter(c => c.id !== id);
          setCategories(newList);
          localStorage.setItem('luxury-selet-categories', JSON.stringify(newList));
          return;
        }
      }
    } catch (error) {
      console.warn('[useCategories] Backend API error:', error);
    }

    // Fallback: delete locally
    console.log('[useCategories] Using local fallback');
    const newList = categories.filter(c => c.id !== id);
    setCategories(newList);
    localStorage.setItem('luxury-selet-categories', JSON.stringify(newList));
  }, [categories, getAuthToken]);

  const reorderCategories = useCallback(async (reorderedCategories: Category[]) => {
    const updated = reorderedCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }));
    setCategories(updated);
    localStorage.setItem('luxury-selet-categories', JSON.stringify(updated));
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

// Helper function for Supabase conversion
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
