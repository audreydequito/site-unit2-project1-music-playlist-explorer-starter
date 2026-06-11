## Unit Assignment: Music Playlist Explorer

Submitted by: **Audrey Dequito**

Estimated time spent: **20** hours spent in total

### Description

Wave is a modern music playlist explorer featuring diverse playlists across K-pop, J-pop, indie, R&B, and pop genres. The app includes a sleek dark mode interface with smooth animations, an infinite-scrolling featured carousel with dynamic backgrounds extracted from album art, and AI-powered playlist descriptions using OpenRouter API.

### Application Features

#### CORE FEATURES

- [x] **Display Playlists**
  - [x] Dynamically render playlists on the homepage using JavaScript.
    - [x] Playlists should be shown in grid view.
    - [x] Playlist images should be reasonably sized (at least 6 playlists on your laptop when full screen; large enough that the playlist components detailed in the next feature are legible).
  - [x] Fetch data from a provided JavaScript file and use it to create interactive playlist tiles.

- [x] **Playlist Components**
  - [x] Each tile should display the playlist's:
    - [x] Cover image
    - [x] Name
    - [x] Author
    - [x] Like count

- [x] **Playlist Details**
  - [x] Create a modal pop-up view that displays detailed information about a playlist when a user clicks on a playlist tile.
  - [x] The modal should show the playlist's:
    - [x] Cover image
    - [x] Name
    - [x] Author
    - [x] List of songs, including each song's:
      - [x] Title
      - [x] Artist
      - [x] Duration
  - [x] The modal itself should:
    - [x] Not occupy the entire screen.
    - [x] Have a shadow to show that it is a pop-up.
    - [x] Appear floating on the screen.
    - [x] The backdrop should appear darker or in a different shade.

- [x] **Like Playlists**
  - [x] Implement functionality to allow users to like playlists by clicking a heart icon on each playlist tile.
  - [x] When the heart icon is clicked:
    - [x] If previously unliked:
      - [x] The like count on the playlist tile should increase by 1.
      - [x] There should be visual feedback (such as the heart turning a different color) to show that the playlist has been liked by the user.
    - [x] If previously liked:
      - [x] The like count on the playlist tile should decrease by 1.
      - [x] There should be visual feedback (such as the heart turning a different color) to show that the playlist has been unliked by the user.
    - [x] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS:** In addition to showcasing the above features, for ease of grading, please film yourself liking and unliking:
      - [x] a playlist with a like count of 0
      - [x] a playlist with a non-zero like count

- [x] **Shuffle Songs**
  - [x] Enable users to shuffle the songs within a playlist using a shuffle button in the playlist's detail modal.
  - [x] When the shuffle button is clicked, the playlist's songs should display in a different order.
  - [x] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS:** In addition to showcasing the above features, for ease of grading, please show yourself shuffling the same playlist more than once. 
  
- [x] **Featured Page**
  - [x] Application includes a dedicated page that randomly selects and displays a playlist, showing the playlist’s:
    - [x] Playlist Image
    - [x] Playlist Name
    - [x] List of songs, including each song's:
      - [x] Title
      - [x] Artist
      - [x] Duration
  - [x] When the page is refreshed or reloaded, a new random playlist is displayed
    - For example, navigating to the all playlists page and then back to the featured playlist page should result in a new random playlist being displayed
    - Note that because your algorithm will not be truly random, it is possible that the same playlist will feature twice in a row. 
    - [x] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS:** In addition to showcasing the above features, for ease of grading, please show yourself refreshing the featured page more than once. 
  - [x] Application includes a navigation bar or some other mechanism such that users can navigate to the page with all playlists from the featured page and vice versa without using the browser's back and forward buttons. 

- [x] **Planning Documentation**
  - [x] Repository includes a `planning.md` file with:
    - [x] A **Data Shape** section (fields and types for playlist and song objects)
    - [x] A **UI and Interaction Rules** section (at least three rules describing what happens in the UI for a user action)
    - [x] At least one **Function Spec** (name, purpose, inputs, outputs, side effects)
    - [x] A **Featured Page** section describing the random playlist display behavior
    - [x] A **Decisions Log** with entries from at least two different milestones

- [x] **AI-Powered Playlist Description**
  - [x] The playlist detail modal includes a "Get Description" button.
  - [x] Clicking the button calls an AI API and displays a generated description within the modal.
  - [x] `planning.md` includes an **AI Feature Spec** documenting role, task, inputs, output format, constraints, and failure behavior.
  - [x] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS:** For ease of grading, open your browser's DevTools Network tab, click the "Get Description" button, and show the outbound request going directly to an AI API URL (e.g., `openrouter.ai`).

#### STRETCH FEATURES

- [x] **Add New Playlists**
  - [x] Allow users to create new playlists.
  - [x] Using a form, users can input playlist:
    - [x] Name
    - [x] Author
    - [x] Cover image
    - [x] Add one or more songs to the playlist, specifying the song's:
      - [x] Title
      - [x] Artist
  - [x] The resulting playlist should display in the grid view.
  - [x] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS:** For ease of grading, please show yourself adding at least two songs to the playlist. 

- [x] **Edit Existing Playlists**
  - [x] Enable users to modify the details of existing playlists.
  - [x] Add an edit button to each playlist tile.
  - [x] Users can update the playlist:
    - [x] Name
    - [x] Author
    - [x] Songs
  - [x] The playlist grid view and playlist detail modal should update to display any changes (see Required Features, Criterion 1 & 2).
  - [x] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS:** For ease of grading, please show yourself:
    - [x] Editing all of a playlist's features (name, creator, AND songs)
    - [x] Editing some of a playlist's features (name, creator, OR songs) 

- [x] **Delete Playlists**
  - [x] Add a delete button to each playlist tile within the grid view.
  - [x] When clicked, the playlist is removed from the playlist grid view.

- [x] **Search Functionality**
  - [x] Implement a search bar that allows users to filter playlists by:
    - [x] Name 
    - [x] Author
  - [x] The search bar should include:
    - [x] Text input field
    - [x] Submit/Search Button
    - [x] Clear Button
  - [x] Playlists matching the search query in the text input are displayed in a grid view when the user:
    - [x] Presses the Enter Key
    - [x] Clicks the Submit/Search Button 
  - [x] User can click the clear button. When clicked:
    - [x] All text in the text input field is deleted
    - [x] All playlists in the `data.json` file are displayed in a grid view
    - [x] **Optional:** If the Add Playlist, Edit Existing Playlist, or Delete Playlist stretch features were implemented:
      - [x] If users can add a playlist, added playlists should be included in search results.
      - [x] If users can edit a playlist, search results should reflect the latest edits to each playlist.
      - [x] If users can delete a playlist, deleted playlists should no longer be included in search results.
      - **Note:** You will not be graded on the implementation of this optional subfeature to keep your grade of this stretch feature independent of your implementation of other stretch features. However, we highly suggest including this in your implementation to model realistic behavior of real applications. 

- [] **Sorting Options**
  - [x] Implement a drop-down or button options that allow users to sort the playlist by:
    - [x] Name (A-Z alphabetically)
    - [x] Number of likes (descending order)
    - [ ] Date added (most recent to oldest, chronologically)
  - [x] Selecting a sort option should result in a reordering based on the selected sort while maintaining a grid view.

### Walkthrough Video

**Walkthrough video:** [Music Playlist Explorer Walkthrough](https://www.loom.com/share/7228d76a38e8454a86ba15d92f9e34aa)

### Screenshots

<img src="sample_main_layout.png" width="600" alt="Main playlist grid view">
<img src="sample_modal.png" width="600" alt="Playlist detail modal">
<img src="sample_featured_page.png" width="600" alt="Featured page carousel"> 
<img src="sample_playlist.png" width="600" alt="Playlist card">
<img src="sample_container.png" width="600" alt="Add playlist form">

### Reflection

* Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?

The labs provided a solid foundation for DOM manipulation, event handling, and working with JSON data. However, I felt less prepared for implementing complex UI features like the infinite carousel with smooth scrolling and the dynamic background color extraction from images. These required deeper understanding of CSS transforms, scroll behaviors, and canvas API which weren't covered extensively in labs. The AI API integration was also new territory, particularly handling async/await patterns and error handling for external API calls.

* If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.

With more time, I would have:
- Implemented the boundary-cloning approach for the infinite carousel instead of tripling the array for better memory efficiency
- Added Spotify API integration for 30-second audio previews
- Implemented user authentication with Firebase to persist liked playlists and custom playlists across sessions
- Added drag-and-drop functionality for reordering songs within playlists
- Created a more robust loading state with skeleton screens instead of just showing/hiding elements
- Added unit tests for critical functions like search, sort, and shuffle
- Implemented keyboard navigation for better accessibility
  
* Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?

What went well:
- The visual design and animations received positive feedback, especially the dynamic backgrounds and smooth page transitions
- The infinite carousel worked seamlessly without visible jumps
- AI-generated descriptions added a unique touch that made playlists feel more personalized

What didn't go as planned:
- Initially struggled with CORS issues when extracting colors from external album art URLs
- The AI API sometimes took longer than expected to respond, which made the UI feel laggy
- Had to pivot from using individual free models to OpenRouter's auto-routing due to rate limits

What I'd like to try next:
- One peer implemented a collaborative playlist feature where multiple users could add songs in real-time using WebSockets
- Another peer created custom visualizers that animated based on song tempo/BPM which was really engaging
- I noticed several peers used TypeScript which helped catch bugs early - I'd like to explore that for future projects

### Open-source libraries used

- [OpenRouter API](https://openrouter.ai/) - AI API aggregator for generating playlist descriptions
- [Pexels](https://www.pexels.com/) - Free stock photos for playlist and song cover art

### Additional Features Implemented

Beyond the required and stretch features, I also added:

- **Dynamic Background Extraction**: Automatically extracts dominant colors from album art using Canvas API to create ambient gradient backgrounds
- **Infinite Carousel**: Seamless infinite scrolling on featured page with smooth animations and auto-centering
- **Progress Indicators**: Interactive dots showing current song position in the carousel
- **Page Transitions**: Smooth fade transitions between pages for polished UX
- **Auto-Generated Song Durations**: Random duration generation (0:00-10:30) for new songs
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Heart Burst Animation**: Satisfying particle animation when liking a playlist
- **LocalStorage Persistence**: Saves custom playlists and like states across sessions
- **OpenRouter Free Model Auto-Routing**: Automatically uses any available free AI model

### Technical Highlights

**Dynamic Background Color Extraction:**
```javascript
function extractDominantColor(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Sample center area of image
        const imageData = ctx.getImageData(centerX, centerY, sampleWidth, sampleHeight);
        const data = imageData.data;
        
        // Calculate average RGB and boost saturation
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 40) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
        
        // Apply dynamic gradient to background
        dynamicBg.style.background = `radial-gradient(
            circle at 30% 20%,
            rgba(${r}, ${g}, ${b}, 0.25) 0%,
            transparent 70%
        )`;
    };
    img.src = imageUrl;
}
```

### Shout out

Shoutout to my CodePath instructors and TAs for their guidance throughout this project, especially for helping me debug the infinite carousel scroll logic and understand async/await patterns for API calls. Also thanks to my cohort peers who provided valuable feedback during code reviews and inspired me to push beyond the basic requirements!
