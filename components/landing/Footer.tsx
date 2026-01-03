import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <img src="/favicon.png" alt="M" className="w-6 h-6 rounded" />
            <span className="font-bold text-lg">MifimnPay</span>
          </div>
          <p className="text-zinc-400 text-sm">Professional receipts for Nigerian businesses.</p>
        </div>
        
        <div className="flex gap-6 text-sm text-zinc-400">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
          <Link href="https://x.com/mifimn" target="_blank" className="hover:text-white transition-colors">Twitter</Link>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2 text-zinc-500 text-xs">
          <p>© {new Date().getFullYear()} MifimnPay. All rights reserved.</p>
          <p>
            Designed by{' '}
            <Link 
              href="https://mifimn.vercel.app/" 
              target="_blank" 
              className="text-orange-500 font-bold hover:underline"
            >
              ~mifimn
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
