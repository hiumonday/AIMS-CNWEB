import { useEffect, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import type { Product } from "../types";
import "./ProductDetail.css";
import { useCart } from "../context/CartContext";

const ViewProductDetail: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Missing product id");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await getProductById(id);
        if (res) {
          setProduct(res);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        const message =
          (err as any)?.message || (typeof err === "string" ? err : null);
        setError(message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  const [qty, setQty] = useState<number>(1);
  const total = product ? (product.price * qty).toFixed(2) : "0.00";

  const formatVnd = (value?: number) => {
    if (value === null || value === undefined) return undefined;
    return `${value.toLocaleString("vi-VN")} VND`;
  };

  const changeQty = (delta: number) => {
    setQty(current => Math.max(1, Math.min(99, current + delta)));
  };

  const addToCart = () => {
    if (!product) return;
    addItem(product.id, qty);
    alert(`Added ${qty} of "${product.title}" to cart.`);
  };

  const formatDetailValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (Array.isArray(value)) {
      if (value.length === 0) return "N/A";
      return value
        .map((entry) => {
          if (typeof entry === "string" || typeof entry === "number") {
            return String(entry);
          }
          if (entry && typeof entry === "object") {
            const title = (entry as { title?: unknown }).title;
            const length = (entry as { length?: unknown }).length;
            if (title && length) return `${title} (${length})`;
            if (title) return String(title);
            if (length) return String(length);
            return JSON.stringify(entry);
          }
          return String(entry);
        })
        .join(", ");
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const renderDetailRows = (
    rows: Array<{ label: string; value: unknown }>
  ) =>
    rows.map((row) => (
      <div className="detail-row" key={row.label}>
        <span>{row.label}:</span>
        <span>{formatDetailValue(row.value)}</span>
      </div>
    ));

  const formatAttributeLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (loading) {
    return (
      <div className="content">
        <p className="muted">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="content">
        <p className="muted">{error || "Product not found"}</p>
        <button className="btn light" type="button" onClick={() => navigate("/products")}>
          Back to list
        </button>
      </div>
    );
  }

  const typeLabel = product.typeCode || product.category;
  const categoryLabel = product.categoryName || product.genre || product.category;
  const priceLabel = formatVnd(product.currentPrice);
  const originalPriceLabel = formatVnd(product.originalValue);

  const baseRows = [
    { label: "Type", value: typeLabel },
    { label: "Status", value: product.status },
    { label: "Barcode", value: product.barcode },
    { label: "Category", value: categoryLabel },
    { label: "Condition", value: product.conditionLabel },
    { label: "Return Policy", value: product.returnPolicy },
    { label: "Height", value: product.dimensions?.height },
    { label: "Width", value: product.dimensions?.width },
    { label: "Length", value: product.dimensions?.length },
    { label: "Weight", value: product.dimensions?.weight },
    { label: "Original Value", value: originalPriceLabel },
    { label: "Current Price", value: priceLabel },
  ].filter((row) => row.value !== undefined && row.value !== null && row.value !== "");

  const attributeRows =
    product.attributes && Object.keys(product.attributes).length > 0
      ? Object.entries(product.attributes)
          .filter(([, value]) => value !== undefined && value !== null && value !== "")
          .map(([key, value]) => ({
            label: formatAttributeLabel(key),
            value,
          }))
      : [];

  const legacyDetailRows =
    product.details && Object.keys(product.details).length > 0
      ? Object.entries(product.details).map(([key, value]) => ({
          label: formatAttributeLabel(key),
          value,
        }))
      : [];

  const detailRows = attributeRows.length > 0 ? attributeRows : legacyDetailRows;

  return (
    <div className="content">
      <div className="back-row">
        <button className="back-link" type="button" onClick={() => navigate(-1)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Back to Products</span>
        </button>
      </div>

      <div className="product-shell">
        <div className="product__image-card">
          <img src={product.imageUrl} alt={product.title} />
        </div>

        <div className="product__info-card">
          <span className="pill">{typeLabel}</span>
          <h1 className="title">{product.title}</h1>
          <p className="category">{categoryLabel}</p>
          <div className="price-main">${product.price.toFixed(2)}</div>
          {priceLabel && <p className="muted small">{priceLabel}</p>}
          <p className="stock">Stock available: {product.stock} units</p>
          <p className="desc muted">{product.shortDesc}</p>

          <div className="details-card">
            <h3>Product Details</h3>
            {renderDetailRows(baseRows)}
          </div>
          {detailRows.length > 0 && (
            <div className="details-card">
              <h3>Attributes</h3>
              {renderDetailRows(detailRows)}
            </div>
          )}

          <div className="cart-card">
            <h3>Add to Cart</h3>
            <div className="cart-row">
              <div className="qty-control">
                <button onClick={() => changeQty(-1)} aria-label="Decrease quantity" type="button">
                  -
                </button>
                <span>{qty}</span>
                <button onClick={() => changeQty(1)} aria-label="Increase quantity" type="button">
                  +
                </button>
              </div>
              <div className="total">Total: ${total}</div>
            </div>
            <button className="btn primary block cart-button" onClick={addToCart} type="button">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l1.68 10.06a2 2 0 0 0 2 1.69h7.72a2 2 0 0 0 2-1.69l.6-4.06H6" />
              </svg>
              Add to Cart
            </button>
            <div className="action-row">
              <button className="btn light" type="button" onClick={() => navigate('/products')}>
                Back to list
              </button>
              <button className="btn light" type="button" onClick={() => navigate('/cart')}>
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductDetail;
