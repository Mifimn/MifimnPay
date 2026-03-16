"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Save, Mail, Phone, MapPin, FileText, Loader2, 
  Link as LinkIcon, AlertTriangle, Palette, AlignLeft, Image as ImageIcon, Type, Info, X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';

const themePalettes = [
  { id: 'orange', name: 'Orange', shades: ['#fdba74', '#f97316', '#ea580c', '#c2410c'] },
  { id: 'red', name: 'Red', shades: ['#fca5a5', '#ef4444', '#dc2626', '#b91c1c'] },
  { id: 'blue', name: 'Blue', shades: ['#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8'] },
  { id: 'pink', name: 'Pink', shades: ['#f9a8d4', '#ec4899', '#db2777', '#be185d'] },
  { id: 'green', name: 'Green', shades: ['#86efac', '#22c55e', '#16a34a', '#15803d'] }
];

// WhatsApp optimized limit: 300KB
const MAX_SOCIAL_IMAGE_SIZE = 300 * 1024; 

export default function SettingsPage() {
  const { user } = useAuth();
  const { setThemeColor } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Logo State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Banners State
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null]);
  const [bannerPreviews, setBannerPreviews] = useState<(string | null)[]>([null, null]);

  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    footerMessage: '',
    currency: '₦ (NGN)',
    slug: '',
    aboutText: '', 
    themeColor: '#f97316',
    bannerType: 'image' as 'image' | 'text',
    promoTexts: ['', '', '', '']
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
            slug: data.slug || '',
            aboutText: data.about_text || '',
            themeColor: data.theme_color || '#f97316',
            bannerType: data.banner_type || 'image',
            promoTexts: data.promo_texts?.length === 4 ? data.promo_texts : ['', '', '', '']
          });

          // Sync global theme store with fetched color
          setThemeColor(data.theme_color || '#f97316');

          setLogoPreview(data.logo_url);
          if (data.banner_urls) {
            setBannerPreviews([data.banner_urls[0] || null, data.banner_urls[1] || null]);
          }
        }
      };
      fetchProfile();
    }
  }, [user, setThemeColor]);

  // IMAGE COMPRESSION HELPER
  const compressImage = (file: File, maxSize: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_DIM = 1200;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = (MAX_DIM / width) * height;
              width = MAX_DIM;
            } else {
              width = (MAX_DIM / height) * width;
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          const performCompression = (q: number) => {
            canvas.toBlob((blob) => {
              if (blob && blob.size > maxSize && q > 0.1) {
                performCompression(q - 0.1);
              } else if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              }
            }, 'image/jpeg', q);
          };
          performCompression(quality);
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    let finalLogoUrl = logoPreview;
    let finalBannerUrls = [...bannerPreviews];

    try {
      if (logoFile && user) {
        const filePath = `${user.id}/logo-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('business-logos').upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      if (formData.bannerType === 'image' && user) {
        for (let i = 0; i < 2; i++) {
          if (bannerFiles[i]) {
            const filePath = `${user.id}/banner-${i}-${Date.now()}`;
            const { error: uploadError } = await supabase.storage.from('business-logos').upload(filePath, bannerFiles[i]!);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
            finalBannerUrls[i] = urlData.publicUrl;
          }
        }
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
          about_text: formData.aboutText, 
          theme_color: formData.themeColor,
          banner_type: formData.bannerType,
          banner_urls: finalBannerUrls,
          promo_texts: formData.promoTexts,
          updated_at: new Date(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update global store color immediately
      setThemeColor(formData.themeColor);

      alert("Settings saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const compressed = await compressImage(file, MAX_SOCIAL_IMAGE_SIZE);
        setLogoFile(compressed);
        setLogoPreview(URL.createObjectURL(compressed));
      } catch (err) {
        alert("Error processing image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBannerUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const compressed = await compressImage(file, MAX_SOCIAL_IMAGE_SIZE);
        const newFiles = [...bannerFiles];
        newFiles[index] = compressed;
        setBannerFiles(newFiles);

        const newPreviews = [...bannerPreviews];
        newPreviews[index] = URL.createObjectURL(compressed);
        setBannerPreviews(newPreviews);
      } catch (err) {
        alert("Error processing banner");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePromoTextChange = (index: number, value: string) => {
    if (value.length <= 30) {
      const newTexts = [...formData.promoTexts];
      newTexts[index] = value;
      setFormData({...formData, promoTexts: newTexts});
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto relative">
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-2xl p-8 z-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange mb-6 shadow-sm border border-brand-orange/20">
                <Info size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Push Updates?</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Applying these changes will immediately update your Storefront and Receipt appearance. WhatsApp previews will refresh shortly after.
              </p>

              <div className="flex gap-4">
                <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/5 hover:bg-slate-100 transition-all">
                  Cancel
                </button>
                <button onClick={() => { setIsConfirmOpen(false); handleSave(); }} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-brand-orange text-white shadow-glow-orange active:scale-95 transition-all">
                  Confirm & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Manage your storefront and billing profile.</p>
        </div>
        <button onClick={() => setIsConfirmOpen(true)} disabled={isLoading} className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-orange active:scale-95 transition-all disabled:opacity-70 w-full md:w-auto">
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />} 
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-white/40 dark:border-white/5 flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-white/40 dark:border-white/10"><Store size={20} /></div>
             <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Business Profile</h2>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div className="md:col-span-2 flex items-center gap-6 p-6 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-white/40 dark:border-white/5">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 flex items-center justify-center overflow-hidden relative group cursor-pointer transition-all hover:border-brand-orange">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="text-slate-300 dark:text-white/20" size={32} />}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">Store Logo</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized for social sharing. Auto-compressed to under 300KB.</p>
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

        {/* Hero Section & Promotions */}
        <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-white/40 dark:border-white/5 flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-white/40 dark:border-white/10"><ImageIcon size={20} /></div>
             <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Hero Section & Promotions</h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex p-1.5 bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-2xl shadow-sm w-fit">
              <button onClick={() => setFormData({...formData, bannerType: 'image'})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${formData.bannerType === 'image' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                <ImageIcon size={14} /> Image Banners
              </button>
              <button onClick={() => setFormData({...formData, bannerType: 'text'})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${formData.bannerType === 'text' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                <Type size={14} /> Text Announcements
              </button>
            </div>

            {formData.bannerType === 'image' ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[0, 1].map((index) => (
                  <div key={index} className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slide {index + 1} (Social Optimized)</label>
                    <div className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden transition-all hover:border-brand-orange">
                      {bannerPreviews[index] ? <img src={bannerPreviews[index]!} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" /> : (
                        <><ImageIcon className="text-slate-300 dark:text-white/20 mb-2" size={32} /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Click to upload</span></>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleBannerUpload(index, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{index + 1}.</div>
                    <input value={formData.promoTexts[index]} onChange={(e) => handlePromoTextChange(index, e.target.value)} placeholder="e.g. 50% OFF ALL SNEAKERS" className="w-full h-14 border-2 border-transparent bg-white/40 dark:bg-white/5 focus:border-brand-orange text-slate-900 dark:text-white rounded-2xl font-bold outline-none transition-all placeholder:text-slate-400 pl-12 pr-16" />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{formData.promoTexts[index].length}/30</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Storefront Appearance */}
        <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-white/40 dark:border-white/5 flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-white/40 dark:border-white/10"><Palette size={20} /></div>
             <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Storefront Appearance</h2>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><AlignLeft size={12} /> Storefront About Section</label>
              <textarea value={formData.aboutText} onChange={(e) => setFormData({...formData, aboutText: e.target.value})} rows={4} placeholder="Describe your business..." className="w-full p-5 bg-white/40 dark:bg-white/5 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-brand-orange outline-none transition-all resize-none placeholder:text-slate-400" />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Accent Color Palette</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {themePalettes.map((theme) => (
                  <div key={theme.id} className="p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 block">{theme.name}</span>
                    <div className="flex gap-2">
                      {theme.shades.map((color) => (
                        <button key={color} type="button" onClick={() => setFormData({...formData, themeColor: color})} style={{ backgroundColor: color }} className={`flex-1 h-10 rounded-lg border-2 transition-all ${formData.themeColor.toLowerCase() === color.toLowerCase() ? 'border-slate-900 dark:border-white scale-110 shadow-md z-10' : 'border-transparent hover:scale-105'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Receipt Defaults */}
        <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-white/40 dark:border-white/5 flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-brand-orange border border-white/40 dark:border-white/10"><FileText size={20} /></div>
             <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Receipt Defaults</h2>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Footer Message</label>
              <textarea value={formData.footerMessage} onChange={(e) => setFormData({...formData, footerMessage: e.target.value})} rows={3} placeholder="Thank you message..." className="w-full p-5 bg-white/40 dark:bg-white/5 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-brand-orange outline-none transition-all resize-none placeholder:text-slate-400" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Currency</label>
              <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full h-14 px-5 bg-white/40 dark:bg-white/5 border-2 border-transparent rounded-2xl text-xs font-black uppercase text-slate-900 dark:text-white focus:border-brand-orange outline-none transition-all">
                <option>₦ (NGN) - Nigerian Naira</option>
                <option>$ (USD) - US Dollar</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder }: any) {
  return (
    <div className="relative">
      <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full h-14 border-2 border-transparent bg-white/40 dark:bg-white/5 focus:border-brand-orange text-slate-900 dark:text-white rounded-2xl font-bold outline-none transition-all placeholder:text-slate-400 ${icon ? 'pl-12 pr-5' : 'px-5'}`} />
      </div>
    </div>
  );
}
