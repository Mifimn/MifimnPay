import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Trash2, Plus, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  const fetchReceipts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (!error) setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  const filtered = receipts.filter(r => 
    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.receipt_number?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">History</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={18} /> New Receipt
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 mb-6">
          <input 
            type="text" placeholder="Search by customer or ID..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2.5 bg-zinc-50 border rounded-lg text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b text-xs text-zinc-500 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
                ) : filtered.length > 0 ? (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">{r.receipt_number}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-zinc-900">{r.customer_name}</td>
                      <td className="px-6 py-4 text-sm font-bold">{r.amount}</td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => handleDelete(r.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-20 text-center text-zinc-400 italic">No receipts saved yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
