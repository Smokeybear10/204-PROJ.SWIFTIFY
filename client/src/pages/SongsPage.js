import { useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, Grid, Slider } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';

import SongCard from '../components/SongCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState([60, 660]);
  const [plays, setPlays] = useState([0, 1100000000]);
  const [danceability, setDanceability] = useState([0, 1]);
  const [energy, setEnergy] = useState([0, 1]);
  const [valence, setValence] = useState([0, 1]);
  const [explicit, setExplicit] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_songs`)
      .then(res => res.json())
      .then(resJson => {
        const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
        setData(songsWithId);
        localStorage.setItem('sw_cache_search_default', JSON.stringify(songsWithId));
      })
      .catch(() => {
        const cached = localStorage.getItem('sw_cache_search_default');
        if (cached) setData(JSON.parse(cached));
      });
  }, []);

  const search = () => {
    const url = `http://${config.server_host}:${config.server_port}/search_songs?title=${title}` +
      `&duration_low=${duration[0]}&duration_high=${duration[1]}` +
      `&plays_low=${plays[0]}&plays_high=${plays[1]}` +
      `&danceability_low=${danceability[0]}&danceability_high=${danceability[1]}` +
      `&energy_low=${energy[0]}&energy_high=${energy[1]}` +
      `&valence_low=${valence[0]}&valence_high=${valence[1]}` +
      `&explicit=${explicit}`;
    const cacheKey = `sw_cache_${btoa(url)}`;

    fetch(url)
      .then(res => res.json())
      .then(resJson => {
        const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
        setData(songsWithId);
        localStorage.setItem(cacheKey, JSON.stringify(songsWithId));
      })
      .catch(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setData(JSON.parse(cached));
        else alert('Search failed and no offline backup available.');
      });
  };

  const surpriseMe = () => {
    const randomRange = () => {
      const a = Math.random();
      const b = Math.random();
      return [Math.min(a, b), Math.max(a, b)];
    };
    const d = randomRange();
    const e = randomRange();
    const v = randomRange();
    setDanceability(d);
    setEnergy(e);
    setValence(v);
    const url = `http://${config.server_host}:${config.server_port}/search_songs?title=${title}` +
      `&duration_low=${duration[0]}&duration_high=${duration[1]}` +
      `&plays_low=${plays[0]}&plays_high=${plays[1]}` +
      `&danceability_low=${d[0]}&danceability_high=${d[1]}` +
      `&energy_low=${e[0]}&energy_high=${e[1]}` +
      `&valence_low=${v[0]}&valence_high=${v[1]}` +
      `&explicit=${explicit}`;
    const cacheKey = `sw_cache_${btoa(url)}`;

    fetch(url)
      .then(res => res.json())
      .then(resJson => {
        const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
        setData(songsWithId);
        localStorage.setItem(cacheKey, JSON.stringify(songsWithId));
      })
      .catch(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setData(JSON.parse(cached));
        else alert('Search failed and no offline backup available.');
      });
  };

  const columns = [
    {
      field: 'title', headerName: 'Title', width: 280,
      renderCell: (params) => (
        <span className="sw-link" onClick={() => setSelectedSongId(params.row.song_id)} style={{ cursor: 'pointer' }}>
          {params.value}
        </span>
      ),
    },
    { field: 'duration', headerName: 'Duration', width: 100 },
    { field: 'plays', headerName: 'Plays', width: 120 },
    { field: 'danceability', headerName: 'Dance', width: 90 },
    { field: 'energy', headerName: 'Energy', width: 90 },
    { field: 'valence', headerName: 'Valence', width: 90 },
    { field: 'tempo', headerName: 'Tempo', width: 80 },
    { field: 'key_mode', headerName: 'Key', width: 100 },
    { field: 'explicit', headerName: 'Explicit', width: 80 },
  ];

  return (
    <div className="sw-page">
      {selectedSongId && (
        <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />
      )}

      <h1 className="sw-heading">Search Songs</h1>

      {/* Search Panel */}
      <div className="sw-search-panel">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <p className="sw-slider-label" style={{ marginBottom: '0.5rem' }}>Search by Title</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="e.g. Blank Space"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(249,168,212,0.2)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#ec4899'}
              onBlur={e => e.target.style.borderColor = 'rgba(249,168,212,0.2)'}
            />
          </div>
          
          <div style={{ paddingBottom: '0.3rem', paddingRight: '0.5rem' }}>
            <FormControlLabel
              label={<span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Explicit</span>}
              control={
                <Checkbox
                  checked={explicit}
                  onChange={(e) => setExplicit(e.target.checked)}
                  sx={{ color: '#ec4899', '&.Mui-checked': { color: '#ec4899' } }}
                />
              }
            />
          </div>
          <button className="sw-btn-natural" onClick={search}>
            Search
          </button>
          <button className="sw-btn-natural-outline" onClick={surpriseMe}>
            Surprise Me
          </button>
        </div>

        {/* Advanced Filters */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'rgba(255,241,247,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', borderBottom: '1px solid rgba(249,168,212,0.1)', paddingBottom: '0.5rem' }}>
          Advanced Filters
        </h3>

        <Grid container spacing={3} alignItems="center">

          {/* Duration */}
          <Grid item xs={12} sm={6}>
            <p className="sw-slider-label" style={{ marginBottom: '0.5rem' }}>Duration</p>
            <Slider
              value={duration}
              min={60} max={660} step={10}
              onChange={(e, v) => setDuration(v)}
              valueLabelDisplay="auto"
              valueLabelFormat={v => <div>{formatDuration(v)}</div>}
            />
          </Grid>

          {/* Plays */}
          <Grid item xs={12} sm={6}>
            <p className="sw-slider-label" style={{ marginBottom: '0.5rem' }}>Plays (millions)</p>
            <Slider
              value={plays}
              min={0} max={1100000000} step={10000000}
              onChange={(e, v) => setPlays(v)}
              valueLabelDisplay="auto"
              valueLabelFormat={v => <div>{(v / 1000000).toFixed(0)}M</div>}
            />
          </Grid>

          {/* Danceability */}
          <Grid item xs={12} sm={4}>
            <p className="sw-slider-label" style={{ marginBottom: '0.5rem' }}>Danceability</p>
            <Slider value={danceability} min={0} max={1} step={0.01}
              onChange={(e, v) => setDanceability(v)}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* Energy */}
          <Grid item xs={12} sm={4}>
            <p className="sw-slider-label" style={{ marginBottom: '0.5rem' }}>Energy</p>
            <Slider value={energy} min={0} max={1} step={0.01}
              onChange={(e, v) => setEnergy(v)}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* Valence */}
          <Grid item xs={12} sm={4}>
            <p className="sw-slider-label" style={{ marginBottom: '0.5rem' }}>Valence</p>
            <Slider value={valence} min={0} max={1} step={0.01}
              onChange={(e, v) => setValence(v)}
              valueLabelDisplay="auto"
            />
          </Grid>

        </Grid>
      </div>

      {/* Results */}
      <h2 className="sw-subheading">Results — {data.length} songs</h2>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </div>
  );
}
