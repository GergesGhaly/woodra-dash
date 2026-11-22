import { getMockStore, updateMockStore } from "../src/data/mockStore";

const productListeners = new Set();

const notifyProductListeners = () => {
  productListeners.forEach((listener) => listener());
};

export const subscribeProducts = (listener) => {
  productListeners.add(listener);
  return () => productListeners.delete(listener);
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export const uploadProductImages = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }
  const urls = await Promise.all(Array.from(files).map(readFileAsDataUrl));
  return urls.filter(Boolean);
};

export const createProduct = async (product) => {
  const nowIso = new Date().toISOString();
  const newItem = {
    id: `prod-${Date.now()}`,
    title: (product.title || "").trim(),
    title_ar: (product.title_ar || "").trim(),
    description: (product.description || "").trim(),
    description_ar: (product.description_ar || "").trim(),
    category_id:
      product.category_id !== undefined &&
      product.category_id !== null &&
      product.category_id !== ""
        ? String(product.category_id)
        : null,
    price: Number(product.price) || 0,
    points: Number(product.points) || 0,
    active: typeof product.active === "boolean" ? product.active : true,
    images: Array.isArray(product.images) ? product.images : [],
    created_at: nowIso,
    updated_at: nowIso,
  };

  updateMockStore((store) => ({
    ...store,
    products: [newItem, ...store.products],
  }));

  notifyProductListeners();
  return [newItem];
};

export const getProducts = async () => {
  const { products } = getMockStore();
  return [...products].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dbTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dbTime - da;
  });
};

export const getProductById = async (id) => {
  const { products } = getMockStore();
  const found = products.find((p) => String(p.id) === String(id));
  return found ? { ...found } : null;
};

export const getProductsByCategoryId = async (categoryId) => {
  const { products } = getMockStore();
  return products.filter(
    (p) => String(p.category_id ?? "") === String(categoryId)
  );
};

export const deleteProduct = async (id) => {
  updateMockStore((store) => ({
    ...store,
    products: store.products.filter((p) => String(p.id) !== String(id)),
  }));
  notifyProductListeners();
};

export const updateProduct = async (id, updates) => {
  const nowIso = new Date().toISOString();
  let updatedItem = null;

  updateMockStore((store) => ({
    ...store,
    products: store.products.map((p) => {
      if (String(p.id) !== String(id)) return p;
      updatedItem = {
        ...p,
        ...updates,
        category_id:
          updates.category_id !== undefined
            ? updates.category_id !== null && updates.category_id !== ""
              ? String(updates.category_id)
              : null
            : p.category_id,
        price:
          updates.price !== undefined ? Number(updates.price) || 0 : p.price,
        points:
          updates.points !== undefined ? Number(updates.points) || 0 : p.points,
        updated_at: nowIso,
      };
      return updatedItem;
    }),
  }));

  notifyProductListeners();
  return updatedItem ? [updatedItem] : [];
};