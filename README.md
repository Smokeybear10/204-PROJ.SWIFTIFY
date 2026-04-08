# Swiftify

**Live demo: [proj-swiftify.vercel.app](https://proj-swiftify.vercel.app/)**

<img src="client/public/img/hero.gif" alt="Swiftify Hero" width="100%" style="border-radius: 8px; margin: 10px 0;" />

<img src="client/public/img/albums.gif" alt="Swiftify Top Albums" width="100%" style="border-radius: 8px; margin: 10px 0;" />

A full-stack Taylor Swift discography explorer built for CIS 5500 at Penn. Cinematic dark UI with GSAP scroll animations, IP-based location detection, and deep song analytics across every era.

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, React Router, GSAP + ScrollTrigger, Recharts |
| UI | Material UI (MUI), custom CSS (Cormorant · Syne · Space Mono) |
| Backend | Express.js, CORS |
| Database | PostgreSQL on AWS RDS |
| Deployment | Railway (server), Vercel (client) |

## Features

- **Home** — Hero image carousel, random "Song of the Day", top songs and top albums tables
- **Albums** — Full album listing sorted by release date, click through to view tracklists
- **Songs** — Advanced search with filters for title, duration, plays, danceability, energy, valence, and explicit content
- **Song Cards** — Click any song to see detailed info in a modal overlay

## Project Structure

```
client/              React frontend (Create React App)
  public/
    img/
      hero.gif       Home page hero section
      albums.gif     Top albums grid
      demo.gif       Full app walkthrough
  src/
    pages/           HomePage, AlbumsPage, AlbumInfoPage, SongsPage
    components/      NavBar, SongCard, LazyTable
    config.json      Server host/port for API calls
server/              Express backend
  server.js          App entry point, route definitions
  routes.js          All API route handlers
  config.json        Database + server credentials
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/author/:type` | Returns author name or pennkey |
| GET | `/random` | Random song (optionally filtered by explicit) |
| GET | `/song/:song_id` | Song details by ID |
| GET | `/album/:album_id` | Album details by ID |
| GET | `/albums` | All albums sorted by release date |
| GET | `/album_songs/:album_id` | All songs in an album |
| GET | `/top_songs` | Top songs by play count (paginated) |
| GET | `/top_albums` | Top albums by total plays (paginated) |
| GET | `/search_songs` | Search songs with multiple filters |
| GET | `/playlist/entrance_songs` | Wedding entrance playlist (slow + danceable) |

## Getting Started

### Prerequisites

- Node.js (v18+)

### Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd client && npm install
```

### Run Locally

Start both the server and client in separate terminals:

```bash
# Terminal 1 — Start the backend (runs on port 3201)
cd server && node server.js

# Terminal 2 — Start the frontend (runs on port 2204)
cd client && npm start
```

The app will be available at `http://localhost:2204`. The client makes API calls to `http://localhost:3201` by default (configured in `client/src/config.json`).

## Authors

Thomas Ou
