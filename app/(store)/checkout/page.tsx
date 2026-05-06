'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, total, clear } = useCartStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });

  useEffect(() => {
    if (!session) { router.push('/login?callbackUrl=/checkout'); return; }
    fetch('/api/addresses').then((r) => r.json()).then((d) => {
      setAddresses(d.addresses || []);
      const def = d.addresses?.find((a: any) => a.isDefault);
      if (def) setSelectedAddress(def.id);
      else if (d.addresses?.length > 0) setSelectedAddress(d.addresses[0].id);
    });
  }, [session]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAddress) });
    const data = await res.json();
    if (res.ok) {
      setAddresses((prev) => [...prev, data.address]);
      setSelectedAddress(data.address.id);
      setShowAddressForm(false);
      toast.success('Address added!');
    } else {
      toast.error(data.error || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Order failed'); return; }

      clear();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders`);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;
  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <span className="text-5xl">🛒</span>
      <h2 className="text-white text-2xl font-bold mt-4 mb-2">Your cart is empty</h2>
      <Link href="/products" className="btn-primary inline-block mt-4">Shop Now</Link>
    </div>
  );

  const cartTotal = total();
  const deliveryFee = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="text-white font-semibold text-lg mb-4">📍 Delivery Address</h2>
            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-orange-500" />
                    <div>
                      <p className="text-white font-medium">{addr.name} <span className="text-white/40 text-sm">· {addr.phone}</span></p>
                      <p className="text-white/60 text-sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-white/60 text-sm">{addr.city}, {addr.state} — {addr.pincode}</p>
                      {addr.isDefault && <span className="badge bg-brand-500/20 text-brand-400 mt-1">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary w-full text-sm py-2.5">
              + Add New Address
            </button>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Name</label><input required value={newAddress.name} onChange={(e) => setNewAddress((a) => ({ ...a, name: e.target.value }))} className="input-field" placeholder="Full Name" /></div>
                  <div><label className="label">Phone</label><input required value={newAddress.phone} onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))} className="input-field" placeholder="10-digit number" /></div>
                </div>
                <div><label className="label">Address Line 1</label><input required value={newAddress.line1} onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))} className="input-field" placeholder="House/Flat no, Street" /></div>
                <div><label className="label">Address Line 2 (optional)</label><input value={newAddress.line2} onChange={(e) => setNewAddress((a) => ({ ...a, line2: e.target.value }))} className="input-field" placeholder="Landmark, Area" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label">City</label><input required value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} className="input-field" /></div>
                  <div><label className="label">State</label><input required value={newAddress.state} onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))} className="input-field" /></div>
                  <div><label className="label">Pincode</label><input required maxLength={6} value={newAddress.pincode} onChange={(e) => setNewAddress((a) => ({ ...a, pincode: e.target.value }))} className="input-field" /></div>
                </div>
                <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                  <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress((a) => ({ ...a, isDefault: e.target.checked }))} className="accent-orange-500" />
                  Set as default address
                </label>
                <button type="submit" className="btn-primary w-full py-3">Save Address</button>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="text-white font-semibold text-lg mb-4">💳 Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20'}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-orange-500" />
                <div>
                  <p className="text-white font-medium">💵 Cash on Delivery</p>
                  <p className="text-white/40 text-sm">Pay when you receive your order</p>
                </div>
              </label>
              <label className="flex items-center gap-4 p-4 rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                <input type="radio" name="payment" disabled className="accent-orange-500" />
                <div>
                  <p className="text-white font-medium">🔒 Online Payment</p>
                  <p className="text-white/40 text-sm">Coming soon — UPI, Cards, Net Banking</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-white font-semibold text-lg mb-4">🧾 Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-dark-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm line-clamp-1">{item.name}</p>
                    <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-white text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee === 0 && <p className="text-green-400/60 text-xs">🎉 Free delivery applied!</p>}
              <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-brand-400 text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={loading || !selectedAddress} className="btn-primary w-full py-4 text-base">
            {loading ? 'Placing Order...' : `Place Order — ${formatPrice(grandTotal)}`}
          </button>

          <p className="text-white/20 text-xs text-center">
            By placing this order, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
