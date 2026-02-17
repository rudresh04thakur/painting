"use client";
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import CountUp from 'react-countup';
import { apiGet } from '../../lib/api'

const getImageUrl = (img, defaultImg) => {
    if (!img) return defaultImg;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;
    return `/${img}`;
};

const Home1AboutSection = () => {
    const [data, setData] = useState({
        title: "Discover the Beauty of Art",
        description: "We bring you the finest collection of contemporary and classic art pieces. Our gallery features works from renowned artists across the globe, curated to inspire and elevate your space.",
        features: ["Original Artworks", "Certified Authenticity", "Global Shipping"],
        stats: [
            { value: 2500, label: "Artworks", suffix: "+" },
            { value: 120, label: "Artists", suffix: "+" },
            { value: 15, label: "Years Experience", suffix: "+" }
        ],
        image1: "/assets/img/home1/about-img1.jpg",
        image2: "/assets/img/home1/about-img2.jpg"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/config/home_about_section')
            .then(res => {
                if (res) setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch about section config", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null; // Or a skeleton loader
    if (!data) return null;

    return (
        <>
            <div className="home1-about-section mb-120">
                <div className="container">
                    <div className="row align-items-end">
                        <div className="col-xl-8 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                            <div className="about-content-wrap">
                                <div className="row g-4">
                                    <div className="col-lg-6">
                                        <div className="about-img">
                                            <img src={getImageUrl(data.image1, "/assets/img/home1/about-img1.jpg")} alt="About Image 1" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="about-content">
                                            <h3>{data.title}</h3>
                                            <p>{data.description}</p>
                                            <ul>
                                                {data.features && data.features.map((feature, index) => (
                                                    <li key={index}>
                                                        <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 6.5L5 10.5L11 1.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Link href="/about" className="learn-btn d-xl-none d-flex">Learn <br /> More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xl-9 col-lg-8">
                                        <div className="countdown-wrap">
                                            <ul className="countdown-list">
                                                {data.stats && data.stats.map((stat, index) => (
                                                    <li key={index} className="single-countdown">
                                                        <div className="number">
                                                            <h3 className="counter">
                                                                <CountUp end={Number(stat.value)} duration={3} />
                                                            </h3>
                                                            {stat.suffix && <strong>{stat.suffix}</strong>}
                                                        </div>
                                                        <span>{stat.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4  wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
                            <div className="about-img-wrap d-xl-block d-none">
                                <img src={getImageUrl(data.image2, "/assets/img/home1/about-img2.jpg")} alt="About Image 2" />
                                <Link href="/about" className="learn-btn">Learn <br /> More</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home1AboutSection
