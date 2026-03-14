"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, Download, Loader2, Eye, X, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Updated path alias
import { useAuth } from '@/lib/AuthContext';
import ReceiptPreview from '@/components/generator/ReceiptPreview';
import { toPng } from 'html-to-image';

/**
 * app/(dashboard)/history/page.tsx
 * Merchant Receipt Log with Status Management
 */
export default function HistoryPage() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchReceipts();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
    if (data) setProfile(data);
  };

  const fetchReceipts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('receipts').update({ status: 'paid' }).eq('id', id);
      if (error) throw error;

      setReceipts(receipts.map(r => r.id === id ? { ...r, status: 'paid' } : r));
      setSelectedReceipt({ ...selectedReceipt, status: 'paid' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadAgain = async () => {
    if (!downloadRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(downloadRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `receipt-${selectedReceipt.receipt_number}.png`;
      link.click();
    } catch (err) { console.error(err); } finally { setIsDownloading(false); }
  };

  const filteredReceipts = receipts.filter(r => 
    (r.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">History</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Audit log of all issued receipts.</p>
        </div>
        <Link href="/generate" className="bg-brand-orange text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-glow-orange active:scale-95 transition-all">
          <Plus size={16} /> New Issuance
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] p-4 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm">
        <input 
          type="text" 
          placeholder="Filter by customer or receipt ID..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full md:w-96 px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold uppercase outline-none focus:border-brand-orange text-slate-900 dark:text-white placeholder:text-slate-400 transition-all" 
        />
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">ID</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Total</th>
              <th className="px-8 py-5 text-right">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-orange" /></td></tr>
            ) : filteredReceipts.length > 0 ? (
              filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors">
                  <td className="px-8 py-5 font-black text-[10px] text-slate-400 tracking-widest">#{r.receipt_number}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-5 font-black text-slate-900 dark:text-white uppercase text-xs italic">{r.customer_name}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit ${
                      r.status?.toLowerCase() === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-brand-orange/10 text-brand-orange'
                    }`}>
                      {r.status?.toLowerCase() === 'paid' ? <CheckCircle size={10}/> : <Clock size={10}/>} {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">₦{Number(r.total_amount).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setSelectedReceipt(r)} className="p-2.5 bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-brand-orange rounded-xl transition-all"><Eye size={16}/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No entries found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[40px] shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Receipt Details</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                    <div className="scale-90 origin-top shadow-2xl">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                status: selectedReceipt.status?.toLowerCase(),
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                currency: '₦',
                                businessName: profile?.business_name || 'Business',
                                businessPhone: profile?.business_phone || '',
                                logoUrl: profile?.logo_url,
                                tagline: profile?.tagline || '',
                                footerMessage: profile?.footer_message || '',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || [],
                                date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')
                            }} 
                            settings={{ color: '#18181b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-b-[40px]">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedReceipt.status?.toLowerCase() === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedReceipt.id)} 
                        disabled={isUpdating} 
                        className="flex-1 py-4 bg-green-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg"
                      >
                        {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle size={16} />} 
                        Mark Paid
                      </button>
                    )}

                    <button 
                      onClick={handleDownloadAgain} 
                      disabled={isDownloading} 
                      className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
                    >
                      {isDownloading ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} />} 
                      Download PNG
                    </button>

                    <button 
                      onClick={() => setSelectedReceipt(null)} 
                      className="flex-1 py-4 bg-white dark:bg-white/10 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all border border-slate-200 dark:border-transparent"
                    >
                      Close
                    </button>
                  </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}