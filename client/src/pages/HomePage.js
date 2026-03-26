import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import fallbackRandom from '../fallback/random.json';
import fallbackAuthor from '../fallback/author.json';
const config = require('../config.json');

export default function HomePage() {
  const [songOfTheDay, setSongOfTheDay] = useState({});
  const [authorName, setAuthorName] = useState('');
  const [selectedSongId, setSelectedSongId] = useState(null);

  const heroImages = [
    '/img/taylor-1.png', 
    '/img/taylor-2.png', 
    '/img/taylor-3.png', 
    '/img/taylor-4.avif', 
    '/img/taylor-5.webp',
    '/img/taylor-6.png',
    '/img/taylor-7.png',
    '/img/taylor-8.png'
  ];
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentHeroIdx(prev => (prev - 1 + heroImages.length) % heroImages.length);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
  };

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => {
        setSongOfTheDay(resJson);
        localStorage.setItem('sw_cache_random', JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_random');
        if (cached) setSongOfTheDay(JSON.parse(cached));
        else setSongOfTheDay(fallbackRandom);
      });

    fetch(`http://${config.server_host}:${config.server_port}/author/name`)
      .then(res => res.json())
      .then(resJson => {
        setAuthorName(resJson.data);
        localStorage.setItem('sw_cache_author', resJson.data);
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_author');
        if (cached) setAuthorName(cached);
        else setAuthorName(fallbackAuthor.data || 'Thomas Ou');
      });
  }, []);

  const songColumns = [
    {
      field: 'title',
      headerName: 'Song Title',
      renderCell: (row) => (
        <span className="sw-link" onClick={() => setSelectedSongId(row.song_id)}>
          {row.title}
        </span>
      ),
    },
    {
      field: 'album',
      headerName: 'Album',
      renderCell: (row) => (
        <NavLink className="sw-link" to={`/albums/${row.album_id}`}>{row.album}</NavLink>
      ),
    },
    { field: 'plays', headerName: 'Plays' },
  ];

  const albumColumns = [
    {
      field: 'title',
      headerName: 'Album Title',
      renderCell: (row) => (
        <NavLink className="sw-link" to={`/albums/${row.album_id}`}>{row.title}</NavLink>
      ),
    },
    { field: 'plays', headerName: 'Plays' },
  ];

  return (
    <div className="sw-page">
      {selectedSongId && (
        <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />
      )}

      {/* Hero */}
      <div className="sw-hero-container">
        <div className="sw-hero__text">
          <h1 className="sw-hero__title">Welcome to Swiftify</h1>
          <p className="sw-hero__desc">
            Explore the complete Taylor Swift discography, track acoustics, discover new favorites, and generate surprise playlists.
          </p>
          <div className="sw-hero__sotd">
            <p className="sw-hero__sotd-label">✦ Song of the Day</p>
            <span
              className="sw-hero__song-link"
              onClick={() => setSelectedSongId(songOfTheDay.song_id)}
            >
              {songOfTheDay.title}
            </span>
          </div>
        </div>
        <div 
          className="sw-carousel-container" 
          style={{ 
            position: 'relative', width: '45%', height: '380px', overflow: 'hidden', 
            borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', 
            border: '1px solid rgba(255,255,255,0.08)' 
          }}
        >
          {heroImages.map((src, idx) => {
            let offset = idx - currentHeroIdx;
            // Wrap the offsets for infinite looping behavior
            if (currentHeroIdx === heroImages.length - 1 && idx === 0) offset = 1;
            if (currentHeroIdx === 0 && idx === heroImages.length - 1) offset = -1;
            
            // Only transition the active, next, and prev elements so they don't slide wildly when wrapping
            const isVisible = Math.abs(offset) <= 1;

            return (
              <img 
                key={src}
                src={src} 
                alt={`Taylor Swift slide ${idx}`} 
                style={{ 
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: `translateX(${offset * 100}%)`,
                  transition: isVisible ? 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                  visibility: isVisible ? 'visible' : 'hidden',
                  zIndex: offset === 0 ? 2 : 1
                }}
              />
            )
          })}
          <button className="sw-carousel-btn sw-carousel-btn--prev" onClick={handlePrev}>❮</button>
          <button className="sw-carousel-btn sw-carousel-btn--next" onClick={handleNext}>❯</button>
        </div>
      </div>

      <hr className="sw-divider" />

      {/* Top Songs */}
      <h2 className="sw-heading">Top Songs</h2>
      <LazyTable
        route={`http://${config.server_host}:${config.server_port}/top_songs`}
        columns={songColumns}
      />

      <hr className="sw-divider" />

      {/* Top Albums */}
      <h2 className="sw-heading">Top Albums</h2>
      <LazyTable
        route={`http://${config.server_host}:${config.server_port}/top_albums`}
        columns={albumColumns}
        defaultPageSize={5}
        rowsPerPageOptions={[5, 10]}
      />

      <hr className="sw-divider" />
      <p className="sw-created-by">Created by {authorName}</p>
    </div>
  );
}
