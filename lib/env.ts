function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

export const env = {
  get buyerApiUrl() { return required("BUYER_API_URL"); },
  get sellerApiUrl() { return required("SELLER_API_URL"); },
  get shippingApiUrl() { return required("SHIPPING_API_URL"); },
  get paymentsApiUrl() { return required("PAYMENTS_API_URL"); },
  get internalApiKey() { return required("INTERNAL_API_KEY"); },
  get sellerInternalApiKey() { return required("SELLER_INTERNAL_API_KEY"); },
};
