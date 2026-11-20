import { useMemo, useState } from 'react';
import { Bookmark, Check, Search, X } from 'lucide-react';
import { BIKE_CLASS_LABELS, MOTORCYCLES } from '../data/motorcycles';
import { BikeClass, Motorcycle } from '../types';

interface GarageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBikeId: string | null;
  onSelectBike: (bikeId: string | null) => void;
  savedGarageIds: string[];
  onToggleSaveBike: (bikeId: string) => void;
}

const CLASS_TABS: Array<{ id: BikeClass | 'all'; label: string }> = [
  { id: 'all', label: 'All Bikes' },
  { id: 'underbone-commuter', label: 'PH Underbone & Commuter' },
  { id: 'scooter', label: 'Scooters' },
  { id: 'naked', label: 'Naked Bikes' },
  { id: 'big-bike', label: 'Big Bikes & Sport' },
];

export function GarageSelectorModal({
  isOpen,
  onClose,
  selectedBikeId,
  onSelectBike,
  savedGarageIds,
  onToggleSaveBike,
}: GarageSelectorModalProps) {
  const [bikeSearch, setBikeSearch] = useState('');
  const [classFilter, setClassFilter] = useState<BikeClass | 'all'>('all');

  const filteredBikes = useMemo(() => {
    const q = bikeSearch.trim().toLowerCase();
    return MOTORCYCLES.filter((bike) => {
      if (classFilter !== 'all' && bike.bikeClass !== classFilter) return false;
      if (!q) return true;
      const haystack = [
        bike.brand,
        bike.model,
        bike.displacement,
        bike.engineType,
        bike.regionFocus,
        ...bike.popularAliases,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [bikeSearch, classFilter]);

  const savedBikes = useMemo(
    () => MOTORCYCLES.filter((b) => savedGarageIds.includes(b.id)),
    [savedGarageIds],
  );

  if (!isOpen) return null;

  const handleChoose = (bike: Motorcycle) => {
    onSelectBike(bike.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garage-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-[#FFFFFF] rounded-xl shadow-2xl border border-black/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/8 flex items-center justify-between gap-4">
          <div>
            <h2
              id="garage-modal-title"
              className="font-display text-xl font-bold text-[#121316]"
            >
              Select Motorcycle Fitment
            </h2>
            <p className="text-sm text-[#5A5E66] mt-0.5">
              Choose your motorcycle to verify exact part compatibility across PH commuters, scooters, naked bikes, and superbikes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#4A4E54] hover:bg-black/5 hover:text-[#121316] transition-colors cursor-pointer shrink-0"
            aria-label="Close motorcycle selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Class Filter Bar */}
        <div className="px-6 py-4 bg-[#F6F6F4] border-b border-black/8 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6B7078] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={bikeSearch}
                onChange={(e) => setBikeSearch(e.target.value)}
                placeholder="Search model: Raider FI, Bajaj 125, TMX, NMAX, MT-07, ZX-10R..."
                className="w-full h-11 pl-10 pr-4 bg-white border border-black/12 rounded-lg text-sm text-[#121316] placeholder:text-[#787D85] focus:outline-none focus:border-[#121316]"
                autoFocus
              />
            </div>
            {selectedBikeId && (
              <button
                type="button"
                onClick={() => {
                  onSelectBike(null);
                  onClose();
                }}
                className="px-4 h-11 text-sm font-medium text-[#121316] bg-white border border-black/14 rounded-lg hover:bg-black/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Show All Motorcycles
              </button>
            )}
          </div>

          {/* Class Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CLASS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setClassFilter(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  classFilter === tab.id
                    ? 'bg-[#121316] text-white'
                    : 'bg-white text-[#4A4E54] border border-black/10 hover:text-[#121316]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pinned My Garage Section */}
          {savedBikes.length > 0 && !bikeSearch && classFilter === 'all' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#5A5E66]">
                  Saved in Your Garage ({savedBikes.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedBikes.map((bike) => {
                  const isActive = selectedBikeId === bike.id;
                  return (
                    <div
                      key={bike.id}
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#C83219] bg-[#C83219]/4'
                          : 'border-black/10 bg-[#FAF9F7] hover:border-black/25'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleChoose(bike)}
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-[#121316] truncate">
                          {bike.brand} {bike.model}
                        </div>
                        <div className="text-xs text-[#5A5E66] mt-0.5 tabular-nums truncate">
                          {bike.displacement} · {bike.years}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleSaveBike(bike.id)}
                        className="p-2 rounded-md text-[#C83219] hover:bg-black/5 transition-colors cursor-pointer"
                        aria-label={`Remove ${bike.brand} ${bike.model} from garage`}
                        title="Remove from Saved Garage"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Bike List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-[#5A5E66]">
                Supported Models ({filteredBikes.length})
              </h3>
            </div>

            {filteredBikes.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-black/15 rounded-lg">
                <p className="text-sm font-medium text-[#121316]">
                  No motorcycle matched “{bikeSearch}”
                </p>
                <p className="text-xs text-[#5A5E66] mt-1">
                  Try searching Raider FI, Bajaj 125, Sniper, Click, NMAX, TMX, MT-07, or Z900.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredBikes.map((bike) => {
                  const isActive = selectedBikeId === bike.id;
                  const isSaved = savedGarageIds.includes(bike.id);
                  return (
                    <div
                      key={bike.id}
                      className={`flex items-start justify-between gap-3 p-4 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#C83219] bg-[#C83219]/4'
                          : 'border-black/10 bg-white hover:border-black/25'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleChoose(bike)}
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="text-xs text-[#5A5E66]">
                          {BIKE_CLASS_LABELS[bike.bikeClass]} · {bike.years}
                        </div>
                        <div className="text-base font-semibold text-[#121316] mt-0.5 flex items-center gap-2">
                          <span className="truncate">
                            {bike.brand} {bike.model}
                          </span>
                          {isActive && (
                            <Check className="w-4 h-4 text-[#C83219] shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-[#5A5E66] mt-1 tabular-nums truncate">
                          {bike.displacement} · {bike.engineType}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleSaveBike(bike.id)}
                        className={`w-9 h-9 inline-flex items-center justify-center rounded-lg border transition-colors shrink-0 cursor-pointer ${
                          isSaved
                            ? 'border-[#C83219]/30 text-[#C83219] bg-[#C83219]/6'
                            : 'border-black/10 text-[#6B7078] hover:text-[#121316] hover:bg-black/5'
                        }`}
                        aria-label={
                          isSaved
                            ? `Remove ${bike.brand} ${bike.model} from My Garage`
                            : `Save ${bike.brand} ${bike.model} to My Garage`
                        }
                        title={isSaved ? 'Saved in Garage' : 'Save to My Garage'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
