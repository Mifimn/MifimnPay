import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Download, Share2, Plus, Trash2, ArrowLeft, Loader2, Palette, Settings, CreditCard, Lock, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ReceiptData, ReceiptItem, ReceiptSettings } from '../types';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function Generator() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [data, setData] = useState<ReceiptData>({
    receiptNumber: '001', // Default start
    date: '...',
    customerName: '',
    currency: '₦',
    items: [{ id: '1', name: '', qty: 1, price: '' as any }], 
    paymentMethod: 'Transfer',
    status: 'Paid',
    discount: '' as any,
    shipping: '' as any,
    businessName: 'My Business',
    businessPhone: '',
    note: ''
  });

  const [settings, setSettings] = useState<ReceiptSettings>({
    color: '#09090b', 
    showLogo: true,
    template: 'detailed'
  });

  useEffect(() => {
    setIsClient(true);
    if (user) {
      initializeGenerator();
    }
  }, [user]);

  const initializeGenerator = async () => {
    // 1. Get the next sequential number for this user
    const { data: nextNum, error: numError } = await supabase
      .rpc('get_next_receipt_number', { target_user_id: user?.id });

    // 2. Fetch Business Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, business_phone, currency, logo_url')
      .eq('id', user?.id)
      .single();

    setData(prev => ({
      ...prev,
      receiptNumber: nextNum || '001',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      businessName: profile?.business_name || 'My Business',
      businessPhone: profile?.business_phone || '',
      currency: profile?.currency || '₦',
      logoUrl: profile?.logo_url
    }));
  };

  const saveToHistory = async () => {
    if (!user) return;

    const subtotal = data.items.reduce((acc, i) => acc + ((Number(i.price)||0) * (Number(i.qty)||0)), 0);
    const totalAmount = (subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0)).toLocaleString();

    // Mapping fields to match the history table names exactly
    const { error } = await supabase.from('receipts').insert([{
      user_id: user.id,
      customer_name: data.customerName || 'Guest Customer',
      amount: `${data.currency}${totalAmount}`,
      items: data.items,
      status: data.status,
      receipt_number: data.receiptNumber,
      created_at: new Date()
    }]);

    if (error) {
      console.error("Database Save Error:", error.message);
      alert("Note: Receipt downloaded but failed to save to history.");
    }
  };

  const generateImage = async () => {
    if (!receiptRef.current) return null;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { 
        scale: 3, 
        useCORS: true,
        onclone: (clonedDoc) => {
            const watermark = clonedDoc.getElementById('preview-watermark');
            if (watermark) watermark.style.display = 'none';
        }
      });
      return canvas.toDataURL("image/png", 1.0);
    } catch (err) {
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const image = await generateImage();
    if (!image) return;
    
    // SAVE TO DATABASE BEFORE DOWNLOAD
    await saveToHistory(); 
    
    const link = document.createElement('a');
    link.href = image;
    link.download = `receipt-${data.receiptNumber}.png`;
    link.click();
    router.push('/history'); // Send user to history to see their saved item
  };

  const handleWhatsApp = async () => {
    const image = await generateImage();
    if (!image) return;
    await saveToHistory();
    window.open(`https://wa.me/?text=${encodeURIComponent('Please find your receipt attached.')}`, '_blank');
  };

  // ... [Keep existing handleItemChange, addItem, removeItem, and initiateAction functions] ...

  if (!isClient || authLoading) return null;

  return (
    <div className="h-[100dvh] bg-zinc-100 flex flex-col overflow-hidden">
      <Head><title>Create Receipt | MifimnPay</title></Head>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold mb-2">Save & Download?</h3>
            <p className="text-sm text-zinc-500 mb-6">This receipt will be saved to your history. Please ensure the amounts are correct.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 rounded-xl font-bold text-sm bg-zinc-100">Cancel</button>
              <button onClick={confirmAndExecute} className="py-3 rounded-xl font-bold text-sm bg-zinc-900 text-white">Download</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex justify-between items-center z-30">
        <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-500"><ArrowLeft size={22} /></Link>
            <h1 className="font-bold text-lg">New Receipt</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => initiateAction(handleWhatsApp)} className="bg-[#25D366] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                {!user ? <Lock size={16} /> : <Share2 size={18} />} Share
            </button>
            <button onClick={() => initiateAction(handleDownload)} className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                {!user ? <Lock size={16} /> : <Download size={18} />} Download
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`flex-1 h-full overflow-y-auto p-4 md:p-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
           <div className="max-w-2xl mx-auto space-y-6 pb-20">
              <section className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
                <input value={data.customerName} onChange={(e) => setData({...data, customerName: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none focus:border-zinc-900" placeholder="Customer Name" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-zinc-400 ml-1 mb-1">RECEIPT NO.</label>
                    <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-zinc-100 rounded-xl text-zinc-900 font-bold" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-zinc-400 ml-1 mb-1">DATE</label>
                    <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none" />
                  </div>
                </div>
              </section>

              <section className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-bold text-xs text-zinc-500 uppercase">Items</h3><button onClick={addItem} className="text-xs font-bold text-zinc-900">+ Add Item</button></div>
                {data.items.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <input placeholder="Item" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="flex-[3] p-3 border-2 border-zinc-100 rounded-xl" />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="flex-1 p-3 border-2 border-zinc-100 rounded-xl text-center" />
                    <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="flex-[2] p-3 border-2 border-zinc-100 rounded-xl" />
                    <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                ))}
              </section>
           </div>
        </div>

        <div className={`flex-1 h-full bg-zinc-200/50 flex flex-col relative ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
             {!user && (
               <div id="preview-watermark" className="absolute inset-0 pointer-events-none z-50 flex flex-col items-center justify-center overflow-hidden opacity-10">
                  {[...Array(12)].map((_, i) => (
                    <span key={i} className="text-4xl font-black rotate-[-15deg] whitespace-nowrap">PREVIEW ONLY</span>
                  ))}
               </div>
             )}
             <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
