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

const Home1TestimonialSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGet('/testimonials'),
            apiGet('/config/home_testimonial_section')
        ])
            .then(([testimonialsData, configData]) => {
                setTestimonials(testimonialsData);
                setConfig(configData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch testimonials data", err);
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
                nextEl: ".testimonial-slider-next",
                prevEl: ".testimonial-slider-prev",
            },
            breakpoints: {
                280: { slidesPerView: 1 },
                386: { slidesPerView: 1 },
                576: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                992: { slidesPerView: 2 },
                1200: { slidesPerView: 3, spaceBetween: 15 },
                1400: { slidesPerView: 3 },
            },
        };
    }, []);

    if (loading) return null;
    if (!testimonials.length) return null;

    // Helper to ensure image path is correct
    const getImageUrl = (img) => {
        if (!img) return '/assets/img/home1/testimonial-author-img1.png'; // Default fallback
        if (img.startsWith('http')) return img;
        if (img.startsWith('assets')) return `/${img}`;
        return img;
    }

    return (
        <div className="home1-testimonial-section mb-120">
            <div className="container">
                <div className="row mb-50 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                    <div className="col-lg-12">
                        <div className="section-title">
                            <h3>{config?.title || "Client Acknowledgment"}</h3>
                            <p>{config?.description || "Join us for an exhilarating live auction experience where art meets excitement."}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid">
                <div className="testimonial-slider-wrap">
                    <div className="row">
                        <div className="col-lg-12">
                            <Swiper {...settings} className="swiper home1-testimonial-slider">
                                <div className="swiper-wrapper">
                                    {testimonials.map((item) => (
                                        <SwiperSlide key={item._id} className="swiper-slide">
                                            <div className="testimonial-card">
                                                <h5>Great Auction Product!</h5>
                                                <p>"{item.content}"</p>
                                                <svg className="quote" width={54} height={49} viewBox="0 0 54 49" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M36.1221 48.6582C36.8815 48.4756 40.3092 46.6602 41.7647 45.6719C43.6526 44.3936 44.7178 43.5234 46.3104 41.9014C51.4678 36.6807 53.419 31.1914 53.8936 20.5781C53.9674 19.0527 53.9991 14.7881 53.978 10.1045C53.9463 2.76758 53.9358 2.17676 53.7565 1.82227C53.5034 1.31738 53.0076 0.801758 52.4803 0.511719L52.0479 0.275391L42.9248 0.275392C35.4682 0.275392 33.728 0.307619 33.3905 0.425783C32.8737 0.6084 32.2198 1.20996 31.9244 1.76856L31.6924 2.20899L31.6608 11.3828C31.6291 21.4697 31.6186 21.2441 32.2725 22.0498C32.4412 22.2647 32.8315 22.5654 33.1373 22.7158L33.6858 22.9951L38.0416 22.9951L42.3975 22.9951L42.3975 23.7793C42.3975 25.498 41.9862 27.915 41.3955 29.7197C40.0561 33.8018 37.7252 36.3799 33.3272 38.625C32.4729 39.0654 31.6397 39.5596 31.4498 39.7637C30.9647 40.2686 30.7643 40.8916 30.817 41.708C30.8592 42.3096 31.0069 42.6963 32.1143 45.0488C33.4116 47.8096 33.6541 48.1855 34.4241 48.5078C34.8987 48.7119 35.637 48.7764 36.1221 48.6582Z" />
                                                    <path d="M6.11524 48.3145C13.2133 45.1563 18.6238 39.7852 21.018 33.5225C21.7035 31.7393 22.3152 29.0215 22.6633 26.2178C23.1063 22.7051 23.1484 21.3838 23.1484 11.6084C23.1484 2.5957 23.1379 2.1875 22.948 1.80078C22.6949 1.27441 22.2414 0.8125 21.6824 0.511719L21.25 0.275391L12.0742 0.275392C2.97227 0.275392 2.89844 0.275392 2.42383 0.500978C1.8543 0.769533 1.43242 1.18848 1.11602 1.7793C0.894533 2.20899 0.894533 2.23047 0.862893 11.3828C0.831253 21.4697 0.820707 21.2441 1.47461 22.0498C1.64336 22.2647 2.0336 22.5654 2.33946 22.7158L2.88789 22.9951L7.29649 22.9951C11.5891 22.9951 11.7051 22.9951 11.7051 23.1992C11.7051 24.0049 11.4309 26.3789 11.2199 27.4531C10.893 29.1074 10.5449 30.1709 9.85938 31.6426C8.40391 34.7578 6.18907 36.8525 2.42383 38.7002C0.483207 39.6455 0.0613324 40.1504 0.0507868 41.5254C0.0507868 42.2666 0.0718802 42.3096 1.26368 44.834C1.92813 46.2305 2.61368 47.5625 2.78243 47.7773C3.53126 48.7012 4.78633 48.9053 6.11524 48.3145Z" />
                                                </svg>
                                                <div className="testimonial-bottom-area">
                                                    <div className="author-area">
                                                        <div className="author-img">
                                                            <img src={getImageUrl(item.image)} alt={item.name} />
                                                        </div>
                                                        <div className="author-content">
                                                            <h5>{item.name}</h5>
                                                            <span>{item.role}</span>
                                                        </div>
                                                    </div>
                                                    <div className="date-and-time-area">
                                                        <strong>{new Date(item.createdAt).toLocaleDateString()}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </div>
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home1TestimonialSection
