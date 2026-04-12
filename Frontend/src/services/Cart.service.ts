import axios from "axios";

const BASE = "api/v1/cart";

// ── Types matching the backend populated response ─────────────────────────────

export interface CartVariant{
    _id:string;
    sku:string;
    stock:number;
    color?:string;
    storage?:string;
    ram?:string;
    price:number;
}

export interface CartProduct{
_id:string;
name:string;
category:string;
images:string[];
}

export interface CartItemDoc {
    _id:string;
    product:CartProduct
}