import { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import api from "../services/api";
import FooterPage from "../components/FooterPage.jsx";
import HeaderPage from "../components/HeaderPage.jsx";
import CardSkeleton from "../components/CardSkeleton.jsx"; 
import ProductSkeleton from "../components/ProductSkeleton";
import Skeleton from "../components/Skeleton";
import { toast } from 'react-toastify';
import { useCart } from "../context/CartContext";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [frequentlyBought, setFrequentlyBought] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [loadingProduct, setLoadingproduct] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  // Fetch product details
 useEffect(() => {
  setLoadingproduct(true);
  setLoadingRandom(true);

  setQuantity(1);

  Promise.all([
    api.get(`/api/store/products/${id}`),
    api.get(`/api/store/random/products?limit=4`)
  ])
    .then(([productRes, randomRes]) => {
      const productData = productRes.data.data;
      const randomData = randomRes.data.data;

      setProduct(productData);
      setMainImage(productData.images && productData.images.length > 0 ? productData.images[0] : "/img/default.png");
      setFrequentlyBought(randomData);

      const unitList = productData.product_units || [];
      setUnits(unitList);

      const defaultUnit =
        unitList.find((u) => u.is_default_sale === 1) ||
        unitList.find((u) => u.is_base === 1) ||
        null;

      setSelectedUnit(defaultUnit);
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    })
    .finally(() => {
      setLoadingproduct(false);
      setLoadingRandom(false);
    });
}, [id]);

const handleAddToCart = async () => {
  try {
    let price = 0;

    if (product.unit_type === "with_unit") {
      const zonePrice = product.zone_prices?.find(
        (zp) => zp.unit_name === selectedUnit?.unit?.short_name
      )?.final_price;

      price = zonePrice || selectedUnit?.base_price || product.price;
    } else {
      price = product.zone_prices?.[0]?.final_price || product.price;
    }

    const payload = {
      product_id: product.id,
      quantity,
      price, 
    };

    if (product.unit_type === "with_unit") {
      payload.unit_id = selectedUnit?.unit_id;
    }
    await api.post("/api/store/cart/add", payload);
    toast.success("🛒 Added to cart!");
    await refreshCartCount();
    } catch (err) {
      console.error("Cart add failed", err);
    }
    };



  // Change main product image
  // const changeImage = (src) => {
  //   setMainImage(src);
  // };

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  if (loadingProduct) {
    return <ProductSkeleton variant="detail" />;
  }

  if (loadingRandom) {
    return <ProductSkeleton variant="detail" />;
  }

  if (!product) {
    return <p className="text-center mt-10 text-red-500">Product not found.</p>;
  }

  if (!frequentlyBought) {
    return (
      <p className="text-center mt-10 text-red-500">
        Frequently bought not found.
      </p>
    );
  }


  return (
    <div className="font-sans">
      <HeaderPage/>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 mt-11 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="rounded-lg shadow w-full h-[380px] object-cover"
            style={{ height: "500px"}}
          />
          {/* <div className="grid grid-cols-4 gap-4 mt-4">
            {(product.images || []).map((src, idx) => (
              <img
                key={idx}
                onClick={() => changeImage(src)}
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full rounded-lg cursor-pointer hover:opacity-80"
                style={{ height:"100px"}}
              />
            ))}
          </div> */}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-xl text-gray-600 mt-2">
            ${product.unit_type === "with_unit"
              ? (selectedUnit 
                  ? (product.zone_prices?.find(
                      (zp) => zp.unit_name === selectedUnit?.unit?.short_name
                    )?.final_price || selectedUnit?.base_price || "0.00")
                  : "0.00")
              : (product.zone_prices?.[0]?.final_price || product.price)}
          </p>

          <p className="text-gray-700 mt-4">{product.description}</p>

        {/* Unit Dropdown */}
        {product.unit_type === "with_unit" && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                className="w-48 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                value={selectedUnit ? selectedUnit.id : ""}
                onChange={(e) => {
                  const unit = units.find((u) => u.id === parseInt(e.target.value));
                  setSelectedUnit(unit);
                }}
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit?.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>
        )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center w-32 border rounded-lg">
              <button
                type="button"
                onClick={decreaseQty}
                className="w-10 h-10 flex items-center justify-center 
                           text-xl font-bold border-r hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="w-full text-center outline-none"
              />
              <button
                type="button"
                onClick={increaseQty}
                className="w-10 h-10 flex items-center justify-center 
                           text-xl font-bold border-l hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button onClick={handleAddToCart}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
              Add to Cart
            </button>
            {/* <button className="border px-6 py-3 rounded-lg shadow hover:bg-gray-100">
              Buy Now
            </button> */}
          </div>
        </div>
      </section>

      <section className="bg-gray-100">
        <div className="text-center mb-12 pt-16">
          <h2 className="text-4xl font-bold text-gray-800">
            Frequently bought
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Explore what we offer</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-16">
          {frequentlyBought.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden 
                         hover:shadow-xl transition-shadow duration-300 
                         w-72 sm:w-96 md:w-full mx-auto p-6 cursor-pointer"
            >
              <img
                src={p.images.length > 0 ? p.images[0] : "/img/default.png"}
                alt={p.name}
                className="w-48 h-48 object-cover mx-auto"
              />
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {p.name}
                </h2>
                <p className="text-gray-600 mt-2">${p.price}</p>
                <button onClick={() => navigate(`/product/${p.id}`)}
                        className="mt-4 w-32 bg-indigo-600 text-white 
                                   py-2 rounded-lg hover:bg-indigo-700 
                                   transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <FooterPage/>
    </div>
  );
};

export default ProductPage;
