import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import fallbackAlbums from '../fallback/albums.json';
const config = require('../config.json');

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/albums`)
      .then(res => res.json())
      .then(resJson => {
        setAlbums(resJson);
        localStorage.setItem('sw_cache_albums', JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_albums');
        if (cached) setAlbums(JSON.parse(cached));
        else setAlbums(fallbackAlbums);
      });
  }, []);

  return (
    <div className="sw-page">
      <h1 className="sw-heading">Albums</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
        The complete Taylor Swift discography
      </p>
      <div className="sw-albums-grid">
        {albums.map((album) => (
          <NavLink
            key={album.album_id}
            to={`/albums/${album.album_id}`}
            className="sw-album-card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <img
              src={album.thumbnail_url}
              alt={`${album.title} album art`}
            />
            <h4>
              {album.title}
            </h4>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
