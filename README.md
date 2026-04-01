# Swiftify

<img src="client/public/img/demo.gif" alt="Swiftify Demo UI" width="100%" style="border-radius: 8px; margin: 10px 0;" />

A full-stack web application for exploring Taylor Swift's discography, built for CIS 5500 at Penn. Browse albums, search songs with advanced filters, and discover random tracks — all wrapped in a dark, editorial rose UI.

## Tech Stack

- **Frontend:** React 18, React Router, Material UI (MUI), Recharts
- **Backend:** Express.js with CORS
- **Database:** PostgreSQL (hosted on AWS RDS)
- **Deployment:** Railway (server), Vercel (client)

## Features

- **Home** — Hero image carousel, random "Song of the Day", top songs and top albums tables
- **Albums** — Full album listing sorted by release date, click through to view tracklists
- **Songs** — Advanced search with filters for title, duration, plays, danceability, energy, valence, and explicit content
- **Song Cards** — Click any song to see detailed info in a modal overlay

## Project Structure

```
client/          React frontend (Create React App)
  src/
    pages/       HomePage, AlbumsPage, AlbumInfoPage, SongsPage
    components/  NavBar, SongCard, LazyTable
    config.json  Server host/port for API calls
server/          Express backend
  server.js      App entry point, route definitions
  routes.js      All API route handlers
  config.json    Database + server credentials
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
# Terminal 1 — Start the backend (runs on port 8080)
cd server && node server.js

# Terminal 2 — Start the frontend (runs on port 3000)
cd client && npm start
```

The app will be available at `http://localhost:3000`. The client makes API calls to `http://localhost:8080` by default (configured in `client/src/config.json`).

## Authors

Thomas Ou
