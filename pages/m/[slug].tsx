import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Package, Globe, ShieldCheck } from 'lucide-react';

export default function PublicStore() {
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchStore();
  }, [slug]);

  const fetchStore = async () => {
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('slug', slug).single();
      if (prof) {
        setProfile(prof);
        const { data: prod } = await supabase
          .from('menu_items')
          .select('*')
          .eq('user_id', prof.id)
          .order('created_at', { ascending: true });
        setItems(prod || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-900" size={24} />
    </div>
  );

  if (!profile) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Storefront Not Found</p>
    </div>
  );

  const logoLetter = (profile.business_name?.charAt(0) || 'B').toUpperCase();
  const currencySymbol = profile.currency?.split(' ')[0] || '₦';

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 relative overflow-hidden selection:bg-zinc-900 selection:text-white">
      <Head>
        <title>{profile.business_name} | Official Price List</title>
      </Head>

      {/* Professional Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 flex flex-wrap gap-12 p-6 rotate-[-15deg] scale-150 justify-center items-center">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="w-10 h-10 flex items-center justify-center">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="" className="w-full h-full object-contain grayscale" />
            ) : (
              <span className="text-3xl font-black text-zinc-900">{logoLetter}</span>
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sleek Minimal Header */}
        <header className="pt-16 pb-12 px-6 border-b border-zinc-100 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-screen-md mx-auto text-center">
            {profile.logo_url && (
              <div className="inline-block p-1 bg-white rounded-full shadow-2xl mb-6 border border-zinc-100">
                <img 
                  src={profile.logo_url} 
                  className="w-16 h-16 rounded-full object-cover" 
                  alt="Business Logo" 
                />
              </div>
            )}
            <h1 className="text-xl font-black uppercase tracking-tighter text-zinc-900 sm:text-2xl">
              {profile.business_name}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="h-[1px] w-4 bg-zinc-200"></span>
              <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.25em] italic">
                {profile.tagline || 'Official Price List'}
              </p>
              <span className="h-[1px] w-4 bg-zinc-200"></span>
            </div>
          </div>
        </header>

        {/* Professional Product List */}
        <main className="flex-1 max-w-screen-md mx-auto w-full px-6 py-12">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-10">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-zinc-900" />
              <h2 className="font-black uppercase tracking-[0.2em] text-[10px]">Product Catalog</h2>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <ShieldCheck size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Live Rates</span>
            </div>
          </div>

          <div className="space-y-1">
            {items.length > 0 ? items.map((item) => (
              <div 
                key={item.id} 
                className="group flex justify-between items-center py-5 border-b border-zinc-50 hover:bg-zinc-50/50 transition-all duration-300 px-2 -mx-2 rounded-lg"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-zinc-800 group-hover:translate-x-1 transition-transform duration-300">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium mt-1 leading-relaxed line-clamp-1">
                    {item.description || 'Verified authentic listing.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-zinc-900 tabular-nums">
                    <span className="text-[10px] mr-0.5 text-zinc-400 font-bold">{currencySymbol}</span>
                    {Number(item.price).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center">
                <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.3em]">No Public Listings Available</p>
              </div>
            )}
          </div>
        </main>

        {/* Minimal Professional Footer */}
        <footer className="py-16 px-6 border-t border-zinc-50 bg-zinc-50/20 text-center">
          <div className="max-w-screen-md mx-auto">
            <div className="flex justify-center gap-8 mb-6 opacity-30">
               <Globe size={14} />
               <Package size={14} />
               <ShieldCheck size={14} />
            </div>
            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-zinc-400 leading-relaxed">
              Secure Digital Storefront &copy; {new Date().getFullYear()} <br/>
              <span className="text-zinc-300">Technology provided by MifimnPay</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}