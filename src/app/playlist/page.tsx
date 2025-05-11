
'use client';

import { useEffect } from 'react';
import './style.css'; // Styles specific to this page

export default function PlaylistPage() {
  useEffect(() => {
    // Check if script is already added to prevent duplicates during HMR or remounts
    if (!document.querySelector('script[src="/script-bundle.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/script-bundle.js'; // Assumes script-bundle.js is in /public
      script.async = true;
      document.body.appendChild(script);

      // Optional: cleanup script on component unmount
      return () => {
        const existingScript = document.querySelector('script[src="/script-bundle.js"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      };
    }
  }, []);

  return (
    <>
      {/* Meta tags and title are better handled by generateMetadata in layout or server components,
          or by directly modifying document.title if needed in a client component for dynamic titles.
          For now, we rely on the global layout for main meta tags and title.
          Font Awesome is now loaded globally from layout.tsx.
      */}
      
      <header>
        <i id="menuToggle" className="fa fa-bars"></i>
        <h1>Play<span>list</span></h1>
      </header>

      <div id="songList" className="song-list hidden"></div>

      <div className="player">
        <div className="loading" id="loading">
          <div className="spinner"></div>
        </div>
        <h2>Now Playing</h2>
        <img id="thumbnail" src={undefined} alt="Thumbnail" className="thumbnail" data-ai-hint="music album art" />
        <p id="songName"></p>

        <div className="controls">
          <i id="prevBtn" className="fa-solid fa-backward-step"></i>
          <i id="playBtn" className="fa-solid fa-play"></i>
          <i id="pauseBtn" className="fa-solid fa-pause" style={{ display: 'none' }}></i>
          <i id="nextBtn" className="fa-solid fa-forward-step"></i>
        </div>

        <div className="timeline-container">
          <input type="range" id="timeline" className="timeline" defaultValue="0" min="0" step="1" />
          <div className="time-display">
            <span id="currentTime">0:00</span>
            <span id="duration">0:00</span>
          </div>
        </div>

        <audio id="audio"></audio>
      </div>

      <footer>
        <p>&copy; {new Date().getFullYear()} <a href="https://alosiousbenny.vercel.app">Alosious Benny</a></p>
      </footer>
    </>
  );
}
