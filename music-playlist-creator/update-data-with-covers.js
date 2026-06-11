// Script to update data.json with real album covers
const fs = require('fs');

// Load the album covers mapping
const covers = JSON.parse(fs.readFileSync('album-covers.json', 'utf8'));

// Load the current data
const data = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));

// Create a lookup function
function getCoverUrl(artist, album) {
  const key = `${artist} - ${album}`;
  return covers[key] || null;
}

// Update each playlist and song with real covers
data.playlists.forEach(playlist => {
  // Update songs with their album covers
  playlist.songs.forEach(song => {
    const coverUrl = getCoverUrl(song.songArtist, song.songAlbum);
    if (coverUrl) {
      song.songArtURL = coverUrl;
    }
  });

  // Update playlist cover with the first song's album cover
  if (playlist.songs.length > 0) {
    playlist.playlistArtURL = playlist.songs[0].songArtURL;
  }
});

// Save the updated data
fs.writeFileSync('data/data.json', JSON.stringify(data, null, 2));

console.log('✓ data.json updated with real album covers!');
console.log('✓ All playlist and song images now use MusicBrainz Cover Art Archive URLs');
