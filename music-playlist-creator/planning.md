## Music Playlist Explorer — Planning Spec

### Data Shape

**Playlist Object:**
- playlistID (number) — unique identifier for each playlist
- playlistTitle (string) — the name/title of the playlist
- playlistArtURL (string) — URL path to the playlist cover image
- playlistCreator (string) — the name of the person who created the playlist
- likeCount (number) — the number of likes the playlist has received
- songs (array of song objects) — collection of all songs in this playlist

**Song Object:**
- songID (number) — unique identifier for each song
- songTitle (string) — the title/name of the song
- songArtist (string) — the artist who performed the song
- songAlbum (string) — the album the song belongs to
- songArtURL (string) — URL path to the song's cover artwork
- songDuration (string) — the length of the song in format "M:SS" (e.g., "3:45")

### UI and Interaction Rules
What are the main sections of the homepage?
- The main sections of hte hompage are the music playlist explorer, where there are multiple playlists displayed with a picture, the creator, and the number of likes. There is also the music playlist explorer when someone clicks on the music playlist and a modal that pops up when someone clicks on the playlist on the homepage.

What happens when a user clicks a playlist card?
- When a user clicks a playlist card a modal will popup with the picture of the playlist, its name, the autor, and the list of songs as well as a shuffle button. The list of songs includes each song's title, artist, and duration. It should also be centered on the screen and not occupy the entire screen.

What happens when a user clicks outside the modal?
- When a user clicks outside the modal it should return to the homepage and the modal should disappear.

What happens when a user clicks the like icon?
- When a user clicks the like icon the number of likes should update to +1 and it should become filled in instead of an empty heart.

What does the shuffle button do?
- The shuffle button randomizes the order of the songs displaying them in different orders.

### Function Specs

#### `loadPlaylistData()`
**What does this function take in?**
- No parameters

**What does it return or produce?**
- Returns a Promise (async function)
- Populates the global `playlistsData` array with playlist objects from data.json
- Triggers `renderPlaylistCards()` after data is loaded

**What DOM element does it append to?**
- Does not directly append to DOM (calls `renderPlaylistCards()` which does)

**What fields from the playlist object does it use?**
- None directly (loads entire playlist objects into memory)

---

#### `renderPlaylistCards()`
**What does this function take in?**
- No parameters (reads from global `playlistsData` array)

**What does it return or produce?**
- Returns nothing (void)
- Creates and displays playlist card elements on the page

**What DOM element does it append to?**
- Appends to `.playlist-cards` container
- Each card is appended as a child div with class `playlist-card`

**What fields from the playlist object does it use?**
- `playlistID` — stored in card's `data-playlist-id` attribute
- `playlistArtURL` — used for the cover image src
- `playlistTitle` — displayed as the card title and image alt text
- `playlistCreator` — displayed as the creator name
- `likeCount` — displayed next to the heart icon

---

#### `openModal(playlist)`
**What does this function take in?**
- `playlist` (object) — a single playlist object from the playlists array

**What does it return or produce?**
- Returns nothing (void)
- Updates the modal DOM elements with playlist data
- Makes the modal visible by adding 'active' class to `.modal-overlay`

**What DOM element does it append to?**
- Appends song items to `.song-list` container
- Updates existing modal elements (`.modal-cover`, `.modal-playlist-title`, `.modal-creator`)

**What fields from the playlist object does it use?**
- `playlistArtURL` — displayed as modal cover image
- `playlistTitle` — displayed as modal title and image alt text
- `playlistCreator` — displayed as creator name in modal
- `songs` — array of song objects that get rendered in the song list

**What fields from the song object does it use?**
- `songArtURL` — displayed as song cover image
- `songTitle` — displayed as song title and image alt text
- `songArtist` — displayed as artist name
- `songAlbum` — displayed as album name
- `songDuration` — displayed as song length

---

#### `closeModal()`
**What does this function take in?**
- No parameters

**What does it return or produce?**
- Returns nothing (void)
- Hides the modal by removing 'active' class from `.modal-overlay`

**What DOM element does it append to?**
- Does not append (only modifies classes)

**What fields from the playlist object does it use?**
- None

---

#### `toggleLike(playlistID)`
**What does this function take in?**
- `playlistID` (number) — the unique identifier of the playlist being liked/unliked

**What does it return or produce?**
- Returns nothing (void)
- Toggles the like state for the specified playlist
- Updates both the data model and the DOM to reflect the change

**What DOM element does it append to?**
- Does not append (modifies existing elements)
- Updates the heart icon (`.heart-icon`) and like count (`.like-count`) within the specific playlist card

**What fields from the playlist object does it use?**
- `playlistID` — to identify which playlist to update
- `isLiked` (boolean) — tracks whether the current user has liked this playlist
- `likeCount` (number) — the current number of likes

**Behavior Specification:**

**Branch 1: When user LIKES a previously unliked playlist**
- **Data Model Changes:**
  - Set `playlist.isLiked` from `false` to `true`
  - Increment `playlist.likeCount` by 1
- **DOM Changes:**
  - Change heart icon from ♡ (empty/outline) to ♥ (filled/solid)
  - Update displayed like count to show the new incremented value
  - Optionally add visual feedback (animation, color change)

**Branch 2: When user UNLIKES a previously liked playlist**
- **Data Model Changes:**
  - Set `playlist.isLiked` from `true` to `false`
  - Decrement `playlist.likeCount` by 1
- **DOM Changes:**
  - Change heart icon from ♥ (filled/solid) to ♡ (empty/outline)
  - Update displayed like count to show the new decremented value
  - Remove any visual feedback from liked state

**Constraint:**
- Each playlist maintains its own `isLiked` state independently
- A user can only like a playlist once at a time (toggle behavior prevents multiple likes)
- Clicking the heart icon should NOT trigger the card's click event (must use `e.stopPropagation()`)
- The like state persists for the current session but resets on page reload (no backend persistence)

---

#### `shuffleSongs()`
**What does this function take in?**
- No parameters directly (accesses the currently displayed playlist's songs from the modal)

**What does it return or produce?**
- Returns nothing (void)
- Randomizes the order of songs displayed in the modal
- Updates the DOM to show the shuffled song list

**Should the original song order be preserved?**
- Yes, the original song order in the playlist object's `songs` array should remain unchanged
- A shuffled copy of the songs array is created for display purposes only
- This allows the user to close and reopen the modal to see the original order
- Each playlist should track its own shuffled state with an `isShuffled` boolean

**What does the UI look like after shuffling?**
- The song list in the modal displays songs in a random order
- All song information (cover, title, artist, album, duration) remains the same
- Only the order changes
- The shuffle button may optionally show a visual indicator that shuffle is active

**What should happen when the user clicks shuffle multiple times?**
- Each click creates a new random shuffle
- The songs are re-randomized from the original order each time (not shuffling an already shuffled list)
- This ensures truly random ordering on each shuffle, not just slight variations
- The button remains functional and continues to shuffle on every click

**Implementation Strategy:**
- Store the original song order in the playlist object
- When shuffle is clicked, create a shuffled copy using a randomization algorithm (Fisher-Yates)
- Re-render the song list with the shuffled copy
- Preserve original data so reopening the modal shows original order (unless shuffle is clicked again)

### Featured Page (Milestone 7)

#### Layout Design

**Page Sections:**
1. **Header/Navigation Bar**
   - Title: "MUSIC PLAYLIST EXPLORER" (left side)
   - Navigation Links: "Featured" | "All" (right side)
   - Active page indicated by underline
   - Sticky/fixed at top

2. **Main Content Container**
   - Split into two sections (left and right)
   - **Left Section:**
     - Playlist name (large, prominent text)
     - Creator name (smaller, secondary text)
   - **Right Section:**
     - Large playlist cover image
     - Square aspect ratio with rounded corners

3. **Song Carousel**
   - Horizontally scrollable carousel of song cards
   - Navigation arrows (< >) on sides
   - Each card shows: song cover, title, artist, album, duration
   - Centered below the main content

4. **Footer**
   - Standard footer with copyright information
   - Fixed at bottom

#### Function Specs

##### `selectRandomPlaylist()`
**What does this function take in?**
- No parameters (accesses global `playlistsData` array)

**What does it return or produce?**
- Returns a single playlist object randomly selected from the `playlistsData` array
- Ensures a different playlist can be selected on each call (true randomness)

**When does it run?**
- Runs automatically on page load (DOMContentLoaded event)
- Runs on each page refresh
- Each page load/refresh selects a NEW random playlist

**How does it work?**
- Uses `Math.random()` to generate a random index
- Selects playlist from `playlistsData[randomIndex]`
- Returns the entire playlist object with all its properties

##### `displayFeaturedPlaylist(playlist)`
**What does this function take in?**
- `playlist` (object) - A single playlist object from the data array

**What does it return or produce?**
- Returns nothing (void)
- Updates the DOM with playlist information

**What DOM elements does it update?**
- Playlist name element
- Creator name element
- Cover image element (src and alt)
- Song carousel (renders all songs as scrollable cards)

**What fields from the playlist object does it use?**
- `playlistTitle` - displayed as main heading
- `playlistCreator` - displayed as subheading
- `playlistArtURL` - used for large cover image
- `songs` - array used to populate the carousel

##### `renderSongCarousel(songs)`
**What does this function take in?**
- `songs` (array) - Array of song objects from the selected playlist

**What does it return or produce?**
- Returns nothing (void)
- Creates and displays song cards in a horizontal carousel

**What DOM element does it append to?**
- Appends song cards to `.song-carousel` container

**What fields from song objects does it use?**
- `songArtURL` - song cover image
- `songTitle` - song name
- `songArtist` - artist name
- `songAlbum` - album name
- `songDuration` - song length

**Carousel Behavior:**
- Horizontal scroll with navigation arrows
- Smooth scrolling animation
- Arrow buttons scroll by one card width
- Mobile-friendly touch/swipe scrolling

#### Navigation Strategy

**Between Pages:**
- **Featured Page** (`featured.html`) ↔ **All Playlists Page** (`index.html`)

**Navigation Mechanism:**
- Header navigation bar present on BOTH pages
- Two clickable links/buttons:
  - "Featured" - navigates to `featured.html`
  - "All" - navigates to `index.html`
- Active page indicated with underline style
- Navigation is consistent across both pages

**Implementation:**
- Use standard `<a>` tags with `href` attributes
- Featured link: `href="featured.html"`
- All link: `href="index.html"`
- CSS styling to indicate active/inactive states
- No need for JavaScript navigation (use native browser navigation)

**User Experience:**
- Clicking "Featured" loads featured.html with a NEW random playlist
- Clicking "All" returns to homepage with all playlist cards
- Each time user clicks "Featured", a fresh random selection occurs
- Browser refresh on Featured page also selects a NEW random playlist

#### Files Required
- `featured.html` - New HTML file for Featured page
- `featured.css` - CSS specific to Featured page layout (or extend existing style.css)
- `featured.js` - JavaScript for random selection and carousel (or extend existing script.js)
- Both pages will share `data/data.json` for playlist data

### AI Feature Spec (Milestone 8)
[Leave blank — fill in before Milestone 8]

### Decisions Log
[One entry per milestone where you make spec-informed decisions]