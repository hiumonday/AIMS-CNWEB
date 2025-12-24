import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { listProducts } from "../services/productService";
import type { ListParams } from "../services/productService";
import type { Category, Product } from "../types";
import "./ProductListPage.css";

type SortKey = "title" | "price-asc" | "price-desc";
type PriceRange = NonNullable<ListParams["priceRange"]>;
type PriceBand = "all" | PriceRange;

const itemsPerPage = 12;

const categories: Array<Category | "All"> = [
  "All",
  "Book",
  "CD",
  "Newspaper",
  "DVD",
];

const priceRanges: Array<{ label: string; value: PriceBand }> = [
  { label: "All Prices", value: "all" },
  { label: "Under 200k", value: "0-200000" },
  { label: "200k - 500k", value: "200000-500000" },
  { label: "Over 500k", value: "500000+" },
];

function priceBandToRange(band: PriceBand): { minPrice?: number; maxPrice?: number } {
  if (!band || band === "all") return { minPrice: undefined, maxPrice: undefined };
  if (band.includes("-")) {
    const [a, b] = band.split("-");
    return { minPrice: Number(a) || undefined, maxPrice: Number(b) || undefined };
  }
  if (band.endsWith("+")) {
    return { minPrice: Number(band.slice(0, -1)) || undefined, maxPrice: undefined };
  }
  return { minPrice: undefined, maxPrice: undefined };
}

function sortKeyToParam(sort: SortKey): "title" | "priceAsc" | "priceDesc" {
  switch (sort) {
    case "price-asc": return "priceAsc";
    case "price-desc": return "priceDesc";
    default: return "title";
  }
}

function formatVnd(value?: number): string {
  if (value == null || isNaN(value)) return "";
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  } catch {
    return `${value.toLocaleString()} VND`;
  }
}

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = (searchParams.get("category") as Category | null) || "All";
  const initialQuery = searchParams.get("query") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<Category | "All">(initialCategory);
  const [sort, setSort] = useState<SortKey>("title");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [priceBand, setPriceBand] = useState<PriceBand>("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  useEffect(() => {
    setCategory(initialCategory);
    setPage(1);
  }, [initialCategory]);

  useEffect(() => {
    setSearch(initialQuery);
    setPage(1);
  }, [initialQuery]);

  useEffect(() => {
    const { minPrice, maxPrice } = priceBandToRange(priceBand);
    const priceRange: ListParams["priceRange"] =
      priceBand === "all" ? undefined : priceBand;
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
        if (result.page !== page) setPage(result.page);
      })
      .catch((err) => {
        const message = (err as any)?.message || "Unable to load products.";
        setError(message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [page, category, search, priceBand, sort, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleCategoryChange = (value: Category | "All") => {
    setCategory(value);
    setPage(1);
    const path = value === "All" ? "/products" : `/products?category=${value}`;
    navigate(path, { replace: true });
  };

  const handleAddToCart = (item: Product) => {
    addItem(item.id, quantities[item.id] || 1);
  };

  return (
    <main className="landing products-page">
      {/* Decorative Snowflakes */}
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❅</div>

      <section className="products-hero theme--xmas">
        <div className="products-hero__content">
          <div className="theme__eyebrow">AIMS STORE · HOLIDAY SPECIAL</div>
          <h1>Quà tặng mùa lễ hội</h1>
          <p>Bộ sưu tập được tuyển chọn kỹ lưỡng cho mùa Giáng sinh an lành.</p>

          <div className="filters-bar">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="select-group">
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value as Category | "All")}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === "All" ? "Tất cả" : cat}</option>
                ))}
              </select>

          <select
            value={priceBand}
            onChange={(e) => {
              setPriceBand(e.target.value as PriceBand);
              setPage(1);
            }}
          >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>

              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="title">Tên: A-Z</option>
                <option value="price-asc">Giá: Thấp - Cao</option>
                <option value="price-desc">Giá: Cao - Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="products-listing">
        {loading && <div className="state-message">Đang tải dữ liệu...</div>}
        {!loading && error && <div className="state-message error">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="state-message">Không tìm thấy sản phẩm phù hợp.</div>
        )}

        {!loading && !error && (
          <div className="grid">
            {products.map((item) => {
              const typeLabel = item.typeCode || item.category;
              const priceLabel = formatVnd(item.currentPrice);
              const currentQty = quantities[item.id] || 1;

              return (
                <article key={item.id} className="card product-card">
                  <div className="product-card__media">
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    <span className="product-badge">{typeLabel}</span>
                    {item.stock < 5 && <span className="stock-warning">Sắp hết!</span>}
                  </div>

                  <div className="card__body product-card__body">
                    <h3>
                      <Link to={`/product/${item.id}`}>{item.title}</Link>
                    </h3>
                    <div className="product-meta">
                      <span className="price">{priceLabel || `${item.price.toLocaleString()} VND`}</span>
                      <span className="stock-info">Kho: {item.stock}</span>
                    </div>

                    <div className="product-footer">
                      {/* Bộ điều chỉnh số lượng */}
                      <div className="qty-control">
                        <button onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) }))}>-</button>
                        <span>{currentQty}</span>
                        <button onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.min(item.stock, (prev[item.id] || 1) + 1) }))}>+</button>
                      </div>

                      {/* Nút hành động */}
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-cart"
                          onClick={() => handleAddToCart(item)}
                          title="Thêm vào giỏ hàng"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l1.68 10.06a2 2 0 0 0 2 1.69h7.72a2 2 0 0 0 2-1.69l.6-4.06H6" />
                          </svg>
                        </button>

                        <Link
                          to={`/product/${item.id}`}
                          className="btn-icon btn-view"
                          title="Xem chi tiết"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="pagination">
          <button
            className="btn light"
            disabled={loading || page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Trước
          </button>
          <span className="page-info">Trang {page} / {totalPages}</span>
          <button
            className="btn light"
            disabled={loading || page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Sau →
          </button>
        </div>
      </section>
    </main>
  );
};

export default ProductListPage;
