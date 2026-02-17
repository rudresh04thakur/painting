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
import { apiGet } from "../../lib/api";

SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

const Home1GeneralArtSliderSection = () => {
    const [paintings, setPaintings] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGet('/paintings?limit=10'),
            apiGet('/config/home_general_art_section')
        ])
            .then(([paintingsData, configData]) => {
                setPaintings(paintingsData.items || []);
                setConfig(configData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch paintings data:", err);
                setLoading(false);
            });
    }, []);

    const settings = useMemo(() => {
        return {
            slidesPerView: "auto",
            speed: 1500,
            spaceBetween: 25,
            autoplay: {
                delay: 2500, // Autoplay duration in milliseconds
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".generat-art-slider-next",
                prevEl: ".generat-art-slider-prev",
            },
            breakpoints: {
                280: {
                    slidesPerView: 1,
                },
                386: {
                    slidesPerView: 1,
                },
                576: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 2,
                },
                992: {
                    slidesPerView: 3,
                },
                1200: {
                    slidesPerView: 4,
                    spaceBetween: 15,
                },
                1400: {
                    slidesPerView: 4,
                },
            },
        };
    }, []);

    // Helper to ensure image path is correct
    const getImageUrl = (img) => {
        if (!img) return '/assets/img/default-product.jpg';
        if (img.startsWith('http')) return img;
        if (img.startsWith('assets')) return `/${img}`;
        return img;
    }

    if (loading) return null;

    return (
        <div className="home1-general-art-slider-section mb-120">
            <div className="container">
                <div className="row mb-60 align-items-center justify-content-between flex-wrap gap-3 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                    <div className="col-lg-8 col-md-9">
                        <div className="section-title">
                            <h3>{config?.title || "General Artwork"}</h3>
                            <p>{config?.description || "Join us for an exhilarating live auction experience where art meets excitement."}</p>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-2 d-flex justify-content-md-end">
                        <Link href="/gallery" className="view-all-btn">View All</Link>
                    </div>
                </div>
                <div className="general-art-slider-wrap wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                    <div className="row">
                        <div className="col-lg-12">
                            <Swiper {...settings} className="swiper home1-generat-art-slider">
                                <div className="swiper-wrapper">
                                    {paintings.map((item) => (
                                        <SwiperSlide key={item._id} className="swiper-slide">
                                            <div className="general-art-card">
                                                <div className="general-art-img-wrap">
                                                    <Link href={`/paintings/${item._id}`} className="card-img">
                                                        <img src={getImageUrl(item.images?.[0])} alt={item.title} />
                                                    </Link>
                                                    <div className="batch">
                                                        <span>{item.style}</span>
                                                    </div>
                                                    <a href="#" className="wishlist">
                                                        <svg width={16} height={15} viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8.00013 3.32629L7.32792 2.63535C5.75006 1.01348 2.85685 1.57317 1.81244 3.61222C1.32211 4.57128 1.21149 5.95597 2.10683 7.72315C2.96935 9.42471 4.76378 11.4628 8.00013 13.6828C11.2365 11.4628 13.03 9.42471 13.8934 7.72315C14.7888 5.95503 14.6791 4.57128 14.1878 3.61222C13.1434 1.57317 10.2502 1.01254 8.67234 2.63441L8.00013 3.32629ZM8.00013 14.8125C-6.375 5.31378 3.57406 -2.09995 7.83512 1.8216C7.89138 1.87317 7.94669 1.9266 8.00013 1.98192C8.05303 1.92665 8.10807 1.87349 8.16513 1.82254C12.4253 -2.10182 22.3753 5.31284 8.00013 14.8125Z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                                <div className="general-art-content">
                                                    <h4><Link href={`/paintings/${item._id}`}>{item.title}</Link></h4>
                                                    <div className="price-area">
                                                        <div className="price">
                                                            <span>Price:</span>
                                                            <strong>${item.price?.USD}</strong>
                                                        </div>
                                                        <Link href={`/paintings/${item._id}`} className="buy-btn">Buy Now</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </div>
                            </Swiper>
                        </div>
                    </div>
                    <div className="slider-btn-group">
                        <div className="generat-art-slider-prev slider-btn">
                            <svg width={9} height={15} viewBox="0 0 9 15" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.535 13.6364L7.4175 14.7539L0.16375 7.50015L7.4175 0.246399L8.535 1.3639L2.39875 7.50015L8.535 13.6364Z" />
                            </svg>
                        </div>
                        <div className="generat-art-slider-next slider-btn">
                            <svg width={9} height={15} viewBox="0 0 9 15" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.465 1.3636L1.5825 0.246094L8.83625 7.49984L1.5825 14.7536L0.465 13.6361L6.60125 7.49984L0.465 1.3636Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home1GeneralArtSliderSection
