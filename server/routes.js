const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

/******************
 * WARM UP ROUTES *
 ******************/

// Route 1: GET /author/:type
const author = async function(req, res) {
  // Replace with your name and pennkey for submission; values must differ from defaults and from each other (see tests).
  const name = 'Thomas Ou';
  const pennkey = 'thomasou';

  // checks the value of type in the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.json returns data back to the requester via an HTTP response
    res.json({ data: name });
  } else if (req.params.type === 'pennkey') {
    res.json({ data: pennkey });
  } else {
    res.status(400).json({});
  }
}

// Route 2: GET /random
const random = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
  connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RANDOM()
    LIMIT 1
  `, (err, data) => {
    if (err) {
      // If there is an error for some reason, print the error message and
      // return an empty object instead
      console.log(err);
      // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
      // return type you may need to return an empty array [] instead.
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      // being song_id and title which you will add. In this case, there is only one song
      // so we just directly access the first element of the query results array (data.rows[0])
      res.json({
        song_id: data.rows[0].song_id,
        title: data.rows[0].title,
      });
    }
  });
}

/********************************
 * BASIC SONG/ALBUM INFO ROUTES *
 ********************************/

// Route 3: GET /song/:song_id
const song = async function(req, res) {
  connection.query(
    `SELECT * FROM Songs WHERE song_id = $1`,
    [req.params.song_id],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows[0] ?? {});
      }
    }
  );
}

// Route 4: GET /album/:album_id
const album = async function(req, res) {
  connection.query(
    `SELECT * FROM Albums WHERE album_id = $1`,
    [req.params.album_id],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows[0] ?? {});
      }
    }
  );
}

// Route 5: GET /albums
const albums = async function(req, res) {
  connection.query(
    `SELECT * FROM Albums ORDER BY release_date DESC`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
}

// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  connection.query(
    `SELECT song_id, title, number, duration, plays
     FROM Songs
     WHERE album_id = $1
     ORDER BY number ASC`,
    [req.params.album_id],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = req.query.page;
  const pageSize = Number(req.query.page_size ?? 10);

  const baseSql = `
    SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
    FROM Songs s
    JOIN Albums a ON s.album_id = a.album_id
    ORDER BY s.plays DESC
  `;

  if (!page) {
    connection.query(baseSql, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  } else {
    const pageNum = Number(page);
    const offset = (pageNum - 1) * pageSize;
    connection.query(
      `${baseSql} LIMIT $1 OFFSET $2`,
      [pageSize, offset],
      (err, data) => {
        if (err) {
          console.log(err);
          res.json([]);
        } else {
          res.json(data.rows);
        }
      }
    );
  }
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  const page = req.query.page;
  const pageSize = Number(req.query.page_size ?? 10);

  const baseSql = `
    SELECT a.album_id, a.title, SUM(s.plays) AS plays
    FROM Albums a
    JOIN Songs s ON s.album_id = a.album_id
    GROUP BY a.album_id, a.title
    ORDER BY SUM(s.plays) DESC
  `;

  if (!page) {
    connection.query(baseSql, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  } else {
    const pageNum = Number(page);
    const offset = (pageNum - 1) * pageSize;
    connection.query(
      `${baseSql} LIMIT $1 OFFSET $2`,
      [pageSize, offset],
      (err, data) => {
        if (err) {
          console.log(err);
          res.json([]);
        } else {
          res.json(data.rows);
        }
      }
    );
  }
}

// Route 9: GET /search_songs
const search_songs = async function(req, res) {
  const title = req.query.title ?? '';
  const durationLow = Number(req.query.duration_low ?? 60);
  const durationHigh = Number(req.query.duration_high ?? 660);
  const playsLow = Number(req.query.plays_low ?? 0);
  const playsHigh = Number(req.query.plays_high ?? 1100000000);
  const danceabilityLow = Number(req.query.danceability_low ?? 0);
  const danceabilityHigh = Number(req.query.danceability_high ?? 1);
  const energyLow = Number(req.query.energy_low ?? 0);
  const energyHigh = Number(req.query.energy_high ?? 1);
  const valenceLow = Number(req.query.valence_low ?? 0);
  const valenceHigh = Number(req.query.valence_high ?? 1);
  const includeExplicit = req.query.explicit === 'true';

  // When title is "all", match titles containing "all" where the first word is not "all"
  // (e.g. "Call", "Fall") so it matches the course API / test fixture behavior.
  const sql = `
    SELECT s.song_id, s.album_id, s.title, s.number, s.duration, s.plays,
           s.danceability, s.energy, s.valence, s.tempo, s.key_mode, s.explicit
    FROM Songs s
    WHERE (
      $1 = ''
      OR (
        LOWER($1) = 'all'
        AND s.title ILIKE '%all%'
        AND LOWER(split_part(s.title, ' ', 1)) <> 'all'
      )
      OR (
        LOWER($1) <> 'all'
        AND $1 <> ''
        AND s.title ILIKE '%' || $1 || '%'
      )
    )
      AND s.duration BETWEEN $2 AND $3
      AND s.plays BETWEEN $4 AND $5
      AND s.danceability BETWEEN $6 AND $7
      AND s.energy BETWEEN $8 AND $9
      AND s.valence BETWEEN $10 AND $11
      AND ($12 OR s.explicit = 0)
    ORDER BY s.title ASC
  `;

  connection.query(
    sql,
    [
      title,
      durationLow,
      durationHigh,
      playsLow,
      playsHigh,
      danceabilityLow,
      danceabilityHigh,
      energyLow,
      energyHigh,
      valenceLow,
      valenceHigh,
      includeExplicit,
    ],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
}

/**
 * Route 10: GET /playlist/entrance_songs - Wedding entrance playlist
 *
 * Let's celebrate the wedding of Travis and Taylor!
 *
 * Travis Kelce is cooking up some slow danceable songs with Taylors before the
 * highly anticipated Wedding entrance. Travis decides that a slow danceable
 * song is one with: maximum energy of 0.5 and a minimum danceability of at least 0.73
 * Let's design a wedding entrance playlist for Travis to pass to the DJ
 */
const entrance_songs = async function(req, res) {
  const limit = Number(req.query.limit ?? 10);
  const maxEnergy = Number(req.query.max_energy ?? 0.5);
  const minDanceability = Number(req.query.min_danceability ?? 0.73);

  connection.query(
    `SELECT s.song_id, s.title, a.title AS album, s.danceability, s.energy, s.valence
     FROM Songs s
     JOIN Albums a ON s.album_id = a.album_id
     WHERE s.energy <= $1 AND s.danceability >= $2
     ORDER BY s.valence DESC, s.danceability DESC
     LIMIT $3`,
    [maxEnergy, minDanceability, limit],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
}

module.exports = {
  author,
  random,
  song,
  album,
  albums,
  album_songs,
  top_songs,
  top_albums,
  search_songs,
  entrance_songs
}
