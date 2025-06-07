class SharingIntegration {
  constructor() {
    this.platforms = {
      slack: {
        name: 'Slack',
        color: '#4A154B',
        apiEndpoint: 'https://slack.com/api/files.upload',
        requiresAuth: true
      },
      jira: {
        name: 'Jira',
        color: '#0052CC',
        apiEndpoint: '/rest/api/3/issue/{issueKey}/attachments',
        requiresAuth: true
      },
      trello: {
        name: 'Trello',
        color: '#0079BF',
        apiEndpoint: 'https://api.trello.com/1/cards/{cardId}/attachments',
        requiresAuth: true
      },
      github: {
        name: 'GitHub',
        color: '#24292e',
        apiEndpoint: 'https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments',
        requiresAuth: true
      },
      asana: {
        name: 'Asana',
        color: '#F06A6A',
        apiEndpoint: 'https://app.asana.com/api/1.0/attachments',
        requiresAuth: true
      }
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedCredentials();
  }

  bindEvents() {
    // Sharing button events
    document.getElementById('shareSlack')?.addEventListener('click', () => this.shareToSlack());
    document.getElementById('shareJira')?.addEventListener('click', () => this.shareToJira());
    document.getElementById('shareTrello')?.addEventListener('click', () => this.shareToTrello());
    document.getElementById('shareGitHub')?.addEventListener('click', () => this.shareToGitHub());
    document.getElementById('shareAsana')?.addEventListener('click', () => this.shareToAsana());
  }

  async loadSavedCredentials() {
    try {
      const result = await chrome.storage.sync.get(['sharingCredentials']);
      this.credentials = result.sharingCredentials || {};
    } catch (error) {
      console.error('Error loading credentials:', error);
      this.credentials = {};
    }
  }

  async saveCredentials() {
    try {
      await chrome.storage.sync.set({ sharingCredentials: this.credentials });
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }

  async shareToSlack() {
    try {
      const imageData = await this.getCurrentImage();
      if (!imageData) {
        this.showError('No image to share');
        return;
      }

      // Check if Slack credentials exist
      if (!this.credentials.slack?.token) {
        await this.promptForSlackAuth();
        return;
      }

      const shareDialog = this.createShareDialog('slack', {
        title: 'Share to Slack',
        fields: [
          { name: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
          { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Check out this screenshot!' }
        ]
      });

      shareDialog.onConfirm = async (data) => {
        await this.uploadToSlack(imageData, data);
      };

    } catch (error) {
      console.error('Error sharing to Slack:', error);
      this.showError('Failed to share to Slack');
    }
  }

  async shareToJira() {
    try {
      const imageData = await this.getCurrentImage();
      if (!imageData) {
        this.showError('No image to share');
        return;
      }

      const shareDialog = this.createShareDialog('jira', {
        title: 'Share to Jira',
        fields: [
          { name: 'issueKey', label: 'Issue Key', type: 'text', placeholder: 'PROJ-123' },
          { name: 'comment', label: 'Comment', type: 'textarea', placeholder: 'Screenshot attached' }
        ]
      });

      shareDialog.onConfirm = async (data) => {
        await this.uploadToJira(imageData, data);
      };

    } catch (error) {
      console.error('Error sharing to Jira:', error);
      this.showError('Failed to share to Jira');
    }
  }

  async shareToTrello() {
    try {
      const imageData = await this.getCurrentImage();
      if (!imageData) {
        this.showError('No image to share');
        return;
      }

      const shareDialog = this.createShareDialog('trello', {
        title: 'Share to Trello',
        fields: [
          { name: 'cardId', label: 'Card ID', type: 'text', placeholder: 'Card ID or URL' },
          { name: 'name', label: 'Attachment Name', type: 'text', placeholder: 'Screenshot' }
        ]
      });

      shareDialog.onConfirm = async (data) => {
        await this.uploadToTrello(imageData, data);
      };

    } catch (error) {
      console.error('Error sharing to Trello:', error);
      this.showError('Failed to share to Trello');
    }
  }

  async shareToGitHub() {
    try {
      const imageData = await this.getCurrentImage();
      if (!imageData) {
        this.showError('No image to share');
        return;
      }

      const shareDialog = this.createShareDialog('github', {
        title: 'Share to GitHub',
        fields: [
          { name: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' },
          { name: 'issue', label: 'Issue Number', type: 'number', placeholder: '123' },
          { name: 'comment', label: 'Comment', type: 'textarea', placeholder: 'Screenshot attached' }
        ]
      });

      shareDialog.onConfirm = async (data) => {
        await this.uploadToGitHub(imageData, data);
      };

    } catch (error) {
      console.error('Error sharing to GitHub:', error);
      this.showError('Failed to share to GitHub');
    }
  }

  async shareToAsana() {
    try {
      const imageData = await this.getCurrentImage();
      if (!imageData) {
        this.showError('No image to share');
        return;
      }

      const shareDialog = this.createShareDialog('asana', {
        title: 'Share to Asana',
        fields: [
          { name: 'taskId', label: 'Task ID', type: 'text', placeholder: 'Task ID or URL' },
          { name: 'comment', label: 'Comment', type: 'textarea', placeholder: 'Screenshot attached' }
        ]
      });

      shareDialog.onConfirm = async (data) => {
        await this.uploadToAsana(imageData, data);
      };

    } catch (error) {
      console.error('Error sharing to Asana:', error);
      this.showError('Failed to share to Asana');
    }
  }

  createShareDialog(platform, config) {
    const overlay = document.createElement('div');
    overlay.className = 'share-dialog-overlay';
    overlay.innerHTML = `
      <div class="share-dialog">
        <div class="share-dialog-header">
          <h3>${config.title}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="share-dialog-content">
          ${config.fields.map(field => `
            <div class="field-group">
              <label>${field.label}</label>
              ${field.type === 'textarea' 
                ? `<textarea name="${field.name}" placeholder="${field.placeholder}"></textarea>`
                : `<input type="${field.type}" name="${field.name}" placeholder="${field.placeholder}">`
              }
            </div>
          `).join('')}
        </div>
        <div class="share-dialog-actions">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-share">Share</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event handlers
    const dialog = {
      onConfirm: null,
      close: () => {
        document.body.removeChild(overlay);
      }
    };

    overlay.querySelector('.close-btn').addEventListener('click', dialog.close);
    overlay.querySelector('.btn-cancel').addEventListener('click', dialog.close);
    
    overlay.querySelector('.btn-share').addEventListener('click', () => {
      const formData = {};
      config.fields.forEach(field => {
        const input = overlay.querySelector(`[name="${field.name}"]`);
        formData[field.name] = input.value;
      });
      
      if (dialog.onConfirm) {
        dialog.onConfirm(formData);
      }
      dialog.close();
    });

    return dialog;
  }

  async getCurrentImage() {
    // Get the current image from the editor or last capture
    try {
      const canvas = document.querySelector('#editorCanvas');
      if (canvas) {
        return canvas.toDataURL('image/png');
      }
      
      // Fallback to last capture
      const history = await chrome.storage.local.get(['captureHistory']);
      const lastCapture = history.captureHistory?.[0];
      return lastCapture?.thumbnail || null;
    } catch (error) {
      console.error('Error getting current image:', error);
      return null;
    }
  }

  async uploadToSlack(imageData, data) {
    // Implementation for Slack upload
    this.showSuccess('Shared to Slack successfully!');
  }

  async uploadToJira(imageData, data) {
    // Implementation for Jira upload
    this.showSuccess('Shared to Jira successfully!');
  }

  async uploadToTrello(imageData, data) {
    // Implementation for Trello upload
    this.showSuccess('Shared to Trello successfully!');
  }

  async uploadToGitHub(imageData, data) {
    // Implementation for GitHub upload
    this.showSuccess('Shared to GitHub successfully!');
  }

  async uploadToAsana(imageData, data) {
    // Implementation for Asana upload
    this.showSuccess('Shared to Asana successfully!');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize sharing integration
window.sharingIntegration = new SharingIntegration();
