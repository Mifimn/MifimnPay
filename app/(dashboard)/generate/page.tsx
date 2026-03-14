"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // UPDATED for App Router
import { 
  Download, Share2, Plus, Trash2, ArrowLeft, Loader2, 
  Settings, Lock, AlertTriangle, User, Store, Edit3
} from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';

// UPDATED: Using absolute paths to match your Next.js setup
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
    receiptNumber: '001',
    date: '...',
    customerName: '',
    currency: '₦',
    items: [{ id: '1', name: '', qty: 1, price: '' }], 
    paymentMethod: 'Transfer',
    status: 'paid', // UPDATED: Changed to lowercase 'paid'
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

          const { data: products } = await supabase
            .from('menu_items')
            .select('*')
            .eq('user_id', user.id);
          if (products) setAvailableProducts(products);

          const { data: receipts } = await supabase
            .from('receipts')
            .select('customer_name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (receipts) {
            const uniqueNames = Array.from(new Set(
              receipts.map(r => r.customer_name).filter(name => name && name.trim() !== '' && name !== 'Walk-in Customer')
            ));
            setPastCustomers(uniqueNames);
          }

        } catch (err) { console.error(err); }
      } else {
        setData(prev => ({ ...prev, date: today }));
      }
    };
    if (!authLoading) initializeData();
  }, [user, authLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.customerName.length > 0) {
        const matches = pastCustomers.filter(name => 
          name.toLowerCase().includes(data.customerName.toLowerCase())
        );
        setFilteredSuggestions(matches.slice(0, 5));
        if (matches.length > 0) setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [data.customerName, pastCustomers]);

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, customerName: e.target.value });
  };

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
      status: data.status.toLowerCase(), // Save as lowercase
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
      if (confirm("Sign up for a free account to Download or Share?")) router.push('/login');
      return;
    }
    setPendingAction(() => action);
    setShowConfirm(true);
  };

  const confirmAndExecute = () => {
    setShowConfirm(false);
    if (pendingAction) pendingAction();
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
      const image = await generateImage();
      if (!image) return;
      await saveToHistory(); 
      const link = document.createElement('a');
      link.href = image;
      link.download = `receipt-${data.receiptNumber}.png`;
      link.click();
      router.push('/history');
    } catch (err: any) { alert(err.message); }
  };

  const handleShare = async () => {
    try {
      const image = await generateImage();
      if (!image) return;
      await saveToHistory();
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
        alert("Sharing not supported. Image has been downloaded.");
        router.push('/history');
      }
    } catch (err: any) { console.error(err); }
  };

  const colors = ['#09090b', '#166534', '#1e40af', '#b45309', '#7e22ce', '#be123c', '#0891b2', '#854d0e'];
  if (!isClient || authLoading) return null;

  return (
    <div className="h-[100dvh] bg-brand-bg flex flex-col overflow-hidden transition-colors duration-300">
      {/* Head tag removed because Next.js 15 uses Metadata in layout files instead! */}

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-brand-paper rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-brand-border transition-colors duration-300">
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold text-brand-black mb-2 transition-colors duration-300">Check details carefully</h3>
            <p className="text-sm text-brand-gray mb-6 transition-colors duration-300">Are you sure the details are correct? This will be saved to your history.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 px-4 rounded-xl font-bold text-sm bg-brand-bg text-brand-gray transition-colors duration-300 border border-brand-border">Cancel</button>
              <button onClick={confirmAndExecute} className="py-3 px-4 rounded-xl font-bold text-sm bg-brand-black text-brand-paper transition-colors duration-300">Save & Proceed</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-brand-paper border-b border-brand-border px-4 py-3 flex justify-between items-center z-30 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="text-brand-gray p-2 hover:bg-brand-bg rounded-full transition-colors"><ArrowLeft size={22} /></Link>
            <h1 className="font-bold text-lg text-brand-black tracking-tight uppercase transition-colors duration-300">New Receipt</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => initiateAction(handleShare)} disabled={isGenerating} className="bg-brand-bg border border-brand-border text-brand-black p-2.5 rounded-full shadow-sm active:scale-95 transition-all">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Share2 size={18} />}
            </button>
            <button onClick={() => initiateAction(handleDownload)} disabled={isGenerating} className="bg-brand-black text-brand-paper p-2.5 rounded-full shadow-sm active:scale-95 transition-all">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Download size={18} />}
            </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <div className={`flex-1 h-full overflow-y-auto bg-brand-bg p-4 md:p-6 space-y-6 transition-colors duration-300 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-10">

            <section className="bg-brand-paper p-2 rounded-2xl border border-brand-border shadow-sm flex items-center gap-2 transition-colors duration-300">
               <button 
                  onClick={() => setUseStoreMode(false)}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${!useStoreMode ? 'bg-brand-black text-brand-paper shadow-lg' : 'text-brand-gray hover:bg-brand-bg'}`}
               >
                  <Edit3 size={16}/> Manual
               </button>
               <button 
                  onClick={() => setUseStoreMode(true)}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${useStoreMode ? 'bg-brand-black text-brand-paper shadow-lg' : 'text-brand-gray hover:bg-brand-bg'}`}
               >
                  <Store size={16}/> Store Mode
               </button>
            </section>

            <section className="bg-brand-paper p-5 rounded-2xl border border-brand-border shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="font-bold text-xs text-brand-gray uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-2 transition-colors duration-300"><Settings size={16} className="text-brand-gray/70" /> Details</h3>

              <div className="relative">
                <input 
                  value={data.customerName} 
                  onChange={handleCustomerNameChange}
                  onFocus={() => { if(data.customerName) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full h-12 px-4 border-2 border-brand-border rounded-xl focus:border-brand-black outline-none font-medium bg-brand-bg focus:bg-brand-paper transition-colors duration-300 text-base text-brand-black" 
                  placeholder="Customer Name"
                  autoComplete="off" 
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-brand-paper border border-brand-border rounded-xl shadow-lg z-50 overflow-hidden transition-colors duration-300">
                    <div className="px-3 py-2 bg-brand-bg text-[10px] font-bold text-brand-gray uppercase tracking-wider border-b border-brand-border transition-colors duration-300">
                      Previous Customers
                    </div>
                    {filteredSuggestions.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => selectCustomer(name)}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-brand-black hover:bg-brand-bg transition-colors flex items-center gap-2"
                      >
                        <User size={14} className="text-brand-gray" />
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-brand-gray ml-1 mb-1 transition-colors duration-300">RECEIPT NO.</label>
                  <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-brand-bg rounded-xl text-brand-black font-bold border border-brand-border transition-colors duration-300" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-brand-gray ml-1 mb-1 uppercase transition-colors duration-300">Date</label>
                  <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl outline-none focus:border-brand-black bg-brand-bg focus:bg-brand-paper text-base text-brand-black transition-colors duration-300" />
                </div>
              </div>
            </section>

            <section className="bg-brand-paper p-5 rounded-2xl border border-brand-border shadow-sm space-y-4 transition-colors duration-300">
              <div className="flex justify-between items-center border-b border-brand-border pb-2 transition-colors duration-300">
                <h3 className="font-bold text-xs text-brand-gray uppercase tracking-wider transition-colors duration-300">Items</h3>
                <button onClick={addItem} className="text-xs font-bold text-brand-black hover:bg-brand-bg px-3 py-1 rounded-full transition-all">+ Add Item</button>
              </div>
              <div className="space-y-4">
                {data.items.map((item) => (
                  <div key={item.id} className="p-4 bg-brand-bg rounded-xl border border-brand-border md:bg-transparent md:p-0 md:border-0 relative transition-colors duration-300">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-brand-gray mb-1 block md:hidden uppercase transition-colors duration-300">Description</label>
                        {useStoreMode ? (
                          <select 
                            onChange={(e) => handleStoreItemSelect(item.id, e.target.value)}
                            className="w-full p-3 text-base border-2 border-brand-border rounded-xl focus:border-brand-black outline-none font-medium bg-brand-paper md:bg-brand-bg appearance-none text-brand-black transition-colors duration-300"
                          >
                            <option value="">Select from Price List</option>
                                                        {availableProducts.map(p => (
                                                          <option key={p.id} value={p.id}>{p.name} ({data.currency}{p.price})</option>
                                                        ))}
                                                      </select>
                                                    ) : (
                                                      <input placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full p-3 text-base border-2 border-brand-border rounded-xl focus:border-brand-black outline-none font-medium bg-brand-paper md:bg-brand-bg text-brand-black transition-colors duration-300" />
                                                    )}
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <div className="w-20">
                                                      <label className="text-[10px] font-bold text-brand-gray mb-1 block md:hidden uppercase transition-colors duration-300">Qty</label>
                                                      <input type="number" placeholder="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full p-3 text-base border-2 border-brand-border rounded-xl focus:border-brand-black outline-none text-center font-bold bg-brand-paper md:bg-brand-bg text-brand-black transition-colors duration-300" />
                                                    </div>
                                                    <div className="flex-1 md:w-32">
                                                      <label className="text-[10px] font-bold text-brand-gray mb-1 block md:hidden uppercase transition-colors duration-300">Price</label>
                                                      <input 
                                                        type="number" 
                                                        disabled={useStoreMode}
                                                        placeholder="0" 
                                                        value={item.price} 
                                                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} 
                                                        className={`w-full p-3 text-base border-2 border-brand-border rounded-xl focus:border-brand-black outline-none font-bold bg-brand-paper md:bg-brand-bg text-brand-black transition-colors duration-300 ${useStoreMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                                      />
                                                    </div>
                                                    <button onClick={() => removeItem(item.id)} className="p-3 text-brand-gray hover:text-red-500 self-end md:self-center transition-colors"><Trash2 size={20}/></button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </section>

                                        <section className="bg-brand-paper p-5 rounded-2xl border border-brand-border shadow-sm space-y-4 transition-colors duration-300">
                                           <h3 className="font-bold text-xs text-brand-gray uppercase tracking-wider transition-colors duration-300">Fees & Method</h3>
                                           <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-brand-gray ml-1 uppercase transition-colors duration-300">Discount (Amount)</label>
                                                <input type="number" placeholder="0" value={data.discount} onChange={(e) => setData({...data, discount: e.target.value})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl outline-none focus:border-brand-black bg-brand-bg focus:bg-brand-paper text-base text-brand-black transition-colors duration-300" />
                                              </div>
                                              <div className="space-y-1">
                                               <label className="text-[10px] font-bold text-brand-gray ml-1 uppercase transition-colors duration-300">Shipping (Amount)</label>
                                                <input type="number" placeholder="0" value={data.shipping} onChange={(e) => setData({...data, shipping: e.target.value})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl outline-none focus:border-brand-black bg-brand-bg focus:bg-brand-paper text-base text-brand-black transition-colors duration-300" />
                                              </div>
                                              <select value={data.paymentMethod} onChange={(e) => setData({...data, paymentMethod: e.target.value as any})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl bg-brand-paper outline-none focus:border-brand-black text-sm text-brand-black transition-colors duration-300">
                                                 <option>Transfer</option><option>Cash</option><option>POS</option>
                                              </select>
                                              <select value={data.status} onChange={(e) => setData({...data, status: e.target.value.toLowerCase() as any})} className="w-full h-12 px-4 border-2 border-brand-border rounded-xl bg-brand-paper outline-none focus:border-brand-black text-sm text-brand-black transition-colors duration-300">
                                                 <option value="paid">Paid</option>
                                                 <option value="pending">Pending</option>
                                              </select>
                                           </div>
                                        </section>
                                      </div>
                                    </div>

                                    <div className={`flex-1 h-full bg-brand-bg flex flex-col relative transition-colors duration-300 ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
                                      <div className="bg-brand-paper/80 backdrop-blur-md border-b border-brand-border p-3 flex justify-between items-center z-10 shadow-sm shrink-0 transition-colors duration-300">
                                         <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                                           {colors.map(c => (
                                             <button key={c} onClick={() => setSettings({...settings, color: c})} className={`w-7 h-7 rounded-full border-2 transition-all ${settings.color === c ? 'border-brand-black scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                                           ))}
                                         </div>
                                         <div className="flex gap-2">
                                           <button onClick={() => setSettings({...settings, showLogo: !settings.showLogo})} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${settings.showLogo ? 'bg-brand-black shadow-sm text-brand-paper' : 'text-brand-gray hover:bg-brand-bg'}`}>Logo</button>
                                           <button onClick={() => setSettings({...settings, template: settings.template === 'simple' ? 'detailed' : 'simple'})} className="px-3 py-1.5 rounded-full text-xs font-bold bg-brand-bg shadow-sm border border-brand-border text-brand-black transition-colors duration-300">{settings.template === 'simple' ? 'Simple' : 'Detailed'}</button>
                                         </div>
                                      </div>
                                      <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
                                         <div className="scale-[0.85] md:scale-100 origin-center transition-transform">
                                           <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
                                         </div>
                                      </div>
                                    </div>

                                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-paper border-t border-brand-border flex z-40 pb-safe shadow-lg transition-colors duration-300">
                                      <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 text-sm font-bold transition-colors duration-300 ${activeTab === 'edit' ? 'text-brand-black bg-brand-bg' : 'text-brand-gray'}`}>Edit Details</button>
                                      <div className="w-[1px] bg-brand-border h-6 self-center transition-colors duration-300"></div>
                                      <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-sm font-bold transition-colors duration-300 ${activeTab === 'preview' ? 'text-brand-black bg-brand-bg' : 'text-brand-gray'}`}>Live Preview</button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }