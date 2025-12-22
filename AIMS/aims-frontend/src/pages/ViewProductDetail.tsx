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

  const changeQty = (delta: number) => {
    setQty(current => Math.max(1, Math.min(99, current + delta)));
  };

  const addToCart = () => {
    if (!product) return;
    addItem(product.id, qty);
    alert(`Added ${qty} of "${product.title}" to cart.`);
  };

  const renderDetailRows = (
    rows: Array<{ label: string; value: string | number | null | undefined }>
  ) =>
    rows.map((row) => {
      const value =
        Array.isArray(row.value) && row.value.length > 0
          ? row.value.join(", ")
          : row.value;
      return (
        <div className="detail-row" key={row.label}>
          <span>{row.label}:</span>
          <span>{value ?? "N/A"}</span>
        </div>
      );
    });

  const typeSpecific = () => {
    if (!product) return null;
    const d = product.details || {};
    switch (product.category) {
      case "Book":
        return renderDetailRows([
          { label: "Author(s)", value: d.author },
          { label: "Cover Type", value: d.coverType },
          { label: "Publisher", value: d.publisher },
          { label: "Publication Date", value: d.publishDate },
          { label: "Pages", value: d.pages },
          { label: "Language", value: d.language },
          { label: "Genre", value: product.genre },
        ]);
      case "Newspaper":
        return renderDetailRows([
          { label: "Editor-in-chief", value: d.editor },
          { label: "Publisher", value: d.publisher },
          { label: "Publication Date", value: d.issueDate },
          { label: "Issue Number", value: d.issueNumber },
          { label: "Frequency", value: d.frequency },
          { label: "Sections", value: d.sections },
          { label: "Language", value: d.language },
          { label: "Genre/Section", value: product.genre },
        ]);
      case "CD":
        return renderDetailRows([
          { label: "Artist(s)", value: d.artist },
          { label: "Record Label", value: d.label },
          { label: "Disc Type", value: d.discType },
          { label: "Tracks", value: d.tracks },
          { label: "Track List", value: d.trackList },
          { label: "Release Date", value: d.release },
          { label: "Genre", value: product.genre },
        ]);
      case "DVD":
        return renderDetailRows([
          { label: "Disc Type", value: d.discType },
          { label: "Director", value: d.director },
          { label: "Runtime", value: d.runtime },
          { label: "Studio", value: d.studio },
          { label: "Language", value: d.language },
          { label: "Subtitles", value: d.subtitles },
          { label: "Release Date", value: d.release },
          { label: "Genre", value: product.genre },
        ]);
      default:
        return null;
    }
  };

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
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product__info-card">
          <span className="pill">{product.category}</span>
          <h1 className="title">{product.title}</h1>
          <p className="category">{product.genre}</p>
          <div className="price-main">${product.price.toFixed(2)}</div>
          <p className="stock">Stock available: {product.stock} units</p>
          <p className="desc muted">{product.shortDesc}</p>

          <div className="details-card">
            <h3>Product Details</h3>
            {typeSpecific()}
          </div>

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
