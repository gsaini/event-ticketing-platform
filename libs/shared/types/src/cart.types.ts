export interface CartItem {
  id: string;
  eventId: string;
  ticketTierId: string;
  quantity: number;
  price: number;
  eventTitle?: string;
  tierName?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface AddToCartDTO {
  eventId: string;
  ticketTierId: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}
