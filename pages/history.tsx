import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Download, Share2, Trash2, Plus, 
  Loader2, Eye, X 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import html2canvas from 'html2canvas';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateImage = async () => {
    if (!downloadRef.current) return null;
    setIsGenerating(true);
    
    // Slight delay to ensure the DOM is fully rendered before capture
    await new Promise(r => setTimeout(r, 700));

    try {
      const canvas = await html2canvas(downloadRef.current, { 
        scale: 4, // High scale for clear small text
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return canvas.toDataURL("image/png", 1.0);
    } catch (err) { 
        console.error("Capture failed:", err);
        return null; 
    } finally { 
        setIsGenerating(false); 
    }
  };

  const handleDownload = async () => {
    const image = await generateImage();
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `receipt-${selectedReceipt.receipt_number}.png`;
    link.click();
  };

  const handleShare = async () => {
    const image = await generateImage();
    if (!image) return;
    try {
        const res = await fetch(image);
        const blob = await res.blob();
        const file = new File([blob], `receipt-${selectedReceipt.receipt_number}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Receipt #${selectedReceipt.receipt_number}`,
                text: `Hello, here is your receipt from ${profile?.business_name || 'MifimnPay'}.`,
            });
        } else {
            // Fallback for desktop browsers that don't support native sharing
            handleDownload();
            alert("Sharing not supported on this browser. Image has been downloaded.");
        }
    } catch (err) { 
        console.error("Sharing failed:", err); 
    }
  };

  const filteredReceipts = receipts.filter(r => 
    (r.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).filter(r => statusFilter === 'All' || r.status === statusFilter);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Receipt History</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
            <Plus size={18} /> New Receipt
          </Link>
        </div>

        {/* Filters/Search Row */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
            <input 
                type="text" 
                placeholder="Search customer or receipt number..." 
                className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] uppercase text-zinc-400 font-black tracking-widest">
                <tr>
                    <th className="px-6 py-4">Receipt No.</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
                ) : filteredReceipts.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-zinc-400 font-medium">No receipts found.</td></tr>
                ) : filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 group transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">#{r.receipt_number}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{r.customer_name}</td>
                    <td className="px-6 py-4 text-sm font-black text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedReceipt(r)} 
                            className="p-2.5 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-90"
                        >
                            <Eye size={18}/>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* VIEW & ACTION MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center bg-white">
                    <div className="flex flex-col">
                        <h3 className="font-black text-zinc-900 leading-none">Receipt Preview</h3>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Check details before sharing</span>
                    </div>
                    <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 flex flex-col items-center">
                    <div className="scale-[0.85] md:scale-100 origin-top shadow-lg">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                businessName: profile?.business_name || 'Business Name',
                                businessPhone: profile?.business_phone || '',
                                logoUrl: profile?.logo_url,
                                currency: profile?.currency || '₦',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || [],
                                // FIX: Ensures the correct date shows in the image
                                date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB', {
                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                })
                            }} 
                            settings={{ color: profile?.theme_color || '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>

                <div className="p-6 border-t bg-white flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handleShare} 
                        disabled={isGenerating} 
                        className="flex-1 py-4 bg-zinc-100 text-zinc-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <><Share2 size={19} /> Share Receipt</>}
                    </button>
                    <button 
                        onClick={handleDownload} 
                        disabled={isGenerating} 
                        className="flex-[1.5] py-4 bg-zinc-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <><Download size={19} /> Download PNG</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
