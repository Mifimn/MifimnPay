"use client";

import { useState, useEffect } from 'react';
import { 
  Store, Save, Mail, Phone, MapPin, FileText, Loader2, Package, 
  Trash2, Plus, Link as LinkIcon, AlertTriangle 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Path alias update
import { useAuth } from '@/lib/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    footerMessage: '',
    currency: '₦ (NGN)',
    slug: ''
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setFormData({
            businessName: data.business_name || '',
            tagline: data.tagline || '',
            phone: data.business_phone || '',
            email: data.business_email || '',
            address: data.address || '',
            footerMessage: data.footer_message || '',
            currency: data.currency || '₦ (NGN)',
            slug: data.slug || ''
          });
          setLogoPreview(data.logo_url);
        }
      };

      const fetchMenu = async () => {
        const { data } = await supabase
          .from('menu_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        if (data) setMenuItems(data);
      };

      fetchProfile();
      fetchMenu();
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    let finalLogoUrl = logoPreview;

    try {
      if (logoFile && user) {
        const filePath = `${user.id}/logo-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('business-logos')
          .getPublicUrl(filePath);

        finalLogoUrl = urlData.publicUrl;
      }

      const cleanSlug = formData.slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: formData.businessName,
          tagline: formData.tagline,
          business_phone: formData.phone,
          business_email: formData.email,
          address: formData.address,
          footer_message: formData.footerMessage,
          currency: formData.currency,
          logo_url: finalLogoUrl,
          slug: cleanSlug,
          updated_at: new Date(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      for (const item of menuItems) {
        if (item.id.toString().startsWith('new')) {
          await supabase.from('menu_items').insert({
            user_id: user?.id,
            name: item.name,
            price: item.price,
            description: item.description
          });
        } else {
          await supabase.from('menu_items').update({
            name: item.name,
            price: item.price,
            description: item.description
          }).eq('id', item.id);
        }
      }

      alert("Settings saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { id: `new-${Date.now()}`, name: '', price: 0, description: '' }]);
  };

  const deleteMenuItem = async (id: string) => {
    if (id.toString().startsWith('new')) {
      setMenuItems(menuItems.filter(i => i.id !== id));
      return;
    }
    if (confirm("Remove this product from your list?")) {
      await supabase.from('menu_items').delete().eq('id', id);
      setMenuItems(menuItems.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Header & Save Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Manage your storefront and billing profile.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isLoading} 
          className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-orange active:scale-95 transition-all disabled:opacity-70 w-full md:w-auto"
        >
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />} 
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column: Business Profile & Defaults */}
        <div className="xl:col-span-2 space-y-8">

          <section className="bg-white dark:bg-[#0f0f0f] rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-slate-100 dark:border-white/10"><Store size={20} /></div>
               <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Business Profile</h2>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div className="md:col-span-2 flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative group cursor-pointer transition-all hover:border-brand-orange">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="text-slate-300 dark:text-white/20" size={32} />}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">Store Logo</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Click circle to upload PNG or JPG.</p>
                </div>
              </div>

              <InputField label="Business Name" value={formData.businessName} onChange={(v: any) => setFormData({...formData, businessName: v})} placeholder="Musa Textiles" />
              <InputField label="Tagline" value={formData.tagline} onChange={(v: any) => setFormData({...formData, tagline: v})} placeholder="Fast and Reliable" />

              <div className="md:col-span-2 space-y-3">
                <InputField label="Store URL Slug" value={formData.slug} onChange={(v: any) => setFormData({...formData, slug: v})} placeholder="e.g. musa-store" icon={<LinkIcon size={16}/>} />
                <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-red-500 font-black uppercase tracking-widest">
                    Warning: Changing this slug alters your Storefront URL. Printed QR codes will stop working.
                  </p>
                </div>
              </div>

              <InputField label="Phone Number" value={formData.phone} onChange={(v: any) => setFormData({...formData, phone: v})} icon={<Phone size={16}/>} />
              <InputField label="Email Address" value={formData.email} onChange={(v: any) => setFormData({...formData, email: v})} icon={<Mail size={16}/>} />

              <div className="md:col-span-2">
                <InputField label="Address" value={formData.address} onChange={(v: any) => setFormData({...formData, address: v})} icon={<MapPin size={16}/>} />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#0f0f0f] rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-slate-100 dark:border-white/10"><FileText size={20} /></div>
               <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Receipt Defaults</h2>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Default Footer Message</label>
                <textarea 
                  value={formData.footerMessage} 
                  onChange={(e) => setFormData({...formData, footerMessage: e.target.value})} 
                  rows={3} 
                  placeholder="Thank you for your business!"
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-brand-orange outline-none transition-all resize-none" 
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Default Currency</label>
                <select 
                  value={formData.currency} 
                  onChange={(e) => setFormData({...formData, currency: e.target.value})} 
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-2xl text-xs font-black uppercase text-slate-900 dark:text-white focus:border-brand-orange outline-none transition-all"
                >
                  <option>₦ (NGN) - Nigerian Naira</option>
                  <option>$ (USD) - US Dollar</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Price List */}
        <div className="xl:col-span-1">
          <section className="bg-white dark:bg-[#0f0f0f] rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden sticky top-8">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-slate-100 dark:border-white/10"><Package size={20} /></div>
                 <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Products</h2>
               </div>
               <button 
                onClick={addMenuItem} 
                className="w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 transition-all"
               >
                 <Plus size={16}/>
               </button>
            </div>

            <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto">
              {menuItems.map((item, idx) => (
                <div key={item.id} className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 group">
                  <input 
                    placeholder="Product Name" 
                    value={item.name} 
                    onChange={(e) => { const n = [...menuItems]; n[idx].name = e.target.value; setMenuItems(n); }} 
                    className="w-full bg-transparent border-none text-slate-900 dark:text-white text-sm font-black uppercase tracking-tight p-0 focus:ring-0 placeholder:text-slate-400 outline-none" 
                  />
                  <input 
                    placeholder="Brief description..." 
                    value={item.description} 
                    onChange={(e) => { const n = [...menuItems]; n[idx].description = e.target.value; setMenuItems(n); }} 
                    className="w-full bg-transparent border-none text-slate-500 text-xs font-bold p-0 focus:ring-0 placeholder:text-slate-400 outline-none" 
                  />

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₦</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={item.price} 
                        onChange={(e) => { const n = [...menuItems]; n[idx].price = e.target.value; setMenuItems(n); }} 
                        className="w-full bg-white dark:bg-black/20 border-2 border-transparent rounded-xl pl-8 pr-4 py-2 text-sm font-black text-slate-900 dark:text-white focus:border-brand-orange outline-none transition-all" 
                      />
                    </div>
                    <button 
                      onClick={() => deleteMenuItem(item.id)} 
                      className="p-3 bg-white dark:bg-black/20 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}

              {menuItems.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No products added yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Sub-component tailored to the new Swell-style forms
function InputField({ label, value, onChange, icon, placeholder }: any) {
  return (
    <div className="relative">
      <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          className={`w-full h-14 border-2 border-transparent bg-slate-50 dark:bg-white/5 focus:border-brand-orange text-slate-900 dark:text-white rounded-2xl font-bold outline-none transition-all placeholder:text-slate-400 ${icon ? 'pl-12 pr-5' : 'px-5'}`} 
        />
      </div>
    </div>
  );
}