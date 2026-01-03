import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, Filter, Download, Trash2, Plus, 
  Calendar, CheckCircle2, Clock, XCircle, Loader2, Eye, X 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import html2canvas from 'html2canvas';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal & Download State
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchReceipts();
  }, [user]);

  const fetchReceipts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this record?')) {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (!error) setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDownloadAgain = async () => {
    if (!downloadRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(downloadRef.current, { scale: 3, useCORS: true });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `receipt-${selectedReceipt.receipt_number}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      (receipt.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (receipt.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus = statusFilter === 'All' || receipt.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Receipt History</h1>
            <p className="text-zinc-500 text-sm mt-1">Track and manage your past business activity.</p>
          </div>
          <Link href="/generate" className="bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={18} /> New Receipt
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" placeholder="Search customer or ID..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border rounded-lg text-sm focus:border-zinc-900 outline-none"
            />
          </div>
          <select 
             value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
             className="bg-zinc-50 border text-zinc-700 text-sm rounded-lg p-2.5 outline-none w-full md:w-40"
          >
             <option value="All">All Status</option>
             <option value="Paid">Paid</option>
             <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b text-xs text-zinc-500 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
                ) : filteredReceipts.length > 0 ? (
                  filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded inline-block mt-4 ml-6">{r.receipt_number}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-zinc-900">{r.customer_name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</td>
                      <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setSelectedReceipt(r)} className="p-2 text-zinc-400 hover:text-zinc-900"><Eye size={16}/></button>
                           <button onClick={() => handleDelete(r.id)} className="p-2 text-zinc-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-20 text-center text-zinc-400 italic">No history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* VIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
                    <h3 className="font-bold">Receipt Details</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-zinc-200 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-100/50 flex flex-col items-center">
                    <div className="scale-90 origin-top">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                currency: '₦',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || []
                            }} 
                            settings={{ color: '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>
                <div className="p-4 bg-white border-t flex gap-3">
                    <button onClick={() => setSelectedReceipt(null)} className="flex-1 py-3 bg-zinc-100 font-bold rounded-xl">Close</button>
                    <button 
                        onClick={handleDownloadAgain} 
                        disabled={isDownloading}
                        className="flex-[2] py-3 bg-zinc-900 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        {isDownloading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download size={18} />} Download Image
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = { Paid: "bg-green-100 text-green-700 border-green-200", Pending: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  const icons = { Paid: <CheckCircle2 size={12} />, Pending: <Clock size={12} /> };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.Paid}`}>
      {icons[status as keyof typeof icons]} {status}
    </span>
  );
}
