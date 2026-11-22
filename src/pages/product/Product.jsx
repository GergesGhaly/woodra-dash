import { Link, useParams } from "react-router-dom";
import "./product.css";
import PublishIcon from "@mui/icons-material/Publish";
import { useEffect, useMemo, useState } from "react";
import {
  getProductById,
  updateProduct,
  uploadProductImages,
} from "../../../services/productService";
import {
  getCategories,
  subscribeCategories,
} from "../../../services/categoryService";

export default function Product() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Controlled edit form fields
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [active, setActive] = useState(true);

  const [newFiles, setNewFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        if (mounted) {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
    const unsubscribe = subscribeCategories(() => {
      loadCategories();
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadProduct = async () => {
      try {
        const item = await getProductById(productId);
        if (!mounted) return;

        if (!item) {
          setProduct(null);
          setError("Product not found.");
          return;
        }

        setError("");

        setProduct(item);
        setTitle(item.title || item.name || "");
        setTitleAr(item.title_ar || "");
        setCategoryId(
          item.category_id !== undefined && item.category_id !== null
            ? String(item.category_id)
            : ""
        );
        setDescription(item.description || "");
        setDescriptionAr(item.description_ar || "");
        setPrice(item.price !== undefined && item.price !== null ? String(item.price) : "");
        setPoints(item.points !== undefined && item.points !== null ? String(item.points) : "");
        setActive(typeof item.active === "boolean" ? item.active : true);
        setPreviewImages(item.images || item.photos || []);
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load product.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const categoryName = useMemo(() => {
    if (!categoryId) return "Uncategorized";
    const found = categories.find((c) => String(c.id) === String(categoryId));
    return found ? found.name_en || found.name : "Uncategorized";
  }, [categories, categoryId]);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      setPreviewImages(selectedFiles.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    try {
      setSaving(true);

      let imagesToSave = product?.images || product?.photos || [];
      if (newFiles.length > 0) {
        imagesToSave = await uploadProductImages(newFiles);
      }

      const parsedCategoryId = categoryId === "" ? null : String(categoryId);

      const updates = {
        title: title.trim(),
        title_ar: titleAr.trim(),
        category_id: parsedCategoryId,
        description: description.trim(),
        description_ar: descriptionAr.trim(),
        price: Number(price) || 0,
        points: Number(points) || 0,
        active,
        images: imagesToSave,
      };

      const updatedRows = await updateProduct(productId, updates);
      const updated = updatedRows?.[0] ?? { ...product, ...updates };
      setProduct(updated);
      setPreviewImages(updated.images || imagesToSave);
      setNewFiles([]);
      setSuccess("Product updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="product">
        <div className="productState">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product">
        <div className="productError">{error || "Product not found."}</div>
        <Link to="/products" className="productBackLink">
          Back to Products
        </Link>
      </div>
    );
  }

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : product.photos || [];
  const mainImage =
    displayImages[0] || "https://via.placeholder.com/300x300?text=Product";

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product</h1>
        <Link to="/products" className="productBackLink">
          Back to Products
        </Link>
      </div>

      {error && <div className="productError">{error}</div>}
      {success && <div className="productSuccess">{success}</div>}

      <div className="productTop">
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={mainImage} alt={product.title || ""} className="productInfoImg" />
            <div className="photos">
              {displayImages.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt=""
                  className="productInfoPhoto"
                />
              ))}
            </div>
          </div>

          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoValue">id:</span>
              <span className="productInfoKey">{product.id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">title:</span>
              <span className="productInfoKey">
                {product.title || product.name}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">العنوان بالعربية:</span>
              <span className="productInfoKey" dir="rtl" lang="ar">
                {product.title_ar || "—"}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">category:</span>
              <span className="productInfoKey">{categoryName}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">price:</span>
              <span className="productInfoKey">
                ${Number(product.price || 0).toFixed(2)}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">points:</span>
              <span className="productInfoKey">{product.points ?? 0}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">description:</span>
              <span className="productInfoKey">
                {product.description || "—"}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">الوصف بالعربية:</span>
              <span className="productInfoKey" dir="rtl" lang="ar">
                {product.description_ar || "—"}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">active:</span>
              <span className="productInfoKey">
                {product.active ? "yes" : "no"}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">created_at:</span>
              <span className="productInfoKey">
                {product.created_at
                  ? new Date(product.created_at).toLocaleString()
                  : "—"}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoValue">updated_at:</span>
              <span className="productInfoKey">
                {product.updated_at
                  ? new Date(product.updated_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h1 className="productTitle">Edit Product</h1>
      <div className="productBottom">
        <form className="productForm" onSubmit={handleUpdate}>
          <div className="productFormRight">
            <div className="productUpload">
              <img
                src={
                  previewImages[0] ||
                  "https://via.placeholder.com/300x300?text=Product"
                }
                alt=""
                className="productUploadImg"
              />
              <label htmlFor="editProductFile" style={{ cursor: "pointer" }}>
                <PublishIcon />
              </label>
              <input
                type="file"
                id="editProductFile"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="photos">
              {previewImages.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt=""
                  className="productInfoPhoto"
                />
              ))}
            </div>

            <button
              type="submit"
              className="productButton"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update"}
            </button>
          </div>

          <div className="productFormLeft">
            <div className="addProductItem">
              <label htmlFor="editTitle">Title</label>
              <input
                id="editTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Product title"
              />
            </div>

            <div className="addProductItem">
              <label htmlFor="editTitleAr" dir="rtl" lang="ar">
                العنوان بالعربية
              </label>
              <input
                id="editTitleAr"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                type="text"
                dir="rtl"
                lang="ar"
                placeholder="عنوان المنتج بالعربية (اختياري)"
              />
            </div>

            <div className="addProductItem">
              <label htmlFor="editCategory">Category</label>
              <select
                id="editCategory"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name_en || cat.name}
                    {cat.name_ar ? ` (${cat.name_ar})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="addProductItem">
              <label htmlFor="editDescription">Description</label>
              <textarea
                id="editDescription"
                className="productDescriptionInput"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
              />
            </div>

            <div className="addProductItem">
              <label htmlFor="editDescriptionAr" dir="rtl" lang="ar">
                الوصف بالعربية
              </label>
              <textarea
                id="editDescriptionAr"
                className="productDescriptionInput"
                dir="rtl"
                lang="ar"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="وصف المنتج بالعربية (اختياري)"
              />
            </div>

            <div className="addProductItem">
              <label htmlFor="editPrice">Price</label>
              <input
                id="editPrice"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="0"
              />
            </div>

            <div className="addProductItem">
              <label htmlFor="editPoints">Points</label>
              <input
                id="editPoints"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                type="number"
                placeholder="0"
              />
            </div>

            <div className="addProductItem">
              <label htmlFor="editActive">Active</label>
              <select
                id="editActive"
                value={active ? "yes" : "no"}
                onChange={(e) => setActive(e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
