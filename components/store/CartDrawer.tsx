'use client';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
  const { items, isOpen, setOpen, remove, updateQuantity, total } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm bg-dark-800 border-l border-white/10 shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Your Cart</h2>
            <p className="text-sm text-white/40">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-white/50 mb-4">Your cart is empty</p>
              <button onClick={() => setOpen(false)} className="btn-primary py-2 px-6 text-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 bg-dark-700 rounded-xl p-3 border border-white/5">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-white hover:text-brand-400 transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-brand-400 text-sm font-semibold mt-0.5">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-brand-500 transition-all text-sm"
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-brand-500 transition-all text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(item.productId)}
                      className="ml-auto text-white/30 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white font-semibold text-lg">{formatPrice(total())}</span>
            </div>
            <p className="text-xs text-white/30 text-center">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="btn-primary w-full text-center block"
            >
              Proceed to Checkout
            </Link>
            <button onClick={() => setOpen(false)} className="btn-secondary w-full text-sm text-center">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
