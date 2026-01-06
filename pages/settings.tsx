import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Store, Save, Mail, Phone, MapPin, 
  FileText, Loader2, Package, Trash2, Plus, Link as LinkIcon, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Settings() {
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
      fetchProfile();
      fetchMenu();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
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
    const { data } = await supabase.from('menu_items').select('*').eq('user_id', user?.id).order('created_at', { ascending: true });
    if (data) setMenuItems(data);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    let finalLogoUrl = logoPreview;
    try {
      if (logoFile && user) {
        const filePath = `${user.id}/logo-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('business-logos').upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      const cleanSlug = formData.slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

      const { error } = await supabase.from('profiles').update({
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
      }).eq('id', user?.id);

      if (error) throw error;
      alert("Business profile updated!");
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { id: `new-${Date.now()}`, name: '', price: 0, description: '', is_new: true }]);
  };

  const saveMenu = async () => {
    setIsLoading(true);
    try {
      for (const item of menuItems) {
        if (item.is_new) {
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
      fetchMenu();
      alert("Price list synced successfully!");
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const deleteMenuItem = async (id: string) => {
    if (id.toString().startsWith('new')) {
      setMenuItems(menuItems.filter(i => i.id !== id));
      return;
    }
    if (confirm("Remove this product from your list?")) {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchMenu();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-20">
      <Head><title>Settings | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-10">
        
        {/* PROFILE SECTION */}
        <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
             <Store size={18} className="text-zinc-400" />
             <h2 className="font-black text-sm uppercase tracking-widest text-zinc-900">Business Profile</h2>
          </div>
          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-zinc-100 bg-zinc-50 flex items-center justify-center overflow-hidden relative group shadow-inner">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="text-zinc-200" size={32} />}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f){ setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }}} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900">Upload Image</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Recommended: 500x500px Square</p>
                </div>
              </div>
            </div>

            <InputField label="Business Name" value={formData.businessName} onChange={(v) => setFormData({...formData, businessName: v})} />
            
            {/* SLUG INPUT WITH WARNING */}
            <div className="space-y-2">
              <InputField label="Store URL Slug" value={formData.slug} onChange={(v) => setFormData({...formData, slug: v})} placeholder="e.g. item-7" icon={<LinkIcon size={14}/>} />
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-amber-700 font-bold">
                  WARNING: Changing your slug will change your store URL. Any previously printed QR codes will stop working.
                </p>
              </div>
            </div>

            <InputField label="Tagline" value={formData.tagline} onChange={(v) => setFormData({...formData, tagline: v})} placeholder="e.g. Quality You Can Trust" />
            <InputField label="Business Phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} icon={<Phone size={14}/>} />
            <div className="md:col-span-2 flex justify-end">
              <button onClick={handleSaveProfile} disabled={isLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
                {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Profile
              </button>
            </div>
          </div>
        </section>

        {/* UNIVERSAL PRICE LIST MANAGER */}
        <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
             <div className="flex items-center gap-3">
               <Package size={18} className="text-zinc-400" />
               <h2 className="font-black text-sm uppercase tracking-widest text-zinc-900">Digital Price List</h2>
             </div>
             <button onClick={addMenuItem} className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
               <Plus size={14}/> New Product
             </button>
          </div>
          <div className="p-8 space-y-4">
            {menuItems.map((item, idx) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100 relative group transition-all hover:bg-white hover:shadow-md">
                <div className="flex-1 space-y-3">
                   <input placeholder="Product Name (e.g. Cement, Jollof Rice)" value={item.name} onChange={(e) => { const n = [...menuItems]; n[idx].name = e.target.value; setMenuItems(n); }} className="w-full bg-transparent border-none text-sm font-black p-0 focus:ring-0 text-zinc-900" />
                   <input placeholder="Short details or specs..." value={item.description} onChange={(e) => { const n = [...menuItems]; n[idx].description = e.target.value; setMenuItems(n); }} className="w-full bg-transparent border-none text-xs text-zinc-400 p-0 focus:ring-0 font-medium" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">₦</span>
                    <input type="number" value={item.price} onChange={(e) => { const n = [...menuItems]; n[idx].price = e.target.value; setMenuItems(n); }} className="w-full bg-white border-2 border-zinc-100 rounded-xl pl-8 pr-3 py-3 text-sm font-black focus:border-zinc-900 outline-none transition-all" />
                  </div>
                  <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
            {menuItems.length > 0 ? (
              <button onClick={saveMenu} disabled={isLoading} className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16}/>} Sync Price List
              </button>
            ) : (
              <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl">
                <Package size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No products listed yet</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</div>}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full h-14 border-2 border-zinc-50 rounded-2xl text-sm font-bold focus:border-zinc-900 outline-none transition-all bg-zinc-100/50 focus:bg-white ${icon ? 'pl-11 pr-4' : 'px-5'}`} />
      </div>
    </div>
  );
}
