import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Mail, Calendar } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const filteredUsers = users.filter(u => 
    u.business_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-card mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={20} />
          <input 
            type="text"
            placeholder="Search by business name or ID..."
            className="w-full bg-slate-800 border-none rounded-lg py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-xs uppercase tracking-wider opacity-60">
            <tr>
              <th className="px-6 py-4">Business / User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredUsers.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold">{u.business_name || 'No Name Set'}</div>
                  <div className="text-xs opacity-50">{u.id.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4">
                  {u.is_admin ? (
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black">ADMIN</span>
                  ) : (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black">USER</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm opacity-70">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors">
                    <Mail size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default UserList;