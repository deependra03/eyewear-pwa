'use client';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  const { items, remove, updateQuantity, total, clear } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="font-display text-3xl font-bold text-white mt-6 mb-2">Your cart is empty</h1>
        <p className="text-white/40 mb-8">Add some eyewear to get started</p>
        <Link href="/products" className="btn-primary inline-block px-8">Browse Products</Link>
      </div>
    );
  }

  const cartTotal = total();
  const deliveryFee = cartTotal >= 999 ? 0 : 99;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Shopping Cart</h1>
        <button onClick={clear} className="text-white/30 hover:text-red-400 text-sm transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex gap-4">
              <Link href={`/products/${item.slug}`}>
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-dark-600 flex-shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="text-white font-medium hover:text-brand-400 transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-brand-400 font-semibold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white hover:border-brand-500 transition-all">−</button>
                  <span className="text-white w-6 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white hover:border-brand-500 transition-all">+</button>
                  <button onClick={() => remove(item.productId)} className="ml-auto text-white/30 hover:text-red-400 transition-colors text-sm">
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="text-white font-semibold text-lg">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-white">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-white/30 text-xs">Add {formatPrice(999 - cartTotal)} more for free delivery</p>
              )}
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="text-brand-400 text-lg">{formatPrice(cartTotal + deliveryFee)}</span>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-center block py-4">
              Proceed to Checkout
            </Link>
            <Link href="/products" className="btn-secondary w-full text-center block py-3 text-sm">
              Continue Shopping
            </Link>
          </div>

          <div className="card p-4 space-y-2 text-sm">
            {[['🔒', 'Secure Checkout'], ['🚚', 'Free delivery above ₹999'], ['↩️', '30-day easy returns'], ['💳', 'COD Available']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 text-white/50">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
