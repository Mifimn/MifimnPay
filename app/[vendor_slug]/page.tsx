import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ShowroomMain from '@/src/storefront/components/Showroom/ShowroomMain';
import HeroSlideshow from '@/src/storefront/components/Showroom/HeroSlideshow';
import { ShieldAlert, Clock } from 'lucide-react';

interface Props {
  params: Promise<{ vendor_slug: string }>;
}

/**
 * 1. SERVER-SIDE METADATA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vendor_slug } = await params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, about_text, logo_url, is_verified')
    .eq('slug', vendor_slug)
    .single();

  if (!profile || !profile.is_verified) return { title: 'Showroom Offline | MifimnPay' };

  const title = `${profile.business_name} | Official Showroom`;
  const description = profile.about_text || `Browse products from ${profile.business_name} on MifimnPay.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mifimnpay.com.ng/${vendor_slug}`,
      siteName: profile.business_name,
      images: [{ url: profile.logo_url || '/favicon.png', width: 800, height: 800, alt: profile.business_name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [profile.logo_url || '/favicon.png'],
    },
  };
}

/**
 * 2. VENDOR SHOWROOM PAGE (Server Component)
 */
export default async function VendorShowroomPage({ params }: Props) {
  const { vendor_slug } = await params;

  // Fetch Vendor Profile Data including is_verified status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', vendor_slug)
    .single();

  // 1. Check if profile exists
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <h2 className="text-xl font-black uppercase italic dark:text-white tracking-tighter">Storefront Not Found</h2>
      </div>
    );
  }

  // 2. SERVER-SIDE IDENTITY GUARD: Check if vendor is verified
  if (!profile.is_verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#050505] p-6 text-center">
        <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-[28px] flex items-center justify-center mb-6 shadow-sm">
          <Clock size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-black uppercase italic dark:text-white tracking-tighter">
          Storefront <span className="text-brand-orange">Pending</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-sm uppercase tracking-widest leading-relaxed">
          The vendor <span className="text-slate-900 dark:text-white">@{vendor_slug}</span> is currently undergoing identity verification. 
          Please check back soon.
        </p>
        <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5 w-full max-w-xs">
           <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Securely Powered by MifimnPay</p>
        </div>
      </div>
    );
  }

  // 3. Fetch Vendor Products (Only if verified)
  const { data: products } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const mappedProducts = (products || []).map(p => ({
    ...p,
    img: p.image_url,
    price: p.price
  }));

  return (
    <>
      {profile.logo_url && <link rel="icon" href={profile.logo_url} />}

      <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500">

        {/* Promotion Marquee */}
        {profile.banner_type === 'text' && profile.promo_texts?.some((t: string) => t.length > 0) && (
          <div className="bg-slate-900 dark:bg-black text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-20">
            <div className="inline-block animate-marquee">
              {profile.promo_texts.map((text: string, i: number) => (
                text && <span key={i} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
              ))}
              {profile.promo_texts.map((text: string, i: number) => (
                text && <span key={`rep-${i}`} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
              ))}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-12 relative z-10">

          <HeroSlideshow 
            isLoading={false}
            bannerType={profile.banner_type}
            banners={profile.banner_urls}
            promoTexts={profile.promo_texts}
            themeColor={profile.theme_color}
          />

          <ShowroomMain 
            isSkeleton={false} 
            products={mappedProducts} 
            vendorName={profile.business_name}
            aboutText={profile.about_text}
            themeColor={profile.theme_color || '#f97316'}
          />

          {mappedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
              <div 
                className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 border shadow-lg"
                style={{ 
                  backgroundColor: `${profile.theme_color || '#f97316'}1a`,
                  borderColor: `${profile.theme_color || '#f97316'}33` 
                }}
              >
                 <span className="font-black text-3xl italic" style={{ color: profile.theme_color || '#f97316' }}>!</span>
              </div>
              <h2 className="text-3xl font-black uppercase italic dark:text-white tracking-tighter">
                Catalog <span style={{ color: profile.theme_color || '#f97316' }}>Empty</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-xs uppercase tracking-wide">
                No active products found for <span className="text-slate-900 dark:text-white">@{vendor_slug}</span>.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}