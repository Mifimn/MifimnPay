import { ReceiptData, ReceiptSettings } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  data: ReceiptData;
  settings: ReceiptSettings;
  receiptRef?: React.RefObject<HTMLDivElement>;
  isAuthenticated?: boolean; // Pass this from the parent page
}

export default function ReceiptPreview({ data, settings, receiptRef, isAuthenticated }: Props) {
  const subtotal = data.items.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  const total = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);
  const logoLetter = (data.businessName?.charAt(0) || 'R').toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center items-start font-sans antialiased p-2 bg-transparent relative"
    >
      <div 
        ref={receiptRef}
        id="receipt-content"
        className="relative text-zinc-900 bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ width: '260px' }}
      >
        {/* Anti-Screenshot Overlay for Guest Users */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden select-none">
            <div className="grid grid-cols-2 gap-8 rotate-[-35deg] opacity-[0.15]">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="text-[20px] font-black text-black whitespace-nowrap tracking-tighter">
                        LOGIN TO REMOVE
                    </span>
                ))}
            </div>
          </div>
        )}

        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: settings.color }}></div>

        <div className="w-full px-4 pt-5 pb-2 relative flex flex-col bg-white">
            {/* Tiled Slanted Logo Watermark */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden" 
                 style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', transform: 'rotate(-15deg) scale(1.2)' }}>
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="flex justify-center items-center">
                        {data.logoUrl ? (
                            <img src={data.logoUrl} alt="" className="w-8 h-8 object-contain grayscale" />
                        ) : (
                            <span className="text-xl font-black" style={{ color: settings.color }}>{logoLetter}</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mb-4 relative z-10 border-b border-zinc-100 pb-3">
                {settings.showLogo && (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg shadow-sm overflow-hidden" style={{ backgroundColor: settings.color }}>
                      {data.logoUrl ? <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : logoLetter}
                    </div>
                )}
                <h2 className="font-black text-[12px] uppercase tracking-tighter leading-none mb-1">{data.businessName || 'Business Name'}</h2>
                <p className="text-[8px] text-zinc-400 font-bold leading-none">{data.businessPhone}</p>
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-[7px] font-bold text-zinc-300 uppercase tracking-widest mb-0.5">Billed To</span>
                    <span className="text-[9px] font-black break-words leading-tight">{data.customerName || 'Walk-in'}</span>
                </div>
                <div className="text-right flex flex-col items-end shrink-0 pl-2">
                    <span className="text-[7px] font-bold text-zinc-300 uppercase tracking-widest mb-0.5">Receipt</span>
                    <span className="text-[9px] font-black leading-none">#{data.receiptNumber}</span>
                    <span className="text-[7px] text-zinc-400 font-bold mt-1.5">{data.date}</span>
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <div className="flex justify-between mb-1 pb-1 border-b border-zinc-100 text-[7px] font-bold text-zinc-300 uppercase tracking-widest">
                    <span>Description</span>
                    <span>Total</span>
                </div>
                <div className="flex flex-col">
                    {data.items.map((item) => (
                        <div key={item.id} className="py-1.5 border-b border-zinc-50/50 last:border-0">
                            <div className="flex justify-between items-start gap-3">
                                <span className="text-[9.5px] font-black text-zinc-800 break-words leading-tight flex-1">{item.name || 'Item Name'}</span>
                                <span className="text-[9.5px] font-black text-zinc-900 shrink-0">{data.currency}{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}</span>
                            </div>
                            {settings.template === 'detailed' && (
                                <span className="text-[8px] text-zinc-400 font-bold tracking-tight">{item.qty} × {data.currency}{Number(item.price || 0).toLocaleString()}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-2 border-t border-zinc-100 relative z-10">
                <div className="flex justify-between items-center px-3 py-2 bg-zinc-50 rounded-xl">
                    <span className="font-black text-[8px] uppercase tracking-widest text-zinc-400">Total Paid</span>
                    <span className="font-black text-[14px] tracking-tight leading-none" style={{ color: settings.color }}>{data.currency}{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="text-center mt-4">
                <p className="text-[6px] text-zinc-300 uppercase tracking-[0.3em] font-black opacity-40">MifimnPay Digital</p>
            </div>
        </div>

        {/* Zigzag SVG Bottom Edge */}
        <div className="w-full shrink-0 h-2 leading-none">
            <svg width="260" height="8" viewBox="0 0 260 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block">
                <defs>
                    <pattern id="zigzag-pattern" x="0" y="0" width="10" height="8" patternUnits="userSpaceOnUse">
                        <polygon points="0,0 5,5 10,0 10,8 0,8" fill="white" />
                    </pattern>
                </defs>
                <rect width="260" height="8" fill="url(#zigzag-pattern)" />
            </svg>
        </div>
      </div>
    </motion.div>
  );
}
