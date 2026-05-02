import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Plus,
  ArrowLeft,
  X,
  Trash2,
  Tag,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { categories, brands, conditions } from "@/pages/admin/data/mockData";
import {
  productService,
  variantService,
  type Product,
  type Variant,
} from "@/services/Products.service";
import { usePermission } from "@/contexts/PermissionContext";
import { PermissionToast } from "@/components/ui/PermissionToast";
import { usePermissionToast } from "@/hooks/usePermissionToast";

const sectionOptions = [
  "New Arrivals",
  "Popular Products",
  "Sweet Deals",
] as const;
type SectionOption = "" | (typeof sectionOptions)[number];

// ── Delete Confirm Modals ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open,
  name,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-popover text-popover-foreground rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Delete Product
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{name}</span>? This
            action cannot be undone and will remove the product permanently.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5"
          >
            <Trash2 size={14} /> Delete Product
          </Button>
        </div>
      </div>
    </div>
  );
};

const DeleteVariantModal = ({
  open,
  sku,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  sku: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-popover text-popover-foreground rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Remove Variant
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Remove variant{" "}
            <span className="font-semibold text-foreground">{sku}</span>? This
            will deactivate it on the backend.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5"
          >
            <Trash2 size={14} /> Remove Variant
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface VariantDraft {
  id: string;
  product: string;
  color: string;
  storage: string;
  ram: string;
  sku: string;
  price: string;
  compare_at_price: string;
  stock: string;
  is_active: boolean;
  isNew: boolean;
  image: string;
}

const toVariantDraft = (v: Variant): VariantDraft => ({
  id: v.id,
  product: v.product,
  color: v.color ?? "",
  storage: v.storage ?? "",
  ram: v.ram ?? "",
  sku: v.sku,
  price: v.price.toLocaleString(),
  compare_at_price: v.compare_at_price?.toLocaleString() ?? "",
  stock: String(v.stock),
  is_active: v.is_active,
  isNew: false,
  image: v.image ?? "", // ← reads existing image from backend
});

const emptyVariantDraft = (productId: string): VariantDraft => ({
  id: "",
  product: productId,
  color: "",
  storage: "",
  ram: "",
  sku: "",
  price: "",
  compare_at_price: "",
  stock: "",
  is_active: true,
  isNew: true,
  image: "", // ← just empty, no v to read from
});

const buildForm = (product: Product) => ({
  name: product.name ?? "",
  category: product.category ?? "Phones",
  brand: product.brand ?? "Apple",
  condition: product.condition ?? "Brand New",
  description: product.description ?? "",
  deliveryFee: product.deliveryFee?.toLocaleString() ?? "",
  type: product.type ?? "",
  section: (product.section ?? "") as SectionOption,
  tagsInput: product.tags?.join(", ") ?? "",
  specCamera: product.specs?.camera ?? "",
  specBattery: product.specs?.battery ?? "",
  specScreenSize: product.specs?.screenSize ?? "",
});

// ── 6-image builder: reads product.images[0..5] ───────────────────────────────
const buildImages = (product: Product): (string | null)[] =>
  Array(4)
    .fill(null)
    .map((_, i) => product.images?.[i] ?? null);

// ── Main Component ────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin, can } = usePermission();
  const { message: permMsg, deny, clear: clearPerm } = usePermissionToast();

  const canEdit = isAdmin || can("products", "editProducts");
  const canDelete = isAdmin || can("products", "deleteProducts");

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productService
      .getBySlug(slug)
      .then((data) => {
        setProduct(data);
        setForm(buildForm(data));
        setImages(buildImages(data));
        setFeatures(data.features?.length ? data.features : [""]);
        setVariants(data.variants?.map(toVariantDraft) ?? []);
      })
      .catch(() => setFetchError("Could not load product. Please try again."))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVariantIdx, setDeletingVariantIdx] = useState<number | null>(
    null,
  );
  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  const [features, setFeatures] = useState<string[]>([""]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [form, setForm] = useState<ReturnType<typeof buildForm>>({
    name: "",
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "",
    deliveryFee: "",
    type: "",
    section: "",
    tagsInput: "",
    specCamera: "",
    specBattery: "",
    specScreenSize: "",
  });

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const variantFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Loading / error guards ──────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading product…</span>
      </div>
    );

  if (fetchError || !product)
    return (
      <div className="text-foreground p-4 sm:p-8">
        <p className="mb-4 text-destructive">
          {fetchError ?? "Product not found."}
        </p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft size={16} /> Go Back
        </Button>
      </div>
    );

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatNum = (v: string) => {
    const n = v.replace(/[^0-9]/g, "");
    return n ? Number(n).toLocaleString() : "";
  };
  const handleChange = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCancel = () => {
    setForm(buildForm(product));
    setFeatures(product.features?.length ? product.features : [""]);
    setImages(buildImages(product));
    setVariants(product.variants?.map(toVariantDraft) ?? []);
    setDeletedVariantIds([]);
    setIsEditing(false);
    setOpenDropdown(null);
    setSaveError(null);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await productService.delete(product._id);
      navigate(-1);
    } catch {
      setSaveError("Failed to delete product. Please try again.");
    }
  };

  // ── Image handling ──────────────────────────────────────────────────────────
  const handleImageClick = (i: number) => {
    if (!isEditing) return;
    fileInputRefs.current[i]?.click();
  };
  const handleImageChange = (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setImages((prev) => {
        const next = [...prev];
        next[i] = reader.result as string;
        return next;
      });
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const handleRemoveImage = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  };

  // ── Feature helpers ─────────────────────────────────────────────────────────
  const addFeature = () => setFeatures((p) => [...p, ""]);
  const updateFeature = (i: number, val: string) =>
    setFeatures((p) => {
      const n = [...p];
      n[i] = val;
      return n;
    });
  const removeFeature = (i: number) =>
    setFeatures((p) => p.filter((_, idx) => idx !== i));

  // ── Variant helpers ─────────────────────────────────────────────────────────
  const addVariant = () =>
    setVariants((p) => [...p, emptyVariantDraft(product._id)]);
  const updateVariant = (
    i: number,
    field: keyof VariantDraft,
    value: string | boolean,
  ) =>
    setVariants((p) => {
      const next = [...p];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  const formatVariantPrice = (
    i: number,
    field: "price" | "compare_at_price",
    raw: string,
  ) => updateVariant(i, field, formatNum(raw));
  const handleRemoveVariant = (i: number) => {
    const v = variants[i];
    if (!v.isNew && v.id) setDeletedVariantIds((p) => [...p, v.id]);
    setVariants((p) => p.filter((_, idx) => idx !== i));
    setDeletingVariantIdx(null);
  };

  // ── Dropdown helpers ────────────────────────────────────────────────────────
  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) return;
    setOpenDropdown((p) => (p === name ? null : name));
  };
  const closeAllDropdowns = () => setOpenDropdown(null);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canEdit) {
      deny(
        "You don't have permission to edit products. Ask your admin to enable 'Edit Products'.",
      );
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      // Build the images array from all 6 slots, filtering nulls
      const imagesArray = images.filter((img): img is string => !!img);

      await productService.patch(product._id, {
        name: form.name,
        category: form.category,
        brand: form.brand,
        condition: form.condition,
        description: form.description || undefined,
        type: form.type || undefined,
        section: form.section || undefined,
        images: imagesArray.length ? imagesArray : undefined,
        deliveryFee: form.deliveryFee
          ? Number(form.deliveryFee.replace(/[^0-9]/g, ""))
          : undefined,
        features: features.filter((f) => f.trim()),
        tags: form.tagsInput
          ? form.tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        specs: {
          camera: form.specCamera || undefined,
          battery: form.specBattery || undefined,
          screenSize: form.specScreenSize || undefined,
        },
      });

      await Promise.all(
        deletedVariantIds.map((vid) => variantService.delete(vid)),
      );
      await Promise.all(
        variants.map((v) => {
          const shared = {
            color: v.color || undefined,
            storage: v.storage || undefined,
            image: v.image || undefined,
            ram: v.ram || undefined,
            sku: v.sku,
            price: Number(v.price.replace(/[^0-9]/g, "")),
            compare_at_price: v.compare_at_price
              ? Number(v.compare_at_price.replace(/[^0-9]/g, ""))
              : undefined,
            stock: Number(v.stock),
            is_active: v.is_active,
          };
          return v.isNew
            ? variantService.create({ productId: product._id, ...shared })
            : variantService.update(v.id, shared);
        }),
      );

      setSaveSuccess(true);
      // Re-fetch so Cancel reverts to the just-saved data, not the original load
      productService.getBySlug(slug!).then((fresh) => {
        setProduct(fresh);
        setVariants(fresh.variants?.map(toVariantDraft) ?? []);
      });

      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
        setDeletedVariantIds([]);
      }, 1500);
    } catch (err: any) {
      setSaveError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Shared CSS ──────────────────────────────────────────────────────────────
  const lavInput =
    "w-full bg-lavender text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const mintInput =
    "w-full bg-mint text-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const dropBtnCls =
    "w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center";

  // ── Dropdown sub-component ──────────────────────────────────────────────────
  const Dropdown = ({
    name,
    value,
    options,
    field,
  }: {
    name: string;
    value: string;
    options: string[];
    field: keyof typeof form;
  }) => (
    <div className="relative">
      <button
        onClick={(e) => toggleDropdown(name, e)}
        style={{ cursor: isEditing ? "pointer" : "default" }}
        className={dropBtnCls}
      >
        {value || <span className="text-muted-foreground">Select…</span>}
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${openDropdown === name ? "rotate-180" : ""}`}
        />
      </button>
      {isEditing && openDropdown === name && (
        <div
          className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-20 max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                handleChange(field, opt);
                setOpenDropdown(null);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-lavender/50 ${
                value === opt
                  ? "text-primary font-medium"
                  : "text-popover-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const SectionDropdown = () => (
    <div className="relative">
      <button
        onClick={(e) => toggleDropdown("section", e)}
        style={{ cursor: isEditing ? "pointer" : "default" }}
        className={dropBtnCls}
      >
        {form.section || <span className="text-muted-foreground">None</span>}
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${openDropdown === "section" ? "rotate-180" : ""}`}
        />
      </button>
      {isEditing && openDropdown === "section" && (
        <div
          className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleChange("section", "");
              setOpenDropdown(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-lavender/50"
          >
            None
          </button>
          {sectionOptions.map((sec) => (
            <button
              key={sec}
              onClick={() => {
                handleChange("section", sec);
                setOpenDropdown(null);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-lavender/50 ${
                form.section === sec
                  ? "text-primary font-medium"
                  : "text-popover-foreground"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const PlainField = ({
    field,
    bg = "bg-lavender",
    fg = "text-lavender-foreground",
    type = "text",
  }: {
    field: keyof typeof form;
    bg?: string;
    fg?: string;
    type?: string;
  }) =>
    isEditing ? (
      <input
        type={type}
        value={String(form[field])}
        onChange={(e) => handleChange(field, e.target.value)}
        className={`w-full ${bg} ${fg} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
      />
    ) : (
      <div className={`w-full ${bg} ${fg} rounded-lg p-3 text-sm`}>
        {String(form[field]) || (
          <span className="text-muted-foreground/60">—</span>
        )}
      </div>
    );

  const PriceField = ({ field }: { field: "deliveryFee" }) =>
    isEditing ? (
      <input
        type="text"
        value={form[field] ? `₦${form[field]}` : ""}
        placeholder="₦0"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          setForm((p) => ({
            ...p,
            [field]: raw ? Number(raw).toLocaleString() : "",
          }));
        }}
        className={lavInput}
      />
    ) : (
      <div className={lavInput}>{form[field] ? `₦${form[field]}` : "—"}</div>
    );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div onClick={closeAllDropdowns}>
      {permMsg && <PermissionToast message={permMsg} onClose={clearPerm} />}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg sm:text-2xl font-semibold text-foreground">
            Product Information
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Delete */}
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 ${
              canDelete
                ? "text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground border-border opacity-50 cursor-not-allowed"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!canDelete) {
                deny(
                  "You don't have permission to delete products. Ask your admin to enable 'Delete Products'.",
                );
                return;
              }
              setShowDeleteModal(true);
            }}
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </Button>

          {/* Edit / Cancel */}
          {isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          ) : (
            <Button
              size="sm"
              className={`gap-1 ${
                canEdit
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
              }`}
              onClick={() => {
                if (!canEdit) {
                  deny(
                    "You don't have permission to edit products. Ask your admin to enable 'Edit Products'.",
                  );
                  return;
                }
                setIsEditing(true);
              }}
            >
              <Edit size={14} />
              <span className="hidden sm:inline">
                {canEdit ? "Edit Product" : "View Only"}
              </span>
              <span className="sm:hidden">{canEdit ? "Edit" : "View"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <X size={15} className="flex-shrink-0" />
          {saveError}
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="ml-auto hover:opacity-70"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── 6-image grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6">
        {Array(6)
          .fill(null)
          .map((_, i) => {
            const img = images[i];
            return (
              <div key={i} className="relative aspect-square">
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
                  className={`w-full h-full rounded-lg flex flex-col items-center justify-center overflow-hidden transition-colors ${
                    img
                      ? "bg-secondary border border-border"
                      : isEditing
                        ? "border-2 border-dashed border-border bg-card hover:border-primary cursor-pointer"
                        : "border-2 border-dashed border-border bg-card"
                  } ${isEditing && img ? "cursor-pointer hover:opacity-80" : ""}`}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`Product ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Plus size={16} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {i === 0 ? "Main" : i === 1 ? "Alt" : `Img ${i + 1}`}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && img && (
                  <button
                    onClick={(e) => handleRemoveImage(i, e)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:opacity-80 z-10"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          })}
      </div>

      {/* ── Per-slot image URL inputs ───────────────────────────────── */}
      <div className="mb-7">
        <h2 className="text-base font-medium text-foreground mb-1">
          Image URLs
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Uploads above fill these automatically. You can also paste URLs
          directly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <div key={i}>
                <label className="text-xs text-muted-foreground block mb-1">
                  {i === 0
                    ? "Image 1 — Main"
                    : i === 1
                      ? "Image 2 — Hover"
                      : `Image ${i + 1}`}
                  {i === 0 && (
                    <span className="text-destructive ml-1">Required</span>
                  )}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="https://…"
                    value={images[i] ?? ""}
                    onChange={(e) =>
                      setImages((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value || null;
                        return next;
                      })
                    }
                    className={lavInput}
                  />
                ) : (
                  <div className={`${lavInput} truncate text-xs`}>
                    {images[i] || (
                      <span className="text-muted-foreground/50 italic">
                        Empty
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* ── Basic Info ─────────────────────────────────────────────── */}
      <div className="mb-7">
        <h2 className="text-base font-medium text-foreground mb-3">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Name
            </label>
            <PlainField field="name" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Category
            </label>
            <Dropdown
              name="category"
              value={form.category}
              options={categories}
              field="category"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Brand
            </label>
            <Dropdown
              name="brand"
              value={form.brand}
              options={brands}
              field="brand"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Condition
            </label>
            <Dropdown
              name="condition"
              value={form.condition}
              options={conditions}
              field="condition"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Section
            </label>
            <SectionDropdown />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Type{" "}
              <span className="text-muted-foreground/60">
                (e.g. smartphone)
              </span>
            </label>
            <PlainField field="type" />
          </div>
        </div>
      </div>

      {/* ── Description ────────────────────────────────────────────── */}
      <div className="mb-7">
        <label className="text-xs text-muted-foreground block mb-1">
          Product Description <span className="text-destructive">Required</span>
        </label>
        {isEditing ? (
          <textarea
            value={form.description}
            rows={4}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        ) : (
          <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm min-h-[90px]">
            {form.description || (
              <span className="text-muted-foreground/60">—</span>
            )}
          </div>
        )}
      </div>

      {/* ── Key Features ───────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-foreground">
            Key Features
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={14} /> Add Feature
            </button>
          )}
        </div>
        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">
                {i + 1}.
              </span>
              {isEditing ? (
                <input
                  type="text"
                  placeholder={`Feature ${i + 1}…`}
                  value={feature}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className={lavInput}
                />
              ) : (
                <div className={lavInput}>
                  {feature || (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </div>
              )}
              {isEditing && features.length > 1 && (
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

      {/* ── Specifications ─────────────────────────────────────────── */}
      <div className="mb-7">
        <h2 className="text-base font-medium text-foreground mb-3">
          Specifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Screen Size
            </label>
            <PlainField
              field="specScreenSize"
              bg="bg-mint"
              fg="text-mint-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Camera
            </label>
            <PlainField
              field="specCamera"
              bg="bg-mint"
              fg="text-mint-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Battery
            </label>
            <PlainField
              field="specBattery"
              bg="bg-mint"
              fg="text-mint-foreground"
            />
          </div>
        </div>
      </div>

      {/* ── Tags ───────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h2 className="text-base font-medium text-foreground mb-1">Tags</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Separate multiple values with commas.
        </p>
        <div>
          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Tag size={12} /> Tags
          </label>
          {isEditing ? (
            <input
              type="text"
              placeholder="Flagship, UK Used…"
              value={form.tagsInput}
              onChange={(e) => handleChange("tagsInput", e.target.value)}
              className={lavInput}
            />
          ) : (
            <div className={lavInput}>{form.tagsInput || "—"}</div>
          )}
          {form.tagsInput && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Variants ───────────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-foreground">Variants</h2>
          {isEditing && (
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={14} /> Add Variant
            </button>
          )}
        </div>

        {variants.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed border-border rounded-lg">
            {isEditing ? (
              <>
                No variants. Click{" "}
                <span className="text-primary font-medium">+ Add Variant</span>{" "}
                to add one.
              </>
            ) : (
              "No variants configured for this product."
            )}
          </p>
        )}

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className="p-3 sm:p-4 bg-card border border-border rounded-xl"
            >
              {/* Variant header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Variant {i + 1}
                  </span>
                  {v.isNew && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={v.is_active}
                    onClick={() =>
                      isEditing && updateVariant(i, "is_active", !v.is_active)
                    }
                    style={{ cursor: isEditing ? "pointer" : "default" }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${v.is_active ? "bg-primary" : "bg-border"}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${v.is_active ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>
                  <span
                    className={`text-xs hidden sm:inline ${v.is_active ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {v.is_active ? "Active" : "Inactive"}
                  </span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setDeletingVariantIdx(i)}
                      className="w-6 h-6 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors ml-1"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Color / RAM / Storage */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                {(["color", "ram", "storage"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground block mb-1 capitalize">
                      {field}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder={
                          field === "color"
                            ? "e.g. Black"
                            : field === "ram"
                              ? "e.g. 8GB"
                              : "e.g. 256GB"
                        }
                        value={v[field]}
                        onChange={(e) =>
                          updateVariant(i, field, e.target.value)
                        }
                        className={lavInput}
                      />
                    ) : (
                      <div className={lavInput}>{v[field] || "—"}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Variant Image */}
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
                    onClick={() =>
                      isEditing && variantFileInputRefs.current[i]?.click()
                    }
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      v.image
                        ? "border-primary bg-secondary"
                        : isEditing
                          ? "border-dashed border-border bg-card hover:border-primary cursor-pointer"
                          : "border-dashed border-border bg-card"
                    } ${isEditing && v.image ? "cursor-pointer hover:opacity-80" : ""}`}
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
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="Or paste image URL…"
                        value={v.image}
                        onChange={(e) =>
                          updateVariant(i, "image", e.target.value)
                        }
                        className={lavInput}
                      />
                    ) : (
                      <div className={`${lavInput} truncate text-xs`}>
                        {v.image || (
                          <span className="text-muted-foreground/50 italic">
                            No variant image set
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clear button */}
                  {isEditing && v.image && (
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

              {/* SKU / Price / Compare / Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    SKU <span className="text-destructive">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="APL-IP15-BLK"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      className={lavInput}
                    />
                  ) : (
                    <div className={lavInput}>{v.sku || "—"}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Price <span className="text-destructive">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="₦0"
                      value={v.price ? `₦${v.price}` : ""}
                      onChange={(e) =>
                        formatVariantPrice(
                          i,
                          "price",
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      className={lavInput}
                    />
                  ) : (
                    <div className={lavInput}>
                      {v.price ? `₦${v.price}` : "—"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Compare At
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="₦0"
                      value={v.compare_at_price ? `₦${v.compare_at_price}` : ""}
                      onChange={(e) =>
                        formatVariantPrice(
                          i,
                          "compare_at_price",
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      className={mintInput}
                    />
                  ) : (
                    <div className={mintInput}>
                      {v.compare_at_price ? `₦${v.compare_at_price}` : "—"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Stock
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, "stock", e.target.value)
                      }
                      className={mintInput}
                    />
                  ) : (
                    <div className={mintInput}>{v.stock || "0"}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Delivery Fee ───────────────────────────────────────────── */}
      <div className="mb-7">
        <h2 className="text-base font-medium text-foreground mb-3">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Delivery Fee
            </label>
            <PriceField field="deliveryFee" />
          </div>
        </div>
      </div>

      {/* ── Footer save ────────────────────────────────────────────── */}
      {isEditing && (
        <>
          <div className="hidden sm:flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={`gap-1 disabled:opacity-60 text-primary-foreground ${saveSuccess ? "bg-green-500 hover:bg-green-500" : "bg-primary hover:opacity-90"}`}
            >
              {saveSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : isSaving ? (
                "Saving…"
              ) : (
                <>
                  <Plus size={16} /> Save Changes
                </>
              )}
            </Button>
          </div>
          {/* Mobile sticky footer */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-20 shadow-lg">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full gap-1 disabled:opacity-60 text-primary-foreground ${saveSuccess ? "bg-green-500 hover:bg-green-500" : "bg-primary hover:opacity-90"}`}
            >
              {saveSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : isSaving ? (
                "Saving…"
              ) : (
                <>
                  <Check size={16} /> Save Changes
                </>
              )}
            </Button>
          </div>
          <div className="sm:hidden h-20" />
        </>
      )}

      {/* Modals */}
      <DeleteConfirmModal
        open={showDeleteModal}
        name={product.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <DeleteVariantModal
        open={deletingVariantIdx !== null}
        sku={
          deletingVariantIdx !== null
            ? variants[deletingVariantIdx]?.sku ||
              `Variant ${deletingVariantIdx + 1}`
            : ""
        }
        onConfirm={() =>
          deletingVariantIdx !== null && handleRemoveVariant(deletingVariantIdx)
        }
        onCancel={() => setDeletingVariantIdx(null)}
      />
    </div>
  );
};

export default ProductDetailPage;
