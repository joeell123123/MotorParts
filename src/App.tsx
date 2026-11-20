import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bike,
  Check,
  CheckCircle2,
  ChevronDown,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { GarageSelectorModal } from './components/GarageSelectorModal';
import { Header } from './components/Header';
import { PartDetailModal } from './components/PartDetailModal';
import { PartImage } from './components/PartImage';
import { BIKE_CLASS_LABELS, MOTORCYCLES } from './data/motorcycles';
import { CATEGORY_LABELS, PARTS } from './data/parts';
import {
  BikeClass,
  CartItem,
  Currency,
  MotoPart,
  PartCategory,
  SortOption,
} from './types';
import { formatPrice } from './utils/format';

const HERO_WORKSHOP_IMAGE = '/src/assets/images/hero_moto_parts_1795187844234.jpg';

const GARAGE_STORAGE_KEY = 'motospec_saved_garage_v1';
const BAG_STORAGE_KEY = 'motospec_parts_bag_v1';

const QUICK_BIKE_IDS = [
  'suzuki-raider-r150-fi',
  'bajaj-ct-125',
  'yamaha-nmax-155',
  'kawasaki-z900',
  'kawasaki-zx10r',
];

const CATEGORY_TABS: Array<{ id: PartCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Parts' },
  { id: 'engine-ignition', label: 'Engine & Ignition' },
  { id: 'drivetrain-cvt', label: 'Drivetrain & CVT' },
  { id: 'brakes-suspension', label: 'Brakes & Suspension' },
  { id: 'exhaust-intake', label: 'Exhaust & Intake' },
  { id: 'tires-wheels', label: 'Tires & Wheels' },
  { id: 'electrical', label: 'Electrical & Fuel' },
];

const CLASS_FILTERS: Array<{ id: BikeClass | 'all'; label: string }> = [
  { id: 'all', label: 'All Bike Classes' },
  { id: 'underbone-commuter', label: 'PH Underbone & Commuter' },
  { id: 'scooter', label: 'Scooters' },
  { id: 'naked', label: 'Naked Bikes' },
  { id: 'big-bike', label: 'Big Bikes & Sport' },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<BikeClass | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currency, setCurrency] = useState<Currency>('PHP');

  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [activePart, setActivePart] = useState<MotoPart | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const [savedGarageIds, setSavedGarageIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(GARAGE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : ['suzuki-raider-r150-fi', 'bajaj-ct-125'];
    } catch {
      return ['suzuki-raider-r150-fi', 'bajaj-ct-125'];
    }
  });

  const [bagItems, setBagItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(BAG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(savedGarageIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedGarageIds]);

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [bagItems]);

  useEffect(() => {
    if (!addedToast) return;
    const timer = window.setTimeout(() => setAddedToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [addedToast]);

  const selectedBike = useMemo(
    () =>
      selectedBikeId
        ? MOTORCYCLES.find((b) => b.id === selectedBikeId) || null
        : null,
    [selectedBikeId],
  );

  const bikeMap = useMemo(() => {
    const map = new Map<string, (typeof MOTORCYCLES)[number]>();
    MOTORCYCLES.forEach((b) => map.set(b.id, b));
    return map;
  }, []);

  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matches = PARTS.filter((part) => {
      if (selectedCategory !== 'all' && part.category !== selectedCategory) {
        return false;
      }

      if (selectedBikeId && !part.compatibleBikeIds.includes(selectedBikeId)) {
        return false;
      }

      if (selectedClass !== 'all') {
        const hasClassMatch = part.compatibleBikeIds.some((bikeId) => {
          const bike = bikeMap.get(bikeId);
          return bike?.bikeClass === selectedClass;
        });
        if (!hasClassMatch) return false;
      }

      if (q) {
        const bikeNames = part.compatibleBikeIds
          .map((id) => {
            const b = bikeMap.get(id);
            return b
              ? `${b.brand} ${b.model} ${b.popularAliases.join(' ')}`
              : '';
          })
          .join(' ');

        const searchable = [
          part.name,
          part.brand,
          part.sku,
          part.oemRef,
          part.summary,
          part.fitmentNotes,
          CATEGORY_LABELS[part.category],
          bikeNames,
        ]
          .join(' ')
          .toLowerCase();

        const terms = q.split(/\s+/).filter(Boolean);
        if (!terms.every((term) => searchable.includes(term))) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...matches];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.pricePhp - b.pricePhp);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.pricePhp - a.pricePhp);
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
    }
    return sorted;
  }, [searchQuery, selectedCategory, selectedBikeId, selectedClass, sortBy, bikeMap]);

  const bagCount = useMemo(
    () => bagItems.reduce((sum, item) => sum + item.quantity, 0),
    [bagItems],
  );

  const handleToggleSaveBike = (bikeId: string) => {
    setSavedGarageIds((prev) =>
      prev.includes(bikeId)
        ? prev.filter((id) => id !== bikeId)
        : [...prev, bikeId],
    );
  };

  const handleAddToBag = (part: MotoPart, quantity = 1) => {
    const bikeLabel = selectedBike
      ? `${selectedBike.brand} ${selectedBike.model}`
      : undefined;

    setBagItems((prev) => {
      const existing = prev.find((item) => item.part.id === part.id);
      if (existing) {
        return prev.map((item) =>
          item.part.id === part.id
            ? {
                ...item,
                quantity: Math.min(part.stockCount, item.quantity + quantity),
                selectedBikeName: bikeLabel || item.selectedBikeName,
              }
            : item,
        );
      }
      return [...prev, { part, quantity, selectedBikeName: bikeLabel }];
    });

    setAddedToast(`Added ${part.name} to Parts Bag`);
  };

  const handleUpdateQty = (partId: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.part.id === partId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveBagItem = (partId: string) => {
    setBagItems((prev) => prev.filter((item) => item.part.id !== partId));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBikeId(null);
    setSelectedCategory('all');
    setSelectedClass('all');
    setSortBy('featured');
  };

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F6F6F4] text-[#121316]">
      <Header
        bagCount={bagCount}
        onOpenBag={() => setIsBagOpen(true)}
        onOpenGarage={() => setIsGarageOpen(true)}
      />

      {/* Section 1: Storefront Hero & Direct Fitment Search */}
      <section className="bg-[#121316] text-white border-b border-black/15">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Editorial Headline & Direct Part / Bike Search */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-7">
              <div className="space-y-4">
                <p className="text-xs font-medium tracking-wide text-[#A6ABB3]">
                  OEM & Aftermarket Motorcycle Hardware · Philippines & Global Fitment
                </p>
                <h1 className="font-display text-[clamp(2.25rem,3.8vw,3.35rem)] font-bold leading-[1.08] tracking-tight text-white [text-wrap:balance]">
                  Exact motorcycle parts, matched to what you actually ride.
                </h1>
                <p className="text-base text-[#C2C6CE] max-w-xl leading-relaxed">
                  Search spark plugs, injectors, sprockets, CVT kits, brakes, and suspension across Philippine commuters like Raider R150 FI and Bajaj CT 125 through naked bikes and liter superbikes.
                </p>
              </div>

              {/* Primary Search & Motorcycle Selector Box */}
              <div className="bg-[#1C1E22] border border-white/12 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#9399A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') scrollToCatalog();
                      }}
                      placeholder="Search part, OEM code, brand, or bike (e.g. Raider FI injector, Bajaj 125 stator, Brembo)..."
                      className="w-full h-12 pl-10 pr-9 bg-[#121316] border border-white/15 rounded-lg text-sm text-white placeholder:text-[#7E848E] focus:outline-none focus:border-[#C83219]"
                      aria-label="Search motorcycle parts"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9399A3] hover:text-white cursor-pointer"
                        aria-label="Clear search query"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={scrollToCatalog}
                    className="h-12 px-6 bg-[#C83219] hover:bg-[#DF3B20] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Search Parts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Bike Fitment Shortcuts */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#9399A3] mr-1">
                    Quick fitment:
                  </span>
                  {QUICK_BIKE_IDS.map((bikeId) => {
                    const bike = bikeMap.get(bikeId);
                    if (!bike) return null;
                    const isActive = selectedBikeId === bike.id;
                    return (
                      <button
                        key={bike.id}
                        type="button"
                        onClick={() => {
                          setSelectedBikeId(isActive ? null : bike.id);
                          scrollToCatalog();
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#121316]'
                            : 'bg-[#26292F] text-[#D7DBE0] hover:bg-[#31353D] hover:text-white'
                        }`}
                      >
                        {bike.brand} {bike.model}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsGarageOpen(true)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-white border border-white/20 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>All 24 Models</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Studio Workshop Photography */}
            <div className="lg:col-span-5">
              <div className="relative h-full min-h-[260px] lg:min-h-[380px] rounded-xl overflow-hidden border border-white/10 bg-[#1B1D21]">
                <PartImage
                  src={HERO_WORKSHOP_IMAGE}
                  alt="Precision motorcycle hardware including billet brake caliper, drive chain, iridium spark plugs, CNC sprocket, and gas shock absorber"
                  title="Precision Motorcycle Hardware"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/75">
                      Featured Workshop Spec
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Underbones · Scooters · Naked · Superbikes
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGarageOpen(true)}
                    className="px-3.5 py-2 bg-white/95 hover:bg-white text-[#121316] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Choose Bike
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Catalog Proof Strip */}
        <div className="border-t border-white/10 bg-[#17191D]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="font-mono text-lg font-semibold text-white tabular-nums">
                {MOTORCYCLES.length} Models
              </div>
              <div className="text-xs text-[#9CA1A9] mt-0.5">
                Raider FI, Bajaj 125, TMX, NMAX to ZX-10R
              </div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold text-white tabular-nums">
                {PARTS.length} Verified SKUs
              </div>
              <div className="text-xs text-[#9CA1A9] mt-0.5">
                OEM cross-referenced & performance parts
              </div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold text-white tabular-nums">
                100% Fitment Check
              </div>
              <div className="text-xs text-[#9CA1A9] mt-0.5">
                Pitch, bore, thread & bolt spacing listed
              </div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold text-white tabular-nums">
                Free PH Shipping
              </div>
              <div className="text-xs text-[#9CA1A9] mt-0.5">
                Orders ₱3,500+ · COD & Workshop Pickup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Fitment Workspace & 3-Column Parts Catalog */}
      <main id="catalog" className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Active Garage / Fitment Banner & Workspace Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-black/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#121316]">
                {selectedBike
                  ? `${selectedBike.brand} ${selectedBike.model} Parts`
                  : 'Parts Catalog'}
              </h2>
              <span className="font-mono text-sm text-[#5A5E66] tabular-nums">
                ({filteredParts.length} {filteredParts.length === 1 ? 'part' : 'parts'})
              </span>
            </div>
            <p className="text-sm text-[#5A5E66]">
              {selectedBike ? (
                <>
                  Showing verified compatible hardware for{' '}
                  <span className="font-medium text-[#121316]">
                    {selectedBike.displacement} {selectedBike.engineType} ({selectedBike.years})
                  </span>
                </>
              ) : (
                'Filter by motorcycle model, part system, or search OEM numbers directly.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Select / Change Motorcycle Button */}
            <button
              type="button"
              onClick={() => setIsGarageOpen(true)}
              className={`h-10 px-4 rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedBike
                  ? 'bg-[#121316] text-white hover:bg-[#25282E]'
                  : 'bg-white text-[#121316] border border-black/15 hover:border-black/35'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>{selectedBike ? 'Change Bike' : 'Select Your Motorcycle'}</span>
            </button>

            {selectedBike && (
              <button
                type="button"
                onClick={() => setSelectedBikeId(null)}
                className="h-10 px-3.5 rounded-lg text-xs font-medium text-[#4A4E54] bg-white border border-black/12 hover:text-[#121316] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Clear Bike Filter
              </button>
            )}

            {/* Bike Class Dropdown */}
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as BikeClass | 'all')}
                aria-label="Filter by motorcycle class"
                className="h-10 pl-3.5 pr-8 bg-white border border-black/15 rounded-lg text-xs font-medium text-[#121316] appearance-none cursor-pointer focus:outline-none focus:border-[#121316]"
              >
                {CLASS_FILTERS.map((cf) => (
                  <option key={cf.id} value={cf.id}>
                    {cf.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5A5E66] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort parts"
                className="h-10 pl-3.5 pr-8 bg-white border border-black/15 rounded-lg text-xs font-medium text-[#121316] appearance-none cursor-pointer focus:outline-none focus:border-[#121316]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5A5E66] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Currency Toggle (Workspace Toolbar Only) */}
            <div
              className="inline-flex items-center p-1 bg-[#EAEAE6] rounded-lg border border-black/8"
              role="group"
              aria-label="Currency selector"
            >
              <button
                type="button"
                onClick={() => setCurrency('PHP')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  currency === 'PHP'
                    ? 'bg-white text-[#121316] shadow-xs'
                    : 'text-[#5A5E66] hover:text-[#121316]'
                }`}
              >
                PHP ₱
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white text-[#121316] shadow-xs'
                    : 'text-[#5A5E66] hover:text-[#121316]'
                }`}
              >
                USD $
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          id="categories"
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Part Categories"
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#121316] text-white'
                    : 'bg-white text-[#4A4E54] border border-black/10 hover:text-[#121316] hover:border-black/25'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Parts Grid or Empty State */}
        {filteredParts.length === 0 ? (
          <div className="bg-white border border-black/10 rounded-xl p-12 text-center space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-[#787D85] mx-auto stroke-[1.5]" />
            <h3 className="font-display text-lg font-bold text-[#121316]">
              No matching parts found
            </h3>
            <p className="text-sm text-[#5A5E66] max-w-md mx-auto">
              Try clearing your category filter or searching another keyword like “spark plug”, “chain”, “clutch”, “CVT”, or “brake”.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-5 py-2.5 bg-[#121316] text-white text-sm font-semibold rounded-lg hover:bg-[#25282E] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredParts.map((part) => {
              const firstFitBike = bikeMap.get(part.compatibleBikeIds[0]);
              const additionalFitCount = Math.max(
                0,
                part.compatibleBikeIds.length - 1,
              );

              return (
                <article
                  key={part.id}
                  className="group bg-white rounded-xl border border-black/10 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Studio Product Image (~65% height prominence) */}
                  <button
                    type="button"
                    onClick={() => setActivePart(part)}
                    className="aspect-[4/3] w-full bg-[#F4F3F0] overflow-hidden text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C83219]"
                  >
                    <PartImage
                      src={part.image}
                      alt={part.name}
                      title={part.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      {/* Clean Unboxed Metadata */}
                      <div className="text-xs text-[#5A5E66] flex items-center justify-between gap-2">
                        <span className="uppercase tracking-wide font-medium truncate">
                          {part.brand}
                        </span>
                        <span className="font-mono tabular-nums text-[#6B7078] shrink-0">
                          {part.sku}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActivePart(part)}
                        className="text-left block w-full cursor-pointer"
                      >
                        <h3 className="font-display text-base font-semibold text-[#121316] leading-snug line-clamp-2 group-hover:text-[#C83219] transition-colors">
                          {part.name}
                        </h3>
                      </button>

                      {/* Fitment Text Line (Zero Pills) */}
                      <div className="text-xs text-[#4A4E54] pt-1 flex items-center gap-1.5">
                        {selectedBike ? (
                          <span className="text-[#1F5E3B] font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Direct fit · {selectedBike.brand} {selectedBike.model}
                            </span>
                          </span>
                        ) : firstFitBike ? (
                          <span className="truncate">
                            Fits {firstFitBike.brand} {firstFitBike.model}
                            {additionalFitCount > 0
                              ? ` + ${additionalFitCount} more`
                              : ''}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Price Baseline & Quick Add */}
                    <div className="pt-3.5 border-t border-black/8 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-base font-semibold text-[#121316] tabular-nums">
                          {formatPrice(part.pricePhp, currency)}
                        </div>
                        <div className="text-[11px] text-[#5A5E66]">
                          {part.stockStatus}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActivePart(part)}
                          className="h-9 px-3 text-xs font-medium text-[#3F4349] border border-black/12 rounded-lg hover:bg-black/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Specs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToBag(part, 1)}
                          className="h-9 px-3.5 bg-[#121316] hover:bg-[#C83219] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Section 3: Technical Fitment Guide & Class Coverage */}
      <section
        id="fitment-standard"
        className="border-t border-black/10 bg-white"
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121316] leading-tight [text-wrap:balance]">
              Built for Filipino daily riders and big-bike workshops alike.
            </h2>
            <p className="text-sm sm:text-base text-[#4A4E54] leading-relaxed">
              Most parts catalogs either stop at imported superbikes or omit technical dimensions. Every MotoSpec listing pairs exact OEM reference numbers with pitch, bore, thread, and mounting measurements across all four riding segments.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                {
                  bikeClass: 'underbone-commuter' as BikeClass,
                  examples:
                    'Suzuki Raider R150 FI & Carb, Bajaj CT 125, Boxer 150, Sniper 155, Honda TMX 125, Barako 175',
                },
                {
                  bikeClass: 'scooter' as BikeClass,
                  examples:
                    'Honda Click 125i / 160, Yamaha NMAX 155 V2, Aerox 155, Mio i 125, Honda ADV 160',
                },
                {
                  bikeClass: 'naked' as BikeClass,
                  examples:
                    'Kawasaki Z900, Yamaha MT-07, KTM 390 Duke, Bajaj Dominar 400 UG, CFMoto 450NK',
                },
                {
                  bikeClass: 'big-bike' as BikeClass,
                  examples:
                    'Kawasaki Ninja ZX-10R, Ninja 400, Yamaha YZF-R1, Honda CBR650R',
                },
              ] as const
            ).map((segment) => (
              <button
                key={segment.bikeClass}
                type="button"
                onClick={() => {
                  setSelectedBikeId(null);
                  setSelectedClass(segment.bikeClass);
                  scrollToCatalog();
                }}
                className="text-left p-5 rounded-xl border border-black/10 bg-[#F6F6F4] hover:border-[#121316] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-bold text-[#121316]">
                    {BIKE_CLASS_LABELS[segment.bikeClass]}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#5A5E66] group-hover:text-[#C83219] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-xs text-[#5A5E66] mt-2 leading-relaxed">
                  {segment.examples}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Minimal Footer */}
      <footer className="border-t border-black/10 bg-[#F6F6F4]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5A5E66]">
          <div>
            <span className="font-display font-bold text-sm text-[#121316] mr-2">
              MotoSpec
            </span>
            <span>
              Precision OEM & Aftermarket Motorcycle Parts Directory · Philippines & Global Fitment
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setIsGarageOpen(true)}
              className="hover:text-[#121316] transition-colors cursor-pointer"
            >
              Motorcycle Fitment List
            </button>
            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              className="hover:text-[#121316] transition-colors cursor-pointer"
            >
              Parts Bag ({bagCount})
            </button>
            <span>© {new Date().getFullYear()} MotoSpec</span>
          </div>
        </div>
      </footer>

      {/* Added to Bag Feedback Toast */}
      {addedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#121316] text-white px-4 py-3 rounded-lg shadow-xl border border-white/15 flex items-center gap-3 text-sm"
        >
          <Check className="w-4 h-4 text-[#4ADE80] shrink-0" />
          <span className="truncate max-w-[260px]">{addedToast}</span>
          <button
            type="button"
            onClick={() => {
              setAddedToast(null);
              setIsBagOpen(true);
            }}
            className="text-xs font-semibold text-[#F87171] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Bag
          </button>
        </div>
      )}

      {/* Interactive Modals & Drawers */}
      <GarageSelectorModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        selectedBikeId={selectedBikeId}
        onSelectBike={(id) => {
          setSelectedBikeId(id);
          if (id) setSelectedClass('all');
        }}
        savedGarageIds={savedGarageIds}
        onToggleSaveBike={handleToggleSaveBike}
      />

      <PartDetailModal
        key={activePart?.id || 'none'}
        part={activePart}
        onClose={() => setActivePart(null)}
        currency={currency}
        selectedBikeId={selectedBikeId}
        onAddToBag={handleAddToBag}
        onSelectCompatibleBike={(bikeId) => {
          setSelectedBikeId(bikeId);
          setSelectedClass('all');
        }}
      />

      <CartDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={bagItems}
        currency={currency}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveBagItem}
        onClearBag={() => setBagItems([])}
      />
    </div>
  );
}
