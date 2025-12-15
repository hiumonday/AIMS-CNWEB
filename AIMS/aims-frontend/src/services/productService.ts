import { apiClient } from "./api";

import type { Paginated, Product, Category } from "../types";

const PRICE_DIVISOR = 1000;

// Backend response types
type BackendProduct = {
  id: number;
  productType: "BOOK" | "CD" | "NEWSPAPER" | "DVD";
  status: string;
  barcode: string;
  title: string;
  category: string;
  conditionLabel: string;
  dominantColor?: string;
  returnPolicy?: string;
  height?: number;
  width?: number;
  length?: number;
  weight?: number;
  originalValue: number;
  currentPrice: number;
  stock: number;
  bookDetail?: {
    id: number;
    authors?: string;
    coverType?: string;
    publisher?: string;
    publishDate?: string;
    pageCount?: number;
    language?: string;
    genre?: string;
  };
  newspaperDetail?: {
    id: number;
    editorInChief?: string;
    publisher?: string;
    issueDate?: string; // legacy field
    publishDate?: string; // current API field
    issueNumber?: string;
    issn?: string;
    frequency?: string;
    sections?: string;
    language?: string;
    genre?: string;
  };
  cdDetail?: {
    id: number;
    artist?: string;
    recordLabel?: string;
    releaseDate?: string;
    trackCount?: number; // not present in current API, keep for compatibility
    tracks?: string; // comma-separated from backend
    tracksList?: string; // compatibility alias
    discType?: string; // not present in current API, default Unknown
    genre?: string;
  };
  dvdDetail?: {
    id: number;
    director?: string;
    studio?: string;
    releaseDate?: string;
    runtimeMinutes?: number;
    runtime?: number; // compatibility
    discType?: string;
    language?: string;
    subtitles?: string;
    genre?: string;
  };
};

type BackendResponse = {
  success?: boolean;
  message?: string;
  data: {
    items: BackendProduct[];
    page: number;
    size?: number;
    limit?: number;
    totalElements?: number;
    totalItems?: number;
    totalPages?: number;
    total?: number;
    count?: number;
  };
};

// Map backend product type to frontend Category
const typeToCategory: Record<BackendProduct["productType"], Category> = {
  BOOK: "Book",
  CD: "CD",
  NEWSPAPER: "Newspaper",
  DVD: "DVD",
};

const categoryToProductType: Record<Category, BackendProduct["productType"]> = {
  Book: "BOOK",
  CD: "CD",
  Newspaper: "NEWSPAPER",
  DVD: "DVD",
};

// Map backend product to frontend Product model
function mapBackendProduct(p: BackendProduct): Product {
  const category = typeToCategory[p.productType] || "Book";

  // Extract genre from the appropriate detail object
  const genre =
    p.bookDetail?.genre ||
    p.cdDetail?.genre ||
    p.dvdDetail?.genre ||
    p.newspaperDetail?.genre ||
    p.category || // fallback to backend category field
    "General";

  // Build details object based on product type
  let details: Record<string, string | number> = {};

  if (p.bookDetail) {
    details = {
      author: p.bookDetail.authors || "Unknown",
      publisher: p.bookDetail.publisher || "Unknown",
      pages: p.bookDetail.pageCount || 0,
      language: p.bookDetail.language || "Unknown",
      publishDate: p.bookDetail.publishDate || "Unknown",
      coverType: p.bookDetail.coverType || "Unknown",
    };
  } else if (p.cdDetail) {
    const trackListString =
      p.cdDetail.tracksList || p.cdDetail.tracks || "Unknown";
    const trackCount =
      p.cdDetail.trackCount ||
      (p.cdDetail.tracks || "").split(",").filter((t) => t.trim()).length ||
      0;
    details = {
      artist: p.cdDetail.artist || "Unknown",
      label: p.cdDetail.recordLabel || "Unknown",
      tracks: trackCount,
      trackList: trackListString,
      discType: p.cdDetail.discType || "Unknown",
      release: p.cdDetail.releaseDate || "Unknown",
      genre: p.cdDetail.genre || genre,
    };
  } else if (p.dvdDetail) {
    details = {
      director: p.dvdDetail.director || "Unknown",
      studio: p.dvdDetail.studio || "Unknown",
      runtime: p.dvdDetail.runtimeMinutes
        ? `${p.dvdDetail.runtimeMinutes} min`
        : p.dvdDetail.runtime
        ? `${p.dvdDetail.runtime} min`
        : "Unknown",
      discType: p.dvdDetail.discType || "Unknown",
      language: p.dvdDetail.language || "Unknown",
      subtitles: p.dvdDetail.subtitles || "Unknown",
      release: p.dvdDetail.releaseDate || "Unknown",
      genre: p.dvdDetail.genre || genre,
    };
  } else if (p.newspaperDetail) {
    details = {
      editor: p.newspaperDetail.editorInChief || "Unknown",
      publisher: p.newspaperDetail.publisher || "Unknown",
      issueDate:
        p.newspaperDetail.publishDate ||
        p.newspaperDetail.issueDate ||
        "Unknown",
      issueNumber: p.newspaperDetail.issueNumber || "Unknown",
      genre: p.newspaperDetail.genre || p.newspaperDetail.sections || genre,
      issn: p.newspaperDetail.issn || "Unknown",
      frequency: p.newspaperDetail.frequency || "Unknown",
      sections: p.newspaperDetail.sections || "Unknown",
      language: p.newspaperDetail.language || "Unknown",
    };
  }

  return {
    id: String(p.id),
    title: p.title,
    category,
    genre,
    price: p.currentPrice / PRICE_DIVISOR, // Convert VND to USD (assuming 1:1000 conversion for display)
    stock: p.stock,
    image: `https://via.placeholder.com/400x300/${
      p.dominantColor?.toLowerCase().replace(/\s/g, "") || "cccccc"
    }/ffffff?text=${encodeURIComponent(p.title)}`,
    shortDesc:
      p.returnPolicy ||
      `${p.conditionLabel} condition, ${category.toLowerCase()} item`,
    details,
  };
}

export type ListParams = {
  page?: number;
  limit?: number;
  size?: number; // kept for compatibility with previous API
  query?: string;
  search?: string; // alias for query
  category?: Category | "All";
  minPrice?: number;
  maxPrice?: number;
  priceMin?: number; // compatibility alias
  priceMax?: number; // compatibility alias
  productType?: BackendProduct["productType"];
  sort?: "title" | "priceAsc" | "priceDesc";
};

function sortProducts(
  items: Product[],
  sort?: ListParams["sort"]
): Product[] {
  if (!sort) return items;
  const sorted = [...items];
  switch (sort) {
    case "priceAsc":
      return sorted.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return sorted.sort((a, b) => b.price - a.price);
    case "title":
    default:
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
}

export async function listProducts(
  params: ListParams = {}
): Promise<Paginated<Product>> {
  try {
    // Convert 1-based page to 0-based for backend
    const backendPage = Math.max(0, (params.page ?? 1) - 1);
    const pageSize = params.size ?? params.limit ?? 10;
    const query = params.query ?? params.search;
    const minPrice = params.minPrice ?? params.priceMin;
    const maxPrice = params.maxPrice ?? params.priceMax;
    const categoryFilter =
      params.category && params.category !== "All" ? params.category : undefined;
    const productType =
      params.productType ||
      (categoryFilter
        ? categoryToProductType[categoryFilter as Category]
        : undefined);

    const response = await apiClient.get<BackendResponse>("/products", {
      params: {
        page: backendPage,
        size: pageSize,
        query: query?.trim() || undefined,
        category: categoryFilter,
        minPrice,
        maxPrice,
        productType,
      },
    });
    console.log(
      "[productService] Đã kết nối backend thành công:",
      response.status,
      response.config?.url || "/products",
      "(baseURL:",
      apiClient.defaults.baseURL,
      ")"
    );

    const payload = response.data as BackendResponse;
    const apiData =
      payload?.data ??
      ({
        items: [],
        page: backendPage,
        size: pageSize,
      } as BackendResponse["data"]);

    const mappedItems = sortProducts(
      (apiData.items || []).map(mapBackendProduct),
      params.sort
    );

    const pageFromApi =
      typeof apiData.page === "number" ? apiData.page : backendPage;
    const sizeFromApi = apiData.size ?? apiData.limit ?? pageSize;
    const totalFromApi =
      apiData.totalElements ??
      apiData.totalItems ??
      apiData.total ??
      apiData.count ??
      mappedItems.length;

    return {
      items: mappedItems,
      page: pageFromApi + 1, // Convert 0-based to 1-based for frontend
      size: sizeFromApi,
      total: totalFromApi,
    };
  } catch (err) {
    console.error("[productService] Lỗi kết nối backend:", err);
    throw err;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await apiClient.get<BackendResponse>(`/products/${id}`);
    // Backend returns single product wrapped in same response structure
    const apiData = response.data.data;

    // If data is an object (single product), map it
    if (apiData && !Array.isArray(apiData)) {
      return mapBackendProduct(apiData as any);
    }

    // If data has items array, get first item
    if (
      apiData &&
      Array.isArray((apiData as any).items) &&
      (apiData as any).items.length > 0
    ) {
      return mapBackendProduct((apiData as any).items[0]);
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch product from API:", err);
    return null;
  }
}
