export type BikeClass =
  | 'underbone-commuter'
  | 'scooter'
  | 'naked'
  | 'big-bike';

export type PartCategory =
  | 'engine-ignition'
  | 'drivetrain-cvt'
  | 'brakes-suspension'
  | 'exhaust-intake'
  | 'tires-wheels'
  | 'electrical';

export type Currency = 'PHP' | 'USD';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  years: string;
  displacement: string;
  engineType: string;
  bikeClass: BikeClass;
  regionFocus: string;
  popularAliases: string[];
}

export interface PartSpec {
  label: string;
  value: string;
}

export interface MotoPart {
  id: string;
  sku: string;
  oemRef: string;
  name: string;
  brand: string;
  category: PartCategory;
  pricePhp: number;
  stockCount: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'OEM Order';
  image: string;
  summary: string;
  compatibleBikeIds: string[];
  fitmentNotes: string;
  specs: PartSpec[];
  isFeatured?: boolean;
}

export interface CartItem {
  part: MotoPart;
  quantity: number;
  selectedBikeName?: string;
}
