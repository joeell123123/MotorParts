import { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/parts';
import { MOTORCYCLES } from '../data/motorcycles';
import { Currency, MotoPart } from '../types';
import { formatPrice } from '../utils/format';
import { PartImage } from './PartImage';

interface PartDetailModalProps {
  part: MotoPart | null;
  onClose: () => void;
  currency: Currency;
  selectedBikeId: string | null;
  onAddToBag: (part: MotoPart, quantity: number) => void;
  onSelectCompatibleBike: (bikeId: string) => void;
}

export function PartDetailModal({
  part,
  onClose,
  currency,
  selectedBikeId,
  onAddToBag,
  onSelectCompatibleBike,
}: PartDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!part) return null;

  const compatibleBikes = MOTORCYCLES.filter((bike) =>
    part.compatibleBikeIds.includes(bike.id),
  );
  const selectedBike = selectedBikeId
    ? MOTORCYCLES.find((b) => b.id === selectedBikeId) || null
    : null;
  const isDirectFit = selectedBike
    ? part.compatibleBikeIds.includes(selectedBike.id)
    : false;

  const handleAdd = () => {
    onAddToBag(part, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="part-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-black/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar */}
        <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between gap-4">
          <div className="text-xs text-[#5A5E66] font-mono tabular-nums truncate">
            {part.brand} · SKU {part.sku} · OEM {part.oemRef}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#4A4E54] hover:bg-black/5 hover:text-[#121316] transition-colors cursor-pointer shrink-0"
            aria-label="Close part specification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          {/* Left Sticky Studio Gallery */}
          <div className="md:col-span-5 bg-[#F4F3F0] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/8">
            <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-white border border-black/6">
              <PartImage
                src={part.image}
                alt={part.name}
                title={part.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5A5E66]">
                Technical Specifications
              </h3>
              <dl className="divide-y divide-black/8 border-y border-black/8">
                {part.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="py-2.5 flex items-baseline justify-between gap-4 text-xs"
                  >
                    <dt className="text-[#5A5E66]">{spec.label}</dt>
                    <dd className="font-mono font-medium text-[#121316] text-right tabular-nums">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right Contiguous Purchase & Fitment Module */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-medium text-[#5A5E66]">
                  {part.brand} · {CATEGORY_LABELS[part.category]}
                </div>
                <h2
                  id="part-detail-title"
                  className="font-display text-2xl font-bold text-[#121316] mt-1 leading-tight"
                >
                  {part.name}
                </h2>
              </div>

              {/* Price & Explicit Availability */}
              <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-black/8">
                <div className="font-mono text-2xl font-semibold text-[#121316] tabular-nums">
                  {formatPrice(part.pricePhp, currency)}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#1F5E3B]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {part.stockStatus} ({part.stockCount} units)
                  </span>
                </div>
              </div>

              {/* Active Bike Fitment Banner */}
              {selectedBike && (
                <div
                  className={`p-3.5 rounded-lg border text-sm flex items-start gap-2.5 ${
                    isDirectFit
                      ? 'bg-[#EDF5F0] border-[#256D45]/25 text-[#17492D]'
                      : 'bg-[#FAF3EC] border-[#B45309]/25 text-[#7C3608]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    {isDirectFit ? (
                      <span>
                        Verified direct fit for your selected{' '}
                        <strong>
                          {selectedBike.brand} {selectedBike.model}
                        </strong>
                        .
                      </span>
                    ) : (
                      <span>
                        Not listed for{' '}
                        <strong>
                          {selectedBike.brand} {selectedBike.model}
                        </strong>
                        . Review compatible models below before ordering.
                      </span>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-[#3F4349] leading-relaxed">
                {part.summary}
              </p>

              {/* Fitment Notes */}
              <div className="bg-[#F6F6F4] rounded-lg p-4 border border-black/8">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5A5E66] mb-1">
                  Workshop Fitment Note
                </div>
                <p className="text-xs text-[#2C3036] leading-relaxed">
                  {part.fitmentNotes}
                </p>
              </div>

              {/* Compatible Motorcycles List */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5A5E66] mb-2.5">
                  Confirmed Compatible Motorcycles ({compatibleBikes.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {compatibleBikes.map((bike) => {
                    const isSelected = selectedBikeId === bike.id;
                    return (
                      <button
                        key={bike.id}
                        type="button"
                        onClick={() => {
                          onSelectCompatibleBike(bike.id);
                          onClose();
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#121316] text-white border-[#121316]'
                            : 'bg-[#F6F6F4] text-[#2C3036] border-black/10 hover:border-black/30'
                        }`}
                      >
                        {bike.brand} {bike.model}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Purchase Action Row */}
            <div className="pt-5 border-t border-black/8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="inline-flex items-center justify-between sm:justify-start border border-black/15 rounded-lg h-12 px-2 bg-[#F6F6F4]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#121316] hover:bg-black/8 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(part.stockCount, q + 1))
                  }
                  className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#121316] hover:bg-black/8 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 h-12 px-6 inline-flex items-center justify-center gap-2 bg-[#C83219] hover:bg-[#AE2913] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Add to Parts Bag ·{' '}
                  <span className="tabular-nums">
                    {formatPrice(part.pricePhp * quantity, currency)}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
