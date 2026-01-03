import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Save, ArrowLeft, Loader2, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [data, setData] = useState<ReceiptData>({
    receiptNumber: '001',
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
    const initializeData = async () => {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (user) {
        try {
          const { data: nextNum } = await supabase.rpc('get_next_receipt_number', { target_user_id: user.id });
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          setData(prev => ({
            ...prev,
            receiptNumber: nextNum || '001',
            date: today,
            businessName: profile?.business_name || 'My Business',
            businessPhone: profile?.business_phone || '',
            currency: profile?.currency || '₦',
            logoUrl: profile?.logo_url
          }));
        } catch (err) { console.error(err); }
      } else {
        setData(prev => ({ ...prev, date: today }));
      }
    };
    if (!authLoading) initializeData();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) {
        if (confirm("Sign up to save receipts?")) router.push('/login');
        return;
    }
    setIsSaving(true);
    try {
        const subtotal = data.items.reduce((acc, i) => acc + ((Number(i.price)||0) * (Number(i.qty)||0)), 0);
        const numericTotal = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);

        const { error } = await supabase.from('receipts').insert([{
            user_id: user.id,
            receipt_number: data.receiptNumber,
            customer_name: data.customerName || 'Walk-in Customer',
            total_amount: numericTotal,
            shipping_fee: Number(data.shipping) || 0,
            discount_amount: Number(data.discount) || 0,
            status: data.status,
            payment_method: data.paymentMethod,
            items: data.items,
            created_at: new Date().toISOString()
        }]);

        if (error) throw error;
        setShowConfirm(false);
        setShowSuccess(true);
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleItemChange = (id: string, field: keyof ReceiptItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value === '' ? '' : value } : item)
    }));
  };

  if (!isClient || authLoading) return null;

  return (
    <div className="h-[100dvh] bg-zinc-100 flex flex-col overflow-hidden">
      <Head><title>New Receipt | MifimnPay</title></Head>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold mb-2">Check details carefully</h3>
            <p className="text-sm text-zinc-500 mb-6">Ready to save this receipt?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 px-4 rounded-xl font-bold text-sm bg-zinc-100">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="py-3 px-4 rounded-xl font-bold text-sm bg-zinc-900 text-white flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Saved Successfully!</h3>
            <p className="text-sm text-zinc-500 mb-6 font-medium leading-relaxed">Proceed to your History page to download or share this receipt with your customer.</p>
            <button onClick={() => router.push('/history')} className="w-full py-4 rounded-2xl font-black text-base bg-zinc-900 text-white shadow-xl active:scale-95 transition-all">OK, Go to History</button>
          </div>
        </div>
      )}

      <header className="bg-white border-b px-4 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-zinc-500 p-2 hover:bg-zinc-100 rounded-full transition-colors"><ArrowLeft size={22} /></Link>
            <h1 className="font-bold text-lg">New Receipt</h1>
        </div>
        <button onClick={() => setShowConfirm(true)} className="bg-zinc-900 text-white px-6 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 leading-none">
            <Save size={18} /> Save
        </button>
      </header>

      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <div className={`flex-1 h-full overflow-y-auto bg-zinc-50 p-4 md:p-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-2xl mx-auto space-y-6 pb-24">
            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2"><Settings size={16} /> Customer Details</h3>
              <input value={data.customerName} onChange={(e) => setData({...data, customerName: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-50 rounded-xl focus:border-zinc-900 outline-none font-bold bg-zinc-50 focus:bg-white transition-all text-sm" placeholder="Customer Name" />
              <div className="grid grid-cols-2 gap-4">
                  <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-zinc-100 border-2 border-transparent rounded-xl text-zinc-500 font-bold text-sm" />
                  <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-50 rounded-xl outline-none focus:border-zinc-900 bg-zinc-50 focus:bg-white text-sm font-bold" />
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-widest">Items Purchased</h3>
                <button onClick={() => setData(prev => ({...prev, items: [...prev.items, { id: Date.now().toString(), name: '', qty: 1, price: '' as any }]}))} className="text-xs font-black text-zinc-900 hover:bg-zinc-100 px-3 py-1 rounded-full">+ Add Item</button>
              </div>
              <div className="space-y-4">
                {data.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="flex-1 h-12 px-4 border-2 border-zinc-50 rounded-xl focus:border-zinc-900 bg-zinc-50 font-bold text-sm" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-20 h-12 px-2 border-2 border-zinc-50 rounded-xl focus:border-zinc-900 text-center font-bold text-sm bg-zinc-50" />
                      <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="w-32 h-12 px-4 border-2 border-zinc-50 rounded-xl focus:border-zinc-900 font-bold text-sm bg-zinc-50" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className={`flex-1 h-full bg-zinc-200/50 flex flex-col relative ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-zinc-100/50 relative">
             <div className="scale-[0.85] md:scale-100 origin-center">
               <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
             </div>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-40 pb-safe">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest ${activeTab === 'edit' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'}`}>Edit</button>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest ${activeTab === 'preview' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'}`}>Preview</button>
        </div>
      </div>
    </div>
  );
}
