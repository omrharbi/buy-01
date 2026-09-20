export interface Product {
  id: string;
  name: string;
  description: string;
  /** Always greater than zero — the form and the service both refuse anything else. */
  price: number;
  quantity: number;
  /** The owner. Every write is checked against it, server-side and in the UI. */
  sellerId: string;
  sellerName: string;
  /** Resolved media URLs, in the order the seller arranged them. */
  imageUrls: string[];
  createdAt: string;
}

/** What the product form sends. The server fills id, sellerId, sellerName and createdAt. */
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrls: string[];
}
