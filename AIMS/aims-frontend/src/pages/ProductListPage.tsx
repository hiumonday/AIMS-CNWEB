import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { listProducts } from "../services/productService";
import type { Category, Product } from "../types";
import "./ProductListPage.css";

type SortKey = "title" | "price-asc" | "price-desc";

const itemsPerPage = 9;
const categories: Array<Category | "All"> = [
  "All",
  "Book",
  "CD",
  "Newspaper",
  "DVD",
];
const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "0 - 200.000 VND", value: "0-200000" },
  { label: "200.000 - 500.000 VND", value: "200000-500000" },
  { label: "> 500.000 VND", value: "500000+" },
];

const sortKeyToParam = (key: SortKey) => {
  if (key === "price-asc") return "priceAsc";
  if (key === "price-desc") return "priceDesc";
  return "title";
};

const priceBandToRange = (
  band: string
): { minPrice?: number; maxPrice?: number } => {
  switch (band) {
    case "0-200000":
      return { minPrice: 0, maxPrice: 200000 };
    case "200000-500000":
      return { minPrice: 200000, maxPrice: 500000 };
    case "500000+":
      return { minPrice: 500000 };
    default:
      return {};
  }
};

const formatVnd = (value?: number) => {
  if (value === null || value === undefined) return undefined;
  return `${value.toLocaleString("vi-VN")} VND`;
};

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory =
    (searchParams.get("category") as Category | null) || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">(initialCategory);
  const [sort, setSort] = useState<SortKey>("title");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [priceBand, setPriceBand] = useState<string>("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  useEffect(() => {
    setCategory(initialCategory);
    setPage(1);
  }, [initialCategory]);

  useEffect(() => {
    const { minPrice, maxPrice } = priceBandToRange(priceBand);
    const priceRange = priceBand === "all" ? undefined : priceBand;

    setLoading(true);
    setError(null);

    listProducts({
      page,
      limit: pageSize,
      query: search.trim() || undefined,
      category,
      priceRange,
      minPrice,
      maxPrice,
      sort: sortKeyToParam(sort),
    })
      .then((result) => {
        setProducts(result.items);
        setTotal(result.total);
        setPageSize(result.size || itemsPerPage);
        if (result.page !== page) {
          setPage(result.page);
        }
      })
      .catch((err) => {
        const message =
          (err as any)?.message ||
          (typeof err === "string" ? err : "Unable to load products.");
        setError(message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [page, category, search, priceBand, sort, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleCategoryChange = (value: Category | "All") => {
    setCategory(value);
    setPage(1);
    if (value === "All") {
      navigate("/products", { replace: true });
    } else {
      navigate(`/products?category=${value}`, { replace: true });
    }
  };

  return (
    <main className="products-shell">
      <header className="products-header">
        <div>
          <h1>AIMS Store</h1>
          <p>
            Page {page} of {totalPages} | {total} products
          </p>
        </div>
        <div className="filters">
          <div className="search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search products by title or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value as Category | "All")
            }
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <select
            value={priceBand}
            onChange={(e) => {
              setPriceBand(e.target.value);
              setPage(1);
            }}
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="title">Title A-Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button
            className="nav__cart"
            type="button"
            onClick={() => navigate("/cart")}
          >
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
            <span>Cart</span>
          </button>
        </div>
      </header>

      <section className="grid">
        {loading && <p className="muted">Loading products...</p>}
        {!loading && error && <p className="muted">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="muted">No products found.</p>
        )}
        {!loading &&
          !error &&
          products.map((item) => {
            const typeLabel = item.typeCode || item.category;
            const categoryLabel = item.categoryName || item.category;
            const genreLabel =
              item.genre && item.genre !== categoryLabel ? item.genre : undefined;
            const priceLabel = formatVnd(item.currentPrice);

            return (
              <article key={item.id} className="card">
                <div className="card__img">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="card__body">
                  <span className="pill">{typeLabel}</span>
                  <h3>{item.title}</h3>
                  <p className="muted">{categoryLabel}</p>
                  {genreLabel && <p className="muted small">{genreLabel}</p>}
                  {item.barcode && (
                    <p className="muted small">Barcode: {item.barcode}</p>
                  )}
                  <p className="muted small">{item.shortDesc}</p>
                  <div className="card__meta">
                    <div>
                      <span className="price">${item.price.toFixed(2)}</span>
                      {priceLabel && (
                        <div className="muted small">{priceLabel}</div>
                      )}
                    </div>
                    <span className="stock">{item.stock} in stock</span>
                  </div>
                  <div className="card__actions">
                    <div className="qty-control small">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.stock}
                        value={quantities[item.id] || 1}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.max(
                              1,
                              Math.min(item.stock, Number(e.target.value) || 1)
                            ),
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.min(
                              item.stock,
                              (prev[item.id] || 1) + 1
                            ),
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn primary"
                      type="button"
                      onClick={() => addItem(item.id, quantities[item.id] || 1)}
                    >
                      Add to cart
                    </button>
                    <Link className="btn light" to={`/product/${item.id}`}>
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
      </section>

      <div className="pagination">
        <button
          type="button"
          disabled={loading || page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={loading || page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default ProductListPage;
