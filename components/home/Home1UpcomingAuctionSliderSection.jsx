"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import Link from "next/link";
import { useCountdownTimer } from "@/customHooks/useCountdownTimer";
import { apiGet } from "../../lib/api";

SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

const getImageUrl = (img) => {
  if (!img) return '/assets/img/home1/upcoming-auction-img1.jpg';
  if (img.startsWith('http')) return img;
  if (img.startsWith('assets')) return `/${img}`;
  return img;
}

const UpcomingAuctionCard = ({ auction }) => {
  const { days, hours, minutes, seconds } = useCountdownTimer(auction.startTime); // Use startTime for upcoming

  return (
    <div className="auction-card">
      <div className="auction-card-img-wrap">
        <Link href={`/auction/${auction._id}`} className="card-img">
          <img src={getImageUrl(auction.paintingId?.image || auction.image)} alt={auction.title} />
        </Link>
        <div className="batch">
          <span className="upcoming">UpComing</span>
        </div>
        <a href="#" className="wishlist">
          <svg width={16} height={15} viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.00013 3.32629L7.32792 2.63535C5.75006 1.01348 2.85685 1.57317 1.81244 3.61222C1.32211 4.57128 1.21149 5.95597 2.10683 7.72315C2.96935 9.42471 4.76378 11.4628 8.00013 13.6828C11.2365 11.4628 13.03 9.42471 13.8934 7.72315C14.7888 5.95503 14.6791 4.57128 14.1878 3.61222C13.1434 1.57317 10.2502 1.01254 8.67234 2.63441L8.00013 3.32629ZM8.00013 14.8125C-6.375 5.31378 3.57406 -2.09995 7.83512 1.8216C7.89138 1.87317 7.94669 1.9266 8.00013 1.98192C8.05303 1.92665 8.10807 1.87349 8.16513 1.82254C12.4253 -2.10182 22.3753 5.31284 8.00013 14.8125Z" />
          </svg>
        </a>
        <div className="countdown-timer">
          <ul data-countdown={auction.startTime}>
            <li className="times" data-days={days}>{days}D</li>
            <li className="colon">:</li>
            <li className="times" data-hours={hours}>{hours}H</li>
            <li className="colon">:</li>
            <li className="times" data-minutes={minutes}>{minutes}M</li>
            <li className="colon">:</li>
            <li className="times" data-seconds={seconds}>{seconds}S</li>
          </ul>
        </div>
      </div>
      <div className="auction-card-content">
        <h4><Link href={`/auction/${auction._id}`}>{auction.title}</Link></h4>
        <div className="price-area">
          <span>Starting Bid</span>
          <strong>${auction.startingBid}</strong>
        </div>
        <div className="bid-area">
          <div className="bid-amount">
            <div className="icon">
              <svg width={20} height={20} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" />
                <path d="M10.5 5H9V11L14.2 14.2L15 12.9L10.5 10.2V5Z" />
              </svg>
            </div>
            <p>0 Bids</p>
          </div>
          <Link href={`/auction/${auction._id}`} className="bid-btn">Place Bid</Link>
        </div>
      </div>
    </div>
  );
};

const Home1UpcomingAuctionSliderSection = () => {
  const [auctions, setAuctions] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet('/auctions?status=upcoming&limit=8'),
      apiGet('/config/home_upcoming_auction_section')
    ])
      .then(([auctionsData, configData]) => {
        setAuctions(auctionsData);
        setConfig(configData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch upcoming auctions data", err);
        setLoading(false);
      });
  }, []);

  const settings = useMemo(() => {
    return {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 25,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".upcoming-auction-slider-next",
        prevEl: ".upcoming-auction-slider-prev",
      },
      breakpoints: {
        280: { slidesPerView: 1 },
        386: { slidesPerView: 1 },
        576: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 4, spaceBetween: 15 },
        1400: { slidesPerView: 4 },
      },
    };
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading Upcoming Auctions...</div>;
  }

  if (auctions.length === 0) {
    return null; // Or show a message
  }

  return (
    <div className="home1-upcoming-auction-slider-section mb-120">
      <div className="container">
        <div className="row mb-50 align-items-center justify-content-between flex-wrap gap-3 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div className="col-lg-8 col-md-9">
            <div className="section-title">
              <h3>{config?.title || "Upcoming Auctions"}</h3>
              <p>{config?.description || "Join us for an exhilarating live auction experience where art meets excitement."}</p>
            </div>
          </div>
          <div className="col-lg-2 col-md-2 d-flex justify-content-md-end">
            <Link href="/upcoming-auction-grid" className="view-all-btn">View All</Link>
          </div>
        </div>
        <div className="upcoming-auction-slider-wrap wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div className="row">
            <div className="col-lg-12">
              <Swiper {...settings} className="swiper home1-upcoming-auction-slider">
                <div className="swiper-wrapper">
                  {auctions.map((auction) => (
                    <SwiperSlide key={auction._id} className="swiper-slide">
                      <UpcomingAuctionCard auction={auction} />
                    </SwiperSlide>
                  ))}
                </div>
              </Swiper>
            </div>
          </div>
          <div className="slider-btn-group">
            <div className="upcoming-auction-slider-prev slider-btn">
              <svg width={9} height={15} viewBox="0 0 9 15" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.535 13.6364L7.4175 14.7539L0.16375 7.50015L7.4175 0.246399L8.535 1.3639L2.39875 7.50015L8.535 13.6364Z" />
              </svg>
            </div>
            <div className="upcoming-auction-slider-next slider-btn">
              <svg width={9} height={15} viewBox="0 0 9 15" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.465 1.3636L1.5825 0.246094L8.83625 7.49984L1.5825 14.7536L0.465 13.6361L6.60125 7.49984L0.465 1.3636Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home1UpcomingAuctionSliderSection;
