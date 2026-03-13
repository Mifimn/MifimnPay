import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-brand-paper py-12 border-t border-brand-border/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <img src="/favicon.png" alt="M" className="w-6 h-6 rounded" />
            <span className="font-bold text-lg text-brand-paper">MifimnPay</span>
          </div>
          <p className="text-brand-gray text-sm">Professional receipts for Nigerian businesses.</p>
        </div>

        <div className="flex gap-6 text-sm text-brand-gray">
          <Link href="#" className="hover:text-brand-paper transition-colors duration-300">Privacy Policy</Link>
          <Link href="#" className="hover:text-brand-paper transition-colors duration-300">Terms of Use</Link>
          <Link href="https://x.com/mifimn" target="_blank" className="hover:text-brand-paper transition-colors duration-300">Twitter</Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2 text-brand-gray/50 text-xs">
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
