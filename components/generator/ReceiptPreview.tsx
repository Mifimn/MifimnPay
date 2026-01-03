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
    <div className="flex justify-center items-start font-sans antialiased p-2 bg-zinc-100/10">
      <div 
        ref={receiptRef}
        className="relative text-zinc-900 bg-white shadow-sm overflow-hidden"
        style={{ 
          width: '300px', // Set a fixed width for perfect capture
          minHeight: '400px',
        }}
      >
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: settings.color }}></div>

        <div className="w-full px-5 pt-5 pb-3 flex flex-col">
            {/* Header */}
            <div className="text-center mb-5 border-b border-zinc-100 pb-4">
                {settings.showLogo && (
                    <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl shadow-sm overflow-hidden"
                        style={{ backgroundColor: settings.color }}
                    >
                      {data.logoUrl ? <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : logoLetter}
                    </div>
                )}
                <h2 className="font-black text-[14px] uppercase tracking-tight leading-none mb-1">{data.businessName || 'Business Name'}</h2>
                <p className="text-[10px] text-zinc-500 font-bold">{data.businessPhone}</p>
            </div>

            {/* Billing Info */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col text-left max-w-[65%]">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Billed To</span>
                    <span className="text-[11px] font-black break-words leading-tight">{data.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Receipt No.</span>
                    <span className="text-[11px] font-black leading-none">{data.receiptNumber}</span>
                    <span className="text-[9px] text-zinc-400 font-bold mt-2 tracking-tighter">{data.date}</span>
                </div>
            </div>

            {/* Items Table - FIXED STRATEGY */}
            <div className="mb-6">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-100">
                            <th className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-left pb-1">Description</th>
                            <th className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-right pb-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item) => (
                            <tr key={item.id} className="border-b border-zinc-50/50">
                                <td className="py-3 pr-2 align-top">
                                    <div className="text-[11px] font-black text-zinc-800 break-words leading-tight mb-1">
                                        {item.name || 'Item Name'}
                                    </div>
                                    {settings.template === 'detailed' && (
                                        <div className="text-[9px] text-zinc-400 font-bold">
                                            {item.qty} x {data.currency}{Number(item.price || 0).toLocaleString()}
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 text-[11px] font-black text-zinc-900 text-right align-top whitespace-nowrap">
                                    {data.currency}{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Subtotal & Total */}
            <div className="mt-auto pt-2 border-t border-zinc-100">
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-[11px] font-bold text-zinc-500">{data.currency}{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 rounded-xl">
                    <span className="font-black text-[11px] uppercase tracking-widest text-zinc-600">Total Paid</span>
                    <span className="font-black text-[18px] tracking-tight leading-none" style={{ color: settings.color }}>
                        {data.currency}{total.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
                <p className="text-[8px] text-zinc-400 font-bold mb-1 uppercase tracking-tight">Thank you for your patronage</p>
                <p className="text-[7px] text-zinc-300 uppercase tracking-[0.2em] font-black">Generated by MifimnPay</p>
            </div>
        </div>

        {/* Improved Zigzag */}
        <div className="w-full shrink-0 h-2 mt-2">
            <svg width="300" height="8" viewBox="0 0 300 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block">
                <defs>
                    <pattern id="zigzag" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
                        <polygon points="0,0 6,6 12,0 12,8 0,8" fill="white" />
                    </pattern>
                </defs>
                <rect width="300" height="8" fill="url(#zigzag)" />
            </svg>
        </div>
      </div>
    </div>
  );
}
