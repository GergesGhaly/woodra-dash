import { getMockStore, updateMockStore } from "../src/data/mockStore";
import { getProductsByCategoryId } from "./productService";

const categoryListeners = new Set();

const notifyCategoryListeners = () => {
  categoryListeners.forEach((listener) => listener());
};

export const subscribeCategories = (listener) => {
  categoryListeners.add(listener);
  return () => categoryListeners.delete(listener);
};

export const getCategories = async () => {
  const { categories } = getMockStore();
  return [...categories].sort((a, b) =>
    (a.name_en || "").localeCompare(b.name_en || "")
  );
};

const validateCategoryPayload = async (
  { name_en, name_ar },
  excludeId = null
) => {
  const cleanEn = (name_en || "").trim();
  const cleanAr = (name_ar || "").trim();

  if (!cleanEn) {
    throw new Error("Category Name (English) is required.");
  }
  if (!cleanAr) {
    throw new Error("Category Name (Arabic) is required.");
  }

  const existing = await getCategories();
  const duplicateEn = existing.find(
    (cat) =>
      String(cat.id) !== String(excludeId) &&
      (cat.name_en || cat.name || "").trim().toLowerCase() ===
        cleanEn.toLowerCase()
  );
  if (duplicateEn) {
    throw new Error(`Category "${cleanEn}" already exists.`);
  }

  const duplicateAr = existing.find(
    (cat) =>
      String(cat.id) !== String(excludeId) &&
      (cat.name_ar || "").trim() === cleanAr
  );
  if (duplicateAr) {
    throw new Error(`Arabic category name "${cleanAr}" already exists.`);
  }

  return { name_en: cleanEn, name_ar: cleanAr };
};

export const createCategory = async (payload) => {
  const valid = await validateCategoryPayload(payload);
  const nowIso = new Date().toISOString();
  const created = {
    id: `cat-${Date.now()}`,
    ...valid,
    created_at: nowIso,
    updated_at: nowIso,
  };

  updateMockStore((store) => ({
    ...store,
    categories: [...store.categories, created],
  }));

  notifyCategoryListeners();
  return created;
};

export const updateCategory = async (id, payload) => {
  const valid = await validateCategoryPayload(payload, id);
  const nowIso = new Date().toISOString();
  let updated = null;

  updateMockStore((store) => ({
    ...store,
    categories: store.categories.map((cat) => {
      if (String(cat.id) !== String(id)) return cat;
      updated = { ...cat, ...valid, updated_at: nowIso };
      return updated;
    }),
  }));

  if (!updated) {
    throw new Error("Category not found.");
  }

  notifyCategoryListeners();
  return updated;
};

export const deleteCategory = async (id) => {
  const assignedProducts = await getProductsByCategoryId(id);
  if (assignedProducts.length > 0) {
    throw new Error(
      `Cannot delete this category because ${assignedProducts.length} product(s) are currently assigned to it. Please reassign those products first.`
    );
  }

  updateMockStore((store) => ({
    ...store,
    categories: store.categories.filter((cat) => String(cat.id) !== String(id)),
  }));

  notifyCategoryListeners();
};
