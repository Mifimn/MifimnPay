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
    <div className="flex justify-center items-start font-sans antialiased p-2">
      <div 
        ref={receiptRef}
        id="receipt-node"
        className="relative text-zinc-900 shadow-2xl overflow-hidden"
        style={{ 
          width: '280px', // Smaller width to make it look compact
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Strip */}
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: settings.color }}></div>

        <div className="bg-white w-full px-4 pt-4 pb-2 relative flex flex-col">
            {/* Background Watermark */}
            {settings.showLogo && !data.logoUrl && (
            <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.02] pointer-events-none">
                <span className="text-[120px] font-black -rotate-12" style={{ color: settings.color }}>
                   {logoLetter}
                </span>
            </div>
            )}

            {/* Business Branding */}
            <div className="text-center mb-4 relative z-10 border-b border-zinc-100 pb-3">
                {settings.showLogo && (
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg shadow-sm overflow-hidden"
                        style={{ backgroundColor: settings.color }}
                    >
                      {data.logoUrl ? (
                         <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                         logoLetter
                      )}
                    </div>
                )}
                <h2 className="font-black text-[13px] uppercase tracking-tight leading-none mb-1">{data.businessName || 'Business Name'}</h2>
                <p className="text-[9px] text-zinc-500 font-bold leading-none">{data.businessPhone}</p>
            </div>

            {/* Receipt Info */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col text-left max-w-[60%]">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Billed To</span>
                    <span className="text-[10px] font-black break-words leading-tight">{data.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">No.</span>
                    <span className="text-[10px] font-black leading-none">{data.receiptNumber}</span>
                    <span className="text-[8px] text-zinc-400 font-bold mt-1 tracking-tighter">{data.date}</span>
                </div>
            </div>

            {/* The Items List - NEW NON-OVERLAY STRATEGY */}
            <div className="mb-4 relative z-10">
                <div className="flex justify-between mb-1.5 pb-1 border-b border-zinc-100">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Description</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                </div>

                <div className="flex flex-col space-y-3"> 
                    {data.items.length === 0 ? (
                        <p className="text-[9px] text-center text-zinc-300 py-1 italic font-medium">No items</p>
                    ) : (
                        data.items.map((item) => (
                        <div key={item.id} className="flex flex-col border-b border-zinc-50 pb-1.5">
                            {/* Row 1: Item Name and Total Price */}
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-[10.5px] font-black text-zinc-800 break-words leading-snug flex-1">
                                    {item.name || 'Item Name'}
                                </span>
                                <span className="text-[10.5px] font-black text-zinc-900 shrink-0">
                                    {data.currency}{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}
                                </span>
                            </div>
                            {/* Row 2: Breakdown (Quantity x Price) */}
                            {settings.template === 'detailed' && (
                                <span className="text-[8.5px] text-zinc-400 font-bold mt-0.5">
                                    {item.qty} x {data.currency}{Number(item.price || 0).toLocaleString()}
                                </span>
                            )}
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* Totals Section */}
            <div className="pt-2 border-t border-zinc-100 relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-[10px] font-bold text-zinc-500">{data.currency}{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2 bg-zinc-50 rounded-lg">
                    <span className="font-black text-[10px] uppercase tracking-widest text-zinc-600">Total Paid</span>
                    <span className="font-black text-[15px] tracking-tight leading-none" style={{ color: settings.color }}>
                        {data.currency}{total.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Minimalist Footer */}
            <div className="text-center mt-4 pb-1 relative z-10">
                <p className="text-[7.5px] text-zinc-400 font-bold mb-1 uppercase tracking-tight">Thank you for your patronage</p>
                <p className="text-[6.5px] text-zinc-300 uppercase tracking-[0.15em] font-black opacity-60">Generated by MifimnPay</p>
            </div>
        </div>

        {/* Improved Zigzag Edge */}
        <div className="w-full shrink-0 overflow-hidden" style={{ height: '8px', lineHeight: '0' }}>
          <svg width="280" height="8" viewBox="0 0 280 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <defs>
              <pattern id="zigzag" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
                <polygon points="0,0 6,6 12,0 12,8 0,8" fill="white" />
              </pattern>
            </defs>
            <rect width="280" height="8" fill="url(#zigzag)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
