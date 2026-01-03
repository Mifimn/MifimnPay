import { ReceiptData, ReceiptSettings } from '../../types';

interface Props {
  data: ReceiptData;
  settings: ReceiptSettings;
  receiptRef?: React.RefObject<HTMLDivElement>;
}

export default function ReceiptPreview({ data, settings, receiptRef }: Props) {
  const subtotal = data.items.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  const total = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);
  const logoLetter = (data.businessName?.charAt(0) || 'R').toUpperCase();

  return (
    <div className="flex justify-center items-start font-sans antialiased p-2 bg-zinc-100/5">
      <div 
        ref={receiptRef}
        id="receipt-content"
        className="relative text-zinc-900 bg-white shadow-sm overflow-hidden flex flex-col"
        style={{ width: '280px', minHeight: '100px' }}
      >
        {/* Top Branding Bar */}
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: settings.color }}></div>

        <div className="w-full px-5 pt-5 pb-3 flex flex-col bg-white">
            {/* Header Section */}
            <div className="text-center mb-5 border-b border-zinc-100 pb-4">
                {settings.showLogo && (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg shadow-sm overflow-hidden" style={{ backgroundColor: settings.color }}>
                      {data.logoUrl ? <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : logoLetter}
                    </div>
                )}
                <h2 className="font-black text-[13px] uppercase tracking-tight leading-none mb-1">{data.businessName || 'Business Name'}</h2>
                <p className="text-[9px] text-zinc-500 font-bold tracking-tight">{data.businessPhone}</p>
            </div>

            {/* Billed To / Receipt No Section */}
            <div className="flex justify-between items-start mb-6 gap-2">
                <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Billed To</span>
                    <span className="text-[10px] font-black break-words leading-tight">{data.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">No.</span>
                    <span className="text-[10px] font-black leading-none">{data.receiptNumber}</span>
                    <span className="text-[8px] text-zinc-400 font-bold mt-2">{data.date}</span>
                </div>
            </div>

            {/* Items Section - Anti-Overlap Strategy */}
            <div className="mb-6">
                <div className="flex justify-between mb-2 pb-1 border-b border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Description</span>
                    <span className="shrink-0">Total</span>
                </div>

                <div className="flex flex-col space-y-3">
                    {data.items.map((item) => (
                        <div key={item.id} className="flex flex-col border-b border-zinc-50 pb-1.5">
                            <div className="flex justify-between items-start gap-4">
                                <span className="text-[10.5px] font-black text-zinc-800 break-words leading-snug flex-1">
                                    {item.name || 'Item Name'}
                                </span>
                                <span className="text-[10.5px] font-black text-zinc-900 shrink-0">
                                    {data.currency}{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}
                                </span>
                            </div>
                            {settings.template === 'detailed' && (
                                <span className="text-[8.5px] text-zinc-400 font-bold mt-0.5 italic">
                                    {item.qty} x {data.currency}{Number(item.price || 0).toLocaleString()}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals Section */}
            <div className="mt-auto pt-2 border-t border-zinc-100 space-y-2.5">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-[10px] font-bold text-zinc-500">{data.currency}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2.5 bg-zinc-50 rounded-xl">
                    <span className="font-black text-[9px] uppercase tracking-widest text-zinc-600">Total Paid</span>
                    <span className="font-black text-[15px] tracking-tight leading-none" style={{ color: settings.color }}>
                        {data.currency}{total.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Footer Section */}
            <div className="text-center mt-5">
                <p className="text-[7.5px] text-zinc-400 font-bold mb-1 uppercase tracking-tight italic">Thank you for your patronage</p>
                <p className="text-[6.5px] text-zinc-300 uppercase tracking-[0.15em] font-black opacity-50">Generated by MifimnPay</p>
            </div>
        </div>

        {/* Real SVG Zigzag edge */}
        <div className="w-full shrink-0 h-2 leading-none">
            <svg width="280" height="8" viewBox="0 0 280 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block overflow-hidden">
                <defs>
                    <pattern id="zigzag-pattern" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
                        <polygon points="0,0 6,6 12,0 12,8 0,8" fill="white" />
                    </pattern>
                </defs>
                <rect width="280" height="8" fill="url(#zigzag-pattern)" />
            </svg>
        </div>
      </div>
    </div>
  );
}
