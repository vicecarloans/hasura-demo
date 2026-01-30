import { Request, Response } from "express";

// --- Hasura Action Payload ---

export interface HasuraActionPayload<T> {
  action: { name: string };
  input: { input: T };
  session_variables: Record<string, string>;
  request_query: string;
}

// --- Hasura Event Trigger Payload ---

export interface HasuraEventPayload<T> {
  id: string;
  created_at: string;
  trigger: { name: string };
  table: { schema: string; name: string };
  event: {
    session_variables: Record<string, string> | null;
    op: "INSERT" | "UPDATE" | "DELETE" | "MANUAL";
    data: {
      old: T | null;
      new: T | null;
    };
  };
}

// --- placeOrder types ---

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface PlaceOrderInput {
  user_id: string;
  items: OrderItemInput[];
  shipping_address?: string;
  notes?: string;
}

export interface PlaceOrderOutput {
  order_id: string;
  total_amount: number;
  status: string;
  items_count: number;
  message: string;
}

// --- DB row types ---

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ProductRow {
  id: string;
  name: string;
  price: string; // pg returns DECIMAL as string
  stock_quantity: number;
  is_active: boolean;
}

export interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  total_amount: string; // pg returns DECIMAL as string
  shipping_address: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// --- Express handler type alias ---

export type AsyncHandler = (req: Request, res: Response) => Promise<void>;
