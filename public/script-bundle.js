
import { playlist } from './audiodb.js';

const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const timeline = document.getElementById('timeline');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbnail = document.getElementById('thumbnail');
const songName = document.getElementById('songName');
const loading = document.getElementById('loading');
const songListContainer = document.getElementById('songList'); // Renamed to avoid conflict
const menuToggle = document.getElementById('menuToggle');

let currentTrack = Math.floor(Math.random() * playlist.length);

function loadTrack(index) {
    if (!audio || !thumbnail || !songName || !loading) return;
    loading.style.display = 'flex';
    currentTrack = index;
    audio.src = playlist[currentTrack].src;
    thumbnail.src = playlist[currentTrack].thumb;
    songName.textContent = playlist[currentTrack].name;
    audio.load();
    audio.addEventListener('canplaythrough', () => {
        if (loading) loading.style.display = 'none';
        updatePlayingIndicator(); 
    }, { once: true });
}

if (playBtn && pauseBtn && audio) {
    playBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';

    playBtn.addEventListener('click', () => {
      audio.play().catch(error => {
        console.error('Autoplay failed:', error);
      });
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-block';
    });

    pauseBtn.addEventListener('click', () => {
      audio.pause();
      pauseBtn.style.display = 'none';
      playBtn.style.display = 'inline-block';
    });

    audio.addEventListener('ended', () => {
      currentTrack = (currentTrack + 1) % playlist.length; 
      loadTrack(currentTrack); 
      audio.play().catch(error => {
        console.error('Autoplay failed on ended:', error);
      });
       if (playBtn && pauseBtn) {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
      }
    });
}


if (audio && timeline && durationDisplay && currentTimeDisplay) {
    audio.addEventListener('loadedmetadata', () => {
      timeline.max = Math.floor(audio.duration);
      durationDisplay.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      timeline.value = Math.floor(audio.currentTime);
      currentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    timeline.addEventListener('input', () => {
      audio.currentTime = timeline.value;
    });
}

if (nextBtn && audio && playBtn && pauseBtn) {
    nextBtn.addEventListener('click', () => {
      currentTrack = (currentTrack + 1) % playlist.length; 
      loadTrack(currentTrack); 
      audio.play().then(() => {
        if (playBtn && pauseBtn) {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
        }
      }).catch(error => {
        console.error('Autoplay failed on next:', error);
      });
    });
}

if (prevBtn && audio && playBtn && pauseBtn) {
    prevBtn.addEventListener('click', () => {
      currentTrack = (currentTrack - 1 + playlist.length) % playlist.length; 
      loadTrack(currentTrack); 
      audio.play().then(() => {
        if (playBtn && pauseBtn) {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
        }
      }).catch(error => {
        console.error('Autoplay failed on prev:', error);
      });
    });
}


function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function updatePlayingIndicator() {
    const songListItems = document.querySelectorAll('#songListItems li');
    songListItems.forEach((li) => {
        li.classList.remove('playing');
        const existingWaveform = li.querySelector('.waveform');
        if (existingWaveform) {
            existingWaveform.remove();
        }
    });

    const currentItem = document.querySelector(`#songListItems li[data-index="${currentTrack}"]`);
    if (currentItem) {
        currentItem.classList.add('playing');
        const waveform = document.createElement('div');
        waveform.classList.add('waveform');
        for (let i = 0; i < 3; i++) {
            const bar = document.createElement('span');
            waveform.appendChild(bar);
        }
        currentItem.appendChild(waveform);
    }
}

loadTrack(currentTrack);

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && ['u', 's', 'c', 'p'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
  if (e.key === 'F12') {
    e.preventDefault();
  }
});


function populateSongList() {
    if (!songListContainer) return;

    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search songs...';
    searchBox.id = 'searchSongs';

    const ul = document.createElement('ul');
    ul.id = 'songListItems';

    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.name;
        li.dataset.index = index.toString();
        li.addEventListener('click', () => {
            loadTrack(index);
            if (songListContainer) songListContainer.classList.add('hidden');
            if (audio && playBtn && pauseBtn) {
                audio.play().then(() => {
                    playBtn.style.display = 'none';
                    pauseBtn.style.display = 'inline-block';
                }).catch(error => {
                    console.error('Autoplay failed on list click:', error);
                });
            }
        });
        ul.appendChild(li);
    });

    songListContainer.innerHTML = '<h3 style="color: #00ffd5;">All Songs</h3>';
    songListContainer.appendChild(searchBox);
    songListContainer.appendChild(ul);

    searchBox.addEventListener('input', () => {
        const filter = searchBox.value.toLowerCase();
        document.querySelectorAll('#songListItems li').forEach(li => {
            const trackName = li.textContent || "";
            li.style.display = trackName.toLowerCase().includes(filter) ? 'block' : 'none';
        });
    });
}

if (menuToggle && songListContainer) {
    menuToggle.addEventListener('click', () => {
        songListContainer.classList.toggle('hidden');
    });
}

populateSongList();
updatePlayingIndicator();

document.addEventListener('click', (event) => {
  if (!songListContainer || !menuToggle) return; 

  const targetElement = event.target;
  const isClickInsideList = songListContainer.contains(targetElement);
  const isClickOnToggle = menuToggle.contains(targetElement);

  if (!isClickInsideList && !isClickOnToggle) {
      songListContainer.classList.add('hidden');
  }
});
