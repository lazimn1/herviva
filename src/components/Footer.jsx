import Logo from './Logo';

const footerLinks = {
  Shop: [
    'New Arrivals',
    'Kurtas & Tunics',
    'Fusion Wear',
    'Occasion Edit',
    'Accessories',
  ],
  Help: [
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
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <img
              src="/logo.png"
              alt="herviva"
              className="h-14 sm:h-16 lg:h-20 w-auto object-contain brightness-200 "
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              Elegant fusion wear for the modern woman. Crafted with care,
              designed to last, made for every her.
            </p>
            <div className="mt-6 flex gap-3">
              {['instagram', 'facebook', 'pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 no-underline transition-colors hover:border-cream/50 hover:text-cream"
                >
                  <span className="text-[10px] uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs tracking-[0.2em] text-cream/50 uppercase">
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-cream/70 no-underline transition-colors hover:text-cream"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-8 sm:flex-row">
          <p className="text-xs text-cream/40">
            &copy; {new Date().getFullYear()} herviva. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-cream/40 no-underline hover:text-cream/70"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-cream/40 no-underline hover:text-cream/70"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
