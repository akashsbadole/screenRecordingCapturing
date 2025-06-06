# Screen Recorder & Capture Chrome Extension

A professional Chrome extension for screen recording and screen capture with advanced features similar to Zoom and Google Meet.

## Features

### 🎥 Screen Recording
- **High-quality screen recording** with customizable frame rates
- **Audio recording** support (microphone and system audio)
- **Real-time recording indicator** on the page
- **Automatic file download** in WebM format
- **Recording timer** with pause/resume functionality

### 📸 Screen Capture
- **Visible tab capture** - Capture the currently visible tab
- **Area selection** - Select and capture specific areas of the screen
- **Multiple formats** - PNG, JPEG, WebP support
- **Quality settings** - High, Medium, Low quality options
- **Instant download** with automatic filename generation

### 🚀 Advanced Features
- **Recent captures history** - Access your last 10 captures
- **Keyboard shortcuts** for quick access
- **Storage management** - Automatic cleanup of old captures
- **Cross-platform compatibility** - Works on Windows, Mac, Linux
- **Privacy-focused** - All processing done locally

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Screen Recorder & Capture"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension will appear in your toolbar

## Usage

### Screen Recording
1. Click the extension icon in your toolbar
2. Click "Start Recording" 
3. Select the screen/window you want to record
4. Choose audio options (microphone/system audio)
5. Click "Stop Recording" when finished
6. The recording will automatically download

### Screen Capture
1. Click the extension icon
2. Choose capture method:
   - **Capture Visible Tab** - Instant screenshot of current tab
   - **Select Area** - Click and drag to select specific area
3. Choose format and quality settings
4. The screenshot will automatically download

### Keyboard Shortcuts
- `Ctrl+Shift+R` - Start/Stop recording
- `Ctrl+Shift+C` - Quick screenshot
- `Ctrl+Shift+S` - Stop current recording

## Permissions

The extension requires the following permissions:
- **activeTab** - To capture screenshots of the current tab
- **desktopCapture** - To record screen content
- **storage** - To save settings and recent captures
- **downloads** - To automatically download captured files
- **tabs** - To manage tab capture functionality

## Privacy & Security

- **No data collection** - We don't collect any personal data
- **Local processing** - All recording and capture happens on your device
- **No cloud uploads** - Files are saved directly to your computer
- **Open source** - Code is available for review

## File Formats

### Recordings
- **WebM** format with VP9/VP8 codec
- **Audio** in Opus format (if enabled)
- **Quality** up to 1080p at 30fps

### Screenshots
- **PNG** - Best quality, larger file size
- **JPEG** - Good quality, smaller file size
- **WebP** - Modern format, excellent compression

## Browser Compatibility

- **Chrome** 88+ (recommended)
- **Edge** 88+ (Chromium-based)
- **Opera** 74+
- **Brave** 1.20+

## Troubleshooting

### Recording Issues
- Ensure you grant screen capture permissions
- Check if other screen recording software is running
- Try refreshing the page and starting again

### Screenshot Issues
- Make sure the tab is fully loaded
- Check browser permissions for the extension
- Try disabling other screenshot extensions

### Performance Issues
- Close unnecessary tabs while recording
- Lower recording quality if experiencing lag
- Ensure sufficient disk space for recordings

## Development

### Building from Source
```bash
# Clone the repository
git clone [repository-url]

# Navigate to extension directory
cd chrome-extension

# The extension is ready to load in Chrome
```

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script for page interaction
├── content.css            # Content script styles
├── icons/                 # Extension icons
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, feature requests, or bug reports:
- Create an issue on GitHub
- Email: support@screenrecorder.com

## Changelog

### Version 1.0.0
- Initial release
- Basic screen recording functionality
- Screenshot capture with area selection
- Recent captures history
- Keyboard shortcuts support
