import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Plus, ArrowLeft, X, Trash2, Tag } from "lucide-react";
import { productsData, categories, brands, conditions } from "@/pages/admin/data/mockData";

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const sectionOptions = ["New Arrivals", "Popular Products", "Sweet Deals"] as const;
type SectionOption = "" | (typeof sectionOptions)[number];

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open, name, onConfirm, onCancel,
}: {
  open: boolean; name: string; onConfirm: () => void; onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">Delete Product</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{name}</span>? This action cannot be
            undone and will remove the product permanently.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5">
            <Trash2 size={14} /> Delete Product
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = productsData.find((p) => p.id === id);

  const [isEditing, setIsEditing]           = useState(false);
  const [saveSuccess, setSaveSuccess]       = useState(false);
  const [openDropdown, setOpenDropdown]     = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Image state
  const [images, setImages] = useState<(string | null)[]>(
    product
      ? Array(6).fill(null).map((_, i) => (i < product.images.length ? "placeholder" : null))
      : Array(6).fill(null)
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Features — dynamic list (seeded from product if available)
  const [features, setFeatures] = useState<string[]>(
    product?.features?.length ? product.features : [""]
  );

  const buildInitialForm = () => ({
    // ── Existing fields ──
    name:         product?.name        ?? "",
    category:     product?.category    ?? "Phones",
    brand:        product?.brand       ?? "Apple",
    condition:    product?.condition   ?? "Brand New",
    storage:      product?.storage     ?? "",
   
    description:  product?.description ?? "",
    price:        product?.price?.toLocaleString() ?? "",
    quantity:     String(product?.stock ?? ""),
    deliveryFee:  "5,000",

    // ── New fields (mirrored from AddProductPage) ──
    type:        product?.type        ?? "",
    section:     (product?.section    ?? "") as SectionOption,
    image:       product?.image       ?? "",
    image2:      product?.image2      ?? "",
    screenSize:  product?.screenSize  ?? "",
    camera:      product?.camera      ?? "",
    battery:     product?.battery     ?? "",
    inStock:     product?.inStock     ?? true,
    rating:      product?.rating      != null ? String(product.rating)  : "",
    reviews:     product?.reviews     != null ? String(product.reviews) : "",
    tagsInput:       product?.tags?.join(", ")       ?? "",
    categoriesInput: product?.categories?.join(", ") ?? "",
  });

  const [form, setForm] = useState<ReturnType<typeof buildInitialForm>>(buildInitialForm);

  if (!product) {
    return (
      <div className="text-foreground p-8">
        <p className="mb-4">Product not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
          <ArrowLeft size={16} /> Go Back
        </Button>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const withNaira = (val: string) => `₦${val}`;

  const handleChange = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setIsEditing(false); }, 1500);
  };

  const handleCancel = () => {
    setForm(buildInitialForm());
    setFeatures(product?.features?.length ? product.features : [""]);
    setImages(Array(6).fill(null).map((_, i) => (i < product.images.length ? "placeholder" : null)));
    setIsEditing(false);
    setOpenDropdown(null);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    navigate(-1);
  };

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleImageClick = (index: number) => {
    if (!isEditing) return;
    fileInputRefs.current[index]?.click();
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setImages((prev) => { const next = [...prev]; next[index] = reader.result as string; return next; });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => { const next = [...prev]; next[index] = null; return next; });
  };

  // ── Features ──────────────────────────────────────────────────────────────
  const addFeature    = () => setFeatures((prev) => [...prev, ""]);
  const updateFeature = (i: number, val: string) =>
    setFeatures((prev) => { const next = [...prev]; next[i] = val; return next; });
  const removeFeature = (i: number) =>
    setFeatures((prev) => prev.filter((_, idx) => idx !== i));

  // ── Dropdown helpers ──────────────────────────────────────────────────────
  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) return;
    setOpenDropdown((prev) => (prev === name ? null : name));
  };
  const closeAllDropdowns = () => setOpenDropdown(null);

  // ── Shared CSS ────────────────────────────────────────────────────────────
  const lavInput = "w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const mintInput = "w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  // ── Reusable dropdown ─────────────────────────────────────────────────────
  const Dropdown = ({
    name, value, options, field,
  }: { name: string; value: string; options: string[]; field: keyof typeof form }) => (
    <div className="relative">
      <button
        onClick={(e) => toggleDropdown(name, e)}
        style={{ cursor: isEditing ? "pointer" : "default" }}
        className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center"
      >
        {value || <span className="text-muted-foreground">Select…</span>}
        <span className="text-muted-foreground text-xs">▼</span>
      </button>
      {isEditing && openDropdown === name && (
        <div
          className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-20 max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { handleChange(field, opt); setOpenDropdown(null); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-lavender/50 ${
                value === opt ? "text-primary font-medium" : "text-popover-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Optional "None" dropdown (for section)
  const SectionDropdown = () => (
    <div className="relative">
      <button
        onClick={(e) => toggleDropdown("section", e)}
        style={{ cursor: isEditing ? "pointer" : "default" }}
        className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center"
      >
        {form.section || <span className="text-muted-foreground">None</span>}
        <span className="text-muted-foreground text-xs">▼</span>
      </button>
      {isEditing && openDropdown === "section" && (
        <div
          className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { handleChange("section", ""); setOpenDropdown(null); }}
            className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-lavender/50"
          >
            None
          </button>
          {sectionOptions.map((sec) => (
            <button
              key={sec}
              onClick={() => { handleChange("section", sec); setOpenDropdown(null); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-lavender/50 ${
                form.section === sec ? "text-primary font-medium" : "text-popover-foreground"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Plain text / textarea field ───────────────────────────────────────────
  const PlainField = ({
    field, bg = "bg-lavender", fg = "text-lavender-foreground", type = "text",
  }: { field: keyof typeof form; bg?: string; fg?: string; type?: string }) =>
    isEditing ? (
      <input
        type={type}
        value={String(form[field])}
        onChange={(e) => handleChange(field, e.target.value)}
        className={`w-full ${bg} ${fg} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
      />
    ) : (
      <div className={`w-full ${bg} ${fg} rounded-lg p-3 text-sm`}>{String(form[field])}</div>
    );

  // ── Price field ───────────────────────────────────────────────────────────
  const PriceField = ({
    field, bg = "bg-lavender", fg = "text-lavender-foreground",
  }: { field: "price" | "deliveryFee"; bg?: string; fg?: string }) =>
    isEditing ? (
      <input
        type="text"
        value={withNaira(form[field])}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          setForm((prev) => ({ ...prev, [field]: raw ? Number(raw).toLocaleString() : "" }));
        }}
        className={`w-full ${bg} ${fg} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
      />
    ) : (
      <div className={`w-full ${bg} ${fg} rounded-lg p-3 text-sm`}>{withNaira(form[field])}</div>
    );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div onClick={closeAllDropdowns}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Product Information</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm" variant="outline"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
          >
            <Trash2 size={14} /> Delete
          </Button>
          {isEditing ? (
            <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
          ) : (
            <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:opacity-90" onClick={() => setIsEditing(true)}>
              <Edit size={14} /> Edit Product
            </Button>
          )}
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {Array(6).fill(null).map((_, i) => {
          const img = images[i];
          return (
            <div key={i} className="relative aspect-square">
              <input type="file" accept="image/*"
                ref={(el) => { fileInputRefs.current[i] = el; }}
                onChange={(e) => handleImageChange(i, e)} className="hidden" />
              <div
                onClick={() => handleImageClick(i)}
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center overflow-hidden transition-colors ${
                  img ? "bg-secondary border border-border"
                  : isEditing ? "border-2 border-dashed border-border bg-card hover:border-primary cursor-pointer"
                  : "border-2 border-dashed border-border bg-card"
                } ${isEditing && img ? "cursor-pointer hover:opacity-80" : ""}`}
              >
                {img === "placeholder" ? (
                  <span className="text-3xl">📱</span>
                ) : img ? (
                  <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Plus size={18} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {i === 0 ? "Main" : i === 1 ? "Alt" : "Image"}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && img && (
                <button onClick={(e) => handleRemoveImage(i, e)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:opacity-80 z-10">
                  <X size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Image URL fallbacks */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-foreground mb-2">Image URLs</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Uploads above fill these automatically. You can also paste URLs directly.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Image URL (Main) <span className="text-destructive">Required</span>
            </label>
            {isEditing ? (
              <input type="text" placeholder="https://…" value={images[0] || form.image}
                onChange={(e) => handleChange("image", e.target.value)} className={lavInput} />
            ) : (
              <div className={`${lavInput} truncate`}>{images[0] || form.image || "—"}</div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Image URL 2 (Hover)</label>
            {isEditing ? (
              <input type="text" placeholder="https://…" value={images[1] || form.image2}
                onChange={(e) => handleChange("image2", e.target.value)} className={lavInput} />
            ) : (
              <div className={`${lavInput} truncate`}>{images[1] || form.image2 || "—"}</div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-foreground mb-3">Basic Info</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Name</label>
            <PlainField field="name" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Category</label>
            <Dropdown name="category" value={form.category} options={categories} field="category" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Brands</label>
            <Dropdown name="brand" value={form.brand} options={brands} field="brand" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Condition</label>
            <Dropdown name="condition" value={form.condition} options={conditions} field="condition" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Section</label>
            <SectionDropdown />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Type <span className="text-muted-foreground/60">(e.g. smartphone, laptop)</span>
            </label>
            <PlainField field="type" />
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs text-muted-foreground">
            Product Description <span className="text-destructive">Required</span>
          </label>
        </div>
        {isEditing ? (
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        ) : (
          <div className="w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm min-h-[90px]">
            {form.description}
          </div>
        )}
      </div>

      {/* Key Features — dynamic list */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-foreground">Key Features</h2>
          {isEditing && (
            <button type="button" onClick={addFeature}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity">
              <Plus size={14} /> Add Feature
            </button>
          )}
        </div>
        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
              {isEditing ? (
                <input type="text" placeholder={`Feature ${i + 1}…`} value={feature}
                  onChange={(e) => updateFeature(i, e.target.value)} className={lavInput} />
              ) : (
                <div className={`${lavInput}`}>{feature || <span className="text-muted-foreground">—</span>}</div>
              )}
              {isEditing && features.length > 1 && (
                <button type="button" onClick={() => removeFeature(i)}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-foreground mb-3">Specifications</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Storage</label>
            <Dropdown name="storage" value={form.storage} options={storageOptions} field="storage" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Screen Size</label>
            <PlainField field="screenSize" bg="bg-mint" fg="text-mint-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Camera</label>
            <PlainField field="camera" bg="bg-mint" fg="text-mint-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Battery</label>
            <PlainField field="battery" bg="bg-mint" fg="text-mint-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Battery Health</label>
            <PlainField field="batteryHealth" bg="bg-mint" fg="text-mint-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Color</label>
            <PlainField field="color" bg="bg-mint" fg="text-mint-foreground" />
          </div>
        </div>
      </div>

      {/* Tags & Categories */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-foreground mb-1">Tags &amp; Categories</h2>
        <p className="text-xs text-muted-foreground mb-4">Separate multiple values with commas.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Tag size={12} /> Tags
            </label>
            {isEditing ? (
              <input type="text" placeholder="Flagship, UK Used, New…"
                value={form.tagsInput} onChange={(e) => handleChange("tagsInput", e.target.value)}
                className={lavInput} />
            ) : (
              <div className={lavInput}>{form.tagsInput || "—"}</div>
            )}
            {form.tagsInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Tag size={12} /> Extra Categories
            </label>
            {isEditing ? (
              <input type="text" placeholder="Phones, Accessories…"
                value={form.categoriesInput} onChange={(e) => handleChange("categoriesInput", e.target.value)}
                className={lavInput} />
            ) : (
              <div className={lavInput}>{form.categoriesInput || "—"}</div>
            )}
            {form.categoriesInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.categoriesInput.split(",").map((c) => c.trim()).filter(Boolean).map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing and Stock */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-foreground mb-3">Pricing and Stock</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Price <span className="text-destructive">Required</span>
            </label>
            <PriceField field="price" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Quantity Available</label>
            {isEditing ? (
              <input type="number" min="0" value={form.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)} className={mintInput} />
            ) : (
              <div className={mintInput}>{form.quantity}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Delivery Fee</label>
            <PriceField field="deliveryFee" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rating (0–5)</label>
            {isEditing ? (
              <input type="number" min="0" max="5" step="0.1" placeholder="4.8"
                value={form.rating} onChange={(e) => handleChange("rating", e.target.value)}
                className={mintInput} />
            ) : (
              <div className={mintInput}>{form.rating || "—"}</div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Review Count</label>
            {isEditing ? (
              <input type="number" min="0" placeholder="124"
                value={form.reviews} onChange={(e) => handleChange("reviews", e.target.value)}
                className={mintInput} />
            ) : (
              <div className={mintInput}>{form.reviews || "—"}</div>
            )}
          </div>
        </div>

        {/* In Stock toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.inStock as boolean}
            onClick={() => isEditing && handleChange("inStock", !form.inStock)}
            style={{ cursor: isEditing ? "pointer" : "default" }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
              form.inStock ? "bg-primary" : "bg-border"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              form.inStock ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
          <label
            className="text-sm text-foreground select-none"
            style={{ cursor: isEditing ? "pointer" : "default" }}
            onClick={() => isEditing && handleChange("inStock", !form.inStock)}
          >
            In Stock
            <span className={`ml-2 text-xs font-medium ${form.inStock ? "text-primary" : "text-muted-foreground"}`}>
              {form.inStock ? "Yes" : "No"}
            </span>
          </label>
        </div>
      </div>

      {/* Footer action */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={isEditing ? handleSave : undefined}
          className={`gap-1 ${
            saveSuccess ? "bg-green-500 hover:bg-green-500" : "bg-primary hover:opacity-90"
          } text-primary-foreground`}
        >
          <Plus size={16} />
          {saveSuccess ? "Saved!" : isEditing ? "Save Changes" : "Publish Products"}
        </Button>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        name={product.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ProductDetailPage;