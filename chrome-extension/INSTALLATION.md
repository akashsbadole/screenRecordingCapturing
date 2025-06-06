# Chrome Extension Installation Guide

## Quick Installation (Developer Mode)

Since this extension is not yet published on the Chrome Web Store, you'll need to install it manually in developer mode.

### Step 1: Download the Extension
1. Download or clone this repository to your computer
2. Extract the files if downloaded as a ZIP
3. Locate the `chrome-extension` folder

### Step 2: Enable Developer Mode
1. Open Google Chrome
2. Navigate to `chrome://extensions/` (or go to Menu → More Tools → Extensions)
3. Toggle **"Developer mode"** ON in the top-right corner

### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to and select the `chrome-extension` folder
3. Click **"Select Folder"** (or "Open" on Mac)

### Step 4: Verify Installation
1. The extension should now appear in your extensions list
2. You should see the Screen Recorder & Capture icon in your Chrome toolbar
3. If the icon is not visible, click the puzzle piece icon and pin the extension

## Using the Extension

### First Time Setup
1. Click the extension icon in your toolbar
2. Grant necessary permissions when prompted:
   - **Screen capture** - Required for screenshots and recordings
   - **Microphone** - Optional, for audio recording
   - **Downloads** - Required to save captured files

### Basic Usage
1. **Screen Recording:**
   - Click the extension icon
   - Click "Start Recording"
   - Select the screen/window to record
   - Choose audio options
   - Click "Stop Recording" when done

2. **Screenshots:**
   - Click the extension icon
   - Choose "Capture Visible Tab" or "Select Area"
   - For area selection, click and drag to select region
   - File will automatically download

### Keyboard Shortcuts
- `Ctrl+Shift+R` - Start/Stop recording
- `Ctrl+Shift+C` - Quick screenshot
- `Escape` - Cancel area selection

## Troubleshooting

### Extension Not Loading
- Make sure you selected the correct folder (`chrome-extension`)
- Check that all files are present in the folder
- Try refreshing the extensions page and reloading

### Permissions Issues
- Make sure to grant all requested permissions
- Try refreshing the page and using the extension again
- Check Chrome's site settings for the current page

### Recording/Screenshot Not Working
- Ensure you're on a regular webpage (not chrome:// pages)
- Check that no other screen recording software is running
- Try refreshing the page and starting again

### Audio Not Recording
- Grant microphone permissions when prompted
- Check your system's microphone settings
- Ensure microphone is not being used by other applications

## Browser Compatibility

### Supported Browsers
- **Google Chrome** 88+ ✅
- **Microsoft Edge** 88+ (Chromium-based) ✅
- **Opera** 74+ ✅
- **Brave Browser** 1.20+ ✅

### Not Supported
- Firefox (uses different extension system)
- Safari (uses different extension system)
- Internet Explorer (outdated)

## File Locations

### Default Download Location
- **Windows:** `C:\Users\[Username]\Downloads\`
- **Mac:** `/Users/[Username]/Downloads/`
- **Linux:** `/home/[Username]/Downloads/`

### File Naming Convention
- **Recordings:** `screen-recording-YYYY-MM-DD-HH-MM-SS.webm`
- **Screenshots:** `screenshot-[type]-YYYY-MM-DD-HH-MM-SS.[format]`

## Privacy & Security

### Data Collection
- ❌ No personal data collected
- ❌ No analytics or tracking
- ❌ No cloud uploads
- ✅ All processing done locally

### Permissions Explained
- **activeTab** - Access current tab for screenshots
- **desktopCapture** - Record screen content
- **storage** - Save settings and recent captures
- **downloads** - Automatically save files
- **tabs** - Manage tab capture functionality

## Updating the Extension

### Manual Updates
1. Download the latest version
2. Go to `chrome://extensions/`
3. Find the extension and click "Remove"
4. Follow installation steps with new version

### Automatic Updates (Future)
Once published on Chrome Web Store, updates will be automatic.

## Uninstalling

### Complete Removal
1. Go to `chrome://extensions/`
2. Find "Screen Recorder & Capture"
3. Click "Remove"
4. Confirm removal
5. Delete the extension folder from your computer

### Keep Settings
If you want to reinstall later with same settings, don't clear browser data.

## Support

### Getting Help
- Check this installation guide first
- Review the main README.md file
- Create an issue on GitHub
- Email: support@example.com

### Common Solutions
1. **Refresh the page** - Solves most issues
2. **Restart Chrome** - Clears temporary issues
3. **Check permissions** - Ensure all permissions granted
4. **Update Chrome** - Use latest version for best compatibility

## Development Mode Limitations

### What Works
- All core functionality
- Settings and preferences
- Keyboard shortcuts
- File downloads

### Limitations
- No automatic updates
- Developer mode warning in Chrome
- Manual installation required
- Not available in Chrome Web Store

## Next Steps

After successful installation:
1. ✅ Test basic screenshot functionality
2. ✅ Test screen recording
3. ✅ Configure settings to your preference
4. ✅ Set up keyboard shortcuts
5. ✅ Bookmark this guide for reference

---

**Need help?** Create an issue on GitHub or contact support.
