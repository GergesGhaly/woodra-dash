import "./productList.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  deleteProduct,
  getProducts,
  subscribeProducts,
} from "../../../services/productService";
import {
  getCategories,
  subscribeCategories,
} from "../../../services/categoryService";

export default function ProductList() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [prods, cats] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        if (active) {
          setData(prods);
          setCategories(cats);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load products.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    const unsubProds = subscribeProducts(() => loadData());
    const unsubCats = subscribeCategories(() => loadData());
    return () => {
      active = false;
      unsubProds();
      unsubCats();
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      map.set(String(cat.id), cat.name_en || cat.name || "");
    }
    return map;
  }, [categories]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError("");
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete product.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      field: "title",
      headerName: "Product",
      width: 240,
      renderCell: (params) => {
        const primaryImg =
          params.row.images?.[0] ||
          params.row.img ||
          "https://via.placeholder.com/100x100?text=Product";
        const displayTitle = params.row.title || params.row.name || "Untitled";

        return (
          <div className="productListItem">
            <img className="productListImg" src={primaryImg} alt={displayTitle} />
            <div className="productListTitleWrap">
              <span>{displayTitle}</span>
              {params.row.title_ar && (
                <span className="productListArabicSub" dir="rtl" lang="ar">
                  {params.row.title_ar}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      field: "images",
      headerName: "Photos",
      width: 170,
      renderCell: (params) => {
        const imgs = params.row.images || params.row.photos || [];
        return (
          <div className="productListSmallItem">
            {imgs.slice(0, 4).map((image, index) => (
              <img
                key={index}
                className="productLiSmallImg"
                src={image}
                alt=""
              />
            ))}
          </div>
        );
      },
    },
    {
      field: "category_id",
      headerName: "Category",
      width: 150,
      valueGetter: (_value, row) => {
        if (row.category_id === null || row.category_id === undefined || row.category_id === "") {
          return "Uncategorized";
        }
        return categoryMap.get(String(row.category_id)) || "Uncategorized";
      },
    },
    { field: "description", headerName: "Description", width: 180 },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      valueFormatter: (value) => `$${Number(value || 0).toFixed(2)}`,
    },
    { field: "points", headerName: "Points", width: 90 },
    {
      field: "active",
      headerName: "Status",
      width: 100,
      valueGetter: (_value, row) => {
        if (typeof row.active === "boolean") {
          return row.active ? "active" : "inactive";
        }
        return row.status || "active";
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <div className="productListActions">
          <Link to={"/product/" + params.row.id}>
            <button type="button" className="productListEdit">
              Edit
            </button>
          </Link>

          <button
            type="button"
            onClick={() => setDeleteTarget(params.row)}
            className="productListDelete"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="productList">
      <div className="productListHeader">
        <h1 className="productListTitle">Products</h1>
        <Link to="/newproduct">
          <button type="button" className="productListAddBtn">
            Add Product
          </button>
        </Link>
      </div>

      {error && <div className="productListError">{error}</div>}

      {loading ? (
        <div className="productListState">Loading products...</div>
      ) : data.length === 0 ? (
        <div className="productListState">
          No products found. Click &quot;Add Product&quot; to create one.
        </div>
      ) : (
        <div className="productListGridWrap">
          <DataGrid
            rows={data}
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

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.title || deleteTarget?.name}</strong>? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}