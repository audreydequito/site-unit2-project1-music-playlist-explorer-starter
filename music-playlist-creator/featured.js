// Global variable to store playlist data
let playlistsData = [];
let nextPlaylistId = 9;
let nextSongId = 1000;

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

        // Apply saved likes to playlists
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

        // Once data is loaded, select and display a random playlist
        const randomPlaylist = selectRandomPlaylist();
        displayFeaturedPlaylist(randomPlaylist);
    } catch (error) {
        console.error('Error loading playlist data:', error);
    }
}

// Function to select a random playlist
function selectRandomPlaylist() {
    const randomIndex = Math.floor(Math.random() * playlistsData.length);
    return playlistsData[randomIndex];
}

// Function to display the featured playlist
function displayFeaturedPlaylist(playlist) {
    // Update playlist title and creator
    const titleElement = document.querySelector('.featured-playlist-title');
    const creatorElement = document.querySelector('.featured-creator');
    const coverElement = document.querySelector('.featured-cover');

    titleElement.textContent = playlist.playlistTitle;
    creatorElement.textContent = playlist.playlistCreator;
    coverElement.src = playlist.playlistArtURL;
    coverElement.alt = playlist.playlistTitle;

    // Extract and apply dynamic background color
    extractDominantColor(playlist.playlistArtURL);

    // Render the song carousel
    renderSongCarousel(playlist.songs);
}

// Function to extract dominant color from image
function extractDominantColor(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function() {
        try {
            // Create canvas to analyze image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Get image data from center area (usually has the most vibrant colors)
            const centerX = Math.floor(img.width / 4);
            const centerY = Math.floor(img.height / 4);
            const sampleWidth = Math.floor(img.width / 2);
            const sampleHeight = Math.floor(img.height / 2);

            const imageData = ctx.getImageData(centerX, centerY, sampleWidth, sampleHeight);
            const data = imageData.data;

            // Calculate average color (sampling every 10th pixel for performance)
            let r = 0, g = 0, b = 0, count = 0;

            for (let i = 0; i < data.length; i += 40) { // Sample every 10 pixels (4 channels * 10)
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            // Increase saturation by boosting the dominant channel
            const max = Math.max(r, g, b);
            const boost = 1.3;
            if (r === max) r = Math.min(255, Math.floor(r * boost));
            if (g === max) g = Math.min(255, Math.floor(g * boost));
            if (b === max) b = Math.min(255, Math.floor(b * boost));

            // Create gradient background
            const dynamicBg = document.querySelector('.dynamic-background');
            dynamicBg.style.background = `
                radial-gradient(
                    circle at 30% 20%,
                    rgba(${r}, ${g}, ${b}, 0.25) 0%,
                    rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)}, 0.15) 40%,
                    transparent 70%
                )
            `;
            dynamicBg.classList.add('active');

        } catch (e) {
            // If CORS error or any issue, use default background
            console.log('Could not extract color from image:', e);
            applyDefaultBackground();
        }
    };

    img.onerror = function() {
        applyDefaultBackground();
    };

    img.src = imageUrl;
}

// Fallback background
function applyDefaultBackground() {
    const dynamicBg = document.querySelector('.dynamic-background');
    dynamicBg.style.background = `
        radial-gradient(
            circle at 30% 20%,
            rgba(100, 100, 150, 0.2) 0%,
            rgba(50, 50, 80, 0.1) 40%,
            transparent 70%
        )
    `;
    dynamicBg.classList.add('active');
}

// Function to render song carousel with infinite loop
function renderSongCarousel(songs) {
    const carouselContainer = document.querySelector('.song-carousel');
    carouselContainer.innerHTML = ''; // Clear existing cards

    // Duplicate songs array 3 times for seamless infinite scroll
    const infiniteSongs = [...songs, ...songs, ...songs];

    infiniteSongs.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'carousel-song-card';

        songCard.innerHTML = `
            <img src="${song.songArtURL}" alt="${song.songTitle}" class="carousel-song-cover">
            <div class="carousel-song-details">
                <div class="carousel-song-info">
                    <h3 class="carousel-song-title">${song.songTitle}</h3>
                    <p class="carousel-song-artist">${song.songArtist}</p>
                    <p class="carousel-song-album">${song.songAlbum}</p>
                </div>
                <p class="carousel-song-duration">${song.songDuration}</p>
            </div>
        `;

        carouselContainer.appendChild(songCard);
    });

    // Set up carousel navigation after cards are rendered
    setupCarouselNavigation(songs.length);

    // Set up progress indicators
    setupProgressIndicators(songs.length);

    // Scroll to the second set of songs (middle) to allow scrolling both directions
    // Do this instantly (no smooth scroll) to prevent animation on page load
    const carousel = carouselContainer;
    const cardWidth = 300; // Card width + gap

    // Temporarily disable smooth scroll for instant positioning
    carousel.style.scrollBehavior = 'auto';
    carousel.scrollLeft = songs.length * cardWidth;

    // Re-enable smooth scrolling and update featured card
    requestAnimationFrame(() => {
        carousel.style.scrollBehavior = 'smooth';
        updateFeaturedCard();
        updateProgressIndicators();
    });
}

// Function to update which card is featured based on scroll position
function updateFeaturedCard() {
    const carousel = document.querySelector('.song-carousel');
    const carouselContainer = document.querySelector('.song-carousel-container');
    const cards = carousel.querySelectorAll('.carousel-song-card');

    // Use the container's center as the reference point (true viewport center)
    const containerRect = carouselContainer.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestCard = null;
    let closestDistance = Infinity;

    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestCard = card;
        }
    });

    // Remove featured class from all cards
    cards.forEach(card => card.classList.remove('featured'));

    // Add featured class to closest card
    if (closestCard) {
        closestCard.classList.add('featured');
    }

    // Update progress indicators
    updateProgressIndicators();
}

// Function to set up carousel navigation arrows with infinite loop
function setupCarouselNavigation(originalSongCount) {
    const carousel = document.querySelector('.song-carousel');
    const leftArrow = document.querySelector('.carousel-arrow-left');
    const rightArrow = document.querySelector('.carousel-arrow-right');
    const cardWidth = 300; // Width of one card + gap
    const setWidth = originalSongCount * cardWidth;

    let isRepositioning = false;
    let scrollTimer = null;
    let isNavigating = false; // Flag to prevent repositioning during arrow clicks

    // Function to get the closest card to center
    function getClosestCardIndex() {
        const cards = carousel.querySelectorAll('.carousel-song-card');
        const carouselContainer = document.querySelector('.song-carousel-container');

        // Use the container's center as the reference point (true viewport center)
        const containerRect = carouselContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - containerCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    // Function to scroll to a specific card
    function scrollToCard(index) {
        const cards = carousel.querySelectorAll('.carousel-song-card');
        if (cards[index]) {
            // Set navigation flag to prevent repositioning
            isNavigating = true;

            // Clear any pending scroll timers
            clearTimeout(scrollTimer);

            const card = cards[index];
            const carouselContainer = document.querySelector('.song-carousel-container');

            // Calculate the exact position to center the card in the container
            const cardOffsetLeft = card.offsetLeft;
            const cardWidth = card.offsetWidth;
            const containerWidth = carouselContainer.offsetWidth;
            const targetScroll = cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2);

            // Scroll to the target position smoothly
            carousel.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });

            // Clear navigation flag after scroll completes
            setTimeout(() => {
                isNavigating = false;
            }, 600);
        }
    }

    // Scroll left - go to previous card
    leftArrow.addEventListener('click', () => {
        if (isNavigating) return; // Prevent rapid clicks
        const currentIndex = getClosestCardIndex();

        // Calculate next index with wrapping
        let nextIndex = currentIndex - 1;

        // If we're at the beginning of any set, move to the equivalent position in the adjacent set
        // This prevents large jumps and allows smooth infinite scrolling
        if (nextIndex < 0) {
            // Wrap to the end of the middle set (not the absolute end)
            nextIndex = originalSongCount * 2 - 1;
        } else if (currentIndex === originalSongCount) {
            // At the start of the middle set, move to end of first set
            nextIndex = originalSongCount - 1;
        }

        scrollToCard(nextIndex);
    });

    // Scroll right - go to next card
    rightArrow.addEventListener('click', () => {
        if (isNavigating) return; // Prevent rapid clicks
        const currentIndex = getClosestCardIndex();
        const totalCards = originalSongCount * 3; // Total cards in tripled array

        // Calculate next index with wrapping
        let nextIndex = currentIndex + 1;

        // If we're at the end of any set, move to the equivalent position in the adjacent set
        // This prevents large jumps and allows smooth infinite scrolling
        if (nextIndex >= totalCards) {
            // Wrap to the start of the middle set (not the absolute start)
            nextIndex = originalSongCount;
        } else if (currentIndex === originalSongCount * 2 - 1) {
            // At the end of the middle set, move to start of third set
            nextIndex = originalSongCount * 2;
        }

        scrollToCard(nextIndex);
    });

    // Update featured card on scroll with throttling
    let lastScrollTime = 0;
    carousel.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScrollTime > 16) { // ~60fps throttle
            updateFeaturedCard();
            lastScrollTime = now;
        }

        // Don't reposition if we're navigating with arrows
        if (isNavigating || isRepositioning) return;

        // Clear previous timer
        clearTimeout(scrollTimer);

        // Wait for scrolling to stop before checking repositioning or centering
        scrollTimer = setTimeout(() => {
            // Double-check flags before repositioning
            if (isRepositioning || isNavigating) return;

            const scrollLeft = carousel.scrollLeft;

            // Reposition if scrolled into the first set (too far left)
            if (scrollLeft < setWidth * 0.8) {
                isRepositioning = true;
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft = scrollLeft + setWidth;
                requestAnimationFrame(() => {
                    carousel.style.scrollBehavior = 'smooth';
                    setTimeout(() => {
                        isRepositioning = false;
                    }, 50);
                });
            }
            // Reposition if scrolled into the third set (too far right)
            else if (scrollLeft > setWidth * 2.2) {
                isRepositioning = true;
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft = scrollLeft - setWidth;
                requestAnimationFrame(() => {
                    carousel.style.scrollBehavior = 'smooth';
                    setTimeout(() => {
                        isRepositioning = false;
                    }, 50);
                });
            }
            // After manual scroll stops, gently center the closest card
            else {
                const closestIndex = getClosestCardIndex();
                const closestCard = carousel.querySelectorAll('.carousel-song-card')[closestIndex];

                if (closestCard) {
                    const carouselContainer = document.querySelector('.song-carousel-container');
                    const cardOffsetLeft = closestCard.offsetLeft;
                    const cardWidth = closestCard.offsetWidth;
                    const containerWidth = carouselContainer.offsetWidth;
                    const targetScroll = cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2);
                    const currentScroll = carousel.scrollLeft;

                    // Only center if we're more than 30px away from center (provides resistance)
                    if (Math.abs(targetScroll - currentScroll) > 30) {
                        carousel.scrollTo({
                            left: targetScroll,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }, 150); // Shorter delay for more responsive centering
    });
}

// ============================================
// ADD PLAYLIST FUNCTIONALITY
// ============================================

// Get form elements
const addPlaylistBtn = document.querySelector('#add-playlist-btn');
const formModal = document.querySelector('#form-modal');
const playlistForm = document.querySelector('#playlist-form');
const cancelFormBtn = document.querySelector('#cancel-form-btn');
const addSongBtn = document.querySelector('#add-song-btn');
const songsContainer = document.querySelector('#songs-container');

// Function to save custom playlists to localStorage
function saveCustomPlaylists() {
    const customPlaylists = playlistsData.filter(p => p.isCustom);
    localStorage.setItem('customPlaylists', JSON.stringify(customPlaylists));
}

// Function to open add playlist form
function openAddForm() {
    document.querySelector('#form-modal-title').textContent = 'Add New Playlist';
    playlistForm.reset();
    songsContainer.innerHTML = '';
    addSongFormItem(); // Add one song form by default
    formModal.classList.add('active');
}

// Function to close form modal
function closeFormModal() {
    formModal.classList.remove('active');
    playlistForm.reset();
    songsContainer.innerHTML = '';
}

// Function to generate random duration (max 10:30)
function generateRandomDuration() {
    const totalSeconds = Math.floor(Math.random() * (630 + 1)); // 0 to 630 seconds (10:30)
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Function to add a song form item
function addSongFormItem(song = null) {
    const songIndex = songsContainer.children.length;
    const songItem = document.createElement('div');
    songItem.className = 'song-form-item';

    // Generate random duration for new songs
    const duration = song ? song.songDuration : generateRandomDuration();

    songItem.innerHTML = `
        <h4>
            Song ${songIndex + 1}
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

    // Get all songs
    const songItems = songsContainer.querySelectorAll('.song-form-item');
    if (songItems.length === 0) {
        alert('Please add at least one song to the playlist');
        return;
    }

    const songs = Array.from(songItems).map(item => ({
        songID: nextSongId++,
        songTitle: item.querySelector('.song-title-input').value.trim(),
        songArtist: item.querySelector('.song-artist-input').value.trim(),
        songAlbum: item.querySelector('.song-album-input').value.trim(),
        songDuration: item.querySelector('.song-duration-input').value.trim(),
        songArtURL: item.querySelector('.song-art-url-input').value.trim()
    }));

    // Add new playlist
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

    // Save custom playlists
    saveCustomPlaylists();

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

// ============================================
// PROGRESS INDICATORS
// ============================================
let originalSongCount = 0;

function setupProgressIndicators(songCount) {
    originalSongCount = songCount;
    const progressContainer = document.querySelector('.carousel-progress');
    progressContainer.innerHTML = '';

    for (let i = 0; i < songCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.dataset.index = i;

        // Click to jump to song
        dot.addEventListener('click', () => {
            const carousel = document.querySelector('.song-carousel');
            const cards = carousel.querySelectorAll('.carousel-song-card');
            // Jump to middle set version of this song
            const targetIndex = songCount + i;
            scrollToCard(targetIndex);
        });

        progressContainer.appendChild(dot);
    }
}

function updateProgressIndicators() {
    if (originalSongCount === 0) return;

    const carousel = document.querySelector('.song-carousel');
    const cards = carousel.querySelectorAll('.carousel-song-card');
    const carouselRect = carousel.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - carouselCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    // Convert to original song index (handle wrapping)
    const songIndex = closestIndex % originalSongCount;

    // Update dots
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        if (index === songIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Helper function for progress dots to scroll to card
function scrollToCard(index) {
    const carousel = document.querySelector('.song-carousel');
    const carouselContainer = document.querySelector('.song-carousel-container');
    const cards = carousel.querySelectorAll('.carousel-song-card');
    if (cards[index]) {
        const card = cards[index];
        const cardOffsetLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const containerWidth = carouselContainer.offsetWidth;
        const targetScroll = cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2);

        carousel.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
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
            if (link.hostname !== window.location.hostname) return;
            e.preventDefault();
            const href = link.getAttribute('href');
            if (link.classList.contains('active')) return;

            document.body.classList.add('page-transitioning');
            overlay.classList.add('active');

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

    // Handle search button - navigate to All page
    const searchBtn = document.querySelector('#search-icon-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

});
