// Development Hot Reload Client
// This script connects to the WebSocket server and handles live updates

(function() {
  // Only run in development mode
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return;
  }

  const socket = io('/dev-reload', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  let isConnected = false;

  socket.on('connect', () => {
    isConnected = true;
    console.log('🔥 Hot reload connected');
    
    // Remove any disconnection notices
    const notice = document.getElementById('dev-reload-notice');
    if (notice) {
      notice.remove();
    }
  });

  socket.on('disconnect', () => {
    isConnected = false;
    console.log('🔌 Hot reload disconnected');
    showDisconnectionNotice();
  });

  socket.on('connected', (data) => {
    console.log('✅ Dev reload server:', data.message);
  });

  socket.on('reload', (data) => {
    console.log('🔄 Reload event:', data);
    
    switch (data.type) {
      case 'full-reload':
        // Use Turbo instead of full page reload for smoother transitions
        if (window.Turbo) {
          console.log('🚀 Using Turbo visit instead of full reload');
          Turbo.visit(window.location.href, { action: 'replace' });
        } else {
          window.location.reload();
        }
        break;
        
      case 'turbo-reload':
        // Use Turbo to reload specific frame or entire page
        handleTurboReload(data);
        break;
        
      case 'style-reload':
        // Reload CSS without page refresh
        handleStyleReload(data);
        break;
        
      default:
        console.log('Unknown reload type:', data.type);
    }
  });

  socket.on('turbo-stream', (data) => {
    console.log('📨 Turbo Stream update received');
    
    // Apply Turbo Stream update
    if (window.Turbo) {
      const streamElement = new DOMParser().parseFromString(data.stream, 'text/html').body.firstChild;
      Turbo.renderStreamMessage(data.stream);
    }
  });

  function handleTurboReload(data) {
    if (!window.Turbo) {
      console.warn('Turbo not available, falling back to full reload');
      window.location.reload();
      return;
    }

    const frame = data.frame || '_top';
    
    if (frame === '_top') {
      // Reload the entire page through Turbo
      Turbo.visit(window.location.href, { action: 'replace' });
    } else {
      // Reload specific Turbo frame
      const frameElement = document.getElementById(frame);
      if (frameElement && frameElement.tagName === 'TURBO-FRAME') {
        console.log(`🔄 Reloading Turbo frame: ${frame}`);
        frameElement.reload();
      } else {
        console.warn(`Turbo frame not found: ${frame}, reloading page`);
        Turbo.visit(window.location.href, { action: 'replace' });
      }
    }
  }

  function handleStyleReload(data) {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const targetPath = data.path;
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(targetPath)) {
        // Force reload by adding timestamp
        const newHref = href.split('?')[0] + '?t=' + Date.now();
        link.setAttribute('href', newHref);
        console.log(`🎨 Reloaded stylesheet: ${targetPath}`);
      }
    });
  }

  function showDisconnectionNotice() {
    // Don't show notice if already exists
    if (document.getElementById('dev-reload-notice')) {
      return;
    }

    const notice = document.createElement('div');
    notice.id = 'dev-reload-notice';
    notice.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span>Hot reload disconnected. Waiting for reconnection...</span>
      </div>
    `;
    document.body.appendChild(notice);
  }

  // Listen for Turbo events to ensure compatibility
  document.addEventListener('turbo:load', () => {
    console.log('📄 Turbo page loaded');
  });

  document.addEventListener('turbo:frame-load', (event) => {
    console.log('🖼️ Turbo frame loaded:', event.target ? event.target.id : 'unknown');
  });

  // Expose reload functions globally for testing
  window.__devReload = {
    reload: () => handleTurboReload({ frame: '_top' }),
    reloadFrame: (frameId) => handleTurboReload({ frame: frameId }),
    reloadStyles: () => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          link.setAttribute('href', href.split('?')[0] + '?t=' + Date.now());
        }
      });
    },
    isConnected: () => isConnected,
    socket: socket,
  };

  console.log('🚀 Dev hot reload client initialized');
})();