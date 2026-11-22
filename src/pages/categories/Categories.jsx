import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  createCategory,
  deleteCategory,
  getCategories,
  subscribeCategories,
  updateCategory,
} from "../../../services/categoryService";
import { getProducts, subscribeProducts } from "../../../services/productService";
import "./categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // Add / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        if (active) {
          setCategories(cats);
          setProducts(prods);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load categories.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    const unsubCats = subscribeCategories(() => loadData());
    const unsubProds = subscribeProducts(() => loadData());
    return () => {
      active = false;
      unsubCats();
      unsubProds();
    };
  }, []);

  const productCountByCategory = useMemo(() => {
    const map = new Map();
    for (const prod of products) {
      if (prod.category_id !== undefined && prod.category_id !== null && prod.category_id !== "") {
        const key = String(prod.category_id);
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    return map;
  }, [products]);

  const openAddModal = () => {
    setEditingCategory(null);
    setNameEn("");
    setNameAr("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNameEn(category.name_en || category.name || "");
    setNameAr(category.name_ar || "");
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
    setFormError("");
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const trimmedEn = nameEn.trim();
    const trimmedAr = nameAr.trim();

    if (!trimmedEn) {
      setFormError("Category Name (English) is required.");
      return;
    }
    if (!trimmedAr) {
      setFormError("Category Name (Arabic) is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setFeedback("");

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name_en: trimmedEn,
          name_ar: trimmedAr,
        });
        setFeedback(`Category "${trimmedEn}" updated successfully.`);
      } else {
        await createCategory({
          name_en: trimmedEn,
          name_ar: trimmedAr,
        });
        setFeedback(`Category "${trimmedEn}" created successfully.`);
      }

      setModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setFormError(err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const assignedProductsForTarget = useMemo(() => {
    if (!deleteTarget) return [];
    return products.filter(
      (p) => String(p.category_id) === String(deleteTarget.id)
    );
  }, [deleteTarget, products]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError("");
      setFeedback("");
      await deleteCategory(deleteTarget.id);
      setFeedback(
        `Category "${deleteTarget.name_en || deleteTarget.name}" deleted.`
      );
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete category.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name_en",
      headerName: "Category Name (English)",
      width: 240,
      valueGetter: (_value, row) => row.name_en || row.name || "",
    },
    {
      field: "name_ar",
      headerName: "Category Name (Arabic)",
      width: 240,
      renderCell: (params) => (
        <span dir="rtl" lang="ar" className="categoryArabicCell">
          {params.row.name_ar || "—"}
        </span>
      ),
    },
    {
      field: "productsCount",
      headerName: "Assigned Products",
      width: 160,
      valueGetter: (_value, row) =>
        productCountByCategory.get(String(row.id)) || 0,
    },
    {
      field: "action",
      headerName: "Action",
      width: 210,
      sortable: false,
      renderCell: (params) => (
        <div className="categoryActions">
          <button
            type="button"
            className="categoryEditBtn"
            onClick={() => openEditModal(params.row)}
          >
            Edit
          </button>
          <button
            type="button"
            className="categoryDeleteBtn"
            onClick={() => setDeleteTarget(params.row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="categoriesPage">
      <div className="categoriesHeader">
        <div>
          <h1 className="categoriesTitle">Categories</h1>
          <p className="categoriesSubtitle">
            Manage product categories in English and Arabic.
          </p>
        </div>
        <button
          type="button"
          className="addCategoryButton"
          onClick={openAddModal}
        >
          Add Category
        </button>
      </div>

      {error && <div className="categoriesError">{error}</div>}
      {feedback && <div className="categoriesSuccess">{feedback}</div>}

      {loading ? (
        <div className="categoriesState">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="categoriesState">
          No categories found. Click &quot;Add Category&quot; to create one.
        </div>
      ) : (
        <div className="categoriesGridWrap">
          <DataGrid
            rows={categories}
            columns={columns}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
          />
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="xs">
        <form onSubmit={handleSaveCategory}>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogContent>
            {formError && <div className="modalFormError">{formError}</div>}

            <div className="categoryFormGroup">
              <label htmlFor="categoryNameEn">Category Name (English)</label>
              <input
                id="categoryNameEn"
                type="text"
                placeholder="e.g. Wooden Chairs"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                autoFocus
              />
            </div>

            <div className="categoryFormGroup">
              <label htmlFor="categoryNameAr">Category Name (Arabic)</label>
              <input
                id="categoryNameAr"
                type="text"
                dir="rtl"
                lang="ar"
                placeholder="مثال: كراسي خشبية"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              style={{ backgroundColor: "#99532f", color: "#fff" }}
            >
              {saving
                ? "Saving..."
                : editingCategory
                ? "Save Changes"
                : "Create Category"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation / Reassignment Warning Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {assignedProductsForTarget.length > 0
            ? "Category In Use"
            : "Delete Category"}
        </DialogTitle>
        <DialogContent>
          {assignedProductsForTarget.length > 0 ? (
            <>
              <DialogContentText>
                Cannot delete{" "}
                <strong>
                  {deleteTarget?.name_en || deleteTarget?.name}
                </strong>{" "}
                because{" "}
                <strong>{assignedProductsForTarget.length}</strong>{" "}
                product(s) are currently assigned to this category:
              </DialogContentText>
              <ul className="assignedProductsList">
                {assignedProductsForTarget.map((p) => (
                  <li key={p.id}>
                    {p.title || p.name}
                  </li>
                ))}
              </ul>
              <DialogContentText>
                Please reassign those products to another category first before
                deleting.
              </DialogContentText>
            </>
          ) : (
            <DialogContentText>
              Are you sure you want to delete category{" "}
              <strong>
                {deleteTarget?.name_en || deleteTarget?.name}
              </strong>
              ? This action cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            {assignedProductsForTarget.length > 0 ? "Close" : "Cancel"}
          </Button>
          {assignedProductsForTarget.length > 0 ? (
            <Button
              component={Link}
              to="/products"
              variant="contained"
              style={{ backgroundColor: "#99532f", color: "#fff" }}
            >
              Go to Products
            </Button>
          ) : (
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
