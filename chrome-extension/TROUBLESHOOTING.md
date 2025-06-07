# 🔧 Troubleshooting Guide - Screen Recorder & Capture Pro

## 🚨 Common Issues & Solutions

### 1. **Service Worker Registration Failed (Status Code: 15)**

**Problem**: Extension fails to load with "Service worker registration failed" error.

**Solutions**:
1. **Check Manifest Permissions**:
   - Ensure all required permissions are listed in `manifest.json`
   - Verify `contextMenus` permission is included

2. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Click "Reload" button for the extension
   - Check for any error messages

3. **Clear Extension Data**:
   - Remove and re-add the extension
   - Clear browser cache and restart Chrome

### 2. **"Cannot read properties of undefined" Errors**

**Problem**: Chrome APIs are undefined or not accessible.

**Solutions**:
1. **Check API Availability**:
   ```javascript
   if (chrome.contextMenus) {
     // Use the API
   } else {
     console.warn('API not available');
   }
   ```

2. **Verify Permissions**:
   - Ensure all required permissions are in manifest
   - Check if extension has proper host permissions

3. **Update Chrome**:
   - Some APIs require newer Chrome versions
   - Update to latest Chrome version

### 3. **Recording Not Starting**

**Problem**: Screen recording fails to start or shows permission errors.

**Solutions**:
1. **Grant Permissions**:
   - Allow screen capture when prompted
   - Check browser permissions in Settings

2. **Check Other Recording Software**:
   - Close other screen recording applications
   - Ensure no conflicts with system recording tools

3. **Refresh Page**:
   - Reload the tab you want to record
   - Try recording a different tab/window

### 4. **Screenshots Appear Blank**

**Problem**: Captured screenshots are empty or black.

**Solutions**:
1. **Page Loading**:
   - Ensure page is fully loaded before capturing
   - Wait for all images and content to load

2. **Browser Permissions**:
   - Check if extension has activeTab permission
   - Verify no other extensions are interfering

3. **Hardware Acceleration**:
   - Try disabling hardware acceleration in Chrome
   - Go to Settings > Advanced > System

### 5. **Performance Issues During Recording**

**Problem**: Browser becomes slow or laggy during recording.

**Solutions**:
1. **Lower Quality Settings**:
   - Reduce recording resolution (720p instead of 4K)
   - Lower frame rate (30fps instead of 60fps)

2. **Close Unnecessary Tabs**:
   - Close unused browser tabs
   - Disable unnecessary extensions

3. **System Resources**:
   - Ensure sufficient RAM and CPU available
   - Close other applications

### 6. **Audio Not Recording**

**Problem**: No audio in recorded videos.

**Solutions**:
1. **Microphone Permissions**:
   - Grant microphone access when prompted
   - Check browser microphone settings

2. **System Audio**:
   - Enable "Share system audio" in screen share dialog
   - Check system audio levels

3. **Audio Drivers**:
   - Update audio drivers
   - Restart browser after driver updates

### 7. **Extension Not Appearing in Toolbar**

**Problem**: Extension icon not visible in Chrome toolbar.

**Solutions**:
1. **Pin Extension**:
   - Click puzzle piece icon in toolbar
   - Find "Screen Recorder & Capture Pro"
   - Click pin icon to pin to toolbar

2. **Extension Enabled**:
   - Go to `chrome://extensions/`
   - Ensure extension is enabled
   - Check for any error messages

### 8. **Keyboard Shortcuts Not Working**

**Problem**: Ctrl+Shift+R and other shortcuts don't work.

**Solutions**:
1. **Check Shortcut Conflicts**:
   - Go to `chrome://extensions/shortcuts`
   - Verify shortcuts are assigned
   - Resolve any conflicts with other extensions

2. **Focus Issues**:
   - Ensure browser window has focus
   - Try clicking on page before using shortcuts

### 9. **Files Not Downloading**

**Problem**: Captured files don't download automatically.

**Solutions**:
1. **Download Permissions**:
   - Check if extension has downloads permission
   - Verify browser download settings

2. **Pop-up Blockers**:
   - Disable pop-up blockers for the extension
   - Allow automatic downloads

3. **Storage Space**:
   - Ensure sufficient disk space
   - Check default download location

### 10. **Sharing Integration Not Working**

**Problem**: Cannot share to Slack, Jira, etc.

**Solutions**:
1. **Authentication**:
   - Ensure you're logged into the target platform
   - Check API credentials and tokens

2. **Network Issues**:
   - Check internet connection
   - Verify no firewall blocking requests

3. **Platform Permissions**:
   - Ensure proper permissions on target platform
   - Check if sharing is enabled for your account

## 🔍 Debugging Steps

### 1. **Check Console Errors**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check both page console and extension console

### 2. **Inspect Extension**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Inspect views: service worker"
4. Check for errors in extension console

### 3. **Test Basic Functionality**
1. Try simple screenshot first
2. Test with different websites
3. Check if issue is site-specific

### 4. **Reset Extension Settings**
1. Go to extension storage
2. Clear all saved settings
3. Restart browser and test

## 📞 Getting Help

### Before Reporting Issues:
1. ✅ Check this troubleshooting guide
2. ✅ Update Chrome to latest version
3. ✅ Try disabling other extensions
4. ✅ Test on different websites
5. ✅ Check browser console for errors

### When Reporting Issues:
- **Browser Version**: Chrome version number
- **Operating System**: Windows/Mac/Linux version
- **Error Messages**: Exact error text from console
- **Steps to Reproduce**: Detailed steps that cause the issue
- **Expected vs Actual**: What should happen vs what actually happens

### Useful Information to Include:
- Extension version
- Website where issue occurs
- Screenshot of error (if applicable)
- Browser console logs
- Extension console logs

## 🛠️ Advanced Troubleshooting

### Reset Extension Completely:
1. Go to `chrome://extensions/`
2. Remove the extension
3. Clear browser data (optional)
4. Restart Chrome
5. Reinstall extension

### Check Extension Permissions:
1. Go to `chrome://extensions/`
2. Click "Details" on the extension
3. Review "Site access" and "Permissions"
4. Ensure all necessary permissions are granted

### Test in Incognito Mode:
1. Open incognito window
2. Enable extension in incognito
3. Test functionality
4. This helps identify conflicts with other extensions

## 🔄 Version Compatibility

### Minimum Requirements:
- **Chrome**: Version 88+
- **Manifest**: Version 3
- **APIs**: Modern Chrome Extension APIs

### Known Compatibility Issues:
- Older Chrome versions may not support all features
- Some enterprise Chrome installations may restrict permissions
- Certain websites may block screen capture APIs

## 📈 Performance Optimization

### For Better Performance:
1. **Lower recording quality** for longer recordings
2. **Close unnecessary tabs** before recording
3. **Use hardware acceleration** if available
4. **Record shorter segments** for large files
5. **Clear browser cache** regularly

### Memory Management:
- Extension automatically cleans up old captures
- Limit history to 50 recent captures
- Large files are compressed when possible

---

**Still having issues?** The extension includes comprehensive error handling and should provide helpful error messages. Check the browser console for detailed error information.
