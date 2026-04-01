import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import SongCard from '../components/SongCard';
import { formatPlays } from '../helpers/formatter';
import fallbackRandom from '../fallback/random.json';
import fallbackTopSongs from '../fallback/top_songs.json';
import fallbackTopAlbums from '../fallback/top_albums.json';
import fallbackAlbums from '../fallback/albums.json';
const config = require('../config.json');

export default function HomePage() {
  const [songOfTheDay, setSongOfTheDay] = useState({});
  const [topSongs, setTopSongs] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
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
  }, [currentHeroIdx]);

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

    fetch(`http://${config.server_host}:${config.server_port}/top_songs?page=1&page_size=8`)
      .then(res => res.json())
      .then(resJson => {
        setTopSongs(resJson);
        localStorage.setItem('sw_cache_top_songs_8', JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_top_songs_8');
        if (cached) setTopSongs(JSON.parse(cached));
        else setTopSongs(fallbackTopSongs.slice(0, 8));
      });

    fetch(`http://${config.server_host}:${config.server_port}/top_albums?page=1&page_size=5`)
      .then(res => res.json())
      .then(resJson => {
        setTopAlbums(resJson);
        localStorage.setItem('sw_cache_top_albums_5', JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_top_albums_5');
        if (cached) setTopAlbums(JSON.parse(cached));
        else setTopAlbums(fallbackTopAlbums.slice(0, 5));
      });

    fetch(`http://${config.server_host}:${config.server_port}/albums`)
      .then(res => res.json())
      .then(resJson => {
        setAllAlbums(resJson);
        localStorage.setItem('sw_cache_albums_all', JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_albums_all');
        if (cached) setAllAlbums(JSON.parse(cached));
        else setAllAlbums(fallbackAlbums);
      });
  }, []);

  const albumsWithThumbs = topAlbums.map(ta => {
    const full = allAlbums.find(a => a.album_id === ta.album_id);
    return { ...ta, thumbnail_url: full?.thumbnail_url };
  });

  return (
    <div>
      {selectedSongId && (
        <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />
      )}

      {/* Full-bleed Hero */}
      <section className="sw-hero-container">
        <div className="sw-hero__left">
          <div className="sw-hero__overline">Taylor Swift Discography Explorer</div>
          <h1 className="sw-hero__title">Every <em>era.</em><br/>Every <em>note.</em></h1>
          <p className="sw-hero__desc">
            Explore the complete catalog. Track acoustics, discover hidden favorites, and generate surprise playlists across every era.
          </p>
          <NavLink to="/albums" className="sw-hero__cta" style={{ textDecoration: 'none' }}>
            Explore the Collection →
          </NavLink>
          <div className="sw-hero__sotd">
            <div>
              <p className="sw-hero__sotd-label">Song of the Day</p>
              <span
                className="sw-hero__song-link"
                onClick={() => setSelectedSongId(songOfTheDay.song_id)}
              >
                {songOfTheDay.title}
              </span>
            </div>
          </div>
        </div>
        <div className="sw-hero__right">
          <div className="sw-carousel-container">
            {heroImages.map((src, idx) => {
              let offset = idx - currentHeroIdx;
              if (currentHeroIdx === heroImages.length - 1 && idx === 0) offset = 1;
              if (currentHeroIdx === 0 && idx === heroImages.length - 1) offset = -1;
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
                    transition: isVisible ? 'transform 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                    visibility: isVisible ? 'visible' : 'hidden',
                    zIndex: offset === 0 ? 2 : 1
                  }}
                />
              );
            })}
            <button className="sw-carousel-btn sw-carousel-btn--prev" onClick={handlePrev}>❮</button>
            <button className="sw-carousel-btn sw-carousel-btn--next" onClick={handleNext}>❯</button>
          </div>
        </div>
      </section>

      {/* Editorial Content */}
      <div className="sw-editorial-content">

        {/* Top Albums */}
        <section className="sw-editorial-section">
          <div className="sw-editorial-section__header">
            <h2 className="sw-editorial-section__title">Top <em>Albums</em></h2>
            <NavLink to="/albums" className="sw-editorial-section__link">View All Albums</NavLink>
          </div>
          <div className="sw-album-overlay-grid">
            {albumsWithThumbs.map((album) => (
              <NavLink
                key={album.album_id}
                to={`/albums/${album.album_id}`}
                className="sw-album-overlay-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={album.thumbnail_url}
                  alt={album.title}
                  className="sw-album-overlay-card__img"
                />
                <div className="sw-album-overlay-card__overlay">
                  <div className="sw-album-overlay-card__title">{album.title}</div>
                  <div className="sw-album-overlay-card__sub">{formatPlays(album.plays)} plays</div>
                </div>
              </NavLink>
            ))}
          </div>
        </section>

        {/* Pullquote */}
        <div className="sw-pullquote">
          <p className="sw-pullquote__text">"People haven't always been there for me, but music always has."</p>
          <p className="sw-pullquote__attr">— Taylor Swift</p>
        </div>

        {/* Top Songs */}
        <section className="sw-editorial-section">
          <div className="sw-editorial-section__header">
            <h2 className="sw-editorial-section__title">Top <em>Songs</em></h2>
            <NavLink to="/songs" className="sw-editorial-section__link">View All Songs</NavLink>
          </div>
          <table className="sw-ed-song-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Album</th>
                <th>Plays</th>
              </tr>
            </thead>
            <tbody>
              {topSongs.map((song, i) => (
                <tr key={song.song_id}>
                  <td>{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <span className="sw-link" onClick={() => setSelectedSongId(song.song_id)}>
                      {song.title}
                    </span>
                  </td>
                  <td>
                    <NavLink className="sw-link" to={`/albums/${song.album_id}`}>
                      {song.album}
                    </NavLink>
                  </td>
                  <td>{formatPlays(song.plays)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

    </div>
  );
}
