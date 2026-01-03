export interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  customerName: string;
  currency: string;
  items: ReceiptItem[];
  paymentMethod: 'Transfer' | 'Cash' | 'POS';
  status: 'Paid' | 'Pending';
  discount: number;
  shipping: number;
  businessName: string;
  businessPhone: string;
  tagline?: string;      // Added
  footerMessage?: string; // Added
  logoUrl?: string | null;
  note?: string;
}

export interface ReceiptSettings {
  color: string;
  showLogo: boolean;
  template: 'simple' | 'detailed';
}
