import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import FooterPage from "../components/FooterPage.jsx";
import HeaderPage from "../components/HeaderPage.jsx";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import "./checkout.css";

const FALLBACK_IMG = "/img/default.png";

const CheckoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
  </svg>
);

const STEPS = [
  { id: 1, label: "Cart" },
  { id: 2, label: "Shipping" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Review" },
];

const WEEKDAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const toLocalIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CheckOutPage = () => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const summaryListRef = useRef(null);
  const scrollHideTimerRef = useRef(null);

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(10.0);
  const [total, setTotal] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [summaryScrolling, setSummaryScrolling] = useState(false);
  const [summaryScrollEdges, setSummaryScrollEdges] = useState({
    overflowing: false,
    canScrollUp: false,
    canScrollDown: false,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [deliveryDays, setDeliveryDays] = useState([]);
  const [availableDeliveryDates, setAvailableDeliveryDates] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await api.get("/api/store/cart/items");
        const data = response.data.items || [];
        const sub = data.reduce((acc, item) => acc + item.price * item.qty, 0);
        setSubtotal(sub);
        setTotal(sub);
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        toast.error("Failed to load cart items!");
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");
        const res = await api.get("/api/auth/check");

        if (res.data) {
          const user = res.data;
          setFirstName(user.first_name || "");
          setLastName(user.last_name || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
        }
      } catch (err) {
        console.error("User not logged in or failed to fetch user:", err);
      }

    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    return () => {
      if (scrollHideTimerRef.current) {
        clearTimeout(scrollHideTimerRef.current);
      }
    };
  }, []);

  const updateSummaryScrollEdges = () => {
    const el = summaryListRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflowing = scrollHeight > clientHeight + 1;
    const canScrollUp = overflowing && scrollTop > 2;
    const canScrollDown = overflowing && scrollTop + clientHeight < scrollHeight - 2;

    setSummaryScrollEdges((prev) => {
      if (
        prev.overflowing === overflowing &&
        prev.canScrollUp === canScrollUp &&
        prev.canScrollDown === canScrollDown
      ) {
        return prev;
      }
      return { overflowing, canScrollUp, canScrollDown };
    });
  };

  useEffect(() => {
    const fetchDeliveryDays = async () => {
      try {
        const deliveryDaysRes = await api.get("/api/store/order/delivery-days");
        const days = deliveryDaysRes?.data?.delivery_days || [];
        const normalizedDays = Array.isArray(days)
          ? days
              .map((day) => String(day).trim().toLowerCase())
              .filter((day) => day in WEEKDAY_INDEX)
          : [];

        setDeliveryDays(normalizedDays);
      } catch (err) {
        console.error("Failed to fetch delivery days:", err);
      }
    };

    fetchDeliveryDays();
  }, []);

  useEffect(() => {
    updateSummaryScrollEdges();

    const el = summaryListRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;


    const observer = new ResizeObserver(() => updateSummaryScrollEdges());
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  const handleSummaryScroll = () => {
    updateSummaryScrollEdges();
    setSummaryScrolling(true);
    if (scrollHideTimerRef.current) {
      clearTimeout(scrollHideTimerRef.current);
    }
    scrollHideTimerRef.current = setTimeout(() => {
      setSummaryScrolling(false);
    }, 900);
  };

  useEffect(() => {
    if (!deliveryDays.length) {
      setAvailableDeliveryDates([]);
      setDeliveryDate("");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDates = [];

    for (let i = 0; i < 21; i += 1) {
      const current = new Date(today);
      current.setDate(today.getDate() + i);
      const weekday = current.getDay();

      if (deliveryDays.some((day) => WEEKDAY_INDEX[day] === weekday)) {
        upcomingDates.push({
          value: toLocalIsoDate(current),
          label: formatDateLabel(current),
        });
      }
    }

    setAvailableDeliveryDates(upcomingDates);
    setDeliveryDate((prev) =>
      upcomingDates.some((date) => date.value === prev)
        ? prev
        : upcomingDates[0]?.value || ""
    );
  }, [deliveryDays]);



  const handlePlaceOrder = async () => {
    try {
      if (!firstName || !phone || !address1 || !city || !postal || !deliveryDate) {
        toast.warning("Please fill all required fields!");
        return;
      }

      setPlacing(true);

      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address1,
        city,
        postal,
        delivery_day: deliveryDate,
      };

      await api.get("/sanctum/csrf-cookie");

      const res = await api.post("/api/store/order/place", payload);

      if (res.status === 201) {
        setItems([]);
        refreshCartCount();
        toast.success("Order placed successfully!");
        navigate(`/thankyou/${res.data.order_number}`);
      } else {
        toast.error("Failed to place order. Try again.");
      }
    } catch (error) {
      console.error("Order placing failed:", error);
    } finally {
      setPlacing(false);
    }
  };

  const itemCount = items.length;

  return (
    <div className="checkout-page">
      <HeaderPage />

      <main className="checkout-main">
        <section className="checkout-section">
          <div className="checkout-container">
            <div className="checkout-intro">
              <p className="checkout-eyebrow">Secure checkout</p>
              <h1 className="checkout-title">
                <span className="checkout-title-icon" aria-hidden="true">
                  <CheckoutIcon />
                </span>
                Checkout
              </h1>
              <p className="checkout-lead">
                Confirm your shipping details and place your order. Fresh produce packed with care.
              </p>
            </div>

            <nav className="checkout-steps" aria-label="Checkout progress">
              {STEPS.map((step) => {
                const status =
                  step.id < 2 ? "is-done" : step.id === 2 ? "is-current" : "";
                return (
                  <div key={step.id} className={`checkout-step ${status}`}>
                    <span className="checkout-step-dot" aria-hidden="true">
                      {step.id < 2 ? <CheckIcon /> : step.id}
                    </span>
                    <p className="checkout-step-label">{step.label}</p>
                  </div>
                );
              })}
            </nav>

            <div className="checkout-layout">
              <div className="checkout-panel">
                <div className="checkout-panel-head">
                  <div className="checkout-panel-head-copy">
                    <span className="checkout-panel-label">Shipping</span>
                    <span className="checkout-panel-hint">Where should we deliver your order?</span>
                  </div>
                </div>

                <div className="checkout-panel-body">
                  <p className="checkout-section-label">Contact &amp; delivery</p>

                  <div className="checkout-grid checkout-grid-2">
                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-first-name">
                        First Name<span className="checkout-required">*</span>
                      </label>
                      <input
                        id="co-first-name"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="checkout-input"
                        autoComplete="given-name"
                      />
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-last-name">
                        Last Name
                      </label>
                      <input
                        id="co-last-name"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="checkout-input"
                        autoComplete="family-name"
                      />
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-email">
                        Email
                      </label>
                      <input
                        id="co-email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="checkout-input"
                        autoComplete="email"
                      />
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-phone">
                        Phone Number<span className="checkout-required">*</span>
                      </label>
                      <input
                        id="co-phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="checkout-input"
                        autoComplete="tel"
                      />
                    </div>

                    <div className="checkout-field checkout-field-span">
                      <label className="checkout-label" htmlFor="co-address">
                        Address<span className="checkout-required">*</span>
                      </label>
                      <input
                        id="co-address"
                        type="text"
                        placeholder="Address Line 1"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        className="checkout-input"
                        autoComplete="street-address"
                      />
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-city">
                        City<span className="checkout-required">*</span>
                      </label>
                      <input
                        id="co-city"
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="checkout-input"
                        autoComplete="address-level2"
                      />
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-postal">
                        Postal Code<span className="checkout-required">*</span>
                      </label>
                      <input
                        id="co-postal"
                        type="text"
                        placeholder="Postal Code"
                        value={postal}
                        onChange={(e) => setPostal(e.target.value)}
                        className="checkout-input"
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>

                  <div className="checkout-field checkout-field-span">
                    <label className="checkout-label">
                      Delivery Date<span className="checkout-required">*</span>
                    </label>
                    {availableDeliveryDates.length > 0 ? (
                      <div className="checkout-date-grid">
                        {availableDeliveryDates.map((dateOption) => (
                          <button
                            key={dateOption.value}
                            type="button"
                            onClick={() => setDeliveryDate(dateOption.value)}
                            className={`checkout-date-option${
                              deliveryDate === dateOption.value ? " is-selected" : ""
                            }`}
                          >
                            {dateOption.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="checkout-date-empty">
                        No delivery dates are available for the next three weeks.
                      </p>
                    )}
                  </div>

                  <div className="checkout-actions">
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      className="checkout-submit"
                      disabled={placing || items.length === 0}
                    >
                      {placing ? "Placing order…" : "Place Order"}
                      {!placing && <ArrowIcon />}
                    </button>
                    <Link to="/cart" className="checkout-back">
                      <BackArrowIcon />
                      Back to cart
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="checkout-summary">
                <h2 className="checkout-summary-title">Order Summary</h2>

                {items.length === 0 ? (
                  <p className="checkout-summary-empty">No items in cart.</p>
                ) : (
                  <div
                    className={[
                      "checkout-summary-scroll",
                      summaryScrollEdges.overflowing ? "is-overflowing" : "",
                      summaryScrollEdges.canScrollUp ? "can-scroll-up" : "",
                      summaryScrollEdges.canScrollDown ? "can-scroll-down" : "",
                      summaryScrolling ? "is-scrolling" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="checkout-summary-fade checkout-summary-fade--top" aria-hidden="true" />
                    <div className="checkout-summary-fade checkout-summary-fade--bottom" aria-hidden="true" />
                    <div
                      ref={summaryListRef}
                      className={`checkout-summary-list${summaryScrolling ? " is-scrolling" : ""}`}
                      onScroll={handleSummaryScroll}
                    >
                      {items.map((item) => {
                        const showUnit = item.unit_name && item.unit_name !== "No Unit";
                        return (
                          <div key={item.id} className="checkout-summary-item">
                            <div className="checkout-summary-thumb">
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
                            <div className="checkout-summary-info">
                              <p className="checkout-summary-name">{item.name}</p>
                              <p className="checkout-summary-meta">
                                {showUnit ? `${item.unit_name} · ` : ""}
                                Qty {item.qty}
                              </p>
                            </div>
                            <p className="checkout-summary-line">
                              ${(item.price * item.qty).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="checkout-summary-rows">
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Items</span>
                    <span>{itemCount}</span>
                  </div>
                </div>

                <hr className="checkout-summary-divider" />

                <div className="checkout-summary-total">
                  <span className="checkout-summary-total-label">Total</span>
                  <span className="checkout-summary-total-value">${total.toFixed(2)}</span>
                </div>

                <p className="checkout-summary-note">
                  Secure checkout · Fresh produce packed with care
                </p>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <FooterPage />
    </div>
  );
};

export default CheckOutPage;
