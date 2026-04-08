import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SongCard from '../components/SongCard';
import { formatPlays } from '../helpers/formatter';
import fallbackRandom from '../fallback/random.json';
import fallbackTopSongs from '../fallback/top_songs.json';
import fallbackTopAlbums from '../fallback/top_albums.json';
import fallbackAlbums from '../fallback/albums.json';
import config from '../config.json';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const [songOfTheDay, setSongOfTheDay] = useState({});
  const [topSongs, setTopSongs] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const gsapDataDone = useRef(false);

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
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.city && data.country_name) {
          setUserLocation(`${data.city}, ${data.country_name}`);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = 'Swiftify';
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

  // Static GSAP — hero zoom + stats entrance + counter
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Carousel slowly zooms as you scroll past hero
      gsap.fromTo('.sw-hero__right',
        { scale: 1 },
        {
          scale: 1.07,
          ease: 'none',
          scrollTrigger: {
            trigger: '.sw-hero-container',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          }
        }
      );

      // Stats bar stagger entrance
      gsap.from('.sw-stat', {
        y: 56,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.sw-stats-bar', start: 'top 88%' }
      });

      // Count-up: 226 songs
      const songProxy = { val: 0 };
      gsap.to(songProxy, {
        val: 226,
        duration: 2,
        ease: 'power2.out',
        onUpdate() {
          const el = document.getElementById('stat-songs');
          if (el) el.textContent = Math.round(songProxy.val);
        },
        scrollTrigger: { trigger: '.sw-stats-bar', start: 'top 88%' }
      });

      // Count-up: 11 albums
      const albumProxy = { val: 0 };
      gsap.to(albumProxy, {
        val: 11,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate() {
          const el = document.getElementById('stat-albums');
          if (el) el.textContent = Math.round(albumProxy.val);
        },
        scrollTrigger: { trigger: '.sw-stats-bar', start: 'top 88%' }
      });
    });

    return () => ctx.revert();
  }, []);

  // Data-dependent GSAP — cards, titles, pullquote, rows
  useEffect(() => {
    if (!topSongs.length || !topAlbums.length || !allAlbums.length || gsapDataDone.current) return;
    gsapDataDone.current = true;

    const ctx = gsap.context(() => {
      // Section title left-to-right clip reveal
      document.querySelectorAll('.sw-editorial-section__title').forEach(el => {
        gsap.fromTo(el,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.15,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: el, start: 'top 84%' }
          }
        );
      });

      // Album cards stagger up
      gsap.from('.sw-album-overlay-card', {
        y: 72,
        opacity: 0,
        duration: 1,
        stagger: { amount: 0.55, ease: 'power1.out' },
        ease: 'power3.out',
        scrollTrigger: { trigger: '.sw-album-overlay-grid', start: 'top 78%' }
      });

      // Pullquote scrub — scale + opacity tied to scroll progress
      gsap.fromTo('.sw-pullquote__text',
        { opacity: 0.15, scale: 0.9, y: 36 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.sw-pullquote',
            start: 'top 88%',
            end: 'center 52%',
            scrub: 1.8,
          }
        }
      );
      gsap.from('.sw-pullquote__attr', {
        opacity: 0,
        y: 14,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.sw-pullquote', start: 'top 62%' }
      });

      // Song rows stagger in from left
      gsap.from('.sw-ed-song-table tbody tr', {
        x: -28,
        opacity: 0,
        duration: 0.6,
        stagger: 0.055,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.sw-ed-song-table', start: 'top 82%' }
      });
    });

    return () => ctx.revert();
  }, [topSongs, topAlbums, allAlbums]);

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
          <div className="sw-hero__overline">
            {userLocation && (
              <span className="sw-hero__location-pill">
                <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true">
                  <path d="M4 0C1.79 0 0 1.79 0 4c0 3 4 6 4 6s4-3 4-6c0-2.21-1.79-4-4-4zm0 5.5C3.17 5.5 2.5 4.83 2.5 4S3.17 2.5 4 2.5 5.5 3.17 5.5 4 4.83 5.5 4 5.5z"/>
                </svg>
                {userLocation}
              </span>
            )}
            <span>Taylor Swift · Discography</span>
          </div>
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
              <button
                type="button"
                className="sw-hero__song-link"
                onClick={() => setSelectedSongId(songOfTheDay.song_id)}
              >
                {songOfTheDay.title}
              </button>
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
                  alt={`Taylor Swift photo ${idx + 1} of ${heroImages.length}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
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
            <button className="sw-carousel-btn sw-carousel-btn--prev" onClick={handlePrev} aria-label="Previous photo">❮</button>
            <button className="sw-carousel-btn sw-carousel-btn--next" onClick={handleNext} aria-label="Next photo">❯</button>
          </div>
        </div>
        <div className="sw-hero__scroll-cue" aria-hidden="true">
          <span className="sw-hero__scroll-text">scroll</span>
          <span className="sw-hero__scroll-line" />
        </div>
      </section>

      {/* Ticker */}
      <div className="sw-ticker" aria-hidden="true">
        <div className="sw-ticker__track">
          {[0, 1].map(i => (
            <span key={i} className="sw-ticker__inner">
              TAYLOR SWIFT&nbsp;&nbsp;·&nbsp;&nbsp;EVERY ERA&nbsp;&nbsp;·&nbsp;&nbsp;EVERY NOTE&nbsp;&nbsp;·&nbsp;&nbsp;226 SONGS&nbsp;&nbsp;·&nbsp;&nbsp;11 ALBUMS&nbsp;&nbsp;·&nbsp;&nbsp;SWIFTIFY&nbsp;&nbsp;·&nbsp;&nbsp;SHAKE IT OFF&nbsp;&nbsp;·&nbsp;&nbsp;THE ERAS TOUR&nbsp;&nbsp;·&nbsp;&nbsp;FEARLESS&nbsp;&nbsp;·&nbsp;&nbsp;MIDNIGHTS&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="sw-stats-bar">
        <div className="sw-stat">
          <span className="sw-stat__num" id="stat-songs">226</span>
          <span className="sw-stat__label">Songs in the catalog</span>
        </div>
        <div className="sw-stat">
          <span className="sw-stat__num" id="stat-albums">11</span>
          <span className="sw-stat__label">Studio albums</span>
        </div>
        <div className="sw-stat">
          <span className="sw-stat__num">10B+</span>
          <span className="sw-stat__label">Streams tracked</span>
        </div>
      </div>

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
                  loading="lazy"
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
                    <button type="button" className="sw-link" onClick={() => setSelectedSongId(song.song_id)}>
                      {song.title}
                    </button>
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
