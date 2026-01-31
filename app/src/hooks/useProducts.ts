import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

// Convert database row to Product type
function dbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: row.image,
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
  if (product.categoryId !== undefined) row.category_id = product.categoryId;
  if (product.availability !== undefined) row.availability = product.availability;
  if (product.description !== undefined) row.description = product.description;
  if (product.inStock !== undefined) row.in_stock = product.inStock;
  if (product.isActive !== undefined) row.is_active = product.isActive;
  if (product.isFeatured !== undefined) row.is_featured = product.isFeatured;
  return row;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load products from Supabase
  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      if (data) {
        setProducts(data.map(dbToProduct));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const dbRow = productToDb(product);

    const { data, error } = await supabase
      .from('products')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    if (data) {
      const newProduct = dbToProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    }
    return null;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const dbUpdates = productToDb(updates);

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return;
    }

    if (data) {
      const updatedProduct = dbToProduct(data);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
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
    // First, remove featured from all products
    const { error: resetError } = await supabase
      .from('products')
      .update({ is_featured: false })
      .neq('id', id);

    if (resetError) {
      console.error('Error resetting featured:', resetError);
    }

    // Then set the selected product as featured
    const { error } = await supabase
      .from('products')
      .update({ is_featured: true })
      .eq('id', id);

    if (error) {
      console.error('Error setting featured:', error);
      return;
    }

    // Update local state
    setProducts(prev => prev.map(prod => ({
      ...prod,
      isFeatured: prod.id === id,
    })));
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
