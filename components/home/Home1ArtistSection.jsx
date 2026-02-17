"use client";
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

const Home1ArtistSection = () => {
  const [artists, setArtists] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/home1/artist-img1.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    Promise.all([
      apiGet('/artists-public?limit=10'),
      apiGet('/config/home_artist_section')
    ])
      .then(([artistsData, configData]) => {
        setArtists(artistsData || []);
        setConfig(configData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch artists data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // Or a loading spinner

  return (
    <div className="home1-artist-section mb-120">
    <div className="container">
      <div className="row mb-50 align-items-center justify-content-between flex-wrap gap-3 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
        <div className="col-lg-8 col-md-9">
          <div className="section-title">
            <h3>{config?.title || "Feature Artists"}</h3>
            <p>{config?.description || "Join us for an exhilarating live auction experience where art meets excitement."}</p>
          </div>
        </div>
        <div className="col-lg-2 col-md-2 d-flex justify-content-md-end">
          <Link href="/artists" className="view-all-btn">View All</Link>
        </div>
      </div>
      <div className="row g-3 row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1">
        {artists.map((artist, index) => (
          <div key={artist._id || index} className="col wow animate fadeInDown" data-wow-delay={`${200 + (index * 100)}ms`} data-wow-duration="1500ms">
            <div className="artist-card">
              <Link href={`/gallery?artist=${encodeURIComponent(artist.name)}`}>
                <img src={getImageUrl(artist.image)} alt={artist.name} />
              </Link>
              <div className="artist-content">
                <h6><Link href={`/gallery?artist=${encodeURIComponent(artist.name)}`}>{artist.name}</Link></h6>
                <span>{artist.country}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

export default Home1ArtistSection
