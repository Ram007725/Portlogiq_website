import { useEffect, useState } from "react";
import api from "../services/api";
import FooterPage from "../components/FooterPage.jsx";
import HeaderPage from "../components/HeaderPage.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

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

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(10.0);
  const [total, setTotal] = useState(0);

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

      const deliveryDaysRes = await api.get("/api/store/order/delivery-days");
      const days = deliveryDaysRes?.data?.delivery_days || [];
      const normalizedDays = Array.isArray(days)
        ? days
            .map((day) => String(day).trim().toLowerCase())
            .filter((day) => day in WEEKDAY_INDEX)
        : [];

      setDeliveryDays(normalizedDays);
    } catch (err) {
      console.error("User not logged in or failed to fetch user:", err);
    }
  };

  fetchUserDetails();
}, []);

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

      // Sanctum CSRF token
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
      // toast.error("Something went wrong while placing the order.");
    }
  };

  return (
    <div>
      <HeaderPage />

      {/* Checkout Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 mt-11">
        {/* Step Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold z-10 ${
                    step <= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {["Cart", "Shipping", "Payment", "Review"][step - 1]}
                </p>
                {step !== 4 && (
                  <div className="absolute top-5 left-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Checkout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 bg-white p-16 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                {availableDeliveryDates.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableDeliveryDates.map((dateOption) => (
                      <button
                        key={dateOption.value}
                        type="button"
                        onClick={() => setDeliveryDate(dateOption.value)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          deliveryDate === dateOption.value
                            ? "border-blue-600 bg-blue-600 text-white shadow"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {dateOption.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    No delivery dates are available for the next three weeks.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-8 w-32 bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700"
            >
              Place Order
            </button>
          </div>

          {/* Right Side - Summary */}
          <div className="bg-gray-50 p-16 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {items.length === 0 ? (
              <p className="text-gray-500">No items in cart.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.unit_name !== "No Unit" && (
                        <p className="text-sm text-gray-500">{item.unit_name}</p>
                      )}
                      <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterPage />
    </div>
  );
};

export default CheckOutPage;
