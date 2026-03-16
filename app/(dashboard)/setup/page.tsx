"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, CreditCard, Plus, Trash2, Save, Loader2, 
  MapPin, Info, HelpCircle, Landmark, Bus, MessageCircle, X, ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { NIGERIA_STATES_LGA } from '@/lib/nigeria-data'; 

export default function StoreSetupPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    whatsappOnly: false,
    logisticsConfig: [] as any[]
  });

  useEffect(() => {
    if (user) {
      const fetchSetup = async () => {
        setIsLoading(true);
        const { data } = await supabase
          .from('profiles')
          .select('bank_name, account_number, account_name, logistics_config, whatsapp_only')
          .eq('id', user.id)
          .single();

        if (data) {
          setFormData({
            bankName: data.bank_name || '',
            accountNumber: data.account_number || '',
            accountName: data.account_name || '',
            whatsappOnly: data.whatsapp_only || false,
            logisticsConfig: data.logistics_config || []
          });
        }
        setIsLoading(false);
      };
      fetchSetup();
    }
  }, [user]);

  const addLogisticsZone = () => {
    setFormData({
      ...formData,
      logisticsConfig: [{ state: '', lga: '', method: 'landmark', price: '', options: '' }, ...formData.logisticsConfig]
    });
  };

  const updateLogisticsZone = (index: number, key: string, value: any) => {
    const updated = [...formData.logisticsConfig];
    updated[index][key] = value;
    setFormData({ ...formData, logisticsConfig: updated });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          account_name: formData.accountName,
          whatsapp_only: formData.whatsappOnly,
          logistics_config: formData.logisticsConfig,
          updated_at: new Date(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      alert("Configuration Saved!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-orange" /></div>;

  return (
    // Optimized: px-0 on mobile for edge-to-edge look, max-w-5xl for desktop
    <div className="max-w-5xl mx-auto space-y-4 pb-20 md:px-4 px-0">

      {/* 1. DOCUMENTATION GUIDE (Edge-to-edge mobile) */}
      <AnimatePresence>
        {showGuide && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-brand-orange/5 border-y md:border border-brand-orange/20 md:rounded-[24px] overflow-hidden"
          >
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-brand-orange flex items-center gap-2">
                  <HelpCircle size={14} /> Setup Guide
                </h3>
                <button onClick={() => setShowGuide(false)} className="text-brand-orange/50 p-1"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GuideItem title="Automated Zones" desc="Calculate exact shipping based on customer LGA." />
                <GuideItem title="Logistics Types" desc="Choose Park Pickup or Landmark Delivery." />
                <GuideItem title="WhatsApp Override" desc="Switch to 100% manual chat negotiation." />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Header (Slimmer on mobile) */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 backdrop-blur-md p-4 md:p-6 md:rounded-[24px] border-y md:border border-white/10">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Store Setup</h1>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-brand-orange text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* 2. PAYMENT & WHATSAPP TOGGLE */}
        <section className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] md:rounded-[24px] border-y md:border border-white/10 p-5 md:p-6 space-y-4 shadow-sm">
          <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><CreditCard size={14} /> Banking</h3>
          <InputField label="Bank Name" value={formData.bankName} onChange={(v: string) => setFormData({...formData, bankName: v})} placeholder="e.g. Opay" compact />
          <InputField label="Account No." value={formData.accountNumber} onChange={(v: string) => setFormData({...formData, accountNumber: v})} placeholder="10 Digits" compact />
          <InputField label="Account Name" value={formData.accountName} onChange={(v: string) => setFormData({...formData, accountName: v})} placeholder="Business Name" compact />

          <div className="pt-4 border-t border-white/5">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-[10px] font-black uppercase text-slate-500">WhatsApp Only Mode</span>
              <div className="relative">
                <input type="checkbox" checked={formData.whatsappOnly} onChange={(e) => setFormData({...formData, whatsappOnly: e.target.checked})} className="hidden" />
                <div className={`w-10 h-5 rounded-full transition-all ${formData.whatsappOnly ? 'bg-green-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.whatsappOnly ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* 3. LOGISTICS MAPPER (Edge-to-Edge mobile) */}
        <section className={`lg:col-span-2 bg-white dark:bg-[#0a0a0a] md:rounded-[24px] border-y md:border border-white/10 p-4 md:p-6 space-y-4 ${formData.whatsappOnly ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Truck size={14} /> Shipping Zones</h3>
            <button onClick={addLogisticsZone} className="p-2 bg-brand-orange/10 text-brand-orange rounded-lg hover:bg-brand-orange/20"><Plus size={18} /></button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
            {formData.logisticsConfig.map((zone, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 md:rounded-2xl border-y md:border border-white/5 relative group">
                <button onClick={() => { const up = [...formData.logisticsConfig]; up.splice(idx,1); setFormData({...formData, logisticsConfig: up})}} className="absolute top-2 right-2 text-red-500 p-2 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">State</label>
                    <select value={zone.state} onChange={(e) => updateLogisticsZone(idx, 'state', e.target.value)} className="w-full h-10 bg-white dark:bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-white px-2 outline-none">
                      <option value="">Select</option>
                      {Object.keys(NIGERIA_STATES_LGA).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">LGA</label>
                    <select value={zone.lga} onChange={(e) => updateLogisticsZone(idx, 'lga', e.target.value)} disabled={!zone.state} className="w-full h-10 bg-white dark:bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-white px-2 outline-none disabled:opacity-20">
                      <option value="">Select</option>
                      {zone.state && NIGERIA_STATES_LGA[zone.state].map((lga: string) => <option key={lga} value={lga}>{lga}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Type</label>
                    <select value={zone.method} onChange={(e) => updateLogisticsZone(idx, 'method', e.target.value)} className="w-full h-10 bg-white dark:bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-white px-1 outline-none">
                      <option value="landmark">Landmark</option>
                      <option value="park">Park</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Price (₦)</label>
                    <input type="number" value={zone.price} onChange={(e) => updateLogisticsZone(idx, 'price', e.target.value)} placeholder="0.00" className="w-full h-10 bg-white dark:bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-white px-3 outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">{zone.method === 'park' ? 'Available Parks' : 'Available Landmarks'}</label>
                  <input type="text" value={zone.options} onChange={(e) => updateLogisticsZone(idx, 'options', e.target.value)} placeholder="Separate with commas..." className="w-full h-10 bg-white dark:bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 px-3 outline-none" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function GuideItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
      <h4 className="text-[9px] font-black uppercase text-brand-orange tracking-widest mb-1">{title}</h4>
      <p className="text-[8px] font-bold text-slate-500 leading-tight uppercase">{desc}</p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, compact }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`w-full ${compact ? 'h-10 px-4' : 'h-12 px-4'} bg-slate-50 dark:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-orange transition-all`} 
      />
    </div>
  );
}
