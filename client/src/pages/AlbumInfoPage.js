import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import SongCard from '../components/SongCard';
import { formatDuration, formatReleaseDate } from '../helpers/formatter';
import fallbackAlbumsBackup from '../fallback/albums_backup.json';
import config from '../config.json';

export default function AlbumInfoPage() {
  const { album_id } = useParams();

  const [songData, setSongData] = useState([]);
  const [albumData, setAlbumData] = useState({});
  const [selectedSongId, setSelectedSongId] = useState(null);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/album/${album_id}`)
      .then(res => res.json())
      .then(resJson => {
        setAlbumData(resJson);
        if (resJson.title) document.title = `${resJson.title} — Swiftify`;
        localStorage.setItem(`sw_cache_albuminfo_${album_id}`, JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem(`sw_cache_albuminfo_${album_id}`);
        if (cached) setAlbumData(JSON.parse(cached));
        else if (fallbackAlbumsBackup.info[album_id]) setAlbumData(fallbackAlbumsBackup.info[album_id]);
      });

    fetch(`http://${config.server_host}:${config.server_port}/album_songs/${album_id}`)
      .then(res => res.json())
      .then(resJson => {
        setSongData(resJson);
        localStorage.setItem(`sw_cache_albumsongs_${album_id}`, JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem(`sw_cache_albumsongs_${album_id}`);
        if (cached) setSongData(JSON.parse(cached));
        else if (fallbackAlbumsBackup.songs[album_id]) setSongData(fallbackAlbumsBackup.songs[album_id]);
      });
  }, [album_id]);

  return (
    <div className="sw-page">
      {selectedSongId && (
        <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />
      )}

      {/* Back button */}
      <NavLink
        to="/albums"
        className="sw-link"
        style={{
          display: 'inline-block',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        ← Back to Albums
      </NavLink>

      {/* Album header */}
      <div className="sw-album-info-header">
        <img
          src={albumData.thumbnail_url}
          alt={`${albumData.title} album art`}
        />
        <div>
          <h1>{albumData.title}</h1>
          <p>Released: {formatReleaseDate(albumData.release_date)}</p>
        </div>
      </div>

      {/* Track list */}
      <div className="sw-table-container">
        <table className="sw-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Plays</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {songData.map((song) => (
              <tr key={song.song_id}>
                <td style={{ color: 'var(--text-muted)', width: '3rem' }}>{song.number}</td>
                <td>
                  <button
                    type="button"
                    className="sw-link"
                    onClick={() => setSelectedSongId(song.song_id)}
                  >
                    {song.title}
                  </button>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{song.plays?.toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)' }}>{formatDuration(song.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
