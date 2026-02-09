import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AUTH_STORAGE_KEYS } from '@/lib/auth-constants';
import type { Product } from '@/types';

// Convert database row to Product type
function dbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: row.image,
    category: row.category_name || '', // Adicionado
    categoryId: row.category_id,
    availability: row.availability,
    description: row.description || undefined,
    inStock: row.in_stock,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert Product to database row format
function productToDb(product: Partial<Product>): any {
  const row: any = {};
  if (product.name !== undefined) row.name = product.name;
  if (product.price !== undefined) row.price = product.price;
  if (product.originalPrice !== undefined) row.original_price = product.originalPrice;
  if (product.image !== undefined) row.image = product.image;
  if (product.category !== undefined) row.category = product.category;
  if (product.categoryId !== undefined) row.category_id = product.categoryId;
  if (product.availability !== undefined) row.availability = product.availability;
  if (product.description !== undefined) row.description = product.description;
  if (product.inStock !== undefined) row.in_stock = product.inStock;
  if (product.isActive !== undefined) row.is_active = product.isActive;
  if (product.isFeatured !== undefined) row.is_featured = product.isFeatured;
  return row;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthToken = () => localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);

// Helper to map DB Product (API) to interface Product
function apiToProduct(p: any): Product {
  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load products from Backend API first, then Supabase, then localStorage
  const loadProducts = useCallback(async () => {
    console.log('[useProducts] Loading products...');
    let loadedData: Product[] | null = null;

    // 1. Try Backend API first
    try {
      console.log('[useProducts] Trying Backend API...');
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        loadedData = data.map(apiToProduct);
        console.log('[useProducts] Loaded from Backend:', loadedData?.length || 0, 'products');
      }
    } catch (error) {
      console.warn('[useProducts] Backend API error:', error);
    }

    // 2. Try Supabase if Backend failed or returned no products
    if (!loadedData || loadedData.length === 0) {
      try {
        console.log('[useProducts] Trying Supabase...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          loadedData = data.map(dbToProduct);
          console.log('[useProducts] Loaded from Supabase:', loadedData.length, 'products');
        }
      } catch (error) {
        console.warn('[useProducts] Supabase error:', error);
      }
    }

    // 3. Fallback to localStorage as last resort
    if (!loadedData || loadedData.length === 0) {
      try {
        console.log('[useProducts] Trying localStorage fallback...');
        const stored = localStorage.getItem('luxury-selet-products');
        if (stored) {
          loadedData = JSON.parse(stored) as Product[];
          console.log('[useProducts] Loaded from localStorage:', loadedData.length, 'products');
        }
      } catch (error) {
        console.warn('[useProducts] localStorage error:', error);
      }
    }

    // Finalize
    if (loadedData) {
      setProducts(loadedData);
      localStorage.setItem('luxury-selet-products', JSON.stringify(loadedData));
    } else {
      console.log('[useProducts] All sources failed/empty');
      setProducts([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('[useProducts] No auth token found');
        throw new Error('No auth token');
      }

      console.log('[useProducts] Creating product:', product);
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[useProducts] Backend error:', response.status, errorData);
        throw new Error(`Failed to add product: ${response.status} ${errorData}`);
      }

      const newProduct = await response.json();
      console.log('[useProducts] Product created successfully:', newProduct);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('[useProducts] Critical error adding product:', error);
      // Don't fallback - just fail loudly so we know there's an issue
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update product on backend');

      const updatedProduct = await response.json();
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (error) {
      console.error('[useProducts] Error updating product:', error);
      // Fallback to Supabase
      const dbUpdates = productToDb(updates);
      const { data, error: sbError } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
      if (!sbError && data) {
        const updatedProduct = dbToProduct(data);
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      }
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete product from backend');

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('[useProducts] Error deleting product:', error);
      // Fallback
      const { error: sbError } = await supabase.from('products').delete().eq('id', id);
      if (!sbError) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    }
  }, []);

  const getProductsByCategory = useCallback((categoryId: string) => {
    return products.filter(prod => prod.categoryId === categoryId && prod.isActive);
  }, [products]);

  const getProductsByAvailability = useCallback((availability: 'pronta-entrega' | 'por-encomenda') => {
    return products.filter(prod => prod.availability === availability && prod.isActive);
  }, [products]);

  const getActiveProducts = useCallback(() => {
    return products.filter(prod => prod.isActive);
  }, [products]);

  const getProductById = useCallback((id: string) => {
    return products.find(prod => prod.id === id);
  }, [products]);

  const toggleProductActive = useCallback(async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      await updateProduct(id, { isActive: !product.isActive });
    }
  }, [products, updateProduct]);

  const toggleProductStock = useCallback(async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      await updateProduct(id, { inStock: !product.inStock });
    }
  }, [products, updateProduct]);

  const setFeaturedProduct = useCallback(async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: true })
      });

      if (!response.ok) throw new Error('Failed to set featured on backend');

      // Update local state
      setProducts(prev => prev.map(prod => ({
        ...prod,
        isFeatured: prod.id === id,
      })));
    } catch (error) {
      console.error('[useProducts] Error setting featured:', error);
      // Fallback
      await supabase.from('products').update({ is_featured: false }).neq('id', id);
      await supabase.from('products').update({ is_featured: true }).eq('id', id);
      setProducts(prev => prev.map(prod => ({
        ...prod,
        isFeatured: prod.id === id,
      })));
    }
  }, []);

  const getFeaturedProduct = useCallback(() => {
    return products.find(p => p.isFeatured && p.isActive) || products.find(p => p.isActive) || null;
  }, [products]);

  return {
    products,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByAvailability,
    getActiveProducts,
    getProductById,
    toggleProductActive,
    toggleProductStock,
    setFeaturedProduct,
    getFeaturedProduct,
    refresh: loadProducts,
  };
}
