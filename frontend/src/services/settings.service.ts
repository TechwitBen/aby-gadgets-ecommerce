import axios from "axios";

const settingApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

export interface DeliveryZone {
  city: string;
  fee:  number;
}

export interface SiteSettings {
  // Business
  storeName:     string;
  businessEmail: string;
  businessPhone: string;
  currency:      string;
  operatingCity: string;
  storeAddress:  string;
  // Bank
  bankName:      string;
  accountName:   string;
  accountNumber: string;
  // Payment methods
  bankTransfer:  boolean;
  payOnDelivery: boolean;
  onlinePayment: boolean;
  // Fulfillment
  enablePickup:          boolean;
  enableDelivery:        boolean;
  pickupAddress:         string;
  pickupHours:           string;
  pickupInstructions:    string;
  deliveryZones:         DeliveryZone[];
  // Legacy (kept for compat)
  deliveryFee:           string;
  enabledCities:         string;
}

export interface DeliveryConfig {
  zones:              DeliveryZone[];
  enablePickup:       boolean;
  enableDelivery:     boolean;
  pickupAddress:      string;
  pickupHours:        string;
  pickupInstructions: string;
}

export const settingsService = {
  get: async (): Promise<SiteSettings> => {
    const { data } = await settingApi.get("/settings");
    return data.settings;
  },

  update: async (updates: Partial<SiteSettings>): Promise<SiteSettings> => {
    const { data } = await settingApi.put("/settings", updates);
    return data.settings;
  },

  /** Lightweight call used by checkout — no admin auth needed */
  getDeliveryConfig: async (): Promise<DeliveryConfig> => {
    const { data } = await settingApi.get("/settings/delivery-zones");
    return {
      zones:              data.zones,
      enablePickup:       data.enablePickup,
      enableDelivery:     data.enableDelivery,
      pickupAddress:      data.pickupAddress,
      pickupHours:        data.pickupHours,
      pickupInstructions: data.pickupInstructions,
    };
  },
};