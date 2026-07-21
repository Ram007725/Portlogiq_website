import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const reviews = [
  {
    title: "Fruit and veg box is excellent quality",
    body: "Fruit and veg box was excellent quality extremely happy",
    author: "Anonymous",
    date: "06/02/2026",
    product: "Fruit & Vegetable Box: $95 AUD",
  },
  {
    title: "Always happy with your service and produce",
    body: "Always happy with your service and produce. You do an amazing job. Thank you so much.",
    author: "Denise Baxter",
    date: "05/11/2026",
    product: "Fruit & Vegetable Box: $95 AUD",
  },
  {
    title: "Excellent fruit and veg box",
    body: "I always love receiving my fruit and veg box. It is delivered in a box so reduces unnecessary waste and packaging. Always fresh and a good assortment of tasty produce.",
    author: "Annabelle",
    date: "03/20/2026",
    product: "Fruit & Vegetable Box: $55 AUD",
  },
  {
    title: "Love my fruit & veg box",
    body: "It makes me so happy when I receive my produce every fortnight. It is super convenient, good value and a great assortment of usable ingredients.",
    author: "Annabelle",
    date: "02/04/2026",
    product: "Fruit & Vegetable Box: $55 AUD",
  },
  {
    title: "Fabulous food!",
    body: "This is an affordable fruit and veg box. It's all stuff we would actually use too. It's exciting to cook now ☺️",
    author: "Rachel Thorn",
    date: "10/02/2024",
    product: "Fruit & Vegetable Box: $95 AUD",
  },
];

const ReviewsSection = () => {
  return (
    <section className="home-section home-section-soft">
      <div className="max-w-6xl mx-auto">
        <div className="home-reviews-header">
          <span className="home-produce-eyebrow">Customer Love</span>
          <h2 className="home-section-title home-heading mb-2">Let customers speak for us</h2>
          <p className="home-body-text text-sm">from 19 reviews</p>
        </div>

        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="home-swiper-pagination home-reviews-swiper"
        >
          {reviews.map((review, idx) => (
            <SwiperSlide key={idx}>
              <div className="home-review-card">
                <div className="home-review-stars home-star">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <h4 className="home-review-title">{review.title}</h4>
                <p className="home-review-body">{review.body}</p>
                <div className="home-review-footer">
                  <p className="home-review-author">
                    {review.author} <span aria-hidden="true">&middot;</span> {review.date}
                  </p>
                  <p className="home-review-product">{review.product}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ReviewsSection;
