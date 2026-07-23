import { useState } from 'react'
import './App.css'
import Collection from './pages/Collection.jsx';
import Shop from './pages/Shop.jsx';
import CheckOut from './pages/CheckOut.jsx';
import Product from './pages/Product.jsx';
import IndexPage from './pages/Index.jsx';
import Home from './pages/Home.jsx';
import CartPage from './pages/cart.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import SignInPage from './components/auth/SignInForm.jsx';
import RegisterPage from './components/auth/RegisterForm.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
 const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "drawing", "geometry", "marker"],
  });

  if (loadError) return <div>Failed to load Google Maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <>
      <ToastContainer
        style={{ marginTop: "4.5rem", zIndex: 9999 }}
        position="top-right"
        autoClose={3200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="brand-toast"
        bodyClassName="brand-toast__body"
      />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<IndexPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/categoryproduct/:id" element={<Collection />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/thankyou/:order_number" element={<ThankYouPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
