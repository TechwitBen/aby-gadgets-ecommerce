import mongoose from "mongoose";
const { Schema } = mongoose;

// ── Default Lagos delivery zones (admin sets fees) ────────────────────────────
const DEFAULT_LAGOS_ZONES = [
  { city: "Ikeja",           fee: 0 },
  { city: "Allen Avenue",    fee: 0 },
  { city: "GRA Ikeja",       fee: 0 },
  { city: "Alausa",          fee: 0 },
  { city: "Ogba",            fee: 0 },
  { city: "Yaba",            fee: 0 },
  { city: "Maryland",        fee: 0 },
  { city: "Anthony",         fee: 0 },
  { city: "Palmgrove",       fee: 0 },
  { city: "Gbagada",         fee: 0 },
  { city: "Surulere",        fee: 0 },
  { city: "Ojuelegba",       fee: 0 },
  { city: "Lawanson",        fee: 0 },
  { city: "Kilo",            fee: 0 },
  { city: "Mushin",          fee: 0 },
  { city: "Oshodi",          fee: 0 },
  { city: "Mafoluku",        fee: 0 },
  { city: "Isolo",           fee: 0 },
  { city: "Ejigbo",          fee: 0 },
  { city: "Ikotun",          fee: 0 },
  { city: "Egbeda",          fee: 0 },
  { city: "Idimu",           fee: 0 },
  { city: "Iyana-Ipaja",     fee: 0 },
  { city: "Ipaja",           fee: 0 },
  { city: "Dopemu",          fee: 0 },
  { city: "Agege",           fee: 0 },
  { city: "Abule-Egba",      fee: 0 },
  { city: "Meiran",          fee: 0 },
  { city: "Ifako-Ijaye",     fee: 0 },
  { city: "Alimosho",        fee: 0 },
  { city: "Ojodu Berger",    fee: 0 },
  { city: "Magodo",          fee: 0 },
  { city: "Shangisha",       fee: 0 },
  { city: "Ketu",            fee: 0 },
  { city: "Ojota",           fee: 0 },
  { city: "Oworonshoki",     fee: 0 },
  { city: "Bariga",          fee: 0 },
  { city: "Somolu",          fee: 0 },
  { city: "Alapere",         fee: 0 },
  { city: "Kosofe",          fee: 0 },
  { city: "Onipanu",         fee: 0 },
  { city: "Shomolu",         fee: 0 },
  { city: "Lekki Phase 1",   fee: 0 },
  { city: "Lekki Phase 2",   fee: 0 },
  { city: "Chevron",         fee: 0 },
  { city: "Jakande",         fee: 0 },
  { city: "Sangotedo",       fee: 0 },
  { city: "Ajah",            fee: 0 },
  { city: "Aja",             fee: 0 },
  { city: "Badore",          fee: 0 },
  { city: "Ibeju-Lekki",     fee: 0 },
  { city: "Ikoyi",           fee: 0 },
  { city: "Victoria Island", fee: 0 },
  { city: "Eko Atlantic",    fee: 0 },
  { city: "Lagos Island",    fee: 0 },
  { city: "Obalende",        fee: 0 },
  { city: "Onikan",          fee: 0 },
  { city: "Marina",          fee: 0 },
  { city: "Idumota",         fee: 0 },
  { city: "Balogun",         fee: 0 },
  { city: "Isale-Eko",       fee: 0 },
  { city: "Apapa",           fee: 0 },
  { city: "Orile",           fee: 0 },
  { city: "Iponri",          fee: 0 },
  { city: "Mile 2",          fee: 0 },
  { city: "Festac Town",     fee: 0 },
  { city: "Satellite Town",  fee: 0 },
  { city: "Amuwo-Odofin",    fee: 0 },
  { city: "Okota",           fee: 0 },
  { city: "Alaba",           fee: 0 },
  { city: "Ojo",             fee: 0 },
  { city: "Ikorodu",         fee: 0 },
  { city: "Badagry",         fee: 0 },
  { city: "Epe",             fee: 0 },
];

const DeliveryZoneSchema = new Schema(
  { city: { type: String, required: true }, fee: { type: Number, default: 0 } },
  { _id: false },
);

const SettingsSchema = new Schema(
  {
    // Singleton — only ever one document
    singleton: { type: Boolean, default: true, unique: true },

    // ── Business Info (all editable from UI) ──────────────────────────────
    storeName:     { type: String, default: "Aby Gadgets" },
    businessEmail: { type: String, default: "Abygadgetsenterprise@gmail.com" },
    businessPhone: { type: String, default: "09039122681" },
    currency:      { type: String, default: "Naira-(₦)" },
    operatingCity: { type: String, default: "Lagos, Nigeria." },
    storeAddress:  {
      type:    String,
      default: "9, Adepele Street, Merciful Plaza computer village ikeja.",
    },

    // ── Bank Details (all editable) ───────────────────────────────────────
    bankName:      { type: String, default: "PalmPay" },
    accountName:   { type: String, default: "Egoh Abraham Inalegwu" },
    accountNumber: { type: String, default: "33958873900" },

    // ── Payment methods ───────────────────────────────────────────────────
    bankTransfer:  { type: Boolean, default: true },
    payOnDelivery: { type: Boolean, default: false },
    onlinePayment: { type: Boolean, default: true },   // Paystack

    // ── Pickup & Delivery ─────────────────────────────────────────────────
    enablePickup:   { type: Boolean, default: true },
    enableDelivery: { type: Boolean, default: true },

    // Pickup info shown to customers when they choose in-store pickup
    pickupAddress:      { type: String, default: "9, Adepele Street, Merciful Plaza Computer Village, Ikeja, Lagos." },
    pickupHours:        { type: String, default: "Mon–Sat: 9am – 6pm" },
    pickupInstructions: { type: String, default: "Please bring a valid ID and your pickup code when collecting your order." },

    // ── Delivery zones (replaces flat deliveryFee + enabledCities) ───────
    // Admin sets per-zone fee; frontend fetches via GET /api/settings/delivery-zones
    deliveryZones: { type: [DeliveryZoneSchema], default: DEFAULT_LAGOS_ZONES },

    // Legacy fields kept for backwards compat (no longer shown in UI)
    deliveryFee:   { type: String, default: "Varies by zone" },
    enabledCities: { type: String, default: "Lagos" },
  },
  { collection: "settings", timestamps: true },
);

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

export default Settings;