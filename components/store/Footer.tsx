import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-brand-500 text-2xl">👓</span>
              <span className="font-display text-xl font-bold text-white">EyeWear</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Premium eyewear with 3D try-on technology. Find your perfect pair with confidence.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2">
              {['Eyeglasses', 'Sunglasses', 'Contact Lenses', 'Computer Glasses'].map((item) => (
                <li key={item}>
                  <Link href={`/products?category=${item.toLowerCase().replace(' ', '-')}`} className="text-white/40 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
            <ul className="space-y-2">
              {[['My Orders', '/orders'], ['My Wishlist', '/wishlist'], ['My Account', '/account'], ['Sign In', '/login']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li>Free Delivery on orders over ₹999</li>
              <li>Easy 30-day returns</li>
              <li>Cash on Delivery available</li>
              <li className="text-brand-400">support@eyewear.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} EyeWear Store. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/30 text-xs">
            <span>🔒 Secure Payments</span>
            <span>🚚 Pan-India Delivery</span>
            <span>↩️ Easy Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
