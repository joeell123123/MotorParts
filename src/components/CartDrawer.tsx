import { FormEvent, useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { PartImage } from './PartImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQty: (partId: string, delta: number) => void;
  onRemoveItem: (partId: string) => void;
  onClearBag: () => void;
}

const FREE_SHIPPING_THRESHOLD_PHP = 3500;

export function CartDrawer({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'form' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'pickup'>('cod');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  if (!isOpen) return null;

  const subtotalPhp = items.reduce(
    (sum, item) => sum + item.part.pricePhp * item.quantity,
    0,
  );
  const shippingFeePhp =
    subtotalPhp === 0 || subtotalPhp >= FREE_SHIPPING_THRESHOLD_PHP ? 0 : 185;
  const totalPhp = subtotalPhp + shippingFeePhp;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_PHP - subtotalPhp,
  );

  const handleConfirmOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) return;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setConfirmedOrderId(`MS-${randomCode}`);
    setCheckoutStep('confirmed');
    onClearBag();
  };

  const handleResetAndClose = () => {
    setCheckoutStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-md h-full bg-white shadow-2xl border-l border-black/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#121316]" />
            <h2
              id="cart-drawer-title"
              className="font-display text-lg font-bold text-[#121316]"
            >
              Parts Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#4A4E54] hover:bg-black/5 hover:text-[#121316] transition-colors cursor-pointer"
            aria-label="Close parts bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed Receipt State */}
        {checkoutStep === 'confirmed' ? (
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EDF5F0] text-[#1F5E3B] inline-flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-[#121316]">
                Order #{confirmedOrderId} Confirmed
              </h3>
              <p className="text-sm text-[#5A5E66] mt-1.5 max-w-xs mx-auto">
                Preparing your parts dispatch for {customerName}. Verification SMS will be sent to{' '}
                <span className="font-mono text-[#121316]">{phone}</span>.
              </p>
            </div>
            <div className="w-full p-4 rounded-lg bg-[#F6F6F4] border border-black/8 text-left text-xs space-y-1.5 text-[#3F4349]">
              <div>
                <span className="text-[#5A5E66]">Method:</span>{' '}
                <span className="font-medium text-[#121316]">
                  {paymentMethod === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : 'Workshop Counter Pickup'}
                </span>
              </div>
              <div>
                <span className="text-[#5A5E66]">Destination:</span>{' '}
                <span className="font-medium text-[#121316]">{address}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full h-11 bg-[#121316] text-white text-sm font-semibold rounded-lg hover:bg-[#25282E] transition-colors cursor-pointer"
            >
              Continue Browsing Parts
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-10 h-10 text-[#9CA1A9] mb-3 stroke-[1.5]" />
            <p className="text-base font-semibold text-[#121316]">
              Your parts bag is empty
            </p>
            <p className="text-sm text-[#5A5E66] mt-1 max-w-[260px]">
              Select your motorcycle or search OEM and aftermarket parts to build your order.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-5 px-5 py-2.5 bg-[#121316] text-white text-sm font-semibold rounded-lg hover:bg-[#25282E] transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : checkoutStep === 'form' ? (
          <form
            onSubmit={handleConfirmOrder}
            className="flex-1 flex flex-col justify-between overflow-y-auto"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/8">
                <span className="text-sm font-semibold text-[#121316]">
                  Delivery & COD Verification
                </span>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('bag')}
                  className="text-xs font-medium text-[#C83219] hover:underline cursor-pointer"
                >
                  Edit Items
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-[#4A4E54]">
                    Full Name
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="mt-1 w-full h-11 px-3.5 rounded-lg border border-black/15 text-sm focus:outline-none focus:border-[#121316]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-[#4A4E54]">
                    Mobile Number (SMS Dispatch)
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917 555 0142"
                    className="mt-1 w-full h-11 px-3.5 rounded-lg border border-black/15 text-sm font-mono focus:outline-none focus:border-[#121316]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-[#4A4E54]">
                    Delivery Address / City / Province
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Barangay, City, Province / Postal Code"
                    className="mt-1 w-full p-3 rounded-lg border border-black/15 text-sm focus:outline-none focus:border-[#121316]"
                  />
                </label>

                <div>
                  <span className="text-xs font-medium text-[#4A4E54] block mb-1.5">
                    Payment & Fulfillment
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`h-11 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'bg-[#121316] text-white border-[#121316]'
                          : 'bg-white text-[#4A4E54] border-black/12'
                      }`}
                    >
                      Cash on Delivery (COD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pickup')}
                      className={`h-11 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        paymentMethod === 'pickup'
                          ? 'bg-[#121316] text-white border-[#121316]'
                          : 'bg-white text-[#4A4E54] border-black/12'
                      }`}
                    >
                      Workshop Pickup
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-black/8 bg-[#F6F6F4] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5A5E66]">Total Payable</span>
                <span className="font-mono text-lg font-bold text-[#121316] tabular-nums">
                  {formatPrice(totalPhp, currency)}
                </span>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-[#C83219] hover:bg-[#AE2913] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Parts Order
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 py-3 bg-[#F6F6F4] border-b border-black/8">
              <div className="flex items-center justify-between text-xs text-[#4A4E54] mb-1.5">
                {remainingForFreeShipping === 0 ? (
                  <span className="font-medium text-[#1F5E3B]">
                    Unlocked Free Nationwide PH Shipping
                  </span>
                ) : (
                  <span>
                    Add{' '}
                    <span className="font-mono font-semibold text-[#121316] tabular-nums">
                      {formatPrice(remainingForFreeShipping, currency)}
                    </span>{' '}
                    for free nationwide shipping
                  </span>
                )}
                <span className="font-mono tabular-nums text-[#5A5E66]">
                  {Math.min(
                    100,
                    Math.round((subtotalPhp / FREE_SHIPPING_THRESHOLD_PHP) * 100),
                  )}
                  %
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#121316] transition-all duration-200"
                  style={{
                    width: `${Math.min(
                      100,
                      (subtotalPhp / FREE_SHIPPING_THRESHOLD_PHP) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Itemized List */}
            <div className="flex-1 overflow-y-auto divide-y divide-black/8 px-6">
              {items.map((item) => (
                <div key={item.part.id} className="py-4 flex gap-4">
                  <div className="w-20 h-16 rounded-md overflow-hidden bg-[#F4F3F0] border border-black/8 shrink-0">
                    <PartImage
                      src={item.part.image}
                      alt={item.part.name}
                      title={item.part.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#5A5E66] truncate">
                      {item.part.brand} · {item.part.sku}
                    </div>
                    <div className="text-sm font-semibold text-[#121316] line-clamp-1 mt-0.5">
                      {item.part.name}
                    </div>
                    {item.selectedBikeName && (
                      <div className="text-xs text-[#1F5E3B] mt-0.5 truncate">
                        Bike: {item.selectedBikeName}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-black/12 rounded-md h-8">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.part.id, -1)}
                          className="w-7 h-full inline-flex items-center justify-center hover:bg-black/5 cursor-pointer"
                          aria-label="Decrease item quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.part.id, 1)}
                          className="w-7 h-full inline-flex items-center justify-center hover:bg-black/5 cursor-pointer"
                          aria-label="Increase item quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-[#121316] tabular-nums">
                          {formatPrice(
                            item.part.pricePhp * item.quantity,
                            currency,
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.part.id)}
                          className="p-1.5 text-[#6B7078] hover:text-[#C83219] transition-colors cursor-pointer"
                          aria-label={`Remove ${item.part.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Totals */}
            <div className="p-6 border-t border-black/8 bg-[#F6F6F4] space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-[#5A5E66]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-[#121316]">
                    {formatPrice(subtotalPhp, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5A5E66]">
                  <span>Shipping</span>
                  <span className="font-mono tabular-nums text-[#121316]">
                    {shippingFeePhp === 0
                      ? 'Free'
                      : formatPrice(shippingFeePhp, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-black/8 font-semibold text-[#121316]">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base tabular-nums">
                    {formatPrice(totalPhp, currency)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutStep('form')}
                className="w-full h-12 bg-[#C83219] hover:bg-[#AE2913] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Proceed to Order & COD Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
