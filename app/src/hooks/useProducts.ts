import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';

const STORAGE_KEY = 'luxury-selet-products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load products from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever products change
  const saveProducts = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveProducts([...products, newProduct]);
    return newProduct;
  }, [products, saveProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updated = products.map(prod =>
      prod.id === id ? { ...prod, ...updates, updatedAt: new Date().toISOString() } : prod
    );
    saveProducts(updated);
  }, [products, saveProducts]);

  const deleteProduct = useCallback((id: string) => {
    const filtered = products.filter(prod => prod.id !== id);
    saveProducts(filtered);
  }, [products, saveProducts]);

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

  const toggleProductActive = useCallback((id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      updateProduct(id, { isActive: !product.isActive });
    }
  }, [products, updateProduct]);

  const toggleProductStock = useCallback((id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      updateProduct(id, { inStock: !product.inStock });
    }
  }, [products, updateProduct]);

  const setFeaturedProduct = useCallback((id: string) => {
    // Remove featured from all products and set it on the selected one
    const updated = products.map(prod => ({
      ...prod,
      isFeatured: prod.id === id,
      updatedAt: prod.id === id ? new Date().toISOString() : prod.updatedAt,
    }));
    saveProducts(updated);
  }, [products, saveProducts]);

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
  };
}
