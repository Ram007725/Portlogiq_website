import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1600&q=80",
    fallback: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600&q=80",
    eyebrow: "Fresh Produce",
    title: "Experience the Delight of Always Fresh Fruits and Vegetables",
    cta: "See more",
    link: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1600&q=80",
    fallback: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1600&q=80",
    eyebrow: "Farm Dairy",
    title: "Say Cheese with our Dairy-centric Goodies!",
    cta: "See collection",
    link: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1600&q=80",
    fallback: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1600&q=80",
    eyebrow: "Seasonal Fruit",
    title: "Enjoy a variety of fresh fruits throughout the year",
    cta: "See more",
    link: "/shop",
  },
];

const HeroSlide = ({ slide, index }) => {
  const [imgSrc, setImgSrc] = useState(slide.image);

  return (
    <div className="home-hero-slide">
      <div className="home-hero-media">
        <img
          src={imgSrc}
          alt=""
          aria-hidden="true"
          className="home-hero-image"
          onError={() => setImgSrc(slide.fallback)}
        />
      </div>
      <div className="home-hero-overlay" />
      <div className="home-hero-vignette" aria-hidden="true" />

      <div className="home-hero-content">
        <span className="home-hero-eyebrow">{slide.eyebrow}</span>
        <h2 className="home-hero-title">{slide.title}</h2>
        <Link to={slide.link} className="home-hero-cta">
          {slide.cta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <span className="home-hero-counter" aria-hidden="true">
        0{index + 1} <span>/ 0{slides.length}</span>
      </span>
    </div>
  );
};

const HeroCarousel = () => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!swiperInstance) return;
    if (isPlaying) {
      swiperInstance.autoplay.stop();
    } else {
      swiperInstance.autoplay.start();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="home-hero-section">
      <Swiper
        loop
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        navigation={{
          prevEl: ".home-hero-prev",
          nextEl: ".home-hero-next",
        }}
        modules={[Autoplay, EffectFade, Navigation]}
        className="home-hero-swiper"
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <HeroSlide slide={slide} index={idx} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="home-hero-controls">
        <button type="button" className="home-hero-control-btn home-hero-prev" aria-label="Previous slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="home-hero-dots" role="tablist" aria-label="Slides">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`home-hero-dot${idx === activeIndex ? " active" : ""}`}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => swiperInstance?.slideToLoop(idx)}
            />
          ))}
        </div>

        <button type="button" className="home-hero-control-btn home-hero-next" aria-label="Next slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <span className="home-hero-divider" aria-hidden="true" />

        <button
          type="button"
          className="home-hero-control-btn home-hero-playpause"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5.5v13a1 1 0 001.5.87l11-6.5a1 1 0 000-1.74l-11-6.5A1 1 0 007 5.5z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;
