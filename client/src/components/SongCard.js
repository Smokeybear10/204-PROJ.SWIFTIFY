import { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip
} from 'recharts';

import { formatDuration } from '../helpers/formatter';
import config from '../config.json';

export default function SongCard({ songId, handleClose }) {
  const [songData, setSongData] = useState({});
  const [albumData, setAlbumData] = useState({});
  const [barRadar, setBarRadar] = useState(true);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/song/${songId}`)
      .then(res => res.json())
      .then((resJson) => {
        setSongData(resJson);
        localStorage.setItem(`sw_cache_song_${songId}`, JSON.stringify(resJson));
        return fetch(`http://${config.server_host}:${config.server_port}/album/${resJson.album_id}`);
      })
      .then(res => res.json())
      .then(resJson => {
        setAlbumData(resJson);
        localStorage.setItem(`sw_cache_album_${resJson.album_id}`, JSON.stringify(resJson));
      })
      .catch(() => {
        const cachedSong = localStorage.getItem(`sw_cache_song_${songId}`);
        if (cachedSong) {
          const parsed = JSON.parse(cachedSong);
          setSongData(parsed);
          const cachedAlbum = localStorage.getItem(`sw_cache_album_${parsed.album_id}`);
          if (cachedAlbum) setAlbumData(JSON.parse(cachedAlbum));
        }
      });
  }, [songId]);

  const chartData = [
    { name: 'Danceability', value: songData.danceability },
    { name: 'Energy', value: songData.energy },
    { name: 'Valence', value: songData.valence },
  ];

  const chartColor = '#ec4899';

  return (
    <Modal
      open={true}
      onClose={handleClose}
      aria-labelledby="song-modal-title"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <div className="sw-modal-box" style={{
        background: 'linear-gradient(145deg, #1a0a12, #120810)',
        border: '1px solid rgba(249,168,212,0.18)',
        borderRadius: '20px',
        width: '620px',
        maxWidth: '95vw',
        padding: '2rem',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(236,72,153,0.15)',
        outline: 'none',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,241,247,0.4)',
            fontSize: '1.3rem',
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'color 0.2s',
          }}
          onMouseOver={e => e.target.style.color = '#f9a8d4'}
          onMouseOut={e => e.target.style.color = 'rgba(255,241,247,0.4)'}
        >
          ✕
        </button>

        {/* Title */}
        <h1 id="song-modal-title" className="sw-modal-title" style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: '1.8rem',
          background: 'linear-gradient(135deg, #fff1f7, #f9a8d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.25rem',
          paddingRight: '2rem',
        }}>
          {songData.title}
        </h1>

        {/* Album link */}
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,241,247,0.6)', marginBottom: '1rem' }}>
          Album:&nbsp;
          <NavLink
            to={`/albums/${albumData.album_id}`}
            onClick={handleClose}
            style={{ color: '#f9a8d4', textDecoration: 'none' }}
          >
            {albumData.title}
          </NavLink>
        </p>

        {/* Meta info */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { label: 'Duration', value: formatDuration(songData.duration) },
            { label: 'Tempo', value: `${songData.tempo} bpm` },
            { label: 'Key', value: songData.key_mode },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(249,168,212,0.12)',
              borderRadius: '10px',
              padding: '0.5rem 1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ec4899', marginBottom: '0.2rem' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#fff1f7' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Chart toggles */}
        <div className="sw-chart-btn-group">
          <button
            className={`sw-chart-btn${barRadar ? ' active' : ''}`}
            disabled={barRadar}
            onClick={() => setBarRadar(true)}
          >
            Bar
          </button>
          <button
            className={`sw-chart-btn${!barRadar ? ' active' : ''}`}
            disabled={!barRadar}
            onClick={() => setBarRadar(false)}
          >
            Radar
          </button>
        </div>

        {/* Chart */}
        <div style={{ margin: '0.75rem 0 1.5rem' }}>
          {barRadar ? (
            <ResponsiveContainer height={200}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 1]} tick={{ fill: 'rgba(255,241,247,0.4)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#f9a8d4', fontSize: 12, fontFamily: 'Inter' }} width={90} />
                <Tooltip
                  contentStyle={{ background: '#1a0a12', border: '1px solid rgba(249,168,212,0.2)', borderRadius: 8, color: '#fff1f7', fontSize: 12 }}
                  cursor={{ fill: 'rgba(236,72,153,0.08)' }}
                />
                <Bar dataKey="value" fill={chartColor} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer height={220}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="rgba(249,168,212,0.15)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#f9a8d4', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 1]} tick={{ fill: 'rgba(255,241,247,0.3)', fontSize: 10 }} />
                <Radar dataKey="value" stroke={chartColor} fill={chartColor} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Modal>
  );
}
