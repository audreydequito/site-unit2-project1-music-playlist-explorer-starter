// Script to fetch album covers from MusicBrainz Cover Art Archive
// Run with: node fetch-covers.js

const https = require('https');
const fs = require('fs');

// Album data with artist and album names
const albums = [
  { artist: 'Laufey', album: 'Bewitched' },
  { artist: 'beabadoobee', album: 'Beatopia' },
  { artist: 'Fujii Kaze', album: 'HELP EVER HURT NEVER' },
  { artist: 'Bruno Mars', album: '24K Magic' },
  { artist: 'Ariana Grande', album: 'thank u, next' },
  { artist: 'Ariana Grande', album: 'Positions' },
  { artist: 'Ariana Grande', album: 'Dangerous Woman' },
  { artist: 'Ariana Grande', album: 'My Everything' },
  { artist: 'Ariana Grande', album: 'Sweetener' },
  { artist: 'Bruno Mars', album: 'Doo-Wops & Hooligans' },
  { artist: 'Bruno Mars', album: 'Unorthodox Jukebox' },
  { artist: 'beabadoobee', album: 'Fake It Flowers' },
  { artist: 'Laufey', album: 'Everything I Know About Love' },
  { artist: 'Fujii Kaze', album: 'LOVE ALL SERVE ALL' },
  { artist: 'Dua Lipa', album: 'Future Nostalgia' },
  { artist: 'Bruno Mars', album: 'An Evening with Silk Sonic' },
  { artist: 'Ariana Grande', album: 'eternal sunshine' },
  { artist: 'beabadoobee', album: 'Patched Up' }
];

// Function to search MusicBrainz for album
function searchAlbum(artist, album) {
  return new Promise((resolve, reject) => {
    const searchUrl = `https://musicbrainz.org/ws/2/release/?query=artist:${encodeURIComponent(artist)}%20AND%20release:${encodeURIComponent(album)}&fmt=json`;

    https.get(searchUrl, {
      headers: {
        'User-Agent': 'MusicPlaylistExplorer/1.0 (educational project)'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.releases && json.releases.length > 0) {
            const releaseId = json.releases[0].id;
            resolve(releaseId);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Function to get cover art URL from Cover Art Archive
function getCoverArtUrl(releaseId) {
  return `https://coverartarchive.org/release/${releaseId}/front-500`;
}

// Main function
async function fetchAllCovers() {
  const results = {};

  for (const album of albums) {
    console.log(`Searching for: ${album.artist} - ${album.album}`);

    try {
      const releaseId = await searchAlbum(album.artist, album.album);

      if (releaseId) {
        const coverUrl = getCoverArtUrl(releaseId);
        const key = `${album.artist} - ${album.album}`;
        results[key] = coverUrl;
        console.log(`✓ Found: ${coverUrl}`);
      } else {
        console.log(`✗ Not found`);
      }

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error fetching ${album.artist} - ${album.album}:`, error.message);
    }
  }

  // Save results to JSON file
  fs.writeFileSync('album-covers.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to album-covers.json');
  console.log('\nNow update your data.json with these URLs!');
}

fetchAllCovers();
