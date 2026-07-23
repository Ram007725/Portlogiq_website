import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FooterPage from "../components/FooterPage.jsx";
import HeaderPage from "../components/HeaderPage.jsx";
import api from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import { toast } from "react-toastify";
import "./cart.css";

const FALLBACK_IMG = "/img/default.png";

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 7.5h10.5l1.2 12.15a1.5 1.5 0 01-1.494 1.65H7.044a1.5 1.5 0 01-1.494-1.65L6.75 7.5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5V6.75a3 3 0 116 0v3.75" />
  </svg>
);

const CartHeadingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.912-4.784 2.208-7.395a49.86 49.86 0 00-.372-6.87M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CartSkeleton = () => (
  <div className="cart-page">
    <HeaderPage />
    <main className="cart-main">
      <section className="cart-section">
        <div className="cart-container">
          <div className="cart-intro">
            <div className="cart-skel-bone" style={{ width: "7rem", height: "1.4rem", borderRadius: 999 }} />
            <div className="cart-skel-bone" style={{ width: "14rem", height: "2.4rem", marginTop: 12 }} />
          </div>
          <div className="cart-layout">
            <div className="cart-panel">
              {[1, 2, 3].map((i) => (
                <div className="cart-skel-row" key={i}>
                  <div className="cart-skel-bone cart-skel-thumb" />
                  <div className="cart-skel-copy">
                    <div className="cart-skel-bone cart-skel-line" />
                    <div className="cart-skel-bone cart-skel-line short" />
                  </div>
                  <div className="cart-skel-bone cart-skel-side" />
                </div>
              ))}
            </div>
            <aside className="cart-summary">
              <div className="cart-skel-bone cart-skel-summary-block" style={{ width: "60%", height: "1.6rem" }} />
              <div className="cart-skel-bone cart-skel-summary-block" />
              <div className="cart-skel-bone cart-skel-summary-block" />
              <div className="cart-skel-bone" style={{ height: "3rem", borderRadius: 14, marginTop: 16 }} />
            </aside>
          </div>
        </div>
      </section>
    </main>
    <FooterPage />
  </div>
);

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      const res = await api.get("/api/store/cart/items");
      setItems(res.data.items);
    } catch (err) {
      console.error("Cart load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const increaseQty = async (id) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    setItems(updated);
    await api.post("/api/store/cart/update", { id, type: "increase" });
    refreshCartCount();
  };

  const decreaseQty = async (id) => {
    const updated = items.map((item) =>
      item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
    );
    setItems(updated);
    await api.post("/api/store/cart/update", { id, type: "decrease" });
    refreshCartCount();
  };

  const removeItem = async (id) => {
    await api.post("/api/store/cart/remove", { id });
    setItems(items.filter((item) => item.id !== id));
    refreshCartCount();
  };

  const handleProceedCheckout = async () => {
    try {
      const hasItemsWithQty = items.some((item) => item.qty > 0);

      if (!hasItemsWithQty) {
        toast.warning("Please add items to your cart before checkout!");
        return;
      }

      await api.get("/sanctum/csrf-cookie");
      const res = await api.get("/api/store/user/check-login");

      if (res.data.loggedIn) {
        navigate("/checkout");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Login check failed:", err);
      navigate("/login");
    }
  };

  const uniqueItemCount = items.length;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal;

  if (loading) return <CartSkeleton />;

  return (
    <div className="cart-page">
      <HeaderPage />

      <main className="cart-main">
        <section className="cart-section">
          <div className="cart-container">
            <div className="cart-intro">
              <h1 className="cart-title">
                <span className="cart-title-icon" aria-hidden="true">
                  <CartHeadingIcon />
                </span>
                Shopping Cart
              </h1>
              <span className="cart-eyebrow">Your bag</span>
            </div>

            <div className="cart-layout">
              <div className="cart-panel">
                {items.length === 0 ? (
                  <div className="cart-empty">
                    <div className="cart-empty-icon">
                      <BagIcon />
                    </div>
                    <h2 className="cart-empty-title">Your cart is empty</h2>
                    <p className="cart-empty-text">
                      Browse the catalogue and add produce, dairy, and pantry favourites to your bag.
                    </p>
                    <Link to="/shop" className="cart-empty-cta">
                      Continue shopping
                      <ArrowIcon />
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="cart-panel-head">
                      <div className="cart-panel-head-copy">
                        <span className="cart-panel-label">Cart items</span>
                        <span className="cart-panel-hint">Review quantities before checkout</span>
                      </div>
                      <span className="cart-panel-count">{items.length}</span>
                    </div>
                    <div className="cart-list">
                      {items.map((item, index) => {
                        const lineTotal = Number(item.price || 0) * (item.qty || 0);
                        const showUnit = item.unit_id && item.unit_name !== "No Unit";

                        return (
                          <article
                            className="cart-item"
                            key={item.id}
                            style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
                          >
                            <div className="cart-item-accent" aria-hidden="true" />

                            <div className="cart-item-body">
                              <button
                                type="button"
                                className="cart-item-product"
                                onClick={() => navigate(`/product/${item.product_id}`)}
                              >
                                <div className="cart-item-thumb">
                                  <img
                                    src={item.img || FALLBACK_IMG}
                                    alt={item.name}
                                    onError={(e) => {
                                      if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) {
                                        e.currentTarget.src = FALLBACK_IMG;
                                      }
                                    }}
                                  />
                                </div>
                                <div className="cart-item-info">
                                  <h2 className="cart-item-name">{item.name}</h2>
                                  <div className="cart-item-meta">
                                    {showUnit ? (
                                      <span className="cart-item-unit">{item.unit_name}</span>
                                    ) : null}
                                    <span className="cart-item-price">
                                      ${Number(item.price || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </button>

                              <div className="cart-item-qty">
                                <span className="cart-qty-label">Qty</span>
                                <div className="cart-stepper">
                                  <button
                                    type="button"
                                    className="cart-stepper-btn"
                                    onClick={() => decreaseQty(item.id)}
                                    disabled={item.qty <= 1}
                                    aria-label={`Decrease quantity of ${item.name}`}
                                  >
                                    &minus;
                                  </button>
                                  <input
                                    type="text"
                                    className="cart-stepper-value"
                                    value={item.qty}
                                    readOnly
                                    aria-label={`Quantity of ${item.name}`}
                                  />
                                  <button
                                    type="button"
                                    className="cart-stepper-btn"
                                    onClick={() => increaseQty(item.id)}
                                    aria-label={`Increase quantity of ${item.name}`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="cart-item-footer">
                              <div className="cart-item-line-total">
                                <span className="cart-item-line-label">Line total</span>
                                <span className="cart-item-line-value">${lineTotal.toFixed(2)}</span>
                              </div>
                              <button
                                type="button"
                                className="cart-remove"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                              >
                                <TrashIcon />
                                <span>Remove</span>
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <aside className="cart-summary">
                <h2 className="cart-summary-title">Order Summary</h2>
                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Items</span>
                    <span>{uniqueItemCount}</span>
                  </div>
                </div>
                <hr className="cart-summary-divider" />
                <div className="cart-summary-total">
                  <span className="cart-summary-total-label">Total</span>
                  <span className="cart-summary-total-value">${total.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={handleProceedCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                  <ArrowIcon />
                </button>
                <p className="cart-summary-note">
                  Secure checkout · Fresh produce packed with care
                </p>
                {items.length > 0 ? (
                  <Link to="/shop" className="cart-continue">
                    Continue shopping
                    <ArrowIcon />
                  </Link>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </main>

      <FooterPage />
    </div>
  );
};

export default Cart;
