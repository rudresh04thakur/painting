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

const getImageUrl = (img) => {
    if (!img) return '/assets/img/home1/blog-img1.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
};

const Home1ArticleSection = () => {
    const [articles, setArticles] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGet('/articles?limit=8'),
            apiGet('/config/home_article_section')
        ])
            .then(([articlesData, configData]) => {
                setArticles(articlesData);
                setConfig(configData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch articles data", err);
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
                nextEl: ".article-slider-next",
                prevEl: ".article-slider-prev",
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

    if (loading) return null;
    if (!articles.length) return null;

    return (
        <div className="home1-article-section mb-120">
            <div className="container">
                <div className="row mb-50 align-items-center justify-content-between flex-wrap gap-3 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                    <div className="col-lg-8 col-md-9">
                        <div className="section-title">
                            <h3>{config?.title || "Latest Article"}</h3>
                            <p>{config?.description || "Our Article is your go-to resource for all things related to art, auctions, and the vibrant community of artists and collectors."}</p>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-2 d-flex justify-content-md-end">
                        <Link href="/article" className="view-all-btn">View All</Link>
                    </div>
                </div>
                <div className="article-slider-wrap wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                    <div className="row">
                        <div className="col-lg-12">
                            <Swiper {...settings} className="swiper home1-article-slider">
                                <div className="swiper-wrapper">
                                    {articles.map((item) => (
                                        <SwiperSlide key={item._id} className="swiper-slide">
                                            <div className="article-card">
                                                <Link href={`/article/${item._id}`} className="article-img">
                                                    <img src={getImageUrl(item.image)} alt={item.title} />
                                                </Link>
                                                <div className="article-content-wrap">
                                                    <div className="article-content">
                                                        <div className="blog-meta">
                                                            <Link href="/article" className="blog-date">
                                                                {new Date(item.publishDate).toLocaleDateString()}
                                                            </Link>
                                                            <div className="blog-comment">
                                                                <span>{item.comments?.length || 0} Comments</span>
                                                            </div>
                                                        </div>
                                                        <h6><Link href={`/article/${item._id}`}>{item.title}</Link></h6>
                                                        <Link href={`/article/${item._id}`} className="read-btn">Read Article</Link>
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
    );
};

export default Home1ArticleSection;
