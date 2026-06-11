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

### Playlist Management Features (Milestone 8)

#### Overview
Allow users to create, edit, and delete playlists directly from the application interface without manually editing JSON files.

#### Feature Requirements

**1. Add New Playlists**
- Users can create new playlists from the homepage
- Form allows input of:
  - Playlist name
  - Author/Creator name
  - Playlist cover image URL
  - Multiple songs with details (title, artist, album, cover URL, duration)
- New playlists appear immediately on homepage

**2. Edit Existing Playlists**
- Users can modify details of existing playlists
- Edit button on each playlist card opens pre-populated form
- Can update: name, author, cover image, and all song details
- Changes reflect immediately on homepage

**3. Delete Playlists**
- Users can remove playlists from homepage
- Delete button on each playlist card
- Confirmation prompt before deletion
- Playlist removed from display and data model

#### Function Specs

##### `openAddPlaylistForm()`
**What does this function take in?**
- No parameters

**What does it return or produce?**
- Returns nothing (void)
- Opens a modal/form for creating a new playlist

**What does it do?**
- Displays empty form with fields for playlist details
- Provides "Add Song" button to add multiple songs
- Form includes: name, author, cover URL, songs array

##### `addPlaylist(playlistData)`
**What does this function take in?**
- `playlistData` (object) - New playlist object with all details

**What does it return or produce?**
- Returns nothing (void)
- Adds playlist to `playlistsData` array
- Re-renders playlist cards to show new playlist

**What does it do?**
- Validates input data
- Generates new unique `playlistID`
- Adds playlist to global data array
- Calls `renderPlaylistCards()` to update UI
- Closes the form modal

##### `openEditForm(playlistID)`
**What does this function take in?**
- `playlistID` (number) - ID of playlist to edit

**What does it return or produce?**
- Returns nothing (void)
- Opens modal/form pre-populated with existing playlist data

**What does it do?**
- Sets `editingPlaylistId` global variable to track edit mode
- Finds playlist by ID in `playlistsData` array
- Updates modal title to "Edit Playlist"
- Populates form fields with current values:
  - Playlist title input
  - Creator name input
  - Cover image URL input
- Clears song container and adds song form items for each existing song
- Shows the form modal with all data pre-filled

##### `handleFormSubmit(e)` - Updated for Edit Mode
**What does this function take in?**
- `e` (Event) - Form submission event

**What does it return or produce?**
- Returns nothing (void)
- Either adds new playlist OR updates existing playlist based on `editingPlaylistId` state

**What does it do - EDIT MODE (when `editingPlaylistId` is not null):**
- Finds the existing playlist by ID
- Updates playlist fields:
  - `playlistTitle` - new title from form
  - `playlistCreator` - new creator from form
  - `playlistArtURL` - new cover URL from form
  - `songs` - array of updated songs (preserves songIDs where possible)
- Clears cached AI description for the edited playlist
- Preserves: `playlistID`, `likeCount`, `isLiked`, `isCustom`, `dateAdded`
- Saves to localStorage via `saveCustomPlaylists()`
- Re-renders all cards via `renderPlaylistCards()`
- Closes form modal

**What does it do - ADD MODE (when `editingPlaylistId` is null):**
- Creates new playlist object with generated ID
- Adds to `playlistsData` array
- Same save/render/close flow as before

##### `deletePlaylist(playlistID)`
**What does this function take in?**
- `playlistID` (number) - ID of playlist to delete

**What does it return or produce?**
- Returns nothing (void)
- Removes playlist from `playlistsData` array
- Re-renders playlist cards

**What does it do?**
- Finds playlist by ID
- Shows confirmation dialog: "Are you sure you want to delete [playlistTitle]? This action cannot be undone."
- If user clicks Cancel, function exits without changes
- If user clicks OK:
  - Removes playlist from `playlistsData` array using `splice()`
  - Saves custom playlists to localStorage via `saveCustomPlaylists()`
  - Updates likes in localStorage via `saveLikesToStorage()`
  - Re-renders all cards via `renderPlaylistCards()`
  - Logs success message to console

**Important Notes:**
- Original (non-custom) playlists: Deleted from session only, return on page refresh
- Custom playlists: Permanently deleted from localStorage
- Confirmation prevents accidental deletions

##### `addSongFieldToForm()`
**What does this function take in?**
- No parameters (or optionally song data for editing)

**What does it return or produce?**
- Returns nothing (void)
- Adds a new song input group to the form

**What does it do?**
- Creates HTML elements for song input fields
- Fields include: title, artist, album, cover URL, duration
- Provides "Remove" button for each song
- Appends to songs container in form

#### UI Components

**Add Playlist Button**
- Location: Homepage navigation bar, right side (+ button)
- Style: Prominent, contrasting color
- Action: Opens add playlist form modal

**3-Dot Menu on Cards**
- Location: On each playlist card, next to the like count
- Icon: Vertical 3-dot icon (⋮)
- Style: Gray color, brightens on hover
- Action: Opens dropdown menu with Edit and Delete options
- **Dropdown Menu:**
  - Dark semi-transparent background with blur
  - Two menu items:
    - ✏️ Edit - Opens edit form
    - 🗑️ Delete - Prompts deletion confirmation
  - Smooth slide-in animation
  - Auto-closes when clicking outside or selecting an option
  - Delete option turns red on hover

**Playlist Form Modal**
- Overlay: Dark semi-transparent background
- Form: Centered, scrollable if needed
- Fields:
  - Playlist Name (text input)
  - Creator (text input)
  - Cover Image URL (text input)
  - Songs section with "Add Song" button
  - Each song has: title, artist, album, cover URL, duration
- Buttons: Save/Update, Cancel

#### Data Persistence Note
- Changes are stored in memory (`playlistsData` array)
- Data persists during current session
- Refreshing page will reload original `data.json`
- For true persistence, would need backend/localStorage (future enhancement)

#### Validation Rules
- Playlist name: Required, min 1 character
- Creator: Required, min 1 character
- Cover URL: Optional (use placeholder if empty)
- At least 1 song required
- Song title: Required
- Song artist: Required
- Duration: Required, format "M:SS" (e.g., "3:45")

### AI-Powered Playlist Descriptions (Milestone 8)

#### AI Feature Spec

**Role:**
The AI model should act as a music curator and playlist analyst who understands musical genres, themes, and vibes.

**Task:**
Generate a compelling 2-3 sentence description for a music playlist that captures its overall vibe, theme, and emotional tone based on the playlist name, creator, and the collection of songs included.

**Inputs:**
- `playlistTitle` (string) - The name of the playlist
- `playlistCreator` (string) - The creator's name
- `songs` (array) - Array of song objects, each containing:
  - `songTitle` (string)
  - `songArtist` (string)
  - `songAlbum` (string)

**Output Format:**
- A 2-3 sentence paragraph
- First sentence: Capture the overall mood/genre/theme
- Second sentence: Highlight what makes this playlist unique or when it's best enjoyed
- Third sentence (optional): Mention the vibe or emotional journey
- Natural, conversational tone
- No marketing jargon or promotional language
- No bullet points or lists

**Constraints:**
- Do NOT list individual songs by name
- Do NOT use generic phrases like "perfect for any occasion" or "something for everyone"
- Do NOT mention specific song counts (e.g., "featuring 8 tracks")
- Do NOT use overly promotional or salesy language
- Do NOT make assumptions about the listener's preferences
- KEEP it concise (2-3 sentences maximum, roughly 40-80 words)
- FOCUS on the collective vibe, not individual tracks

**Example Output:**
"This playlist brings together smooth jazz and contemporary indie vibes, creating a perfect soundtrack for late-night introspection. The carefully curated selection flows from mellow acoustic moments to dreamy electronic textures. Ideal for unwinding after a long day or setting a calm, creative atmosphere."

**Failure Behavior:**
- If API call fails: Display a user-friendly error message: "Unable to generate description. Please try again."
- If response is empty/invalid: Display fallback text: "Description unavailable at this time."
- Show a "Retry" button if generation fails
- The UI should remain functional; failure should not break the modal
- Log errors to console for debugging but don't expose technical details to users

#### Function Specs

##### `getPlaylistDescription(playlist)`
**What does this function take in?**
- `playlist` (object) - A complete playlist object containing:
  - `playlistTitle` (string)
  - `playlistCreator` (string)
  - `songs` (array of song objects)

**What does it return?**
- Returns a Promise that resolves to:
  - `string` - The AI-generated description (on success)
  - `null` - If the API call fails or returns invalid data

**What API does it call?**
- Anthropic Claude API (or other AI API like OpenAI)
- Endpoint: Configured in environment/secrets file
- Model: Claude 3.5 Sonnet (or specified model)

**Prompt Structure:**
```
You are a music curator and playlist analyst. Generate a 2-3 sentence description for this playlist:

Playlist: {playlistTitle}
Creator: {playlistCreator}

Songs:
- {songTitle} by {songArtist} ({songAlbum})
- {songTitle} by {songArtist} ({songAlbum})
...

Requirements:
- Capture the overall mood, genre, and theme
- 2-3 sentences, natural and conversational tone
- Do NOT list individual songs
- Do NOT use generic marketing language
- Focus on the vibe and when/how to enjoy this playlist
```

**What happens on error?**
1. **Network Error:**
   - Catch the error in try-catch block
   - Log error details to console
   - Return `null` to calling function
   - UI displays: "Unable to generate description. Please try again."

2. **API Error (4xx/5xx response):**
   - Check response status
   - Log error message from API
   - Return `null`
   - UI displays error message with retry option

3. **Invalid/Empty Response:**
   - Validate response structure
   - If description is empty or malformed, return `null`
   - UI displays fallback message

4. **Timeout:**
   - Set reasonable timeout (e.g., 10 seconds)
   - If exceeded, cancel request and return `null`
   - UI shows timeout message

**Implementation Notes:**
- Use async/await for clean asynchronous code
- Store API key securely (NOT in git repository)
- Add loading state while API call is in progress
- Consider caching descriptions in memory/localStorage to avoid redundant API calls
- Rate limit button clicks to prevent API spam

##### UI Integration Spec

**"Get Description" Button:**
- Location: Inside the playlist modal, below the playlist creator name
- Initial State: Blue/primary color button, text "Get Description"
- Loading State: Button disabled, text "Generating..." with spinner/loading animation
- Success State: Button hidden or changes to "Regenerate Description"
- Error State: Button shows "Retry" with error styling

**Description Display Area:**
- Location: Below the "Get Description" button, above the song list
- Initial State: Hidden/not present
- Loading State: Show skeleton loader or animated placeholder
- Success State: Display description text with subtle background styling
- Error State: Show error message in red/warning color with retry option
- Style: Italic text, slightly smaller font, light background box with padding

**User Flow:**
1. User opens playlist modal
2. User sees "Get Description" button
3. User clicks button
4. Button shows "Generating..." (disabled)
5. API call made in background
6. On success: Description appears, button becomes "Regenerate"
7. On error: Error message appears, button becomes "Retry"

### Decisions Log

#### Milestone 7: Featured Page Implementation

**Date:** June 9, 2026

**Context:**
Creating a dedicated Featured page that displays a randomly selected playlist with an interactive song carousel.

**Key Decisions:**

1. **Random Selection Algorithm**
   - **Decision:** Use `Math.random()` with array indexing to select playlist
   - **Reasoning:** Simple, effective for small dataset (8 playlists), runs client-side
   - **Implementation:** `const randomIndex = Math.floor(Math.random() * playlistsData.length)`
   - **Trade-off:** True randomness means same playlist can appear consecutively (acceptable per requirements)

2. **Carousel Implementation**
   - **Decision:** Infinite scroll carousel with tripled song array
   - **Reasoning:** 
     - Duplicate songs 3x creates seamless infinite scroll illusion
     - Middle section loaded first allows scrolling both directions
     - Repositioning on scroll edges maintains infinite effect
   - **Alternative Considered:** Finite carousel with disabled end buttons (rejected - less engaging UX)

3. **Page Navigation Strategy**
   - **Decision:** Standard HTML `<a>` tags with native browser navigation
   - **Reasoning:**
     - Simplest implementation (no router library needed)
     - Leverages browser history naturally
     - Consistent header on both pages
   - **Implementation:** Same navigation bar rendered on index.html and featured.html

4. **Layout Design**
   - **Decision:** Split layout - playlist info (left) + large cover image (right) + carousel (bottom)
   - **Reasoning:**
     - Visual hierarchy emphasizes featured playlist
     - Large cover image creates "hero" feel appropriate for featured content
     - Carousel below allows horizontal scrolling without competing for vertical space

5. **Featured Card Highlighting**
   - **Decision:** Center-aligned card gets visual emphasis (scale + shadow)
   - **Reasoning:**
     - Provides visual focus as user scrolls
     - Dynamic highlighting based on viewport position
     - Updates smoothly during scroll for fluid experience

**Testing Results:**
- ✅ Random playlist loads on page load
- ✅ Different playlist selected on refresh
- ✅ Navigation works without browser back/forward
- ✅ Carousel scrolls infinitely in both directions
- ✅ Featured card highlights based on position

---

#### Milestone 8: AI-Powered Playlist Descriptions

**Date:** June 9, 2026

**Context:**
Implementing AI-generated playlist descriptions that appear in the modal when users click a "Get Description" button.

**Key Decisions:**

1. **API Choice: OpenRouter with Free Gemma 4 Model**
   - **Decision:** Use OpenRouter API with `google/gemma-4-31b-it:free` model
   - **Reasoning:** 
     - OpenRouter provides a unified API for multiple AI models
     - Using a free model as specified in the lab instructions (no cost, suitable for learning)
     - Initially tried `meta-llama/llama-3.3-70b-instruct:free` but encountered rate limiting
     - Gemma 4 31B is a powerful open-source model from Google capable of generating quality 2-3 sentence descriptions
     - Free tier models prevent unexpected API charges during development
     - Model successfully generates sophisticated, contextually relevant playlist descriptions
   - **Alternative Free Models:** `google/gemma-4-26b-a4b-it:free`, `poolside/laguna-m.1:free`, `moonshotai/kimi-k2.6:free`
   - **Production Note:** For a real app, this would use a backend proxy to hide the API key and could use paid models for better quality

2. **Prompt Structure**
   - **Decision:** Include playlist title, creator, and full song list (title, artist, album) in prompt
   - **Reasoning:**
     - More context = better, more accurate descriptions
     - Song titles and artists help AI understand genre/vibe
     - Explicitly instructing "Do NOT list individual songs" prevents the AI from just listing songs back
   - **Constraint Added:** "Do NOT use generic marketing language" to ensure authentic, useful descriptions

3. **Caching Strategy**
   - **Decision:** Cache descriptions in memory by playlist ID
   - **Reasoning:**
     - Avoids redundant API calls (saves money and improves UX)
     - Instant display when reopening the same playlist
     - Memory cache (not localStorage) means fresh descriptions on page reload
   - **Trade-off:** Cache cleared on page refresh, but acceptable since descriptions should feel fresh

4. **Button States and UX**
   - **Decision:** Three button states: "Get Description" → "Generating..." → "Regenerate"
   - **Reasoning:**
     - Clear loading state with spinner animation provides feedback during API call
     - "Regenerate" button allows users to get alternative descriptions without seeming broken
     - Clicking "Regenerate" clears cache and generates a truly new description
   - **Alternative Considered:** Single "Generate" button, but "Regenerate" better communicates that new content will be created

5. **Error Handling**
   - **Decision:** User-friendly error message + "Retry" button, detailed logs in console
   - **Reasoning:**
     - Users don't need to see technical details (HTTP codes, API errors)
     - "Unable to generate description. Please try again." is clear and actionable
     - Console logs help with debugging during development
     - Red styling on error state makes it visually distinct
   - **Fallback:** Modal remains functional even if API fails (doesn't break the UI)

6. **Loading Animation**
   - **Decision:** Spinning icon using CSS animation with `::before` pseudo-element
   - **Reasoning:**
     - Pure CSS solution (no additional image/icon library needed)
     - Lightweight and performant
     - Matches dark theme aesthetic
   - **Alternative Considered:** Text-only "Generating...", but spinner provides better visual feedback

7. **Description Display Style**
   - **Decision:** Italic text in a subtle background box, positioned below button in modal
   - **Reasoning:**
     - Italic styling communicates that it's AI-generated/editorial content (not user-provided data)
     - Subtle background distinguishes description from other modal content
     - Positioned in modal-info section keeps it visually grouped with playlist metadata
   - **Trade-off:** Takes up more vertical space in modal, but acceptable given value of the feature

8. **Security: API Key Management**
   - **Decision:** Store API key in `secrets.js` file, add to `.gitignore`
   - **Reasoning:**
     - Prevents accidental commit of API keys to git repository
     - Simple solution for client-side app (no backend)
     - Created `.gitignore` to protect `secrets.js`
   - **Limitation:** Client-side storage means key is visible in browser (acceptable for educational project)
   - **Production Note:** In a real app, this would require a backend proxy to hide the API key

**Technical Implementation Notes:**
- API call uses `fetch` with async/await for clean error handling
- Timeout not implemented (OpenRouter has default timeout)
- Response validated for structure before displaying
- Console logs added for debugging API issues

**Testing Results:**
- ✅ Button appears in modal
- ✅ Loading state displays during API call
- ✅ Description appears on success
- ✅ Error message displays on failure
- ✅ "Regenerate" clears cache and generates new description
- ✅ Cached descriptions show immediately when reopening playlist

**Future Enhancements:**
- Add localStorage caching to persist descriptions across page reloads
- Implement rate limiting to prevent API spam from rapid button clicks
- Add timeout handling for slow API responses
- Consider backend proxy to hide API key in production