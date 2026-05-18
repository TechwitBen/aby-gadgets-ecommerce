import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronDown, Check, ImageIcon } from "lucide-react";
import { categories, brands, conditions } from "@/pages/admin/data/mockData";
import { productService, variantService } from "@/services/products.service";
import { authAPI } from "@/services/api";
import { usePermission } from "@/contexts/PermissionContext";
import { PermissionBanner } from "@/components/ui/PermissionBanner";
import { useToast } from "@/hooks/use-toast";
import { useInView, fadeUp } from "@/hooks/useInView";

const sectionOptions = [
  "New Arrivals",
  "Popular Products",
  "Sweet Deals",
] as const;

const TAG_OPTIONS = [
  {
    group: "Condition",
    tags: ["UK Used", "Brand New", "Open Box", "Refurbished", "Fairly Used"],
  },
  {
    group: "Tier",
    tags: ["Flagship", "Budget", "Mid-range", "Premium", "Value"],
  },
  {
    group: "Feature",
    tags: [
      "5G",
      "Foldable",
      "Ultra-thin",
      "Pro Camera",
      "Long Battery",
      "S Pen",
      "Noise Cancelling",
      "Wireless",
      "Waterproof",
      "Gaming",
    ],
  },
  {
    group: "Status",
    tags: ["New", "Best Seller", "Limited Stock", "Deal", "Popular"],
  },
];

// ── SKU generator ─────────────────────────────────────────────────────────────
const autoSku = (
  productName: string,
  brand: string,
  color?: string,
  storage?: string,
  ram?: string,
) => {
  const slug = (s = "") =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4);
  const parts = [
    slug(brand),
    slug(productName),
    color ? slug(color) : null,
    storage ? slug(storage) : null,
    ram ? slug(ram) : null,
    Math.random().toString(36).slice(2, 5).toUpperCase(),
  ].filter(Boolean);
  return parts.join("-");
};

const SLOT_LABELS = [
  "Main",
  "Hover/Alt",
  "Image 3",
  "Image 4",
  "Image 5",
  "Image 6",
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

  const toggle = (tag: string) =>
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed))
      onChange([...selected, trimmed]);
    setCustomInput("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="w-full bg-lavender text-lavender-foreground rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>
          {selected.length === 0
            ? "Select or type tags…"
            : `${selected.length} tag${selected.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a custom tag…"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
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
          <div className="max-h-60 overflow-y-auto p-3 space-y-4">
            {TAG_OPTIONS.map(({ group, tags }) => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {group}
                </p>
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
          <div className="px-3 py-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selected.length} selected
            </span>
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

// ── Variant shape ─────────────────────────────────────────────────────────────
interface Variant {
  color: string;
  storage: string;
  ram: string;
  price: string;
  stock: string;
  sku: string;
  is_active: boolean;
  image: string;
}
const emptyVariant = (): Variant => ({
  color: "",
  storage: "",
  ram: "",
  price: "",
  stock: "",
  sku: "",
  is_active: true,
  image: "",
});

// ── Main Component ────────────────────────────────────────────────────────────
const AddProductPage = () => {
  const navigate = useNavigate();
  const { isAdmin, can } = usePermission();
  const { toast } = useToast();

  // 🎬 Page entrance animation
  const { ref: pageRef, isInView: pageInView } = useInView({
    once: true,
    threshold: 0,
  });

  const canAdd = isAdmin || can("products", "addProducts");

  if (!canAdd) {
    return (
      <PermissionBanner
        message="You don't have permission to add products."
        hint="Ask your admin to enable the 'Add Products' permission for your account."
      />
    );
  }

  useEffect(() => {
    const checkUser = async () => {
      const user = await authAPI.getCurrentUser();
      console.log("CURRENT USER:", user);
    };
    checkUser();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "",
    type: "",
    section: "" as "" | "New Arrivals" | "Popular Products" | "Sweet Deals",
    specs: { storage: "", screenSize: "", camera: "", battery: "" },
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [uploadedImages, setUploadedImages] = useState<(string | null)[]>(
    Array(4).fill(null),
  );
  const [urlInputs, setUrlInputs] = useState<string[]>(Array(4).fill(""));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const variantFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    variants?: string;
    images?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const handleImageClick = (i: number) => fileInputRefs.current[i]?.click();

  const handleImageChange = (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setUploadedImages((prev) => {
        const next = [...prev];
        next[i] = reader.result as string;
        return next;
      });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImages((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
    setUrlInputs((prev) => {
      const next = [...prev];
      next[i] = "";
      return next;
    });
  };

  const handleUrlInput = (i: number, value: string) =>
    setUrlInputs((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });

  const getFinalImages = (): string[] =>
    Array(4)
      .fill(null)
      .map((_, i) => uploadedImages[i] || urlInputs[i] || "")
      .filter(Boolean)
      .slice(0, 4);

  const getSlotPreview = (i: number): string | null =>
    uploadedImages[i] || urlInputs[i] || null;

  // ── Variant helpers ────────────────────────────────────────────────────────
  const addVariant = () => setVariants((p) => [...p, emptyVariant()]);
  const removeVariant = (i: number) =>
    setVariants((p) => p.filter((_, idx) => idx !== i));

  const updateVariant = (
    i: number,
    field: keyof Variant,
    value: string | boolean,
  ) =>
    setVariants((p) => {
      const next = [...p];
      next[i] = { ...next[i], [field]: value };
      return next;
    });

  const formatVariantPrice = (i: number, raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    updateVariant(i, "price", cleaned ? Number(cleaned).toLocaleString() : "");
  };

  // ── Features ───────────────────────────────────────────────────────────────
  const addFeature = () => setFeatures((p) => [...p, ""]);
  const updateFeature = (i: number, v: string) =>
    setFeatures((p) => {
      const n = [...p];
      n[i] = v;
      return n;
    });
  const removeFeature = (i: number) =>
    setFeatures((p) => p.filter((_, idx) => idx !== i));

  const handleChange = (
    field: keyof Omit<typeof formData, "specs">,
    value: string,
  ) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSpecChange = (
    field: keyof typeof formData.specs,
    value: string,
  ) => setFormData((p) => ({ ...p, specs: { ...p.specs, [field]: value } }));

  const closeAllDropdowns = () => {
    setShowCategoryDropdown(false);
    setShowBrandDropdown(false);
    setShowConditionDropdown(false);
    setShowSectionDropdown(false);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!formData.name.trim()) e.name = "Product name is required.";
    if (!formData.description.trim())
      e.description = "Description is required.";
    if (variants.length === 0)
      e.variants = "Add at least one variant with a price.";
    if (getFinalImages().length === 0)
      e.images = "At least one image is required.";
    return e;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canAdd) {
      setSubmitError("You don't have permission to add products.");
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You don't have permission to add products.",
      });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the highlighted fields.",
      });
      return;
    }
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    let newProduct: { _id: string } | null = null;

    try {
      newProduct = await productService.create({
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        condition: formData.condition,
        description: formData.description || undefined,
        type: formData.type || undefined,
        section: formData.section || undefined,

        images: getFinalImages(),
        // deliveryFee intentionally omitted — zone-based fees are in Settings
        features: features.filter((f) => f.trim()),
        tags: selectedTags.length ? selectedTags : undefined,
        specs: {
          screenSize: formData.specs.screenSize || undefined,
          camera: formData.specs.camera || undefined,
          battery: formData.specs.battery || undefined,
        },
      });

      await Promise.all(
        variants.map((v) => {
          const resolvedSku =
            v.sku?.trim() ||
            autoSku(formData.name, formData.brand, v.color, v.storage, v.ram);
          return variantService.create({
            productId: newProduct!._id,
            color: v.color || undefined,
            storage: v.storage || undefined,
            ram: v.ram || undefined,
            image: v.image || undefined,
            sku: resolvedSku,
            price: Number(v.price.replace(/[^0-9]/g, "")),
            stock: Number(v.stock),
            is_active: v.is_active,
          });
        }),
      );

      toast({
        title: "Product Published",
        description: `${formData.name} has been added.`,
      });
      navigate("/admin/products");
    } catch (err: any) {
      if (newProduct?._id) {
        try {
          await productService.delete(newProduct._id);
        } catch {}
      }
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setSubmitError(msg);
      toast({
        variant: "destructive",
        title: "Failed to Publish",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared CSS ─────────────────────────────────────────────────────────────
  const inputCls = (err = false) =>
    `w-full bg-lavender text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${err ? "ring-2 ring-destructive" : ""}`;
  const mintCls =
    "w-full bg-mint text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const dropBtnCls =
    "w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center";

  const SimpleDropdown = ({
    label,
    value,
    options,
    show,
    onToggle,
    onSelect,
  }: {
    label: string;
    value: string;
    options: string[];
    show: boolean;
    onToggle: () => void;
    onSelect: (v: string) => void;
  }) => (
    <div className="relative">
      <label className="text-xs text-muted-foreground block mb-1">
        {label}
      </label>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={dropBtnCls}
      >
        {value}
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${show ? "rotate-180" : ""}`}
        />
      </button>
      {show && (
        <div
          className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-lavender/50 transition-colors ${value === opt ? "text-primary font-medium" : "text-popover-foreground"}`}
            >
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
        <h1 className="text-2xl font-semibold text-foreground">
          Product Information
        </h1>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-1 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Plus size={16} /> {isSubmitting ? "Publishing…" : "Publish Product"}
        </Button>
      </div>

      {submitError && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <X size={15} className="flex-shrink-0" />
          {submitError}
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="ml-auto hover:opacity-70 transition-opacity"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 🎬 Animated content wrapper */}
      <div ref={pageRef} className={fadeUp(pageInView)}>
        {/* Images */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-medium text-foreground">
              Product Images
            </h2>
            <span className="text-xs text-muted-foreground">
              {getFinalImages().length} / 4 images added
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Upload files or paste URLs. Slot 1 is required. File uploads take
            priority over URLs.
          </p>
          {errors.images && (
            <p className="text-xs text-destructive mb-3 font-medium">
              {errors.images}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {Array(4)
              .fill(null)
              .map((_, i) => {
                const preview = getSlotPreview(i);
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="relative aspect-square">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          fileInputRefs.current[i] = el;
                        }}
                        onChange={(e) => handleImageChange(i, e)}
                        className="hidden"
                      />
                      <div
                        onClick={() => handleImageClick(i)}
                        className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all bg-card overflow-hidden ${
                          preview
                            ? "border-primary bg-primary/5"
                            : errors.images && i === 0
                              ? "border-destructive"
                              : "border-border hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt={`Slot ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <ImageIcon
                              size={20}
                              className="text-muted-foreground"
                            />
                            <span className="text-[10px] text-muted-foreground mt-1 text-center leading-tight px-1">
                              {SLOT_LABELS[i]}
                            </span>
                          </>
                        )}
                      </div>
                      {preview && (
                        <button
                          onClick={(e) => handleRemoveImage(i, e)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:opacity-80 z-10"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Paste URL…"
                      value={uploadedImages[i] ? "" : urlInputs[i]}
                      disabled={!!uploadedImages[i]}
                      onChange={(e) => handleUrlInput(i, e.target.value)}
                      className={`w-full text-xs rounded-lg px-2 py-1.5 border focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                        uploadedImages[i]
                          ? "bg-muted/40 border-border text-muted-foreground cursor-not-allowed"
                          : "bg-card border-border text-foreground hover:border-primary/50"
                      }`}
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Basic Info
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Name <span className="text-destructive">Required</span>
              </label>
              <input
                type="text"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) => {
                  handleChange("name", e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={inputCls(!!errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            <SimpleDropdown
              label="Category"
              value={formData.category}
              options={categories}
              show={showCategoryDropdown}
              onToggle={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowBrandDropdown(false);
                setShowConditionDropdown(false);
                setShowSectionDropdown(false);
              }}
              onSelect={(v) => {
                handleChange("category", v);
                setShowCategoryDropdown(false);
              }}
            />
            <SimpleDropdown
              label="Brand"
              value={formData.brand}
              options={brands}
              show={showBrandDropdown}
              onToggle={() => {
                setShowBrandDropdown(!showBrandDropdown);
                setShowCategoryDropdown(false);
                setShowConditionDropdown(false);
                setShowSectionDropdown(false);
              }}
              onSelect={(v) => {
                handleChange("brand", v);
                setShowBrandDropdown(false);
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SimpleDropdown
              label="Condition"
              value={formData.condition}
              options={conditions}
              show={showConditionDropdown}
              onToggle={() => {
                setShowConditionDropdown(!showConditionDropdown);
                setShowCategoryDropdown(false);
                setShowBrandDropdown(false);
                setShowSectionDropdown(false);
              }}
              onSelect={(v) => {
                handleChange("condition", v);
                setShowConditionDropdown(false);
              }}
            />
            <div className="relative">
              <label className="text-xs text-muted-foreground block mb-1">
                Section
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSectionDropdown(!showSectionDropdown);
                  setShowCategoryDropdown(false);
                  setShowBrandDropdown(false);
                  setShowConditionDropdown(false);
                }}
                className={dropBtnCls}
              >
                {formData.section || (
                  <span className="text-muted-foreground/70">
                    Select section…
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform ${showSectionDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showSectionDropdown && (
                <div
                  className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      handleChange("section", "");
                      setShowSectionDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-lavender/50"
                  >
                    None
                  </button>
                  {sectionOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        handleChange("section", s);
                        setShowSectionDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-lavender/50 ${formData.section === s ? "text-primary font-medium" : "text-popover-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Type{" "}
                <span className="text-muted-foreground/60 ml-1">
                  (e.g. smartphone, laptop)
                </span>
              </label>
              <input
                type="text"
                placeholder="smartphone"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className={inputCls()}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="text-xs text-muted-foreground block mb-1">
            Product Description{" "}
            <span className="text-destructive">Required</span>
          </label>
          <textarea
            placeholder="Describe the product…"
            value={formData.description}
            rows={4}
            onChange={(e) => {
              handleChange("description", e.target.value);
              if (errors.description)
                setErrors({ ...errors, description: undefined });
            }}
            className={`w-full bg-lavender text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${errors.description ? "ring-2 ring-destructive" : ""}`}
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Key Features */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">
              Key Features
            </h2>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={14} /> Add Feature
            </button>
          </div>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  placeholder={`Feature ${i + 1}…`}
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className={inputCls()}
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Specifications
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Screen Size
              </label>
              <input
                type="text"
                placeholder='e.g. 6.1"'
                value={formData.specs.screenSize}
                onChange={(e) => handleSpecChange("screenSize", e.target.value)}
                className={inputCls()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Camera
              </label>
              <input
                type="text"
                placeholder="e.g. 48MP Triple Camera"
                value={formData.specs.camera}
                onChange={(e) => handleSpecChange("camera", e.target.value)}
                className={inputCls()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Battery
              </label>
              <input
                type="text"
                placeholder="e.g. Up to 22hrs video playback"
                value={formData.specs.battery}
                onChange={(e) => handleSpecChange("battery", e.target.value)}
                className={inputCls()}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-medium text-foreground">Tags</h2>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Pick from common options or type your own. Tags help with filtering
            and search.
          </p>
          <TagDropdown selected={selectedTags} onChange={setSelectedTags} />
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTags(selectedTags.filter((t) => t !== tag))
                    }
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Stock */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">
              Pricing and Stock
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>

          {errors.variants && (
            <p className="text-xs text-destructive mb-3">{errors.variants}</p>
          )}

          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed border-border rounded-lg">
              No variants yet. Click{" "}
              <span className="text-primary font-medium">+ Add Variant</span> to
              add a color / storage / RAM option.
            </p>
          )}

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="p-3 bg-card border border-border rounded-lg"
              >
                {/* Row 1 — Color / RAM / Storage / SKU */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Black"
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(i, "color", e.target.value)
                      }
                      className={inputCls()}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      RAM
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8GB"
                      value={v.ram}
                      onChange={(e) => updateVariant(i, "ram", e.target.value)}
                      className={inputCls()}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Storage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 256GB"
                      value={v.storage}
                      onChange={(e) =>
                        updateVariant(i, "storage", e.target.value)
                      }
                      className={inputCls()}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      className={inputCls()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated if blank.
                    </p>
                  </div>
                </div>

                {/* Row 2 — Variant Image */}
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Variant Image{" "}
                    <span className="text-muted-foreground/60">
                      (shown when this color is selected by the customer)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        variantFileInputRefs.current[i] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () =>
                          updateVariant(i, "image", reader.result as string);
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />

                    {/* Click-to-upload preview box */}
                    <div
                      onClick={() => variantFileInputRefs.current[i]?.click()}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                        v.image
                          ? "border-primary bg-secondary hover:opacity-80"
                          : "border-dashed border-border bg-card hover:border-primary"
                      }`}
                    >
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={`Variant ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Plus size={14} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground leading-tight text-center">
                            Upload
                          </span>
                        </div>
                      )}
                    </div>

                    {/* URL input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Or paste image URL…"
                        value={v.image}
                        onChange={(e) =>
                          updateVariant(i, "image", e.target.value)
                        }
                        className={inputCls()}
                      />
                    </div>

                    {/* Clear button */}
                    {v.image && (
                      <button
                        type="button"
                        onClick={() => updateVariant(i, "image", "")}
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 3 — Price / Stock / Remove */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Price <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="₦0"
                      value={v.price ? `₦${v.price}` : ""}
                      onChange={(e) =>
                        formatVariantPrice(
                          i,
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      className={inputCls()}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, "stock", e.target.value)
                      }
                      className={mintCls}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="w-full h-[42px] rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center gap-1.5 transition-colors text-xs font-medium"
                    >
                      <X size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Fee field removed — now managed via Settings → Delivery Zones */}
          <p className="text-xs text-muted-foreground mt-4 bg-secondary/40 rounded-lg px-3 py-2">
            💡 Delivery fees are now zone-based and managed in{" "}
            <strong>Settings → Delivery Zones</strong>. No per-product fee is
            needed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-1 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Plus size={16} />{" "}
            {isSubmitting ? "Publishing…" : "Publish Product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
