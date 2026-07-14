import { Link } from 'react-router-dom';

const footerLinks = {
  Shop: [
    'New Arrivals',
    'Kurtas & Tunics',
    'Fusion Wear',
    'Occasion Edit',
    'Accessories',
  ],
  Help: [
    'Track Orders',
    'Size Guide',
    'Shipping & Returns',
    'Care Instructions',
    'Contact Us',
    'FAQs',
  ],
  About: ['Our Story', 'Sustainability', 'Craftsmanship', 'Careers', 'Press'],
};

export default function Footer() {
  return (
    <footer className="bg-olive text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <img
              src="/logo.png"
              alt="herviva"
              className="h-8 w-auto object-contain brightness-200 sm:h-12 lg:h-16"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70 sm:text-base">
              Elegant fusion wear for the modern woman. Crafted with care,
              designed to last, made for every her.
            </p>
            {/* Social Buttons (Optimized Touch Targets) */}
            <div className="mt-8 flex gap-4">
              {['instagram', 'facebook', 'pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/70 no-underline transition-colors hover:border-cream/50 hover:text-cream sm:h-10 sm:w-10"
                >
                  <span className="text-[11px] uppercase tracking-wider">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links (2-column on mobile, 3-column on desktop) */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className={title === 'About' ? 'col-span-2 sm:col-span-1' : ''}>
                <h4 className="text-xs font-semibold tracking-[0.2em] text-cream/50 uppercase">
                  {title}
                </h4>
                <ul className="mt-4 space-y-1">
                  {links.map((link) => (
                    <li key={link}>
                      {link === 'Track Orders' ? (
                        <Link
                          to="/track-orders"
                          className="block py-1.5 text-sm text-cream/80 no-underline transition-colors hover:text-cream sm:py-1"
                        >
                          {link}
                        </Link>
                      ) : (
                        <a
                          href="#"
                          className="block py-1.5 text-sm text-cream/80 no-underline transition-colors hover:text-cream sm:py-1"
                        >
                          {link}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-8 sm:mt-16 sm:flex-row">
          <p className="text-xs text-cream/40">
            &copy; {new Date().getFullYear()} herviva. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="py-2 text-xs text-cream/40 no-underline hover:text-cream/70 sm:py-0"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="py-2 text-xs text-cream/40 no-underline hover:text-cream/70 sm:py-0"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
