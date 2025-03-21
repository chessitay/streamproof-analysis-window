(function() {
  let analysisWindow = null;

  const windowFeatures = 'width=400,height=600,resizable=yes,scrollbars=yes';
  
  let overlayMode = false;
  
  // CSS styles for the overlay mode
  const overlayStyles = `
    .bettermint-analysis-window {
      position: fixed;
      z-index: 9999;
      width: 350px;
      background-color: #292A2D;
      color: #e0e0e0;
      font-family: "Exo 2", Arial, sans-serif;
      box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
      border-radius: 8px;
      top: 100px;
      right: 20px;
      resize: both;
      overflow: auto;
      max-height: 80vh;
      transition: all 0.3s ease;
    }

    body.ultra-dark .bettermint-analysis-window {
      background-color: #000;
    }

    .bettermint-analysis-header {
      background-color: #5d3fd3;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
      border-radius: 8px 8px 0 0;
    }

    .bettermint-analysis-title {
      font-weight: bold;
      font-size: 14px;
      color: white;
    }

    .bettermint-analysis-controls {
      display: flex;
    }

    .bettermint-analysis-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
      margin-left: 10px;
      padding: 0;
    }

    .bettermint-analysis-content {
      padding: 10px 15px;
      overflow-y: auto;
      max-height: calc(80vh - 40px);
    }

    .bettermint-analysis-refresh {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bettermint-lines-container {
      margin-top: 10px;
    }

    .bettermint-line {
      margin-bottom: 15px;
      padding: 8px;
      border-radius: 6px;
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bettermint-line:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bettermint-line-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .bettermint-line-number {
      font-weight: bold;
      color: #5d3fd3;
    }

    .bettermint-line-eval {
      font-weight: bold;
    }

    .bettermint-line-eval.positive {
      color: #5ad759;
    }

    .bettermint-line-eval.negative {
      color: #ff5d5d;
    }

    .bettermint-line-eval.mate {
      color: #ffcc00;
    }

    .bettermint-line-depth {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }

    .bettermint-line-moves {
      font-family: monospace;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .bettermint-auto-update {
      margin-right: 10px;
      display: flex;
      align-items: center;
    }

    .bettermint-auto-update input {
      margin-right: 5px;
    }

    .bettermint-refresh-button {
      outline: none;
      cursor: pointer;
      font-weight: 500;
      border-radius: 4px;
      color: #fff;
      background: #5d3fd3;
      line-height: 1.15;
      font-size: 12px;
      padding: 5px 10px;
      border: none;
      text-align: center;
      box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
    }

    .bettermint-refresh-button:hover {
      background: #6e52e4;
    }

    .bettermint-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }

    .bettermint-stat-box {
      background-color: rgba(255, 255, 255, 0.08);
      padding: 10px;
      border-radius: 6px;
      text-align: center;
    }

    .bettermint-stat-value {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .bettermint-stat-label {
      font-size: 11px;
      color: #aaa;
      text-transform: uppercase;
    }

    .bettermint-best-move {
      color: #5d3fd3;
      font-weight: bold;
    }

    .bettermint-mode-switch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
    }

    .bettermint-mode-switch label {
      margin-right: 10px;
      font-size: 12px;
    }

    .bettermint-switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 20px;
    }

    .bettermint-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .bettermint-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #555;
      transition: .4s;
      border-radius: 20px;
    }

    .bettermint-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .bettermint-slider {
      background-color: #5d3fd3;
    }

    input:checked + .bettermint-slider:before {
      transform: translateX(26px);
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background: #5d3fd3;
      border-radius: 5px;
    }
  `;

  // Inject styles into the page for overlay mode
  function injectOverlayStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = overlayStyles;
    document.head.appendChild(styleElement);
  }

  // Load user preferences
  function loadPreferences() {
    try {
      const savedMode = localStorage.getItem('bettermint-analysis-mode');
      if (savedMode !== null) {
        overlayMode = savedMode === 'overlay';
      }
    } catch (e) {
      console.error('Could not access localStorage for preferences:', e);
    }
    return overlayMode;
  }

  function savePreferences() {
    try {
      localStorage.setItem('bettermint-analysis-mode', overlayMode ? 'overlay' : 'streamproof');
    } catch (e) {
      console.error('Could not save preferences:', e);
    }

  }
  function toggleMode() {
    closeAnalysisWindow();
    overlayMode = !overlayMode;
    savePreferences();
    openAnalysisWindow();
  }

  function closeAnalysisWindow() {
    if (overlayMode) {
      const overlayWindow = document.getElementById('bettermint-analysis-window');
      if (overlayWindow) {
        overlayWindow.remove();
      }
    } else if (analysisWindow && !analysisWindow.closed) {
      analysisWindow.close();
      analysisWindow = null;
    }
  }

  // Create the overlay window embedded in the page
  function createOverlayWindow() {
    // Check if overlay window already exists
    let overlayWindow = document.getElementById('bettermint-analysis-window');
    if (overlayWindow) {
      overlayWindow.style.display = 'block';
      return overlayWindow;
    }
    
    // Create overlay window
    overlayWindow = document.createElement('div');
    overlayWindow.className = 'bettermint-analysis-window';
    overlayWindow.id = 'bettermint-analysis-window';
    overlayWindow.innerHTML = `
      <div class="bettermint-analysis-header">
        <div class="bettermint-analysis-title">BetterMint Analysis</div>
        <div class="bettermint-analysis-controls">
          <button class="bettermint-analysis-button" id="bettermint-pin-button" title="Pin/Unpin Window">📌</button>
          <button class="bettermint-analysis-button" id="bettermint-minimize-button" title="Minimize/Maximize">-</button>
          <button class="bettermint-analysis-button" id="bettermint-close-button" title="Close">×</button>
        </div>
      </div>
      <div class="bettermint-analysis-content">
        <div class="bettermint-stats">
          <div class="bettermint-stat-box">
            <div class="bettermint-stat-value" id="bettermint-depth">0</div>
            <div class="bettermint-stat-label">Depth</div>
          </div>
          <div class="bettermint-stat-box">
            <div class="bettermint-stat-value" id="bettermint-position-eval">0.00</div>
            <div class="bettermint-stat-label">Evaluation</div>
          </div>
          <div class="bettermint-stat-box">
            <div class="bettermint-stat-value" id="bettermint-best-move">--</div>
            <div class="bettermint-stat-label">Best Move</div>
          </div>
          <div class="bettermint-stat-box">
            <div class="bettermint-stat-value" id="bettermint-move-quality">--</div>
            <div class="bettermint-stat-label">Last Move</div>
          </div>
        </div>
        
        <div class="bettermint-analysis-refresh">
          <div class="bettermint-auto-update">
            <input type="checkbox" id="bettermint-auto-update-checkbox" checked>
            <label for="bettermint-auto-update-checkbox">Auto-update</label>
          </div>
          <button class="bettermint-refresh-button" id="bettermint-refresh-button">Refresh Analysis</button>
        </div>
        
        <div class="bettermint-mode-switch">
          <label>Mode: <span id="bettermint-mode-label">Overlay (Always on Top)</span></label>
          <label class="bettermint-switch">
            <input type="checkbox" id="bettermint-mode-toggle" ${overlayMode ? 'checked' : ''}>
            <span class="bettermint-slider"></span>
          </label>
        </div>
        
        <div class="bettermint-lines-container" id="bettermint-lines-container">
          <!-- Lines will be added here dynamically -->
        </div>
      </div>
    `;
    
    document.body.appendChild(overlayWindow);
    makeDraggable(overlayWindow);
    setupOverlayEventListeners(overlayWindow);
    updateOverlayAnalysis();
    
    return overlayWindow;
  }

  // Set up event listeners for the overlay window
  function setupOverlayEventListeners(overlayWindow) {
    const closeButton = document.getElementById('bettermint-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        overlayWindow.style.display = 'none';
      });
    }
    
    // Minimize/maximize button
    const minimizeButton = document.getElementById('bettermint-minimize-button');
    if (minimizeButton) {
      minimizeButton.addEventListener('click', () => {
        const content = overlayWindow.querySelector('.bettermint-analysis-content');
        if (content) {
          if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeButton.textContent = '-';
            overlayWindow.style.height = 'auto';
          } else {
            content.style.display = 'none';
            minimizeButton.textContent = '+';
            overlayWindow.style.height = 'auto';
          }
        }
      });
    }
    
    // Pin/unpin button
    const pinButton = document.getElementById('bettermint-pin-button');
    if (pinButton) {
      pinButton.addEventListener('click', () => {
        overlayWindow.classList.toggle('pinned');
        pinButton.style.color = overlayWindow.classList.contains('pinned') ? '#5ad759' : 'white';
      });
    }
    
    // Refresh button
    const refreshButton = document.getElementById('bettermint-refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', updateOverlayAnalysis);
    }
    
    // Mode toggle
    const modeToggle = document.getElementById('bettermint-mode-toggle');
    if (modeToggle) {
      modeToggle.addEventListener('change', () => {
        toggleMode();
      });
    }
  }

  // Make the overlay window draggable
  function makeDraggable(element) {
    const header = element.querySelector('.bettermint-analysis-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
      
      // Add these styles to prevent text selection while dragging
      element.style.userSelect = 'none';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      // Ensure window stays within viewport
      const maxX = window.innerWidth - element.offsetWidth;
      const maxY = window.innerHeight - element.offsetHeight;
      
      element.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      element.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.userSelect = '';
      document.body.style.userSelect = '';
    });
  }

  // Update the overlay analysis with current data
  function updateOverlayAnalysis() {
    const engine = window.BetterMintmaster?.engine;
    if (!engine) return;
    
    const linesContainer = document.getElementById('bettermint-lines-container');
    const depthElement = document.getElementById('bettermint-depth');
    const evalElement = document.getElementById('bettermint-position-eval');
    const bestMoveElement = document.getElementById('bettermint-best-move');
    const moveQualityElement = document.getElementById('bettermint-move-quality');
    
    // Get turn color
    let turnColor = 'w';
    if (window.BetterMintmaster?.game?.controller) {
      turnColor = BetterMintmaster.game.controller.getTurn() === 1 ? 'w' : 'b';
    }
    
    if (!linesContainer || !engine.topMoves || engine.topMoves.length === 0) return;
    
    // Clear previous content
    linesContainer.innerHTML = '';
    
    // Update stats
    if (depthElement) depthElement.textContent = engine.depth || '0';
    
    // Get the best move's evaluation for the position eval stat
    const bestMove = engine.topMoves[0];
    if (bestMove && evalElement) {
      let evalText, evalClass;
      
      if (bestMove.mate !== null) {
        const mateIn = Math.abs(bestMove.mate);
        evalText = bestMove.mate > 0 ? `M${mateIn}` : `-M${mateIn}`;
        evalClass = 'mate';
      } else {
        const cpEval = bestMove.cp / 100;
        evalText = cpEval > 0 ? `+${cpEval.toFixed(2)}` : cpEval.toFixed(2);
        evalClass = cpEval >= 0 ? 'positive' : 'negative';
      }
      
      evalElement.textContent = evalText;
      evalElement.className = `bettermint-stat-value ${evalClass}`;
    }
    
    // Update best move indicator
    if (bestMoveElement && bestMove) {
      bestMoveElement.textContent = `${formatSingleMove(bestMove.move)}`;
    }
    
    // Update move quality if provided
    if (moveQualityElement && engine.lastMoveScore) {
      moveQualityElement.textContent = engine.lastMoveScore;
      
      // Set color based on move quality
      const qualityColors = {
        'Brilliant': '#1baca6',
        'GreatFind': '#5c8bb0',
        'BestMove': '#9eba5a',
        'Excellent': '#96bc4b',
        'Good': '#96af8b',
        'Book': '#a88865',
        'Inaccuracy': '#f0c15c',
        'Mistake': '#e6912c',
        'Blunder': '#b33430',
        'MissedWin': '#dbac16'
      };
      
      if (qualityColors[engine.lastMoveScore]) {
        moveQualityElement.style.color = qualityColors[engine.lastMoveScore];
      }
    }
    
    // Add each line to the container
    engine.topMoves.forEach((move, index) => {
      const lineElement = document.createElement('div');
      lineElement.className = 'bettermint-line';
      
      let evalText, evalClass;
      
      if (move.mate !== null) {
        const mateIn = Math.abs(move.mate);
        evalText = move.mate > 0 ? `Mate in ${mateIn}` : `Mate in -${mateIn}`;
        evalClass = 'mate';
      } else {
        const cpEval = move.cp / 100;
        evalText = cpEval > 0 ? `+${cpEval.toFixed(2)}` : cpEval.toFixed(2);
        evalClass = cpEval >= 0 ? 'positive' : 'negative';
      }
      
      const formattedMoves = formatMoves(move.line, turnColor);
      
      lineElement.innerHTML = `
        <div class="bettermint-line-header">
          <div class="bettermint-line-number">Line ${index + 1}</div>
          <div class="bettermint-line-eval ${evalClass}">${evalText}</div>
        </div>
        <div class="bettermint-line-depth">Depth: ${move.depth}</div>
        <div class="bettermint-line-moves">${formattedMoves}</div>
      `;
      
      linesContainer.appendChild(lineElement);
    });
  }

  // Function to open a separate analysis window (streamproof mode)
  function openPopupWindow() {
    // Close existing window if open
    if (analysisWindow && !analysisWindow.closed) {
      analysisWindow.focus();
      return;
    }
    
    // Create a new popup window
    analysisWindow = window.open('', 'BetterMintAnalysis', windowFeatures);
    
    // Check if popup was blocked
    if (!analysisWindow) {
      alert('Please allow popups for BetterMint Analysis Window to work.');
      return;
    }
  
    const doc = analysisWindow.document;
    
    doc.title = 'BetterMint Analysis';
    
    const favicon = doc.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">♞</text></svg>';
    doc.head.appendChild(favicon);
    
    const styles = doc.createElement('style');
    styles.textContent = `
      body {
        font-family: "Exo 2", Arial, sans-serif;
        background-color: #292A2D;
        color: #e0e0e0;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      
      .dark-theme body {
        background-color: #292A2D;
      }
      
      .ultra-dark-theme body {
        background-color: #000;
      }
      
      .header {
        background-color: #5d3fd3;
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        font-weight: bold;
      }
      
      .content {
        padding: 15px;
      }
      
      .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .stat-box {
        background-color: rgba(255, 255, 255, 0.08);
        padding: 10px;
        border-radius: 6px;
        text-align: center;
      }
      
      .stat-value {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 11px;
        color: #aaa;
        text-transform: uppercase;
      }
      
      .refresh {
        margin-top: 10px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .auto-update {
        margin-right: 10px;
        display: flex;
        align-items: center;
      }
      
      .auto-update input {
        margin-right: 5px;
      }
      
      .refresh-button {
        outline: none;
        cursor: pointer;
        font-weight: 500;
        border-radius: 4px;
        color: #fff;
        background: #5d3fd3;
        line-height: 1.15;
        font-size: 12px;
        padding: 5px 10px;
        border: none;
        text-align: center;
        box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
      }
      
      .refresh-button:hover {
        background: #6e52e4;
      }
      
      .line {
        margin-bottom: 15px;
        padding: 8px;
        border-radius: 6px;
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .line:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .line-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .line-number {
        font-weight: bold;
        color: #5d3fd3;
      }
      
      .line-eval {
        font-weight: bold;
      }
      
      .line-eval.positive {
        color: #5ad759;
      }
      
      .line-eval.negative {
        color: #ff5d5d;
      }
      
      .line-eval.mate {
        color: #ffcc00;
      }
      
      .line-depth {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
      
      .line-moves {
        font-family: monospace;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .mode-switch {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        margin-bottom: 15px;
        padding: 8px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
      }
      
      .mode-switch label {
        margin-right: 10px;
        font-size: 12px;
      }
      
      .switch {
        position: relative;
        display: inline-block;
        width: 46px;
        height: 20px;
      }
      
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #555;
        transition: .4s;
        border-radius: 20px;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .slider {
        background-color: #5d3fd3;
      }
      
      input:checked + .slider:before {
        transform: translateX(26px);
      }
      
      .connection-status {
        display: flex;
        align-items: center;
        font-size: 12px;
        margin-top: 10px;
        padding: 5px;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
      }
      
      .status-connected {
        background-color: #5ad759;
      }
      
      .status-disconnected {
        background-color: #ff5d5d;
      }
      
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #5d3fd3;
        border-radius: 5px;
      }
    `;
    
    doc.head.appendChild(styles);
    
    doc.body.innerHTML = `
      <div class="header">
        <div class="title">BetterMint Analysis</div>
      </div>
      <div class="content">
        <div class="stats">
          <div class="stat-box">
            <div class="stat-value" id="depth">0</div>
            <div class="stat-label">Depth</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" id="position-eval">0.00</div>
            <div class="stat-label">Evaluation</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" id="best-move">--</div>
            <div class="stat-label">Best Move</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" id="move-quality">--</div>
            <div class="stat-label">Last Move</div>
          </div>
        </div>
        
        <div class="refresh">
          <div class="auto-update">
            <input type="checkbox" id="auto-update-checkbox" checked>
            <label for="auto-update-checkbox">Auto-update</label>
          </div>
          <button class="refresh-button" id="refresh-button">Refresh Analysis</button>
        </div>
        
        <div class="mode-switch">
          <label>Mode: <span id="mode-label">Streamproof (Separate Window)</span></label>
          <label class="switch">
            <input type="checkbox" id="mode-toggle" ${overlayMode ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="lines-container" id="lines-container">
          <!-- Lines will be added here dynamically -->
        </div>
        
        <div class="connection-status">
          <div class="status-indicator status-connected" id="status-indicator"></div>
          <span id="status-text">Connected to BetterMint</span>
        </div>
      </div>
    `;
    
    doc.getElementById('refresh-button').addEventListener('click', () => {
      window.focus();
      requestAnalysisUpdate();
    });
    
    // Add event listener for mode toggle
    doc.getElementById('mode-toggle').addEventListener('change', () => {
      toggleMode();
    });
    
    // Add event listener for window close
    analysisWindow.addEventListener('beforeunload', () => {
    });
    
    analysisWindow.onload = () => {
      requestAnalysisUpdate();
    };
    
    analysisWindow.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      
      const data = event.data;
      
      if (data.type === 'analysisUpdate') {
        updateAnalysisInPopup(data);
      }
    });
  }
  
  function requestAnalysisUpdate() {
    if (!analysisWindow || analysisWindow.closed) return;
    
    // Get data from BetterMint
    const engine = window.BetterMintmaster?.engine;
    if (!engine) return;
    
    // Get turn color (w for white, b for black)
    let turnColor = 'w';
    if (window.BetterMintmaster?.game?.controller) {
      turnColor = BetterMintmaster.game.controller.getTurn() === 1 ? 'w' : 'b';
    }
    
    // Prepare data to send to popup
    const data = {
      type: 'analysisUpdate',
      topMoves: engine.topMoves,
      depth: engine.depth,
      lastMoveQuality: engine.lastMoveScore,
      turnColor: turnColor,
      fen: BetterMintmaster.game.controller.getFEN()
    };
    
    // Send data to popup
    if (analysisWindow && !analysisWindow.closed) {
      try {
        analysisWindow.postMessage(data, window.location.origin);
      } catch (e) {
        console.error('Error sending data to analysis window:', e);
      }
    }
  }
  
  // Update the analysis in the popup window with current data
  function updateAnalysisInPopup(data) {
    if (!analysisWindow || analysisWindow.closed) return;
    
    try {
      const doc = analysisWindow.document;
      const linesContainer = doc.getElementById('lines-container');
      const depthElement = doc.getElementById('depth');
      const evalElement = doc.getElementById('position-eval');
      const bestMoveElement = doc.getElementById('best-move');
      const moveQualityElement = doc.getElementById('move-quality');
      
      // Show connection status
      const statusIndicator = doc.getElementById('status-indicator');
      const statusText = doc.getElementById('status-text');
      
      if (statusIndicator && statusText) {
        statusIndicator.className = 'status-indicator status-connected';
        statusText.textContent = 'Connected to BetterMint';
      }
      
      if (!linesContainer || !data.topMoves || data.topMoves.length === 0) return;
      
      // Clear previous content
      linesContainer.innerHTML = '';
      
      // Update stats
      if (depthElement) depthElement.textContent = data.depth || '0';
      
      // Get the best move's evaluation for the position eval stat
      const bestMove = data.topMoves[0];
      if (bestMove && evalElement) {
        let evalText, evalClass;
        
        if (bestMove.mate !== null) {
          const mateIn = Math.abs(bestMove.mate);
          evalText = bestMove.mate > 0 ? `M${mateIn}` : `-M${mateIn}`;
          evalClass = 'mate';
        } else {
          const cpEval = bestMove.cp / 100;
          evalText = cpEval > 0 ? `+${cpEval.toFixed(2)}` : cpEval.toFixed(2);
          evalClass = cpEval >= 0 ? 'positive' : 'negative';
        }
        
        evalElement.textContent = evalText;
        evalElement.className = `stat-value ${evalClass}`;
      }
      
      // Update best move indicator
      if (bestMoveElement && bestMove) {
        bestMoveElement.textContent = `${formatSingleMove(bestMove.move)}`;
      }
      
      // Update move quality if provided
      if (moveQualityElement && data.lastMoveQuality) {
        moveQualityElement.textContent = data.lastMoveQuality;
        
        // Set color based on move quality
        const qualityColors = {
          'Brilliant': '#1baca6',
          'GreatFind': '#5c8bb0',
          'BestMove': '#9eba5a',
          'Excellent': '#96bc4b',
          'Good': '#96af8b',
          'Book': '#a88865',
          'Inaccuracy': '#f0c15c',
          'Mistake': '#e6912c',
          'Blunder': '#b33430',
          'MissedWin': '#dbac16'
        };
        
        if (qualityColors[data.lastMoveQuality]) {
          moveQualityElement.style.color = qualityColors[data.lastMoveQuality];
        }
      }
      
      // Add each line to the container
      data.topMoves.forEach((move, index) => {
        const lineElement = doc.createElement('div');
        lineElement.className = 'line';
        
        let evalText, evalClass;
        
        if (move.mate !== null) {
          const mateIn = Math.abs(move.mate);
          evalText = move.mate > 0 ? `Mate in ${mateIn}` : `Mate in -${mateIn}`;
          evalClass = 'mate';
        } else {
          const cpEval = move.cp / 100;
          evalText = cpEval > 0 ? `+${cpEval.toFixed(2)}` : cpEval.toFixed(2);
          evalClass = cpEval >= 0 ? 'positive' : 'negative';
        }
        
        const formattedMoves = formatMoves(move.line, data.turnColor);
        
        lineElement.innerHTML = `
          <div class="line-header">
            <div class="line-number">Line ${index + 1}</div>
            <div class="line-eval ${evalClass}">${evalText}</div>
          </div>
          <div class="line-depth">Depth: ${move.depth}</div>
          <div class="line-moves">${formattedMoves}</div>
        `;
        
        linesContainer.appendChild(lineElement);
      });
    } catch (e) {
      console.error('Error updating analysis window:', e);
    }
  }
  
  // Format chess moves for display
  function formatMoves(line, turnColor = 'w') {
    if (typeof line === 'string') {
      line = line.split(' ');
    }
    
    let formattedMoves = '';
    let moveNumber = 1;
    
    // Determine starting move number and color
    const isWhiteToMove = turnColor === 'w';
    
    for (let i = 0; i < line.length; i++) {
      // Add move number for white's moves or at the start if black to move
      if ((isWhiteToMove && i % 2 === 0) || (!isWhiteToMove && i === 0)) {
        formattedMoves += moveNumber + '. ';
        
        // Only increment after black's move or if black is to move initially and this is the first move
        if (!isWhiteToMove && i === 0) {
          formattedMoves += '... ';
        }
      }
      
      // Add the move itself
      formattedMoves += formatSingleMove(line[i]) + ' ';
      
      // Increment move number after black's move
      if ((isWhiteToMove && i % 2 === 1) || (!isWhiteToMove && i % 2 === 0 && i > 0)) {
        moveNumber++;
      }
    }
    
    return formattedMoves.trim();
  }

  // Convert UCI move format to algebraic notation
  function formatSingleMove(uciMove) {
    if (!uciMove) return '';
    
    // Check for promotion
    if (uciMove.length === 5) {
      const promotionPiece = uciMove.charAt(4).toUpperCase();
      return uciMove.substring(0, 2) + '-' + uciMove.substring(2, 4) + '=' + promotionPiece;
    }
    
    return uciMove.substring(0, 2) + '-' + uciMove.substring(2, 4);
  }

  // Open the analysis window in the appropriate mode
  function openAnalysisWindow() {
    // First, load user preferences
    loadPreferences();
    
    // Open in the appropriate mode
    if (overlayMode) {
      injectOverlayStyles();
      createOverlayWindow();
    } else {
      openPopupWindow();
    }
  }

  function createToggleButton() {
    const button = document.createElement('button');
    button.innerHTML = '📊 Analysis';
    button.id = 'bettermint-analysis-toggle';
    button.className = 'button';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9998';
    button.style.background = '#5d3fd3';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '8px 16px';
    button.style.fontFamily = '"Exo 2", Arial, sans-serif';
    button.style.boxShadow = '0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%)';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', openAnalysisWindow);
    
    document.body.appendChild(button);
    return button;
  }

  // Add a keystroke to toggle the analysis window (Alt+A)
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
      if (event.altKey && event.key === 'a') {
        openAnalysisWindow();
      }
    });
  }

  // Hook into BetterMint's StockfishEngine.onTopMoves method to get data
  function hookIntoStockfishEngine() {
    const checkInterval = setInterval(() => {
      if (window.StockfishEngine && StockfishEngine.prototype.onTopMoves) {
        clearInterval(checkInterval);
        
        const originalOnTopMoves = StockfishEngine.prototype.onTopMoves;
        
        // Override the method to add our functionality
        StockfishEngine.prototype.onTopMoves = function(move, isBestMove) {
          originalOnTopMoves.call(this, move, isBestMove);
          
          if (overlayMode) {
            const overlayWindow = document.getElementById('bettermint-analysis-window');
            const autoUpdateCheckbox = document.getElementById('bettermint-auto-update-checkbox');
            
            if (overlayWindow && 
                overlayWindow.style.display !== 'none' && 
                (!autoUpdateCheckbox || autoUpdateCheckbox.checked)) {
              updateOverlayAnalysis();
            }
          } 
          else if (analysisWindow && !analysisWindow.closed) {
            try {
              const autoUpdateCheckbox = analysisWindow.document.getElementById('auto-update-checkbox');
              if (!autoUpdateCheckbox || autoUpdateCheckbox.checked) {
                requestAnalysisUpdate();
              }
            } catch (e) {
            }
          }
        };
      }
    }, 1000);
  }

  function initialize() {
    window.addEventListener("BetterMintSendOptions", function (evt) {
      if (evt.detail && evt.detail.data && evt.detail.data["option-show-analysis-window"] !== false) {
        loadPreferences();
        
        setupKeyboardShortcuts();
        
        const checkInterval = setInterval(() => {
          if (window.BetterMintmaster) {
            clearInterval(checkInterval);
            
            if (!document.getElementById('bettermint-analysis-toggle')) {
              createToggleButton();
            }
            
            hookIntoStockfishEngine();
          }
        }, 1000);
      }
    });
    
    window.dispatchEvent(
      new CustomEvent("BetterMintGetOptions", { 
        detail: { id: "analysis-window-init" } 
      })
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
