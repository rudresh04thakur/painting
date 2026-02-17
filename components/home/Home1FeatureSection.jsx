"use client";
import React, { useState, useEffect } from 'react';
import { apiGet } from "../../lib/api";

const Home1FeatureSection = () => {
    const [features, setFeatures] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGet('/features'),
            apiGet('/config/home_feature_section')
        ])
            .then(([featuresData, configData]) => {
                setFeatures(featuresData);
                setConfig(configData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch features data", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;
    if (!features.length) return null;

    // Helper to ensure image path is correct
    const getImageUrl = (img, defaultImg) => {
        if (!img) return defaultImg;
        if (img.startsWith('http')) return img;
        if (img.startsWith('assets')) return `/${img}`;
        return img;
    }

    return (
        <div className="home1-feature-section mb-120">
            <div className="container">
                <div className="row gy-lg-0 gy-5 justify-content-between">
                    <div className="col-xl-6 col-lg-7 d-flex align-items-lg-end wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                        <div className="feature-content">
                            <div className="section-title">
                                <h3>{config?.title || "What Makes Us Special"}</h3>
                                <p>{config?.description || "An unparalleled art auction experience where quality, integrity, and passion for art come together."}</p>
                            </div>
                            <ul className="feature-list">
                                {features.map((feature) => (
                                    <li key={feature._id}>
                                        <div className="icon">
                                            <img src={getImageUrl(feature.icon, '/assets/img/home1/feature-icon1.svg')} alt={feature.title} width={24} height={24} />
                                        </div>
                                        <div className="content">
                                            <h5>{feature.title}</h5>
                                            <p>{feature.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-5 position-relative wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
                        <div className="feature-img">
                            <img src={getImageUrl(config?.image, "/assets/img/home1/feature-img.jpg")} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home1FeatureSection
