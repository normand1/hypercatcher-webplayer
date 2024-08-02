let episodes = [];
let currentPage = 1;
const episodesPerPage = 10;

function createFlyingObjects() {
    const container = document.body;
    for (let i = 0; i < 50; i++) {
        const obj = document.createElement('div');
        obj.className = 'flying-object';
        obj.style.left = `${Math.random() * 100}vw`;
        obj.style.top = `${Math.random() * 100}vh`;
        obj.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
        container.appendChild(obj);

        gsap.to(obj, {
            x: `${(Math.random() - 0.5) * 200}vw`,
            y: `${(Math.random() - 0.5) * 200}vh`,
            duration: Math.random() * 10 + 5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }
}

function createMountains() {
    const mountains = document.createElement('div');
    mountains.className = 'mountains';
    document.body.appendChild(mountains);

    for (let i = 0; i < 5; i++) {
        const mountain = document.createElement('div');
        mountain.className = 'mountain';
        mountain.style.left = `${i * 25}%`;
        mountain.style.borderWidth = `0 ${50 + Math.random() * 100}px ${100 + Math.random() * 100}px ${50 + Math.random() * 100}px`;
        mountains.appendChild(mountain);
    }
}

function playEpisode(index, event) {
    event.stopPropagation();
    const episode = episodes[index];
    const player = document.querySelector('#player audio');
    const nowPlaying = document.getElementById('nowPlaying');
    
    player.src = episode.audioUrl;
    player.play();
    nowPlaying.textContent = `Now Playing: ${episode.title}`;
}

function toggleEpisode(index) {
    const content = document.getElementById(`episode-content-${index}`);
    const arrow = document.getElementById(`dropdown-arrow-${index}`);
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        arrow.classList.add('open');
    } else {
        content.style.display = 'none';
        arrow.classList.remove('open');
    }
}

function displayEpisodes() {
    const startIndex = (currentPage - 1) * episodesPerPage;
    const endIndex = startIndex + episodesPerPage;
    const currentEpisodes = episodes.slice(startIndex, endIndex);

    const episodesHTML = currentEpisodes.map((episode, index) => `
        <div class="episode">
            <div class="episode-header" onclick="toggleEpisode(${startIndex + index})">
                <h2>${episode.title}</h2>
                <span id="dropdown-arrow-${startIndex + index}" class="dropdown-arrow">▼</span>
            </div>
            <div id="episode-content-${startIndex + index}" class="episode-content" style="display: none;">
                <p>${episode.description}</p>
                <button onclick="playEpisode(${startIndex + index}, event)">Play Episode</button>
            </div>
        </div>
    `).join('');

    document.getElementById('episodes').innerHTML = episodesHTML;
    updatePager();
}

function updatePager() {
    const totalPages = Math.ceil(episodes.length / episodesPerPage);
    const pagerElement = document.getElementById('pager');
    
    if (totalPages > 1) {
        let pagerHTML = '';
        if (currentPage > 1) {
            pagerHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
        }

        pagerHTML += `<span>Page ${currentPage} of ${totalPages}</span>`;

        if (currentPage < totalPages) {
            pagerHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
        }

        pagerElement.innerHTML = pagerHTML;
        pagerElement.style.display = 'flex';
    } else {
        pagerElement.style.display = 'none';
    }
}

function changePage(newPage) {
    currentPage = newPage;
    displayEpisodes();
}

async function fetchAndDisplayPodcast(rssUrl) {
    try {
        const response = await axios.get(rssUrl);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");

        const items = xmlDoc.getElementsByTagName('item');
        episodes = Array.from(items).map(item => ({
            title: item.getElementsByTagName('title')[0].textContent,
            description: item.getElementsByTagName('description')[0].textContent,
            audioUrl: item.getElementsByTagName('enclosure')[0].getAttribute('url')
        }));

        displayEpisodes();

        if (episodes.length > 0) {
            playEpisode(0, new Event('click'));
            document.getElementById('player').style.display = 'block';
        } else {
            document.getElementById('player').style.display = 'none';
            document.getElementById('episodes').innerHTML = '<p>No episodes found in this RSS feed.</p>';
        }

        // Update the input field with the loaded RSS URL
        document.getElementById('rss-url').value = rssUrl;
    } catch (error) {
        console.error('Error fetching or parsing RSS feed:', error);
        document.getElementById('episodes').innerHTML = '<p>Error fetching or parsing the RSS feed. Please check the URL and try again.</p>';
        document.getElementById('player').style.display = 'none';
        document.getElementById('pager').style.display = 'none';
    }
}

function loadPodcast() {
    const rssUrl = document.getElementById('rss-url').value;
    if (rssUrl) {
        fetchAndDisplayPodcast(rssUrl);
    } else {
        alert('Please enter a valid RSS feed URL');
    }
}

function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.addEventListener('DOMContentLoaded', () => {
    createFlyingObjects();
    createMountains();

    // Add scanner effect
    const scanner = document.createElement('div');
    scanner.className = 'scanner';
    document.body.appendChild(scanner);

    // Check for RSS URL in the URL parameter
    const urlRssParam = getURLParameter('rss');
    if (urlRssParam) {
        fetchAndDisplayPodcast(urlRssParam);
    }
});