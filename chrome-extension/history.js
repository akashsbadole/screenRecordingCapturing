class CaptureHistory {
  constructor() {
    this.history = [];
    this.filteredHistory = [];
    this.init();
  }

  async init() {
    await this.loadHistory();
    this.bindEvents();
    this.updateStats();
    this.renderHistory();
  }

  async loadHistory() {
    try {
      const result = await chrome.storage.local.get(['captureHistory']);
      this.history = result.captureHistory || [];
      this.filteredHistory = [...this.history];
    } catch (error) {
      console.error('Error loading history:', error);
      this.history = [];
      this.filteredHistory = [];
    }
  }

  bindEvents() {
    // Filter events
    document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('dateFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('searchFilter').addEventListener('input', () => this.applyFilters());
    
    // Clear history
    document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
  }

  applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

    this.filteredHistory = this.history.filter(item => {
      // Type filter
      if (typeFilter && item.type !== typeFilter) return false;
      
      // Date filter
      if (dateFilter) {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        if (itemDate !== dateFilter) return false;
      }
      
      // Search filter
      if (searchFilter && !item.filename.toLowerCase().includes(searchFilter)) return false;
      
      return true;
    });

    this.renderHistory();
  }

  updateStats() {
    const totalItems = this.history.length;
    const totalRecordings = this.history.filter(item => item.type === 'recording').length;
    const totalScreenshots = this.history.filter(item => item.type === 'screenshot').length;
    const totalSize = this.history.reduce((sum, item) => sum + (item.size || 0), 0);

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalRecordings').textContent = totalRecordings;
    document.getElementById('totalScreenshots').textContent = totalScreenshots;
    document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
  }

  renderHistory() {
    const grid = document.getElementById('historyGrid');
    const emptyState = document.getElementById('emptyState');

    if (this.filteredHistory.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = this.filteredHistory.map(item => this.createHistoryItem(item)).join('');
  }

  createHistoryItem(item) {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    const typeClass = item.type === 'recording' ? 'type-recording' : 'type-screenshot';
    const typeIcon = item.type === 'recording' ? '🎥' : '📸';

    return `
      <div class="history-item" data-id="${item.id}">
        <div class="item-thumbnail">
          ${item.thumbnail ? 
            `<img src="${item.thumbnail}" alt="Thumbnail">` : 
            `<span>${typeIcon}</span>`
          }
        </div>
        <div class="item-content">
          <div class="item-title">${item.filename}</div>
          <div class="item-meta">
            <span class="item-type ${typeClass}">${item.type}</span>
            <span class="item-date">${formattedDate}</span>
          </div>
          <div class="item-actions">
            <button class="action-btn btn-primary" onclick="captureHistory.openItem('${item.id}')">
              Open
            </button>
            <button class="action-btn btn-secondary" onclick="captureHistory.shareItem('${item.id}')">
              Share
            </button>
            <button class="action-btn btn-danger" onclick="captureHistory.deleteItem('${item.id}')">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async openItem(itemId) {
    const item = this.history.find(h => h.id.toString() === itemId);
    if (!item) return;

    try {
      // Try to open the file using the downloads API
      await chrome.downloads.show(item.downloadId);
    } catch (error) {
      // If that fails, try to open the file location
      try {
        await chrome.downloads.showDefaultFolder();
      } catch (error2) {
        console.error('Error opening item:', error2);
        this.showNotification('Error', 'Could not open the file');
      }
    }
  }

  async shareItem(itemId) {
    const item = this.history.find(h => h.id.toString() === itemId);
    if (!item) return;

    // Create a simple share dialog
    const shareUrl = `data:text/plain,Check out this ${item.type} I captured: ${item.filename}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Screen Recorder Pro - ${item.filename}`,
          text: `Check out this ${item.type} I captured`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`Check out this ${item.type} I captured: ${item.filename}`);
        this.showNotification('Copied', 'Share text copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }

  async deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item from history?')) return;

    try {
      this.history = this.history.filter(h => h.id.toString() !== itemId);
      await chrome.storage.local.set({ captureHistory: this.history });
      
      this.applyFilters();
      this.updateStats();
      
      this.showNotification('Deleted', 'Item removed from history');
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showNotification('Error', 'Failed to delete item');
    }
  }

  async clearHistory() {
    if (!confirm('Are you sure you want to clear all capture history? This cannot be undone.')) return;

    try {
      await chrome.storage.local.set({ captureHistory: [] });
      this.history = [];
      this.filteredHistory = [];
      
      this.updateStats();
      this.renderHistory();
      
      this.showNotification('Cleared', 'All history has been cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      this.showNotification('Error', 'Failed to clear history');
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  showNotification(title, message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      font-family: inherit;
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.captureHistory = new CaptureHistory();
});
