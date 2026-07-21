import HomeHeader from "../components/HomePage/HomeHeader.jsx";
import HomeFooter from "../components/HomePage/HomeFooter.jsx";
import HeroCarousel from "../components/HomePage/HeroCarousel.jsx";
import CategoryGrid from "../components/HomePage/CategoryGrid.jsx";
import FruitVegSection from "../components/HomePage/FruitVegSection.jsx";
import FeaturedProduct from "../components/HomePage/FeaturedProduct.jsx";
import FeaturesBar from "../components/HomePage/FeaturesBar.jsx";
import AboutFoodSection from "../components/HomePage/AboutFoodSection.jsx";
import ReviewsSection from "../components/HomePage/ReviewsSection.jsx";
import NewsletterSection from "../components/HomePage/NewsletterSection.jsx";
import "../components/HomePage/home.css";

export default function Home() {
  return (
    <div className="home-page min-h-screen">
      <HomeHeader />
      <main className="home-main">
        <HeroCarousel />
        <CategoryGrid />
        <FruitVegSection />
        <FeaturedProduct />
        <FeaturesBar />
        <AboutFoodSection />
        <ReviewsSection />
        <NewsletterSection />
      </main>
      <HomeFooter />
    </div>
  );
}
