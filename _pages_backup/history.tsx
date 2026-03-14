import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Download, Plus, Calendar, Loader2, Eye, X, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import { toPng } from 'html-to-image';

export default function History() {
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
    const { data } = await supabase.from('receipts').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string) => {
    setIsUpdating(true);
    try {
      // Standardize to lowercase 'paid' for consistency
      const { error } = await supabase.from('receipts').update({ status: 'paid' }).eq('id', id);
      if (error) throw error;
      
      // Update local states instantly
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
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsDownloading(false); 
    }
  };

  const filteredReceipts = receipts.filter(r => 
    (r.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg font-sans transition-colors duration-300">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-brand-black transition-colors duration-300">Receipt History</h1>
          <Link href="/generate" className="bg-brand-black text-brand-paper px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"><Plus size={18} /> New Receipt</Link>
        </div>

        <div className="bg-brand-paper p-4 rounded-xl border border-brand-border mb-6 transition-colors duration-300">
          <input 
            type="text" 
            placeholder="Search customer or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full md:w-96 px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm outline-none focus:border-brand-black text-brand-black placeholder:text-brand-gray transition-colors duration-300" 
          />
        </div>

        <div className="bg-brand-paper border border-brand-border rounded-xl overflow-hidden shadow-sm overflow-x-auto transition-colors duration-300">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-brand-bg border-b border-brand-border text-xs uppercase text-brand-gray font-bold transition-colors duration-300">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border transition-colors duration-300">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-gray" /></td></tr>
              ) : filteredReceipts.length > 0 ? (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-bg group transition-colors duration-300">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-brand-gray transition-colors duration-300">{r.receipt_number}</td>
                    <td className="px-6 py-4 text-sm text-brand-gray transition-colors duration-300">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-brand-black transition-colors duration-300">{r.customer_name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 w-fit transition-colors duration-300 ${
                        r.status?.toLowerCase() === 'paid' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {r.status?.toLowerCase() === 'paid' ? <CheckCircle size={10}/> : <Clock size={10}/>} {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-black transition-colors duration-300">₦{Number(r.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedReceipt(r)} className="p-2 text-brand-gray hover:text-brand-black transition-all"><Eye size={16}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-20 text-center text-brand-gray italic transition-colors duration-300">No history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-brand-paper border border-brand-border rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 transition-colors duration-300">
                <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-bg rounded-t-2xl transition-colors duration-300">
                    <h3 className="font-bold text-brand-black transition-colors duration-300">Receipt Details</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-brand-border text-brand-gray hover:text-brand-black rounded-full transition-colors duration-300"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-brand-bg/50 flex flex-col items-center transition-colors duration-300">
                    <div className="scale-90 origin-top shadow-xl">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                status: selectedReceipt.status?.toLowerCase(),
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                currency: '₦',
                                businessName: profile?.business_name || 'Business Name',
                                businessPhone: profile?.business_phone || '',
                                logoUrl: profile?.logo_url,
                                tagline: profile?.tagline || '',
                                footerMessage: profile?.footer_message || '',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || [],
                                date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')
                            }} 
                            // Hardcoding light mode colors here so the actual receipt remains professional/printable
                            settings={{ color: '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>
                
                {/* RESPONSIVE MODAL FOOTER */}
                <div className="p-4 border-t border-brand-border bg-brand-paper rounded-b-2xl transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedReceipt.status?.toLowerCase() === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedReceipt.id)} 
                        disabled={isUpdating} 
                        className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-sm"
                      >
                        {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle size={18} />} 
                        <span className="whitespace-nowrap">Mark as Paid</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleDownloadAgain} 
                      disabled={isDownloading} 
                      className={`${selectedReceipt.status?.toLowerCase() === 'pending' ? 'flex-1' : 'flex-[2]'} py-3 bg-brand-black text-brand-paper font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all`}
                    >
                      {isDownloading ? <Loader2 className="animate-spin w-5 h-5 text-brand-paper" /> : <Download size={18} />} 
                      <span className="whitespace-nowrap">Download Image</span>
                    </button>

                    <button 
                      onClick={() => setSelectedReceipt(null)} 
                      className="flex-1 py-3 bg-brand-bg text-brand-black font-bold rounded-xl transition-colors hover:bg-brand-border border border-brand-border"
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
