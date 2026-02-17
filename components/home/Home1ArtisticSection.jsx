"use client";
import React, { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

const Home1ArtisticSection = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/config/home_artistic_section')
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch artistic section config:", err);
                setLoading(false);
            });
    }, []);

    // Helper to ensure image path is correct
    const getImageUrl = (img, defaultImg) => {
        if (!img) return defaultImg;
        if (img.startsWith('http')) return img;
        if (img.startsWith('assets')) return `/${img}`;
        return img;
    }

    if (loading) return null;
    
    // Default config if none returned
    const finalConfig = config || {
        image: "assets/img/home1/artistic-img.png",
        title: "Our Artistic Endeavor",
        description: "At Artmart, our mission is to revolutionize the art experience We are committed to:",
        items: [
            "Connecting artists and collectors from around the world.",
            "Providing a platform for emerging and established artists.",
            "Ensuring transparency and authenticity in every transaction."
        ]
    };

    return (
        <div className="home1-artistic-section mb-120">
            <div className="container">
                <div className="row gy-md-5 g-4">
                    <div className="col-lg-7 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                        <div className="artistic-img">
                            <img src={getImageUrl(finalConfig.image, "/assets/img/home1/artistic-img.png")} alt="" />
                        </div>
                    </div>
                    <div className="col-lg-5 wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
                        <div className="artistic-content">
                            <h3>{finalConfig.title}</h3>
                            <p>{finalConfig.description}</p>
                            <ul>
                                {finalConfig.items && finalConfig.items.map((item, index) => (
                                    <li key={index}>
                                        <svg width={18} height={14} viewBox="0 0 18 14" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M16.4372 6.03907C14.0967 6.03907 11.9636 3.90787 11.9636 1.56547V0.605469H10.0436V1.56547C10.0436 3.26851 10.7905 4.86595 11.9626 6.03907H0.117188V7.95907H11.9626C10.7905 9.13219 10.0436 10.7296 10.0436 12.4327V13.3927H11.9636V12.4327C11.9636 10.0912 14.0967 7.95907 16.4372 7.95907H17.3972V6.03907H16.4372Z" />
                                        </svg>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p>We believe that art has the power to inspire, transform, and connect people. Our goal is to
                                bring this power to life by creating.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home1ArtisticSection
