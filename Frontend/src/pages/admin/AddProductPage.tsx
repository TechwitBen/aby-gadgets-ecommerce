import { useState, useRef, useRef as useOutsideRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronDown, Check } from "lucide-react";
import { categories, brands, conditions } from "@/pages/admin/data/mockData";

const sectionOptions = ["New Arrivals", "Popular Products", "Sweet Deals"] as const;

// Predefined tag options grouped by category for discoverability
const TAG_OPTIONS = [
  { group: "Condition",  tags: ["UK Used", "Brand New", "Open Box", "Refurbished", "Fairly Used"] },
  { group: "Tier",       tags: ["Flagship", "Budget", "Mid-range", "Premium", "Value"] },
  { group: "Feature",    tags: ["5G", "Foldable", "Ultra-thin", "Pro Camera", "Long Battery", "S Pen", "Noise Cancelling", "Wireless", "Waterproof", "Gaming"] },
  { group: "Status",     tags: ["New", "Best Seller", "Limited Stock", "Deal", "Popular"] },
];

// ── Tag Dropdown ──────────────────────────────────────────────────────────────
const TagDropdown = ({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const ref = useOutsideRef<HTMLDivElement>(null);

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag]
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustomInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCustom(); }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="w-full bg-lavender text-lavender-foreground rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>
          {selected.length === 0 ? "Select or type tags…" : `${selected.length} tag${selected.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Custom input */}
          <div className="p-3 border-b border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a custom tag…"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!customInput.trim()}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
          </div>

          {/* Grouped options */}
          <div className="max-h-60 overflow-y-auto p-3 space-y-4">
            {TAG_OPTIONS.map(({ group, tags }) => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const active = selected.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggle(tag)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
                        }`}
                      >
                        {active && <Check size={10} />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary hover:opacity-80"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AddProductPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "",
    price: "",
    quantity: "",
    deliveryFee: "",
    type: "",
    section: "" as "" | "New Arrivals" | "Popular Products" | "Sweet Deals",
    image: "",
    image2: "",
    storage: "",
    screenSize: "",
    camera: "",
    battery: "",
    inStock: true,
    rating: "",
    reviews: "",
  });

  // Tags — now an array, not a raw string
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [features, setFeatures] = useState<string[]>([""]);
  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown]       = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown]   = useState(false);

  const [errors, setErrors] = useState<{ name?: string; description?: string; price?: string }>({});

  // ── Image handling ──────────────────────────────────────────────────────────
  const handleImageClick  = (i: number) => fileInputRefs.current[i]?.click();

  const handleImageChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setImages((prev) => { const next = [...prev]; next[i] = reader.result as string; return next; });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => { const next = [...prev]; next[i] = null; return next; });
  };

  // ── Price formatting ────────────────────────────────────────────────────────
  const formatNum = (v: string) => {
    const n = v.replace(/[^0-9]/g, "");
    return n ? Number(n).toLocaleString() : "";
  };

  const handlePriceChange = (field: "price" | "deliveryFee", v: string) =>
    setFormData({ ...formData, [field]: formatNum(v) });

  // ── Features ────────────────────────────────────────────────────────────────
  const addFeature    = () => setFeatures((p) => [...p, ""]);
  const updateFeature = (i: number, v: string) =>
    setFeatures((p) => { const n = [...p]; n[i] = v; return n; });
  const removeFeature = (i: number) =>
    setFeatures((p) => p.filter((_, idx) => idx !== i));

  const handleChange = (field: keyof typeof formData, value: string | boolean) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const closeAllDropdowns = () => {
    setShowCategoryDropdown(false);
    setShowBrandDropdown(false);
    setShowConditionDropdown(false);
    setShowSectionDropdown(false);
  };

  // ── Validation & submit ─────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!formData.name.trim())        e.name        = "Product name is required.";
    if (!formData.description.trim()) e.description = "Description is required.";
    if (!formData.price.trim())       e.price       = "Price is required.";
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const payload = {
      name:        formData.name,
      price:       Number(formData.price.replace(/[^0-9]/g, "")),
      image:       images[0] || formData.image,
      image2:      images[1] || formData.image2 || undefined,
      category:    formData.category,
      type:        formData.type        || undefined,
      brand:       formData.brand,
      condition:   formData.condition,
      description: formData.description || undefined,
      features:    features.filter((f) => f.trim()),
      section:     formData.section     || undefined,
      storage:     formData.storage     || undefined,
      screenSize:  formData.screenSize  || undefined,
      camera:      formData.camera      || undefined,
      battery:     formData.battery     || undefined,
      inStock:     formData.inStock,
      rating:      formData.rating  ? Number(formData.rating)  : undefined,
      reviews:     formData.reviews ? Number(formData.reviews) : undefined,
      tags:        selectedTags.length ? selectedTags : undefined,
      quantity:    formData.quantity,
      deliveryFee: formData.deliveryFee,
    };

    console.log("Publishing product:", payload);
    navigate("products");
  };

  // ── Shared input classes ────────────────────────────────────────────────────
  const inputCls  = (err = false) =>
    `w-full bg-lavender text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${err ? "ring-2 ring-destructive" : ""}`;
  const mintCls   = "w-full bg-mint text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const dropBtnCls = "w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center";

  // ── Reusable dropdown ───────────────────────────────────────────────────────
  const SimpleDropdown = ({
    label, value, options, show, onToggle, onSelect,
  }: {
    label: string; value: string; options: string[];
    show: boolean; onToggle: () => void; onSelect: (v: string) => void;
  }) => (
    <div className="relative">
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={dropBtnCls}>
        {value} <ChevronDown size={14} className={`text-muted-foreground transition-transform ${show ? "rotate-180" : ""}`} />
      </button>
      {show && (
        <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          {options.map((opt) => (
            <button key={opt} onClick={() => onSelect(opt)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-lavender/50 transition-colors ${value === opt ? "text-primary font-medium" : "text-popover-foreground"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-theme" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Product Information</h1>
        <Button onClick={handleSubmit} className="gap-1 bg-primary text-primary-foreground hover:opacity-90">
          <Plus size={16} /> Publish Product
        </Button>
      </div>

      {/* Image Upload */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square">
            <input type="file" accept="image/*"
              ref={(el) => { fileInputRefs.current[i] = el; }}
              onChange={(e) => handleImageChange(i, e)} className="hidden" />
            <div onClick={() => handleImageClick(i)}
              className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-card overflow-hidden ${img ? "border-primary" : "border-border hover:border-primary"}`}>
              {img ? (
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Plus size={24} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">{i === 0 ? "Main" : i === 1 ? "Alt" : "Image"}</span>
                </>
              )}
            </div>
            {img && (
              <button onClick={(e) => handleRemoveImage(i, e)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:opacity-80 z-10">
                <X size={10} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Image URLs */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-1">Image URLs</h2>
        <p className="text-xs text-muted-foreground mb-3">Uploads above fill these automatically. You can also paste URLs directly.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Image URL (Main) <span className="text-destructive">Required</span></label>
            <input type="text" placeholder="https://…" value={images[0] || formData.image}
              onChange={(e) => handleChange("image", e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Image URL 2 (Hover)</label>
            <input type="text" placeholder="https://…" value={images[1] || formData.image2}
              onChange={(e) => handleChange("image2", e.target.value)} className={inputCls()} />
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Basic Info</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Name <span className="text-destructive">Required</span></label>
            <input type="text" placeholder="Product name" value={formData.name}
              onChange={(e) => { handleChange("name", e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
              className={inputCls(!!errors.name)} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <SimpleDropdown label="Category" value={formData.category} options={categories}
            show={showCategoryDropdown}
            onToggle={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowBrandDropdown(false); setShowConditionDropdown(false); setShowSectionDropdown(false); }}
            onSelect={(v) => { handleChange("category", v); setShowCategoryDropdown(false); }} />
          <SimpleDropdown label="Brand" value={formData.brand} options={brands}
            show={showBrandDropdown}
            onToggle={() => { setShowBrandDropdown(!showBrandDropdown); setShowCategoryDropdown(false); setShowConditionDropdown(false); setShowSectionDropdown(false); }}
            onSelect={(v) => { handleChange("brand", v); setShowBrandDropdown(false); }} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <SimpleDropdown label="Condition" value={formData.condition} options={conditions}
            show={showConditionDropdown}
            onToggle={() => { setShowConditionDropdown(!showConditionDropdown); setShowCategoryDropdown(false); setShowBrandDropdown(false); setShowSectionDropdown(false); }}
            onSelect={(v) => { handleChange("condition", v); setShowConditionDropdown(false); }} />

          {/* Section with "None" option */}
          <div className="relative">
            <label className="text-xs text-muted-foreground block mb-1">Section</label>
            <button onClick={(e) => { e.stopPropagation(); setShowSectionDropdown(!showSectionDropdown); setShowCategoryDropdown(false); setShowBrandDropdown(false); setShowConditionDropdown(false); }} className={dropBtnCls}>
              {formData.section || <span className="text-muted-foreground/70">Select section…</span>}
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showSectionDropdown ? "rotate-180" : ""}`} />
            </button>
            {showSectionDropdown && (
              <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { handleChange("section", ""); setShowSectionDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-lavender/50">None</button>
                {sectionOptions.map((s) => (
                  <button key={s} onClick={() => { handleChange("section", s); setShowSectionDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-lavender/50 ${formData.section === s ? "text-primary font-medium" : "text-popover-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Type <span className="text-muted-foreground/60 ml-1">(e.g. smartphone, laptop)</span>
            </label>
            <input type="text" placeholder="smartphone" value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)} className={inputCls()} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label className="text-xs text-muted-foreground block mb-1">
          Product Description <span className="text-destructive">Required</span>
        </label>
        <textarea placeholder="Describe the product…" value={formData.description} rows={4}
          onChange={(e) => { handleChange("description", e.target.value); if (errors.description) setErrors({ ...errors, description: undefined }); }}
          className={`w-full bg-lavender text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${errors.description ? "ring-2 ring-destructive" : ""}`} />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
      </div>

      {/* Key Features */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">Key Features</h2>
          <button type="button" onClick={addFeature}
            className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity">
            <Plus size={14} /> Add Feature
          </button>
        </div>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
              <input type="text" placeholder={`Feature ${i + 1}…`} value={f}
                onChange={(e) => updateFeature(i, e.target.value)} className={inputCls()} />
              {features.length > 1 && (
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
        <h2 className="text-lg font-medium text-foreground mb-4">Specifications</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Storage</label>
            <input type="text" placeholder="e.g. 256GB" value={formData.storage}
              onChange={(e) => handleChange("storage", e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Screen Size</label>
            <input type="text" placeholder='e.g. 6.1"' value={formData.screenSize}
              onChange={(e) => handleChange("screenSize", e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Camera</label>
            <input type="text" placeholder="e.g. 48MP Triple Camera" value={formData.camera}
              onChange={(e) => handleChange("camera", e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Battery</label>
            <input type="text" placeholder="e.g. Up to 22hrs video playback" value={formData.battery}
              onChange={(e) => handleChange("battery", e.target.value)} className={inputCls()} />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-medium text-foreground">Tags</h2>
          {selectedTags.length > 0 && (
            <button type="button" onClick={() => setSelectedTags([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors">
              Clear all
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Pick from common options or type your own. Tags help with filtering and search.
        </p>
        <TagDropdown selected={selectedTags} onChange={setSelectedTags} />
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedTags.map((tag) => (
              <span key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {tag}
                <button type="button" onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                  className="hover:text-destructive transition-colors ml-0.5">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing and Stock */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Pricing and Stock</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Price <span className="text-destructive">Required</span></label>
            <input type="text" placeholder="₦234,000" value={formData.price ? `₦${formData.price}` : ""}
              onChange={(e) => { handlePriceChange("price", e.target.value.replace(/[^0-9]/g, "")); if (errors.price) setErrors({ ...errors, price: undefined }); }}
              className={inputCls(!!errors.price)} />
            {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Quantity Available</label>
            <input type="number" min="0" placeholder="0" value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)} className={mintCls} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Delivery Fee</label>
            <input type="text" placeholder="₦0" value={formData.deliveryFee ? `₦${formData.deliveryFee}` : ""}
              onChange={(e) => handlePriceChange("deliveryFee", e.target.value.replace(/[^0-9]/g, ""))}
              className={inputCls()} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" placeholder="4.8" value={formData.rating}
              onChange={(e) => handleChange("rating", e.target.value)} className={mintCls} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Review Count</label>
            <input type="number" min="0" placeholder="124" value={formData.reviews}
              onChange={(e) => handleChange("reviews", e.target.value)} className={mintCls} />
          </div>
        </div>

        {/* In Stock toggle */}
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={formData.inStock}
            onClick={() => handleChange("inStock", !formData.inStock)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${formData.inStock ? "bg-primary" : "bg-border"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.inStock ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <label className="text-sm text-foreground cursor-pointer select-none"
            onClick={() => handleChange("inStock", !formData.inStock)}>
            In Stock
            <span className={`ml-2 text-xs font-medium ${formData.inStock ? "text-primary" : "text-muted-foreground"}`}>
              {formData.inStock ? "Yes" : "No"}
            </span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSubmit} className="gap-1 bg-primary text-primary-foreground hover:opacity-90">
          <Plus size={16} /> Publish Product
        </Button>
      </div>
    </div>
  );
};

export default AddProductPage;