import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Hls from 'hls.js';

export const VideoPlayer = ({ src, poster, autoplay }) => {
  const containerRef = useRef(null);

  const getSources = (originalSrc) => {
    if (!originalSrc) return [];
    
    // If it's a Cloudinary URL, we can request different resolutions on the fly
    if (originalSrc.includes('cloudinary.com/') && originalSrc.includes('/upload/')) {
      const parts = originalSrc.split('/upload/');
      const base = parts[0] + '/upload';
      const rest = parts[1];
      
      return [
        { src: `${base}/q_auto,h_1080/${rest}`, size: 1080 },
        { src: `${base}/q_auto,h_720/${rest}`, size: 720 },
        { src: `${base}/q_auto,h_480/${rest}`, size: 480 },
        { src: `${base}/q_auto,h_360/${rest}`, size: 360 }
      ];
    }
    
    // Fallback for non-Cloudinary static MP4s
    return [
      { src: originalSrc, size: 1080 },
      { src: originalSrc, size: 720 },
      { src: originalSrc, size: 480 }
    ];
  };

  useEffect(() => {
    if (!containerRef.current || !src) return;
    
    containerRef.current.innerHTML = '';
    const video = document.createElement('video');
    video.playsInline = true;
    if (poster) video.poster = poster;
    video.className = 'w-full h-full object-contain';
    containerRef.current.appendChild(video);

    let plyr;
    let hls;

    const defaultOptions = {
      controls: [
        'play-large', 
        'play', 
        'progress', 
        'current-time', 
        'mute', 
        'volume', 
        'settings', 
        'pip', 
        'fullscreen'
      ],
      settings: ['quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      autoplay: autoplay,
      ratio: '16:9'
    };

    if (typeof src === 'string' && src.endsWith('.m3u8') && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        // Parse the available resolutions from the m3u8 file
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0); // 0 means Auto

        defaultOptions.quality = {
          default: 0,
          options: availableQualities,
          forced: true,
          onChange: (newQuality) => {
            if (newQuality === 0) {
              hls.currentLevel = -1; // -1 means Auto in hls.js
            } else {
              hls.levels.forEach((level, levelIndex) => {
                if (level.height === newQuality) {
                  hls.currentLevel = levelIndex;
                }
              });
            }
          }
        };

        // Initialize Plyr only after HLS has parsed the manifest
        plyr = new Plyr(video, defaultOptions);
        
        if (autoplay) {
          video.play().catch(e => console.log('Autoplay blocked:', e));
        }
      });
    } else {
      // Native support (like Safari) or standard MP4
      const sources = getSources(src);
      
      // Initialize Plyr but pass sources explicitly so quality menu appears
      plyr = new Plyr(video, defaultOptions);
      
      plyr.source = {
        type: 'video',
        title: 'Video',
        sources: sources,
        poster: poster || ''
      };
      
      if (autoplay) {
        plyr.once('ready', () => {
          plyr.play().catch(e => console.log('Autoplay blocked:', e));
        });
      }
    }

    return () => {
      if (plyr) plyr.destroy();
      if (hls) hls.destroy();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [src, autoplay, poster]);

  return (
    <div className="w-full h-full relative" style={{ '--plyr-color-main': '#f97316' }}>
      <div ref={containerRef} className="w-full h-full relative" />
    </div>
  );
};

export default VideoPlayer;
