function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const env = {
  get buyerApiUrl() { return stripTrailingSlash(required("BUYER_API_URL")); },
  get sellerApiUrl() { return stripTrailingSlash(required("SELLER_API_URL")); },
  get shippingApiUrl() { return stripTrailingSlash(required("SHIPPING_API_URL")); },
  get paymentsApiUrl() { return stripTrailingSlash(required("PAYMENTS_API_URL")); },
  get internalApiKey() { return required("INTERNAL_API_KEY"); },
  get sellerInternalApiKey() { return required("SELLER_INTERNAL_API_KEY"); },
};
