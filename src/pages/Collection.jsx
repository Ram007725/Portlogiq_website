import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import FooterPage from "../components/FooterPage.jsx";
import HeaderPage from "../components/HeaderPage.jsx";
import ProductSkeleton from "../components/ProductSkeleton";
import ProductListingTable from "../components/ProductListingTable.jsx";
import ProductCategoryNav from "../components/ProductCategoryNav.jsx";
import ProductFilters from "../components/ProductFilters.jsx";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { DEFAULT_PRODUCT_FILTERS, filterAndSortProducts } from "../utils/productFilters";

const CollectionPage = () => {
  const [catProduct, setCatProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_PRODUCT_FILTERS);
  const { refreshCartCount } = useCart();

  const { id } = useParams();
  const categoryName = categories.find((c) => String(c.id) === String(id))?.name;

  // Switching category: start over from a clean list at page 1 and reset filters.
  useEffect(() => {
    setCatProduct([]);
    setTotalPages(1);
    setPage(1);
    setFilters(DEFAULT_PRODUCT_FILTERS);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const isFirstPage = page === 1;
    isFirstPage ? setLoading(true) : setLoadingMore(true);

    api
      .get(`/api/store/categorywiseproducts/${id}?page=${page}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setCatProduct((prev) => (isFirstPage ? data.data : [...prev, ...data.data]));
        setTotalPages(data.last_page);
      })
      .catch((err) => {
        console.error("Error fetching categorywise product:", err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, page]);

  // Keep fetching subsequent pages automatically so the full category list
  // is loaded and visible without the user ever having to click anything.
  useEffect(() => {
    if (!loading && !loadingMore && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [loading, loadingMore, page, totalPages]);

  useEffect(() => {
    document.body.classList.add("plt-scroll-theme");
    return () => document.body.classList.remove("plt-scroll-theme");
  }, []);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(catProduct, filters),
    [catProduct, filters]
  );

  const handleAddToCart = async (p, quantity = 1, unitId = null) => {
    try {
      let price = 0;
      let selectedUnit = null;

      if (p.unit_type === "with_unit") {
        selectedUnit =
          (unitId != null && p.product_units?.find((u) => u.unit_id === unitId)) ||
          p.product_units?.find((u) => u.is_default_sale === 1) ||
          p.product_units?.find((u) => u.is_base === 1);

        const zonePrice = p.zone_prices?.find(
          (zp) => zp.unit_name === selectedUnit?.unit?.short_name
        )?.final_price;

        price = zonePrice ?? selectedUnit?.base_price ?? p.price;
      } else {
        price = p.zone_prices?.[0]?.final_price ?? p.price;
      }

      const payload = {
        product_id: p.id,
        quantity,
        price,
      };

      if (p.unit_type === "with_unit") {
        payload.unit_id = selectedUnit?.unit_id;
      }

      await api.post("/api/store/cart/add", payload);
      toast.success(`🛒 ${p.name} added to cart!`);
      await refreshCartCount();
    } catch (err) {
      console.error("Cart add failed:", err);
      toast.error("Failed to add product to cart!");
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  return (
    <div className="min-h-screen font-sans">
      <HeaderPage />

      <main className="pt-20">
        <section className="bg-gray-50 py-12 mt-11">
          <div className="max-w-7xl mx-auto px-6">
            <div className="plt-listing-intro">
              <div className="plt-page-head">
                <span className="plt-eyebrow">Category</span>
                <h2 className="text-4xl font-bold text-gray-800">
                  {categoryName || "All Products"}
                </h2>
                <p className="plt-page-sub">
                  Search and switch categories to explore more products
                </p>
              </div>
            </div>

            <ProductCategoryNav
              activeId={id}
              onCategoriesLoaded={setCategories}
            />

            {catProduct.length > 0 ? (
              <ProductFilters filters={filters} onChange={setFilters} />
            ) : null}

            {catProduct.length === 0 ? (
              <p className="text-center py-16 text-gray-500">
                No products found in this category. Try another category above.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center py-16 text-gray-500">
                No products match your search. Try a different keyword.
              </p>
            ) : (
              <>
                <ProductListingTable
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                />

                {loadingMore ? (
                  <p className="text-center py-6 text-sm text-gray-400">
                    Loading more products…
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>
      </main>

      <FooterPage />
    </div>
  );
};

export default CollectionPage;
