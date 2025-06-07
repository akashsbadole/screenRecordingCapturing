class StampLibrary {
  constructor() {
    this.stamps = {
      arrows: [
        { name: 'Arrow Right', emoji: '➡️', svg: this.createArrowSVG('right') },
        { name: 'Arrow Left', emoji: '⬅️', svg: this.createArrowSVG('left') },
        { name: 'Arrow Up', emoji: '⬆️', svg: this.createArrowSVG('up') },
        { name: 'Arrow Down', emoji: '⬇️', svg: this.createArrowSVG('down') },
        { name: 'Curved Arrow', emoji: '↩️', svg: this.createCurvedArrowSVG() }
      ],
      shapes: [
        { name: 'Circle', emoji: '⭕', svg: this.createCircleSVG() },
        { name: 'Square', emoji: '⬜', svg: this.createSquareSVG() },
        { name: 'Triangle', emoji: '🔺', svg: this.createTriangleSVG() },
        { name: 'Star', emoji: '⭐', svg: this.createStarSVG() },
        { name: 'Heart', emoji: '❤️', svg: this.createHeartSVG() }
      ],
      annotations: [
        { name: 'Checkmark', emoji: '✅', svg: this.createCheckmarkSVG() },
        { name: 'Cross', emoji: '❌', svg: this.createCrossSVG() },
        { name: 'Question', emoji: '❓', svg: this.createQuestionSVG() },
        { name: 'Exclamation', emoji: '❗', svg: this.createExclamationSVG() },
        { name: 'Info', emoji: 'ℹ️', svg: this.createInfoSVG() }
      ],
      numbers: [
        { name: '1', emoji: '1️⃣', svg: this.createNumberSVG('1') },
        { name: '2', emoji: '2️⃣', svg: this.createNumberSVG('2') },
        { name: '3', emoji: '3️⃣', svg: this.createNumberSVG('3') },
        { name: '4', emoji: '4️⃣', svg: this.createNumberSVG('4') },
        { name: '5', emoji: '5️⃣', svg: this.createNumberSVG('5') }
      ],
      callouts: [
        { name: 'Speech Bubble', emoji: '💬', svg: this.createSpeechBubbleSVG() },
        { name: 'Thought Bubble', emoji: '💭', svg: this.createThoughtBubbleSVG() },
        { name: 'Callout Box', emoji: '📢', svg: this.createCalloutBoxSVG() },
        { name: 'Warning', emoji: '⚠️', svg: this.createWarningSVG() },
        { name: 'Important', emoji: '🔥', svg: this.createImportantSVG() }
      ]
    };
    
    this.customStamps = [];
    this.init();
  }

  init() {
    this.loadCustomStamps();
  }

  async loadCustomStamps() {
    try {
      const result = await chrome.storage.local.get(['customStamps']);
      this.customStamps = result.customStamps || [];
    } catch (error) {
      console.error('Error loading custom stamps:', error);
    }
  }

  async saveCustomStamps() {
    try {
      await chrome.storage.local.set({ customStamps: this.customStamps });
    } catch (error) {
      console.error('Error saving custom stamps:', error);
    }
  }

  // SVG creation methods
  createArrowSVG(direction) {
    const paths = {
      right: 'M5 12h14m-7-7l7 7-7 7',
      left: 'M19 12H5m7-7l-7 7 7 7',
      up: 'M12 19V5m-7 7l7-7 7 7',
      down: 'M12 5v14m7-7l-7 7-7-7'
    };
    
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="${paths[direction]}"/>
    </svg>`;
  }

  createCurvedArrowSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 14l-5-5 5-5"/>
      <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
    </svg>`;
  }

  createCircleSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>`;
  }

  createSquareSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>`;
  }

  createTriangleSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2l10 18H2L12 2z"/>
    </svg>`;
  }

  createStarSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`;
  }

  createHeartSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;
  }

  createCheckmarkSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20,6 9,17 4,12"/>
    </svg>`;
  }

  createCrossSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`;
  }

  createQuestionSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <point cx="12" cy="17"/>
    </svg>`;
  }

  createExclamationSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <point cx="12" cy="16"/>
    </svg>`;
  }

  createInfoSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <point cx="12" cy="8"/>
    </svg>`;
  }

  createNumberSVG(number) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold">${number}</text>
    </svg>`;
  }

  createSpeechBubbleSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`;
  }

  createThoughtBubbleSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 21l4-7h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2z"/>
    </svg>`;
  }

  createCalloutBoxSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`;
  }

  createWarningSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <point cx="12" cy="17"/>
    </svg>`;
  }

  createImportantSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>`;
  }

  // Get all stamps by category
  getStampsByCategory(category) {
    return this.stamps[category] || [];
  }

  // Get all categories
  getCategories() {
    return Object.keys(this.stamps);
  }

  // Add custom stamp
  addCustomStamp(name, imageData) {
    const stamp = {
      id: Date.now(),
      name: name,
      imageData: imageData,
      created: new Date().toISOString()
    };
    
    this.customStamps.push(stamp);
    this.saveCustomStamps();
    return stamp;
  }

  // Remove custom stamp
  removeCustomStamp(id) {
    this.customStamps = this.customStamps.filter(stamp => stamp.id !== id);
    this.saveCustomStamps();
  }

  // Get custom stamps
  getCustomStamps() {
    return this.customStamps;
  }

  // Create stamp library UI
  createStampLibraryUI() {
    const container = document.createElement('div');
    container.className = 'stamp-library';
    container.innerHTML = `
      <div class="stamp-library-header">
        <h3>Stamp Library</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="stamp-categories">
        ${this.getCategories().map(category => `
          <button class="category-btn" data-category="${category}">
            ${category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        `).join('')}
        <button class="category-btn" data-category="custom">Custom</button>
      </div>
      <div class="stamp-grid" id="stampGrid">
        <!-- Stamps will be populated here -->
      </div>
      <div class="stamp-actions">
        <input type="file" id="customStampInput" accept="image/*" style="display: none;">
        <button id="addCustomStamp">Add Custom Stamp</button>
      </div>
    `;

    // Event handlers
    container.querySelector('.close-btn').addEventListener('click', () => {
      container.remove();
    });

    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        this.showStampsForCategory(category, container.querySelector('#stampGrid'));
        
        // Update active category
        container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    container.querySelector('#addCustomStamp').addEventListener('click', () => {
      container.querySelector('#customStampInput').click();
    });

    container.querySelector('#customStampInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleCustomStampUpload(file, container.querySelector('#stampGrid'));
      }
    });

    // Show first category by default
    this.showStampsForCategory('arrows', container.querySelector('#stampGrid'));
    container.querySelector('.category-btn').classList.add('active');

    return container;
  }

  showStampsForCategory(category, gridElement) {
    let stamps;
    
    if (category === 'custom') {
      stamps = this.getCustomStamps().map(stamp => ({
        name: stamp.name,
        imageData: stamp.imageData,
        isCustom: true,
        id: stamp.id
      }));
    } else {
      stamps = this.getStampsByCategory(category);
    }

    gridElement.innerHTML = stamps.map(stamp => `
      <div class="stamp-item" data-stamp='${JSON.stringify(stamp)}'>
        ${stamp.isCustom 
          ? `<img src="${stamp.imageData}" alt="${stamp.name}">`
          : `<div class="stamp-icon">${stamp.emoji}</div>`
        }
        <div class="stamp-name">${stamp.name}</div>
        ${stamp.isCustom ? '<button class="delete-stamp" data-id="' + stamp.id + '">&times;</button>' : ''}
      </div>
    `).join('');

    // Add click handlers
    gridElement.querySelectorAll('.stamp-item').forEach(item => {
      item.addEventListener('click', () => {
        const stampData = JSON.parse(item.dataset.stamp);
        this.selectStamp(stampData);
      });
    });

    // Add delete handlers for custom stamps
    gridElement.querySelectorAll('.delete-stamp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        this.removeCustomStamp(id);
        this.showStampsForCategory('custom', gridElement);
      });
    });
  }

  handleCustomStampUpload(file, gridElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const name = prompt('Enter stamp name:') || 'Custom Stamp';
      this.addCustomStamp(name, e.target.result);
      this.showStampsForCategory('custom', gridElement);
    };
    reader.readAsDataURL(file);
  }

  selectStamp(stampData) {
    // Notify that a stamp was selected
    window.postMessage({
      type: 'STAMP_SELECTED',
      stamp: stampData
    }, '*');
  }
}

// Global instance
window.stampLibrary = new StampLibrary();
