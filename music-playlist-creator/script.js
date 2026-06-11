// Global variable to store playlist data
let playlistsData = [];
let currentPlaylist = null; // Track the currently displayed playlist in modal
let descriptionCache = {}; // Cache for AI-generated descriptions
let nextPlaylistId = 9; // Counter for new playlist IDs
let nextSongId = 1000; // Counter for new song IDs
let editingPlaylistId = null; // Track which playlist is being edited
let filteredPlaylists = []; // Stores filtered/sorted results
let searchQuery = ''; // Current search term
let sortOption = 'default'; // Current sort option
let playlistToDelete = null; // Track playlist pending deletion

// Get modal elements
const modalOverlay = document.querySelector('.modal-overlay');
const formModal = document.querySelector('#form-modal');
const modalContent = document.querySelector('.modal-content');
const playlistCardsContainer = document.querySelector('.playlist-cards');
const shuffleButton = document.querySelector('.shuffle-button');
const getDescriptionBtn = document.querySelector('#get-description-btn');
const descriptionContainer = document.querySelector('#description-container');
const descriptionText = document.querySelector('#description-text');
const modalMenuBtn = document.querySelector('.modal-menu-btn');
const modalMenuDropdown = document.querySelector('.modal-menu-dropdown');
const modalEditBtn = document.querySelector('#modal-edit-btn');
const modalDeleteBtn = document.querySelector('#modal-delete-btn');

// Get delete confirmation modal elements
const deleteConfirmationModal = document.querySelector('#delete-confirmation-modal');
const deletePlaylistName = document.querySelector('#delete-playlist-name');
const confirmDeleteBtn = document.querySelector('#confirm-delete-btn');
const cancelDeleteBtn = document.querySelector('#cancel-delete-btn');

// Get form elements
const addPlaylistBtn = document.querySelector('#add-playlist-btn');
const playlistForm = document.querySelector('#playlist-form');
const cancelFormBtn = document.querySelector('#cancel-form-btn');
const addSongBtn = document.querySelector('#add-song-btn');
const songsContainer = document.querySelector('#songs-container');

// Function to load data from JSON file
async function loadPlaylistData() {
    try {
        const response = await fetch('data/data.json');
        const data = await response.json();

        // Load custom playlists from localStorage
        const customPlaylists = JSON.parse(localStorage.getItem('customPlaylists') || '[]');

        // Merge original and custom playlists
        playlistsData = [...data.playlists, ...customPlaylists];

        // Load saved likes from localStorage
        const savedLikes = JSON.parse(localStorage.getItem('playlistLikes') || '{}');

        // Initialize isLiked property for each playlist from localStorage
        playlistsData.forEach(playlist => {
            const savedState = savedLikes[playlist.playlistID];
            if (savedState) {
                playlist.isLiked = savedState.isLiked;
                playlist.likeCount = savedState.likeCount;
            } else {
                playlist.isLiked = false;
            }
        });

        // Update next ID counters
        if (playlistsData.length > 0) {
            nextPlaylistId = Math.max(...playlistsData.map(p => p.playlistID)) + 1;
        }

        // Initialize filtered playlists with all data
        filteredPlaylists = [...playlistsData];

        renderPlaylistCards();
    } catch (error) {
        console.error('Error loading playlist data:', error);
    }
}

// Function to render playlist cards
function renderPlaylistCards() {
    filteredPlaylists = [...playlistsData];
    renderFilteredPlaylistCards(filteredPlaylists);
}

// Function to render playlist cards from a specific array (for search/sort)
function renderFilteredPlaylistCards(playlists) {
    playlistCardsContainer.innerHTML = ''; // Clear existing cards

    if (playlists.length === 0) {
        // Show "no results" message
        playlistCardsContainer.innerHTML = `
            <div class="no-results">
                <p>No playlists found matching "${searchQuery}"</p>
            </div>
        `;
        return;
    }

    playlists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.dataset.playlistId = playlist.playlistID;

        // Determine heart icon based on like state - same path, different fill
        const heartIcon = playlist.isLiked
            ? '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14.5c-.2 0-.4-.1-.5-.2-3.2-2.5-5.5-4.6-5.5-7.8C2 4.5 3.5 3 5.5 3c1.1 0 2.1.6 2.5 1.5.4-.9 1.4-1.5 2.5-1.5 2 0 3.5 1.5 3.5 3.5 0 3.2-2.3 5.3-5.5 7.8-.1.1-.3.2-.5.2z" fill="currentColor"/></svg>'
            : '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14.5c-.2 0-.4-.1-.5-.2-3.2-2.5-5.5-4.6-5.5-7.8C2 4.5 3.5 3 5.5 3c1.1 0 2.1.6 2.5 1.5.4-.9 1.4-1.5 2.5-1.5 2 0 3.5 1.5 3.5 3.5 0 3.2-2.3 5.3-5.5 7.8-.1.1-.3.2-.5.2z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
        const likedClass = playlist.isLiked ? 'liked' : '';

        card.innerHTML = `
            <div class="playlist-cover-wrapper">
                <img src="${playlist.playlistArtURL}" alt="${playlist.playlistTitle}" class="playlist-cover">
                <div class="play-button-overlay">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="playlist-info">
                <div class="playlist-text">
                    <h3 class="playlist-title">${playlist.playlistTitle}</h3>
                    <p class="playlist-creator">${playlist.playlistCreator}</p>
                </div>
                <div class="playlist-likes">
                    <span class="heart-icon ${likedClass}">${heartIcon}</span>
                    <span class="like-count">${playlist.likeCount}</span>
                </div>
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => openModal(playlist));

        // Add click event to heart icon for like toggle
        const heartElement = card.querySelector('.heart-icon');
        heartElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click from opening modal
            toggleLike(playlist.playlistID);
        });

        playlistCardsContainer.appendChild(card);
    });
}

// Function to search playlists by title or creator (case-insensitive)
function searchPlaylists(query) {
    searchQuery = query.toLowerCase().trim();

    if (searchQuery === '') {
        // No search query - show all playlists
        filteredPlaylists = [...playlistsData];
    } else {
        // Filter by title or creator
        filteredPlaylists = playlistsData.filter(playlist => {
            const title = playlist.playlistTitle.toLowerCase();
            const creator = playlist.playlistCreator.toLowerCase();
            return title.includes(searchQuery) || creator.includes(searchQuery);
        });
    }

    // Apply current sort after filtering
    sortPlaylists(sortOption);
}

// Function to sort playlists based on selected option
function sortPlaylists(option) {
    sortOption = option;

    // Make a copy to avoid mutating filtered results during sort
    let sortedPlaylists = [...filteredPlaylists];

    switch(option) {
        case 'name-asc':
            sortedPlaylists.sort((a, b) => {
                const comparison = a.playlistTitle.localeCompare(b.playlistTitle);
                // Tie-breaker: if titles match, sort by creator name
                return comparison !== 0 ? comparison : a.playlistCreator.localeCompare(b.playlistCreator);
            });
            break;

        case 'name-desc':
            sortedPlaylists.sort((a, b) => {
                const comparison = b.playlistTitle.localeCompare(a.playlistTitle);
                return comparison !== 0 ? comparison : b.playlistCreator.localeCompare(a.playlistCreator);
            });
            break;

        case 'likes-desc':
            sortedPlaylists.sort((a, b) => {
                const comparison = b.likeCount - a.likeCount;
                // Tie-breaker: if same likes, sort alphabetically by name
                return comparison !== 0 ? comparison : a.playlistTitle.localeCompare(b.playlistTitle);
            });
            break;

        case 'likes-asc':
            sortedPlaylists.sort((a, b) => {
                const comparison = a.likeCount - b.likeCount;
                return comparison !== 0 ? comparison : a.playlistTitle.localeCompare(b.playlistTitle);
            });
            break;

        case 'default':
        default:
            // No sorting - use original order from filteredPlaylists
            break;
    }

    // Render the sorted/filtered results
    renderFilteredPlaylistCards(sortedPlaylists);
}

// Helper function to render songs in the modal
function renderSongs(songs) {
    const songList = document.querySelector('.song-list');
    songList.innerHTML = '';

    songs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';

        songItem.innerHTML = `
            <img src="${song.songArtURL}" alt="${song.songTitle}" class="song-cover">
            <div class="song-details">
                <p class="song-title">${song.songTitle}</p>
                <p class="song-artist">${song.songArtist}</p>
                <p class="song-album">${song.songAlbum}</p>
            </div>
            <span class="song-duration">${song.songDuration}</span>
        `;

        songList.appendChild(songItem);
    });
}

// Function to get AI-generated playlist description
async function getPlaylistDescription(playlist) {
    try {
        // Check if API_KEY is defined
        if (typeof API_KEY === 'undefined') {
            console.error('API_KEY is not defined. Make sure secrets.js is loaded.');
            return null;
        }

        // Build the song list for the prompt
        const songsList = playlist.songs.map(song =>
            `- ${song.songTitle} by ${song.songArtist} (${song.songAlbum})`
        ).join('\n');

        // Construct the prompt
        const prompt = `You are a music curator and playlist analyst. Generate a compelling 2-3 sentence description for this playlist:

Playlist: ${playlist.playlistTitle}
Creator: ${playlist.playlistCreator}

Songs:
${songsList}

Requirements:
- Capture the overall mood, genre, and theme
- 2-3 sentences, natural and conversational tone
- First sentence: Capture the overall mood/genre/theme
- Second sentence: Highlight what makes this playlist unique or when it's best enjoyed
- Do NOT list individual songs
- Do NOT use generic marketing language like "perfect for any occasion"
- Focus on the collective vibe, not individual tracks`;

        // Make API call to OpenRouter using any free model
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Music Playlist Explorer'
            },
            body: JSON.stringify({
                model: 'openrouter/auto:free',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 250,
                temperature: 0.7
            })
        });

        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', response.status, response.statusText, errorData);
            console.error('Full error details:', JSON.stringify(errorData, null, 2));
            return null;
        }

        // Parse response
        const data = await response.json();
        console.log('API Response:', data);

        // Extract description from response
        const description = data.choices?.[0]?.message?.content?.trim();

        if (!description) {
            console.error('Empty or invalid response from API', data);
            return null;
        }

        return description;

    } catch (error) {
        console.error('Error fetching playlist description:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return null;
    }
}

// Function to handle description button click
async function handleGetDescription() {
    if (!currentPlaylist) return;

    // Check if we're regenerating (button text is "Regenerate")
    const isRegenerating = getDescriptionBtn.textContent === 'Regenerate';

    // If regenerating, clear the cache for this playlist
    if (isRegenerating) {
        delete descriptionCache[currentPlaylist.playlistID];
    }

    // Check cache first (only if not regenerating)
    if (!isRegenerating && descriptionCache[currentPlaylist.playlistID]) {
        displayDescription(descriptionCache[currentPlaylist.playlistID], false);
        return;
    }

    // Update button to loading state
    getDescriptionBtn.disabled = true;
    getDescriptionBtn.classList.add('loading');
    getDescriptionBtn.textContent = 'Generating...';

    // Hide any previous description or error
    descriptionContainer.style.display = 'none';
    descriptionText.classList.remove('error');

    try {
        // Call AI API
        const description = await getPlaylistDescription(currentPlaylist);

        if (description) {
            // Cache the description
            descriptionCache[currentPlaylist.playlistID] = description;

            // Display success
            displayDescription(description, false);
        } else {
            // Display error
            displayDescription('Unable to generate description. Please try again.', true);
        }

    } catch (error) {
        console.error('Error in handleGetDescription:', error);
        displayDescription('Unable to generate description. Please try again.', true);
    } finally {
        // Reset button state
        getDescriptionBtn.disabled = false;
        getDescriptionBtn.classList.remove('loading');
    }
}

// Function to display description or error message
function displayDescription(text, isError) {
    descriptionText.textContent = text;
    descriptionContainer.style.display = 'block';

    if (isError) {
        descriptionText.classList.add('error');
        getDescriptionBtn.textContent = 'Retry';
        getDescriptionBtn.classList.add('error');
    } else {
        descriptionText.classList.remove('error');
        getDescriptionBtn.textContent = 'Regenerate';
        getDescriptionBtn.classList.remove('error');
    }
}

// Function to open modal with playlist data
function openModal(playlist) {
    // Store reference to current playlist
    currentPlaylist = playlist;

    // Update modal header
    const modalCover = document.querySelector('.modal-cover');
    const modalTitle = document.querySelector('.modal-playlist-title');
    const modalCreator = document.querySelector('.modal-creator');

    modalCover.src = playlist.playlistArtURL;
    modalCover.alt = playlist.playlistTitle;
    modalTitle.textContent = playlist.playlistTitle;
    modalCreator.textContent = playlist.playlistCreator;

    // Reset description button and hide description
    getDescriptionBtn.textContent = descriptionCache[playlist.playlistID] ? 'Show Description' : 'Get Description';
    getDescriptionBtn.classList.remove('loading', 'error');
    getDescriptionBtn.disabled = false;
    descriptionContainer.style.display = 'none';
    descriptionText.classList.remove('error');

    // Render songs in original order
    renderSongs(playlist.songs);

    // Show modal
    modalOverlay.classList.add('active');
}

// Function to close modal
function closeModal() {
    modalOverlay.classList.remove('active');
    currentPlaylist = null; // Clear current playlist reference

    // Hide description when closing modal
    descriptionContainer.style.display = 'none';

    // Reset button text based on cache
    if (currentPlaylist && descriptionCache[currentPlaylist.playlistID]) {
        getDescriptionBtn.textContent = 'Show Description';
    } else {
        getDescriptionBtn.textContent = 'Get Description';
    }
}

// Function to shuffle songs using Fisher-Yates algorithm
function shuffleSongs() {
    if (!currentPlaylist) return;

    // Create a copy of the original songs array to shuffle
    const shuffledSongs = [...currentPlaylist.songs];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
    }

    // Re-render the song list with shuffled order
    renderSongs(shuffledSongs);
}

// Function to save likes to localStorage
function saveLikesToStorage() {
    const likesData = {};
    playlistsData.forEach(playlist => {
        likesData[playlist.playlistID] = {
            isLiked: playlist.isLiked,
            likeCount: playlist.likeCount
        };
    });
    localStorage.setItem('playlistLikes', JSON.stringify(likesData));
}

// Function to toggle like state for a playlist
function toggleLike(playlistID) {
    // Find the playlist in the data array
    const playlist = playlistsData.find(p => p.playlistID === playlistID);
    if (!playlist) return;

    // Find the corresponding card in the DOM
    const card = document.querySelector(`[data-playlist-id="${playlistID}"]`);
    if (!card) return;

    const heartIcon = card.querySelector('.heart-icon');
    const likeCountElement = card.querySelector('.like-count');

    // Toggle the like state
    if (playlist.isLiked) {
        // UNLIKE branch
        playlist.isLiked = false;
        playlist.likeCount--;
        heartIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14.5c-.2 0-.4-.1-.5-.2-3.2-2.5-5.5-4.6-5.5-7.8C2 4.5 3.5 3 5.5 3c1.1 0 2.1.6 2.5 1.5.4-.9 1.4-1.5 2.5-1.5 2 0 3.5 1.5 3.5 3.5 0 3.2-2.3 5.3-5.5 7.8-.1.1-.3.2-.5.2z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
        heartIcon.classList.remove('liked');
    } else {
        // LIKE branch
        playlist.isLiked = true;
        playlist.likeCount++;
        heartIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14.5c-.2 0-.4-.1-.5-.2-3.2-2.5-5.5-4.6-5.5-7.8C2 4.5 3.5 3 5.5 3c1.1 0 2.1.6 2.5 1.5.4-.9 1.4-1.5 2.5-1.5 2 0 3.5 1.5 3.5 3.5 0 3.2-2.3 5.3-5.5 7.8-.1.1-.3.2-.5.2z" fill="currentColor"/></svg>';
        heartIcon.classList.add('liked');

        // Add burst animation
        createHeartBurst(heartIcon);
    }

    // Update the displayed like count
    likeCountElement.textContent = playlist.likeCount;

    // Save to localStorage
    saveLikesToStorage();

    // Re-sort if sorting by likes
    if (sortOption.includes('likes')) {
        sortPlaylists(sortOption);
    }
}

// Close modal when clicking outside the modal content
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Prevent clicks inside modal content from closing the modal
modalContent.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Add event listener to shuffle button
shuffleButton.addEventListener('click', shuffleSongs);

// Add event listener to get description button
getDescriptionBtn.addEventListener('click', handleGetDescription);

// Add event listener to modal menu button
modalMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modalMenuDropdown.classList.toggle('active');
});

// Add event listener to edit button in modal menu
modalEditBtn.addEventListener('click', () => {
    if (currentPlaylist) {
        const playlistId = currentPlaylist.playlistID;  // Store ID first
        modalMenuDropdown.classList.remove('active');
        closeModal();  // Now safe to close (sets currentPlaylist = null)
        openEditForm(playlistId);  // Use stored ID
    }
});

// Add event listener to delete button in modal menu
modalDeleteBtn.addEventListener('click', () => {
    if (currentPlaylist) {
        const playlistId = currentPlaylist.playlistID;  // Store ID first
        modalMenuDropdown.classList.remove('active');
        closeModal();
        deletePlaylist(playlistId);  // Use stored ID
    }
});

// Close modal menu dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.modal-menu-container')) {
        modalMenuDropdown.classList.remove('active');
    }
});

// ============================================
// SEARCH AND SORT FUNCTIONALITY
// ============================================

// Get search and sort elements
const searchIconBtn = document.querySelector('#search-icon-btn');
const searchContainer = document.querySelector('#search-container');
const searchInput = document.querySelector('#search-input');
const searchCloseBtn = document.querySelector('#search-close-btn');
const sortSelect = document.querySelector('#sort-select');
const pageNavigation = document.querySelector('.page-navigation');

// Toggle search bar visibility
searchIconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer.classList.add('active');
    pageNavigation.style.opacity = '0';
    pageNavigation.style.pointerEvents = 'none';
    setTimeout(() => {
        searchInput.focus();
    }, 100);
});

// Function to close search bar
function closeSearchBar() {
    searchContainer.classList.remove('active');
    pageNavigation.style.opacity = '1';
    pageNavigation.style.pointerEvents = 'auto';
    searchInput.value = '';
    searchPlaylists(''); // Reset search
}

// Close search bar
searchCloseBtn.addEventListener('click', closeSearchBar);

// Close search when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (searchContainer.classList.contains('active')) {
        if (!searchContainer.contains(e.target) && !searchIconBtn.contains(e.target)) {
            closeSearchBar();
        }
    }
});

// Add event listener for search input (debounced)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchPlaylists(e.target.value);
    }, 300); // 300ms debounce to avoid searching on every keystroke
});

// Add event listener for sort dropdown
sortSelect.addEventListener('change', (e) => {
    sortPlaylists(e.target.value);
});

// ============================================
// ADD PLAYLIST FUNCTIONALITY
// ============================================

// Function to save custom playlists to localStorage
function saveCustomPlaylists() {
    const customPlaylists = playlistsData.filter(p => p.isCustom);
    localStorage.setItem('customPlaylists', JSON.stringify(customPlaylists));
}

// Function to open add playlist form
function openAddForm() {
    editingPlaylistId = null; // Reset editing state
    document.querySelector('#form-modal-title').textContent = 'Add New Playlist';
    playlistForm.reset();
    songsContainer.innerHTML = '';
    addSongFormItem(); // Add one song form by default
    formModal.classList.add('active');
}

// Function to open edit playlist form
function openEditForm(playlistID) {
    console.log('openEditForm called with ID:', playlistID);
    editingPlaylistId = playlistID; // Set editing state
    const playlist = playlistsData.find(p => p.playlistID === playlistID);

    if (!playlist) {
        console.error('Playlist not found:', playlistID);
        return;
    }

    console.log('Found playlist:', playlist);

    // Update modal title
    document.querySelector('#form-modal-title').textContent = 'Edit Playlist';

    // Pre-populate form fields
    document.querySelector('#playlist-title-input').value = playlist.playlistTitle;
    document.querySelector('#playlist-creator-input').value = playlist.playlistCreator;
    document.querySelector('#playlist-art-url-input').value = playlist.playlistArtURL;

    // Clear and populate songs as compact list items
    songsContainer.innerHTML = '';
    playlist.songs.forEach(song => {
        addExistingSongItem(song);
    });

    console.log('Form populated, showing modal');
    // Show modal
    formModal.classList.add('active');
}

// Function to delete playlist
function deletePlaylist(playlistID) {
    const playlist = playlistsData.find(p => p.playlistID === playlistID);
    if (!playlist) return;

    // Show confirmation modal
    playlistToDelete = playlist;
    deletePlaylistName.textContent = playlist.playlistTitle;
    deleteConfirmationModal.classList.add('active');
}

function confirmDeletePlaylist() {
    if (!playlistToDelete) return;

    // Remove from array
    const index = playlistsData.findIndex(p => p.playlistID === playlistToDelete.playlistID);
    if (index !== -1) {
        playlistsData.splice(index, 1);
    }

    // Save to localStorage if it was a custom playlist
    saveCustomPlaylists();

    // Save likes
    saveLikesToStorage();

    // Close modals
    deleteConfirmationModal.classList.remove('active');
    modalOverlay.classList.remove('active');

    // Re-render cards
    renderPlaylistCards();

    // Re-apply current search and sort
    searchPlaylists(searchQuery);

    // Clear tracking
    playlistToDelete = null;
}

// Function to close form modal
function closeFormModal() {
    formModal.classList.remove('active');
    playlistForm.reset();
    songsContainer.innerHTML = '';
}

// Function to add a compact existing song item (for editing)
function addExistingSongItem(song) {
    const songItem = document.createElement('div');
    songItem.className = 'existing-song-item';
    songItem.dataset.songId = song.songID;
    songItem.innerHTML = `
        <img src="${song.songArtURL}" alt="${song.songTitle}" class="existing-song-cover">
        <div class="existing-song-info">
            <div class="existing-song-title">${song.songTitle}</div>
            <div class="existing-song-artist">${song.songArtist}</div>
        </div>
        <button type="button" class="remove-existing-song-btn" onclick="this.parentElement.remove()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="6" y1="12" x2="18" y2="12"></line>
            </svg>
        </button>
    `;
    songsContainer.appendChild(songItem);
}

// Function to generate random duration (max 10:30)
function generateRandomDuration() {
    const totalSeconds = Math.floor(Math.random() * (630 + 1)); // 0 to 630 seconds (10:30)
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Function to add a full song form item (for new songs)
function addSongFormItem(song = null) {
    const songIndex = songsContainer.querySelectorAll('.song-form-item').length;
    const songItem = document.createElement('div');
    songItem.className = 'song-form-item';

    // Generate random duration for new songs
    const duration = song ? song.songDuration : generateRandomDuration();

    songItem.innerHTML = `
        <h4>
            New Song ${songIndex + 1}
            <button type="button" class="remove-song-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
        </h4>
        <div class="form-group">
            <label>Song Title *</label>
            <input type="text" class="song-title-input" required value="${song ? song.songTitle : ''}">
        </div>
        <div class="form-group">
            <label>Artist *</label>
            <input type="text" class="song-artist-input" required value="${song ? song.songArtist : ''}">
        </div>
        <div class="form-group">
            <label>Album *</label>
            <input type="text" class="song-album-input" required value="${song ? song.songAlbum : ''}">
        </div>
        <input type="hidden" class="song-duration-input" value="${duration}">
        <div class="form-group">
            <label>Cover Image URL *</label>
            <input type="url" class="song-art-url-input" required value="${song ? song.songArtURL : ''}" placeholder="https://example.com/cover.jpg">
        </div>
    `;
    songsContainer.appendChild(songItem);
}

// Function to handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const title = document.querySelector('#playlist-title-input').value.trim();
    const creator = document.querySelector('#playlist-creator-input').value.trim();
    const artURL = document.querySelector('#playlist-art-url-input').value.trim();

    // Get existing songs and new song forms
    const existingSongItems = songsContainer.querySelectorAll('.existing-song-item');
    const newSongItems = songsContainer.querySelectorAll('.song-form-item');

    if (existingSongItems.length === 0 && newSongItems.length === 0) {
        alert('Please add at least one song to the playlist');
        return;
    }

    if (editingPlaylistId !== null) {
        // EDIT MODE: Update existing playlist
        const playlist = playlistsData.find(p => p.playlistID === editingPlaylistId);
        if (!playlist) return;

        // Update playlist fields
        playlist.playlistTitle = title;
        playlist.playlistCreator = creator;
        playlist.playlistArtURL = artURL;

        // Rebuild songs array: keep existing songs that weren't removed
        const updatedSongs = [];

        // Add existing songs that are still in the form (weren't removed)
        existingSongItems.forEach(item => {
            const songId = parseInt(item.dataset.songId);
            const existingSong = playlist.songs.find(s => s.songID === songId);
            if (existingSong) {
                updatedSongs.push(existingSong);
            }
        });

        // Add new songs from form items
        newSongItems.forEach(item => {
            updatedSongs.push({
                songID: nextSongId++,
                songTitle: item.querySelector('.song-title-input').value.trim(),
                songArtist: item.querySelector('.song-artist-input').value.trim(),
                songAlbum: item.querySelector('.song-album-input').value.trim(),
                songDuration: item.querySelector('.song-duration-input').value.trim(),
                songArtURL: item.querySelector('.song-art-url-input').value.trim()
            });
        });

        playlist.songs = updatedSongs;

        // Clear the cached description for this playlist since it changed
        delete descriptionCache[editingPlaylistId];

    } else {
        // ADD MODE: Create new playlist
        const songs = Array.from(newSongItems).map(item => ({
            songID: nextSongId++,
            songTitle: item.querySelector('.song-title-input').value.trim(),
            songArtist: item.querySelector('.song-artist-input').value.trim(),
            songAlbum: item.querySelector('.song-album-input').value.trim(),
            songDuration: item.querySelector('.song-duration-input').value.trim(),
            songArtURL: item.querySelector('.song-art-url-input').value.trim()
        }));

        const newPlaylist = {
            playlistID: nextPlaylistId++,
            playlistTitle: title,
            playlistCreator: creator,
            playlistArtURL: artURL,
            likeCount: 0,
            isLiked: false,
            isCustom: true,
            dateAdded: Date.now(),
            songs: songs
        };
        playlistsData.push(newPlaylist);
    }

    // Save custom playlists
    saveCustomPlaylists();

    // Save likes
    saveLikesToStorage();

    // Re-render cards
    renderPlaylistCards();

    // Re-apply current search and sort
    searchPlaylists(searchQuery);

    // Close form
    closeFormModal();
}

// Add event listeners
addPlaylistBtn.addEventListener('click', openAddForm);
cancelFormBtn.addEventListener('click', closeFormModal);
addSongBtn.addEventListener('click', () => addSongFormItem());
playlistForm.addEventListener('submit', handleFormSubmit);

// Close form modal when clicking outside
formModal.addEventListener('click', (e) => {
    if (e.target === formModal) {
        closeFormModal();
    }
});

// Delete confirmation modal event listeners
confirmDeleteBtn.addEventListener('click', confirmDeletePlaylist);
cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmationModal.classList.remove('active');
    playlistToDelete = null;
});

// Close delete confirmation modal when clicking outside
deleteConfirmationModal.addEventListener('click', (e) => {
    if (e.target === deleteConfirmationModal) {
        deleteConfirmationModal.classList.remove('active');
        playlistToDelete = null;
    }
});

// ============================================
// HEART BURST ANIMATION
// ============================================
function createHeartBurst(heartIcon) {
    // Add burst class to heart
    heartIcon.classList.add('bursting');

    // Remove class after animation
    setTimeout(() => {
        heartIcon.classList.remove('bursting');
    }, 600);

    // Create particle burst effect
    const particleCount = 8;
    const heartRect = heartIcon.getBoundingClientRect();
    const centerX = heartRect.left + heartRect.width / 2;
    const centerY = heartRect.top + heartRect.height / 2;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'heart-particle';

        // Calculate random angle and distance
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 30 + Math.random() * 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--particle-x', `translate(${tx}px, ${ty}px)`);
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';

        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 600);
    }
}

// ============================================
// PAGE TRANSITIONS
// ============================================
function setupPageTransitions() {
    const navLinks = document.querySelectorAll('.nav-link[href]');
    const overlay = document.querySelector('.page-transition-overlay');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only handle same-origin links
            if (link.hostname !== window.location.hostname) return;

            e.preventDefault();
            const href = link.getAttribute('href');

            // Don't transition if clicking current page
            if (link.classList.contains('active')) return;

            // Start transition
            document.body.classList.add('page-transitioning');
            overlay.classList.add('active');

            // Navigate after fade out
            setTimeout(() => {
                window.location.href = href;
            }, 150);
        });
    });
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPlaylistData();
    setupPageTransitions();

    // Fade in from transition
    setTimeout(() => {
        const overlay = document.querySelector('.page-transition-overlay');
        overlay.classList.remove('active');
        document.body.classList.remove('page-transitioning');
    }, 100);

    // Check if URL has #add-playlist hash to auto-open form
    if (window.location.hash === '#add-playlist') {
        openAddForm();
        // Clear the hash from URL
        history.replaceState(null, null, ' ');
    }
});
