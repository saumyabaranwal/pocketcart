import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  LogOut,
  Pencil,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import "./App.css";
import Login from "./pages/Login";
import { authFetch, clearSession, getStoredUser, getToken } from "./api";

const API_URL = "http://localhost:5003/api/products";

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isCheckingAuth] = useState(false);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("");
  const [source, setSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    url: "",
    source: "",
    price: "",
    notes: "",
    collection: "",
  });

  const collections = useMemo(() => {
    return [...new Set(products.map((product) => product.collection))].filter(Boolean);
  }, [products]);

  const sources = useMemo(() => {
    return [...new Set(products.map((product) => product.source))].filter(Boolean);
  }, [products]);

  useEffect(() => {
    if (currentUser && getToken()) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function fetchProducts(filters = {}) {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();

      if (filters.search || search) {
        params.set("search", filters.search ?? search);
      }

      if (filters.collection || collection) {
        params.set("collection", filters.collection ?? collection);
      }

      if (filters.source || source) {
        params.set("source", filters.source ?? source);
      }

      const queryString = params.toString();
      const url = queryString ? `${API_URL}?${queryString}` : API_URL;

      const response = await authFetch(url);
      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(product) {
    setEditingProduct(product);

    setEditForm({
      title: product.title,
      url: product.url,
      source: product.source,
      price: product.price || "",
      notes: product.notes || "",
      collection: product.collection || "Uncategorized",
    });
  }

  function cancelEditing() {
    setEditingProduct(null);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    const value = event.target.value;
    setSearch(value);
    fetchProducts({ search: value });
  }

  function handleCollectionChange(event) {
    const value = event.target.value;
    setCollection(value);
    fetchProducts({ collection: value });
  }

  function handleSourceChange(event) {
    const value = event.target.value;
    setSource(value);
    fetchProducts({ source: value });
  }

  function clearFilters() {
    setSearch("");
    setCollection("");
    setSource("");
    fetchProducts({ search: "", collection: "", source: "" });
  }

  async function saveEdit(event) {
    event.preventDefault();

    try {
      const response = await authFetch(`${API_URL}/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const updatedProduct = await response.json();

      if (!response.ok) {
        console.error(updatedProduct.message || "Failed to update product");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );

      setEditingProduct(null);
    } catch (error) {
      console.error("Update product error:", error);
    }
  }

  async function deleteProduct(productId) {
    const confirmDelete = window.confirm("Delete this product from PocketCart?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await authFetch(`${API_URL}/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete product");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error("Delete product error:", error);
    }
  }

  function handleLogout() {
    clearSession();
    setProducts([]);
    setCurrentUser(null);
  }

  // not logged in -> show the login/signup screen
  if (!currentUser || !getToken()) {
    return <Login onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  if (isCheckingAuth) {
    return null;
  }

  return (
    <main className="app-shell">
      <section className="top-bar">
        <div>
          <p className="eyebrow">Saved Products, ready to compare</p>
          <h1>PocketCart</h1>
        </div>

        <div className="summary-pill">
          <ShoppingBag size={18} />
          <span>{products.length} items</span>
        </div>
      </section>

      <section className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search saved products..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <select value={collection} onChange={handleCollectionChange}>
          <option value="">All collections</option>
          {collections.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={source} onChange={handleSourceChange}>
          <option value="">All sources</option>
          {sources.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>

        <button type="button" onClick={clearFilters}>
          Clear
        </button>

        <button type="button" className="icon-button" onClick={() => fetchProducts()}>
          <RefreshCw size={17} />
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={handleLogout}
          title={`Log out (${currentUser?.email || ""})`}
        >
          <LogOut size={17} />
        </button>
      </section>

      {isLoading && <p className="status-text">Loading products...</p>}

      <section className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={product.title} />
              ) : (
                <ShoppingBag size={34} />
              )}
            </div>

            <div className="product-content">
              <div>
                <p className="source">{product.source}</p>
                <h2>{product.title}</h2>
              </div>

              <p className="notes">{product.notes || "No notes yet."}</p>

              <div className="meta-row">
                <span>{product.collection}</span>
                {product.price && <strong>₹{product.price}</strong>}
              </div>

              <div className="card-actions">
                <a href={product.url} target="_blank" rel="noreferrer">
                  Open product
                  <ExternalLink size={15} />
                </a>

                <button type="button" onClick={() => startEditing(product)}>
                  <Pencil size={15} />
                </button>

                <button type="button" onClick={() => deleteProduct(product._id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!isLoading && products.length === 0 && (
        <section className="empty-state">
          <ShoppingBag size={38} />
          <h2>No products found</h2>
          <p>Saved products will appear here once they match your filters.</p>
        </section>
      )}

      {editingProduct && (
        <section className="modal-backdrop">
          <form className="edit-modal" onSubmit={saveEdit}>
            <div className="modal-header">
              <h2>Edit product</h2>
              <button type="button" onClick={cancelEditing}>
                <X size={18} />
              </button>
            </div>

            <label>
              Title
              <input name="title" value={editForm.title} onChange={handleEditChange} />
            </label>

            <label>
              URL
              <input name="url" value={editForm.url} onChange={handleEditChange} />
            </label>

            <label>
              Source
              <input name="source" value={editForm.source} onChange={handleEditChange} />
            </label>

            <label>
              Price
              <input name="price" value={editForm.price} onChange={handleEditChange} />
            </label>

            <label>
              Collection
              <input
                name="collection"
                value={editForm.collection}
                onChange={handleEditChange}
              />
            </label>

            <label>
              Notes
              <textarea name="notes" value={editForm.notes} onChange={handleEditChange} />
            </label>

            <button type="submit">Save changes</button>
          </form>
        </section>
      )}
    </main>
  );
}

export default App;
