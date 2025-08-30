import { Request } from "express";
import mongoose from "mongoose";

export type AuthCookie = {
  accessToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
    tenant: string;
  };
}

export interface PriceConfiguration {
  priceType: "base" | "additional",
  availableOptions: {
    [key: string]: number;
  }
}

export interface ProductPricingCache {
  productId: string;
  priceConfiguration: PriceConfiguration;
}

export interface ProductMessage {
  id: string;
  priceConfiguration: PriceConfiguration;
}

export interface ToppingMessage {
  id: string;
  price: number;
}

export type Topping = {
  _id: string;
  name: string;
  price: number;
  image: string;
  isAvailable: boolean;
}
export interface ProductPriceConfiguration {
  [key: string]: {
    priceType: "base" | "additional";
    availableOptions: {
      [key: string]: number
    };
  };
}
export type ProductAttribute = {
  name: string;
  value: string | boolean;
}
export interface Product {
  _id: string;
  name: string;
  description: string;
  priceConfiguration: ProductPriceConfiguration;
  image: string;
}

export interface CartItem extends Pick<Product, '_id' | 'name' | 'image' | 'priceConfiguration'> {
  chosenConfiguration: {
    priceConfiguration: {
      [key: string]: string
    };
    selectedToppings: Topping[];
  };
  qty: number;
}

export interface ToppingPricingCache {
  _id?: mongoose.Types.ObjectId,
  toppingId: string,
  price: number,
  tenantId: string
}