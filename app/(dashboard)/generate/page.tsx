"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
  Download, Share2, Plus, Trash2, ArrowLeft, Loader2, 
  Settings, Lock, AlertTriangle, User, Store, Edit3, ShieldAlert
} from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';

import { ReceiptData, ReceiptItem, ReceiptSettings } from '@/types';
import ReceiptPreview from '@/components/generator/ReceiptPreview';
import { supabase } from '@/lib/supabaseClient'; 
import { useAuth } from '@/lib/AuthContext'; 

const safeFloat = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export default function Generator() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const receiptRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [useStoreMode, setUseStoreMode] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  const [pastCustomers, setPastCustomers] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [data, setData] = useState<ReceiptData>({
    receiptNumber: '...',
    date: '...',
    customerName: '',
    currency: '₦',
    items: [{ id: '1', name: '', qty: 1, price: '' }], 
    paymentMethod: 'Transfer',
    status: 'paid',
    discount: '',
    shipping: '',
    businessName: 'My Business',
    businessPhone: '',
    tagline: '',
    footerMessage: '',
    note: ''
  });

  const [settings, setSettings] = useState<ReceiptSettings>({
    color: '#09090b', 
    showLogo: true,
    template: 'detailed'
  });

  useEffect(() => {
    setIsClient(true);
    const initializeData = async () => {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (user) {
        try {
          const { data: nextNum } = await supabase.rpc('get_next_receipt_number', { target_user_id: user.id });

          const { data: profile } = await supabase
            .from('profiles')
            .select('business_name, business_phone, currency, logo_url, tagline, footer_message')
            .eq('id', user.id)
            .single();

          if (profile) {
            setData(prev => ({
              ...prev,
              receiptNumber: nextNum || '001',
              date: today,
              businessName: profile.business_name || 'My Business',
              businessPhone: profile.business_phone || '',
              currency: profile.currency || '₦',
              logoUrl: profile.logo_url,
              tagline: profile.tagline || '', 
              footerMessage: profile.footer_message || '' 
            }));
          }

          const { data: products } = await supabase.from('menu_items').select('*').eq('user_id', user.id);
          if (products) setAvailableProducts(products);

          const { data: receipts } = await supabase
            .from('receipts')
            .select('customer_name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (receipts) {
            const uniqueNames = Array.from(new Set(
              receipts.map(r => r.customer_name).filter(name => name && name.trim() !== '')
            ));
            setPastCustomers(uniqueNames as string[]);
          }

        } catch (err) { console.error(err); }
      } else {
        setData(prev => ({ ...prev, date: today }));
      }
    };
    if (!authLoading) initializeData();
  }, [user, authLoading]);

  useEffect(() => {
    if (data.customerName.length > 0) {
      const matches = pastCustomers.filter(name => 
        name.toLowerCase().includes(data.customerName.toLowerCase())
      );
      setFilteredSuggestions(matches.slice(0, 5));
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [data.customerName, pastCustomers]);

  const selectCustomer = (name: string) => {
    setData({ ...data, customerName: name });
    setShowSuggestions(false);
  };

  const handleStoreItemSelect = (id: string, productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return;
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, name: product.name, price: product.price } : item
      )
    }));
  };

  const saveToHistory = async () => {
    if (!user) return; 

    // 1. LIMIT CHECK: Run the SQL Function to check if they are allowed to save
    const { data: canProceed } = await supabase.rpc('check_receipt_limit', { vendor_id: user.id });

    if (!canProceed) {
      alert("Verification Required: You have reached the limit of 10 receipts for unverified accounts. Please verify your NIN to get unlimited access.");
      router.push('/verify');
      throw new Error("Limit reached");
    }

    const subtotal = data.items.reduce((acc, i) => acc + (safeFloat(i.price) * safeFloat(i.qty)), 0);
    const shipping = safeFloat(data.shipping);
    const discount = safeFloat(data.discount);
    const numericTotal = subtotal + shipping - discount;

    const { error } = await supabase.from('receipts').insert([{
      user_id: user.id,
      receipt_number: data.receiptNumber,
      customer_name: data.customerName || 'Walk-in Customer',
      total_amount: numericTotal,
      shipping_fee: shipping,
      discount_amount: discount,
      status: data.status.toLowerCase(),
      payment_method: data.paymentMethod,
      items: data.items.map(i => ({
        ...i,
        qty: safeFloat(i.qty),
        price: safeFloat(i.price)
      })),
      created_at: new Date().toISOString()
    }]);

    if (error) throw error;
  };

  const confirmAndExecute = async () => {
    setShowConfirm(false);
    if (pendingAction) {
      await pendingAction();
    }
  };

  const generateImage = async () => {
    if (!receiptRef.current) return null;
    setIsGenerating(true);
    setActiveTab('preview');
    await new Promise(r => setTimeout(r, 400)); 
    try {
      return await toPng(receiptRef.current, { pixelRatio: 3, cacheBust: true });
    } catch (err) { return null; } finally { setIsGenerating(false); }
  };

  const handleDownload = async () => {
    try {
      await saveToHistory(); // This will trigger the limit check
      const image = await generateImage();
      if (!image) return;

      const link = document.createElement('a');
      link.href = image;
      link.download = `receipt-${data.receiptNumber}.png`;
      link.click();
      router.push('/history');
    } catch (err: any) { 
       if(err.message !== "Limit reached") console.error(err); 
    }
  };

  const handleShare = async () => {
    try {
      await saveToHistory(); // This will trigger the limit check
      const image = await generateImage();
      if (!image) return;

      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], `receipt-${data.receiptNumber}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt #${data.receiptNumber}`,
          text: `Hello ${data.customerName || 'Customer'}, attached is your receipt.`,
        });
        router.push('/history');
      } else {
        const link = document.createElement('a');
        link.href = image;
        link.download = `receipt-${data.receiptNumber}.png`;
        link.click();
        alert("Sharing not supported on this browser. Receipt downloaded instead.");
        router.push('/history');
      }
    } catch (err: any) {
        if(err.message !== "Limit reached") console.error(err);
    }
  };

  const handleItemChange = (id: string, field: keyof ReceiptItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', qty: 1, price: '' }]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) return;
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const initiateAction = (action: () => void) => {
    if (!user) {
      if (confirm("Sign up to save, download or share receipts?")) router.push('/login');
      return;
    }
    setPendingAction(() => action);
    setShowConfirm(true);
  };

  const colors = ['#09090b', '#166534', '#1e40af', '#b45309', '#7e22ce', '#be123c', '#0891b2', '#854d0e'];
  if (!isClient || authLoading) return null;

  return (
    <div className={`h-[100dvh] bg-brand-bg flex flex-col overflow-hidden transition-colors duration-300 ${!user ? 'fixed inset-0 z-[100]' : ''}`}>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-paper rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center border border-brand-border">
            <div className="w-16 h-16 bg-yellow-500/10 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-brand-black mb-2 uppercase italic tracking-tighter">Sync Record</h3>
            <p className="text-[10px] font-bold text-brand-gray mb-8 uppercase tracking-[0.15em] leading-relaxed">Ensure all totals and client names are accurate before final synchronization.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirm(false)} className="py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-brand-bg text-brand-gray border border-brand-border active:scale-95 transition-all">Go Back</button>
              <button onClick={confirmAndExecute} className="py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-brand-black text-brand-paper shadow-lg active:scale-95 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-brand-paper border-b border-brand-border px-4 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="text-brand-gray p-2 hover:bg-brand-bg rounded-full transition-colors"><ArrowLeft size={22} /></Link>
            <h1 className="font-black text-lg text-brand-black tracking-tighter uppercase italic">New Receipt</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => initiateAction(handleShare)} disabled={isGenerating} className="bg-brand-bg border border-brand-border text-brand-black p-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Share2 size={18} />}
            </button>
            <button onClick={() => initiateAction(handleDownload)} disabled={isGenerating} className="bg-brand-black text-brand-paper p-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Download size={18} />}
            </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <div className={`flex-1 h-full overflow-y-auto bg-brand-bg p-4 md:p-6 space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-10">

            <section className="bg-brand-paper p-2 rounded-2xl border border-brand-border shadow-sm flex items-center gap-2">
               <button onClick={() => setUseStoreMode(false)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${!useStoreMode ? 'bg-brand-black text-brand-paper shadow-lg' : 'text-brand-gray hover:bg-brand-bg'}`}><Edit3 size={16}/> Manual Entry</button>
               <button onClick={() => setUseStoreMode(true)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${useStoreMode ? 'bg-brand-black text-brand-paper shadow-lg' : 'text-brand-gray hover:bg-brand-bg'}`}><Store size={16}/> Price List Mode</button>
            </section>

            <section className="bg-brand-paper p-5 rounded-3xl border border-brand-border shadow-sm space-y-4">
              <h3 className="font-black text-[10px] text-brand-gray uppercase tracking-widest flex items-center gap-2 border-b border-brand-border pb-2"><User size={16} className="text-brand-orange" /> Client Information</h3>

              <div className="relative">
                <input 
                  value={data.customerName} 
                  onChange={(e) => setData({ ...data, customerName: e.target.value })}
                  onFocus={() => { if(data.customerName) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full h-14 px-5 border-2 border-brand-border rounded-2xl focus:border-brand-black outline-none font-bold bg-brand-bg text-base text-brand-black" 
                  placeholder="Customer Name"
                  autoComplete="off" 
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-brand-paper border border-brand-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    {filteredSuggestions.map((name, index) => (
                      <button key={index} onClick={() => selectCustomer(name)} className="w-full text-left px-5 py-4 text-sm font-bold text-brand-black hover:bg-brand-bg transition-colors flex items-center gap-3"><User size={14} className="text-brand-gray" /> {name}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-brand-gray ml-1 uppercase tracking-widest">ID</label>
                  <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-brand-bg rounded-xl text-brand-black font-black border border-brand-border opacity-60" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-brand-gray ml-1 uppercase tracking-widest">Date</label>
                  <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl outline-none focus:border-brand-black bg-brand-bg font-bold text-brand-black" />
                </div>
              </div>
            </section>

            <section className="bg-brand-paper p-5 rounded-3xl border border-brand-border shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-2">
                <h3 className="font-black text-[10px] text-brand-gray uppercase tracking-widest">Assets / Items</h3>
                <button onClick={addItem} className="text-[10px] font-black uppercase tracking-widest text-brand-orange">+ Add Line</button>
              </div>
              <div className="space-y-4">
                {data.items.map((item) => (
                  <div key={item.id} className="p-4 bg-brand-bg rounded-2xl border border-brand-border relative">
                    <div className="flex flex-col gap-3">
                      {useStoreMode ? (
                        <select 
                          onChange={(e) => handleStoreItemSelect(item.id, e.target.value)}
                          className="w-full p-4 text-sm border-2 border-brand-border rounded-xl focus:border-brand-black outline-none font-bold bg-brand-paper text-brand-black appearance-none"
                        >
                          <option value="">Choose Asset...</option>
                          {availableProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({data.currency}{p.price})</option>
                          ))}
                        </select>
                      ) : (
                        <input placeholder="Asset Name" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full p-4 text-sm border-2 border-brand-border rounded-xl focus:border-brand-black outline-none font-bold bg-brand-paper text-brand-black" />
                      )}

                      <div className="flex gap-3">
                        <div className="w-24">
                          <label className="text-[8px] font-black text-brand-gray ml-1 uppercase">Qty</label>
                          <input type="number" placeholder="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full p-3 border-2 border-brand-border rounded-xl outline-none text-center font-black bg-brand-paper text-brand-black" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[8px] font-black text-brand-gray ml-1 uppercase">Unit Price</label>
                          <input type="number" disabled={useStoreMode} placeholder="0" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className={`w-full p-3 border-2 border-brand-border rounded-xl outline-none font-black bg-brand-paper text-brand-black ${useStoreMode ? 'opacity-50' : ''}`} />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-3 text-brand-gray hover:text-red-500 self-end transition-colors"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-brand-paper p-5 rounded-3xl border border-brand-border shadow-sm space-y-4">
              <h3 className="font-black text-[10px] text-brand-gray uppercase tracking-widest">Fees & Payment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-brand-gray ml-1 uppercase tracking-widest">Discount</label>
                  <input type="number" placeholder="0" value={data.discount} onChange={(e) => setData({...data, discount: e.target.value})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl outline-none bg-brand-bg font-bold text-brand-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-brand-gray ml-1 uppercase tracking-widest">Logistics</label>
                  <input type="number" placeholder="0" value={data.shipping} onChange={(e) => setData({...data, shipping: e.target.value})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl outline-none bg-brand-bg font-bold text-brand-black" />
                </div>
                <select value={data.paymentMethod} onChange={(e) => setData({...data, paymentMethod: e.target.value as any})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl bg-brand-paper font-bold text-xs uppercase tracking-widest text-brand-black outline-none focus:border-brand-black">
                    <option>Transfer</option><option>Cash</option><option>POS</option>
                </select>
                <select value={data.status} onChange={(e) => setData({...data, status: e.target.value.toLowerCase() as any})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl bg-brand-paper font-bold text-xs uppercase tracking-widest text-brand-black outline-none focus:border-brand-black">
                    <option value="paid">PAID (Closed)</option>
                    <option value="pending">PENDING</option>
                </select>
              </div>
            </section>
          </div>
        </div>

        {/* Live Preview Side */}
        <div className={`flex-1 h-full bg-brand-bg flex flex-col relative ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-brand-paper/80 backdrop-blur-md border-b border-brand-border p-3 flex justify-between items-center z-10 shrink-0">
             <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
               {colors.map(c => (
                 <button key={c} onClick={() => setSettings({...settings, color: c})} className={`w-8 h-8 rounded-full border-2 transition-all ${settings.color === c ? 'border-brand-black scale-110' : 'border-transparent opacity-70'}`} style={{ backgroundColor: c }} />
               ))}
             </div>
             <div className="flex gap-2">
               <button onClick={() => setSettings({...settings, showLogo: !settings.showLogo})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.showLogo ? 'bg-brand-black text-brand-paper' : 'bg-brand-paper text-brand-gray border border-brand-border'}`}>Logo</button>
               <button onClick={() => setSettings({...settings, template: settings.template === 'simple' ? 'detailed' : 'simple'})} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-paper border border-brand-border text-brand-black">{settings.template === 'simple' ? 'Simple' : 'Detailed'}</button>
             </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-10">
             <div className="scale-[0.8] sm:scale-[0.9] lg:scale-100 origin-center">
               <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
             </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-paper border-t border-brand-border flex z-40 pb-safe shadow-lg">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'text-brand-black bg-brand-bg' : 'text-brand-gray'}`}>1. Modify Detail</button>
          <div className="w-[1px] bg-brand-border h-6 self-center"></div>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'text-brand-black bg-brand-bg' : 'text-brand-gray'}`}>2. View Result</button>
        </div>
      </div>
    </div>
  );
}