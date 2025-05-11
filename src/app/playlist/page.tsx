'use client';

import { useEffect } from 'react';
import Head from 'next/head';
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
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Song4u - Playlist</title>
        <meta name="description" content="Song4u - listen to My Favorite Songs" />
        <meta name="keywords" content="Song4u, Music, Player, Web App, Playlist" />
        <meta name="author" content="DOT007" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:title" content="Favorite Playlist" />
        <meta property="og:description" content="Song4u - listen to My Favorite Songs" />
        <meta property="og:url" content="https://alosiousbenny.vercel.app/Playlist" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://files.catbox.moe/jkwu5t.jpg" />
        <meta name="twitter:image" content="https://files.catbox.moe/jkwu5t.jpg" />
        <link rel="icon" href="https://files.catbox.moe/4tr6ip.jpg" type="image/x-icon" />
        {/* It's generally better to load external CSS like Font Awesome via npm package if possible,
            or ensure it's truly necessary and a reliable CDN. For now, keeping as is. */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      
      <header>
        <i id="menuToggle" className="fa fa-bars"></i>
        <h1>Song<span>4u</span></h1>
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
        <p>&copy; {new Date().getFullYear()} <a href="https://alosious-benny.vercel.app">Alosious Benny</a></p>
      </footer>
    </>
  );
}

