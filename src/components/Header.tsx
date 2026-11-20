import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';

interface HeaderProps {
  bagCount: number;
  onOpenBag: () => void;
  onOpenGarage: () => void;
}

export function Header({ bagCount, onOpenBag, onOpenGarage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F6F4]/95 backdrop-blur-sm border-b border-black/8">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-xl font-bold tracking-tight text-[#121316] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C83219] rounded"
        >
          MotoSpec
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A4E54]"
        >
          <a
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('catalog');
            }}
            className="hover:text-[#121316] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#121316]"
          >
            Parts Catalog
          </a>
          <button
            type="button"
            onClick={onOpenGarage}
            className="hover:text-[#121316] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#121316] cursor-pointer"
          >
            By Motorcycle
          </button>
          <a
            href="#categories"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('categories');
            }}
            className="hover:text-[#121316] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#121316]"
          >
            Categories
          </a>
          <a
            href="#fitment-standard"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('fitment-standard');
            }}
            className="hover:text-[#121316] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#121316]"
          >
            Fitment Guide
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#121316] hover:bg-[#25282E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C83219]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Parts Bag</span>
            <span className="tabular-nums text-white/80">({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-black/12 text-[#121316] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/8 bg-[#F6F6F4] px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleNavClick('catalog')}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#121316] rounded-lg hover:bg-black/5"
          >
            Parts Catalog
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenGarage();
            }}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#121316] rounded-lg hover:bg-black/5"
          >
            By Motorcycle
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('categories')}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#121316] rounded-lg hover:bg-black/5"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('fitment-standard')}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#121316] rounded-lg hover:bg-black/5"
          >
            Fitment Guide
          </button>
        </div>
      )}
    </header>
  );
}
