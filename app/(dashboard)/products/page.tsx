"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Package, Edit, Trash2, Image as ImageIcon, Loader2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: number;
  wholesale_price: number | null;
  stock: number | null;
  image_url: string | null;
  image_urls: string[] | null; // Added to support multi-image cleanup
  is_active: boolean;
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'retail' | 'wholesale'>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('menu_items') 
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  // COMPLETE DELETE FUNCTIONALITY WITH STORAGE CLEANUP
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      // 1. Find the product in state to get its image URLs
      const productToDelete = products.find(p => p.id === id);

      if (productToDelete) {
        // Collect all unique images (fallback image_url + new image_urls array)
        const urlsToDelete = new Set<string>();
        if (productToDelete.image_url) urlsToDelete.add(productToDelete.image_url);
        if (productToDelete.image_urls) {
          productToDelete.image_urls.forEach(url => urlsToDelete.add(url));
        }

        // Extract the exact storage paths from the public URLs
        // e.g. https://.../public/product-images/USER_ID/filename.jpg -> USER_ID/filename.jpg
        const pathsToDelete = Array.from(urlsToDelete).map(url => {
          return url.split('/public/product-images/')[1];
        }).filter(Boolean); // Removes any undefined/invalid splits

        // 2. Delete the actual image files from Supabase Storage
        if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove(pathsToDelete);

          if (storageError) {
            console.error("Storage cleanup warning:", storageError);
            // We log the warning, but proceed to delete the DB record so the user isn't stuck.
          }
        }
      }

      // 3. Delete the product record from the database
      const { error: dbError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 4. Instantly remove the product from the UI
      setProducts(prev => prev.filter(product => product.id !== id));

    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(error.message || "Failed to delete product");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'wholesale') return product.wholesale_price !== null && product.wholesale_price > 0;
    if (activeTab === 'retail') return product.price > 0;
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-black tracking-tight uppercase italic transition-colors duration-300 mb-1">
            Products
          </h1>
          <p className="text-sm font-bold text-brand-gray tracking-wide uppercase transition-colors duration-300">
            Manage inventory for retail and wholesale.
          </p>
        </div>

        <Link href="/products/add">
          <button className="bg-brand-black text-brand-paper px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-black/10">
            <Plus size={18} />
            Add Product
          </button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex p-1.5 bg-brand-paper border border-brand-border rounded-2xl shadow-sm transition-colors duration-300 shrink-0">
          {(['all', 'retail', 'wholesale'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-brand-black text-brand-paper shadow-md' 
                  : 'text-brand-gray hover:text-brand-black hover:bg-brand-bg'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input 
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full min-h-[48px] pl-12 pr-4 bg-brand-paper border border-brand-border rounded-2xl outline-none text-brand-black font-medium placeholder:text-brand-gray/60 focus:border-brand-black transition-colors duration-300 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-brand-paper rounded-[32px] border border-brand-border overflow-hidden shadow-sm min-h-[450px] transition-colors duration-300">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-brand-gray">
            <Loader2 size={40} className="animate-spin mb-4 text-brand-black" />
            <p className="text-xs font-black uppercase tracking-widest">Loading Inventory...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/30">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Product</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Retail Price</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Wholesale Price</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((product, idx) => (
                    <motion.tr 
                      key={product.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-brand-border last:border-0 hover:bg-brand-bg/50 transition-colors group"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center overflow-hidden shrink-0">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-brand-gray/50" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-black text-sm">{product.name}</p>
                            <p className="text-[10px] text-brand-gray font-black uppercase tracking-widest mt-0.5">
                              Stock: {product.stock !== null ? product.stock : '∞'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-mono font-bold text-brand-black text-sm">
                          ₦{(product.price || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        {product.wholesale_price ? (
                          <div className="inline-flex items-center gap-1.5 bg-brand-black/5 dark:bg-brand-paper/10 px-3 py-1.5 rounded-lg border border-brand-border">
                            <Tag size={12} className="text-brand-black" />
                            <span className="font-mono font-bold text-brand-black text-sm">
                              ₦{product.wholesale_price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-brand-gray/50 uppercase tracking-widest">Not Set</span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          product.is_active !== false 
                            ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                            : 'bg-brand-bg text-brand-gray border-brand-border'
                        }`}>
                          {product.is_active !== false ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">

                          <Link href={`/products/add?id=${product.id}`}>
                            <button className="p-2 text-brand-gray hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800 shadow-sm" title="Edit">
                              <Edit size={16} />
                            </button>
                          </Link>

                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-brand-gray hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800 shadow-sm" title="Delete">
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[450px] text-center px-6"
          >
            <div className="w-24 h-24 bg-brand-bg rounded-[32px] flex items-center justify-center text-brand-gray mb-6 border border-brand-border shadow-inner relative">
              <Package size={40} strokeWidth={1} />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-black rounded-xl text-brand-paper flex items-center justify-center shadow-lg">
                <Plus size={16} strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-brand-black mb-2 uppercase tracking-tight italic">No Products Found</h3>
            <p className="text-sm font-medium text-brand-gray max-w-sm mx-auto mb-8 leading-relaxed">
              {searchQuery 
                ? "No items match your current search or tab filters. Try clearing them." 
                : "Add products to display them on your digital storefront. Set both retail and wholesale prices to unlock B2B sales."}
            </p>
            {!searchQuery && (
              <Link href="/products/add">
                <button className="bg-brand-black text-brand-paper px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-black/20">
                  <Plus size={16} />
                  Create First Product
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
