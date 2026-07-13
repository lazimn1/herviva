import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import Logo from './Logo';

const navLinks = [
  { label: 'Home', href: '/', isRoute: true },
  { label: 'Collections', href: '/collections', isRoute: true },
  { label: 'Shop', href: '/shop', isRoute: true },
  { label: 'Our Story', href: '/story', isRoute: true },
  { label: 'Lookbook', href: '/lookbook', isRoute: true },
  { label: 'Order', href: '/track-orders', isRoute: true },
];

export default function Navbar({ cartCount, onCartClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await dbService.getSiteContent();
      if (data?.announcementBar) {
        setAnnouncement(data.announcementBar);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-cream/92 shadow-[0_4px_30px_rgba(44,36,25,0.06)] backdrop-blur-xl'
            : 'bg-cream/40 backdrop-blur-md',
        ].join(' ')}
      >
        {announcement && (
          <div className="bg-terracotta px-4 py-2 text-center text-sm font-medium tracking-wide text-cream">
            {announcement}
          </div>
        )}
        <div className="border-b border-cream-dark/60">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a
            href="#"
            className="no-underline"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Logo />
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 no-underline transition-colors hover:bg-sage/10 hover:text-burgundy"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 no-underline transition-colors hover:bg-sage/10 hover:text-burgundy"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Shopping bag"
              onClick={onCartClick}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-cream-dark bg-transparent text-ink transition-colors hover:bg-sage/10"
            >
              <svg
                className="h-[18px] w-[18px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-medium text-cream">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center cursor-pointer rounded-full border-2 border-transparent transition-all hover:border-sage/30 focus:outline-none"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-cream font-medium">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-cream-dark bg-white shadow-xl py-2 overflow-hidden z-50">
                    <div className="px-5 py-3 border-b border-cream-dark/50 bg-cream/30 mb-2">
                      <p className="text-xs text-muted font-medium uppercase tracking-wider mb-0.5">Hello,</p>
                      <p className="text-sm font-semibold text-ink truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                    </div>
                    
                    <div className="px-2">
                      <Link 
                        to="/track-orders" 
                        className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-sage/10 hover:text-burgundy no-underline"
                        onClick={() => setProfileOpen(false)}
                      >
                        Your Orders
                      </Link>
                      
                      <Link 
                        to="/wishlist" 
                        className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-sage/10 hover:text-burgundy no-underline"
                        onClick={() => setProfileOpen(false)}
                      >
                        Wishlist
                      </Link>
                      
                      {user?.user_metadata?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-sage/10 hover:text-burgundy no-underline"
                          onClick={() => setProfileOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      
                      <div className="my-2 border-t border-cream-dark/50" />
                      
                      <button 
                        onClick={() => { signOut(); setProfileOpen(false); }} 
                        className="w-full text-left flex items-center rounded-xl px-3 py-2 text-sm font-medium text-burgundy transition-colors hover:bg-burgundy/10 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex">
                <Link
                  to="/auth"
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 no-underline transition-colors hover:bg-sage/10 hover:text-burgundy"
                >
                  Log In
                </Link>
              </div>
            )}

            <button
              type="button"
              aria-label="Toggle menu"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-cream-dark bg-transparent text-ink transition-colors hover:bg-sage/10 lg:hidden"
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              {drawerOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={[
          'fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className={[
          'fixed top-0 right-0 z-50 h-full w-[min(320px,85vw)] border-l border-cream-dark bg-cream shadow-2xl transition-transform duration-400 lg:hidden',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-cream-dark px-5">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-cream-dark"
            onClick={() => setDrawerOpen(false)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-3 border-b border-cream-dark px-5 py-4 bg-cream/40">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="h-12 w-12 rounded-full object-cover border border-cream-dark"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-lg font-medium text-cream">
                {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider mb-0.5">Welcome back</p>
              <p className="text-sm font-semibold text-ink truncate w-48">
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>
          </div>
        )}
        <nav className="p-5">
          <div className="space-y-1">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block border-b border-cream-dark py-3.5 text-[15px] font-medium text-ink no-underline"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="block border-b border-cream-dark py-3.5 text-[15px] font-medium text-ink no-underline"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </a>
              )
            ))}
            {user?.user_metadata?.role === 'admin' && (
              <Link
                to="/admin"
                className="block border-b border-cream-dark py-3.5 text-[15px] font-medium text-ink no-underline"
                onClick={() => setDrawerOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setDrawerOpen(false);
                }}
                className="block w-full text-left border-b border-cream-dark py-3.5 text-[15px] font-medium text-ink no-underline cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="block border-b border-cream-dark py-3.5 text-[15px] font-medium text-ink no-underline"
                onClick={() => setDrawerOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        </nav>
      </div>

      <div className="h-[68px]" />
    </>
  );
}
