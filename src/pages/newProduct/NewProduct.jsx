import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublishIcon from "@mui/icons-material/Publish";
import "./newProduct.css";

import {
  createProduct,
  uploadProductImages,
} from "../../../services/productService";
import {
  getCategories,
  subscribeCategories,
} from "../../../services/categoryService";

export default function NewProduct() {
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [active, setActive] = useState(true);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const list = await getCategories();
        if (mounted) {
          setCategories(list);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
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

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    try {
      setLoading(true);

      const imageUrls = await uploadProductImages(files);

      const parsedCategoryId = categoryId === "" ? null : String(categoryId);

      await createProduct({
        title: title.trim(),
        title_ar: titleAr.trim(),
        description: description.trim(),
        description_ar: descriptionAr.trim(),
        category_id: parsedCategoryId,
        price: Number(price) || 0,
        points: Number(points) || 0,
        active,
        images: imageUrls,
      });

      setSuccess("Product created successfully.");

      setTitle("");
      setTitleAr("");
      setDescription("");
      setDescriptionAr("");
      setCategoryId("");
      setPrice("");
      setPoints("");
      setFiles([]);
      setPreviewImages([]);
      setActive(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newProduct">
      <div className="newProductHeader">
        <h1 className="addProductTitle">New Product</h1>
        <Link to="/products" className="backToProductsLink">
          Back to Products
        </Link>
      </div>

      {error && <div className="newProductError">{error}</div>}
      {success && <div className="newProductSuccess">{success}</div>}

      <div className="newProducWrap">
        <form className="addProductForm" onSubmit={handleSubmit}>
          <div className="addProductItem">
            <label htmlFor="newTitle">Title</label>
            <input
              id="newTitle"
              type="text"
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="addProductItem">
            <label htmlFor="newTitleAr" dir="rtl" lang="ar">
              العنوان بالعربية
            </label>
            <input
              id="newTitleAr"
              type="text"
              dir="rtl"
              lang="ar"
              placeholder="عنوان المنتج بالعربية (اختياري)"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
            />
          </div>

          <div className="addProductItem">
            <label htmlFor="newDescription">Description</label>
            <textarea
              id="newDescription"
              className="productDescription"
              placeholder="Enter product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="addProductItem">
            <label htmlFor="newDescriptionAr" dir="rtl" lang="ar">
              الوصف بالعربية
            </label>
            <textarea
              id="newDescriptionAr"
              className="productDescription"
              dir="rtl"
              lang="ar"
              placeholder="وصف المنتج بالعربية (اختياري)..."
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
            />
          </div>

          <div className="addProductItem">
            <label htmlFor="newCategory">Category</label>
            <select
              id="newCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select Category"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name_en || cat.name}
                  {cat.name_ar ? ` (${cat.name_ar})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="addProductItem">
            <label htmlFor="newPrice">Price</label>
            <input
              id="newPrice"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="addProductItem">
            <label htmlFor="newPoints">Points</label>
            <input
              id="newPoints"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>

          <div className="addProductItem">
            <label htmlFor="newActive">Active</label>
            <select
              id="newActive"
              value={active ? "yes" : "no"}
              onChange={(e) => setActive(e.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <button
            type="submit"
            className="addProductButton"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>

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

            <label htmlFor="file" style={{ cursor: "pointer" }}>
              <PublishIcon />
            </label>

            <input
              type="file"
              id="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="photos">
            {previewImages.map((image, index) => (
              <img
                key={index}
                className="productInfoPhoto"
                src={image}
                alt={`preview-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}