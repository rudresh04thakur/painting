"use client";
import React, { useMemo, useEffect, useState } from "react";
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

const Banner1 = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/config/home_banner_slider')
            .then(data => {
                setSlides(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch banner config:", err);
                setLoading(false);
            });
    }, []);

    const settings = useMemo(() => {
        return {
            slidesPerView: "auto",
            speed: 1500,
            effect: 'fade',
            autoplay: {
                delay: 2500, // Autoplay duration in milliseconds
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination1",
                clickable: true,
            },
        };
    }, []);

    // Helper to ensure image path is correct
    const getImageUrl = (img) => {
        if (!img) return '/assets/img/home1/home1-banner-bg1.jpg';
        if (img.startsWith('http')) return img;
        if (img.startsWith('assets')) return `/${img}`;
        return img;
    }

    if (loading) return null; // Or a skeleton

    return (
        <>
            <div className="home1-banner-section mb-120">
                <Swiper {...settings} className="swiper home1-banner-slider">
                    <div className="swiper-wrapper">
                        {slides.length > 0 ? (
                            slides.map((slide, index) => (
                                <SwiperSlide key={index} className="swiper-slide">
                                    <div className="banner-bg" style={{ backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.46) 0%, rgba(0, 0, 0, 0.46) 100%), url(${getImageUrl(slide.backgroundImage || slide.bgImage)})` }}>
                                    </div>
                                    <div className="banner-wrapper">
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-xxl-7 col-lg-8">
                                                    <div className="banner-content">
                                                        {slide.subtitle && <span>{slide.subtitle}</span>}
                                                        <h1>{slide.title}</h1>
                                                        <p>{slide.description}</p>
                                                        <Link href={slide.btnLink || "/auctions"} className="primary-btn1 btn-hover">
                                                            <span>{slide.btnText || "Explore Now"}</span>
                                                            <strong style={{top: '48px', left: '69.5px'}} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : (
                            // Fallback if no slides
                            <SwiperSlide className="swiper-slide">
                                <div className="banner-bg" style={{ backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.46) 0%, rgba(0, 0, 0, 0.46) 100%), url(assets/img/home1/home1-banner-bg1.jpg)' }}>
                                </div>
                                <div className="banner-wrapper">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-xxl-7 col-lg-8">
                                                <div className="banner-content">
                                                    <span>Welcome To ArtMart</span>
                                                    <h1>Discover, Bid, And Collect Rare Artworks</h1>
                                                    <p>Experience the thrill of the auction from the comfort of your home.</p>
                                                    <Link href="/auctions" className="primary-btn1 btn-hover">
                                                        <span>Explore Now</span>
                                                        <strong style={{top: '48px', left: '69.5px'}} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )}
                    </div>
                </Swiper>
                <div className="pagination-area">
                    <div className="swiper-pagination1" />
                </div>
            </div>
        </>
    )
}

export default Banner1