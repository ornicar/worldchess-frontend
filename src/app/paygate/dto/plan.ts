export interface Plan {
  title?: string;
  featuresTitle?: string;
  featuresList?: string[];
  images?: string[];
  oldPrice?: number | null;
  price: number;
  id: string;
  type: string;
  btnCaption?: string;
  bgcolor?: string;
  description?: string;
}
