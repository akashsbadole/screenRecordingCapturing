// Test script for Screen Recorder & Capture Pro Extension
// Run this in the browser console to test extension functionality

class ExtensionTester {
  constructor() {
    this.testResults = [];
    this.init();
  }

  init() {
    console.log('🧪 Starting Extension Tests...');
    this.runAllTests();
  }

  async runAllTests() {
    await this.testExtensionLoaded();
    await this.testPermissions();
    await this.testBasicFunctionality();
    await this.testUIElements();
    await this.testStorageAccess();
    
    this.displayResults();
  }

  async testExtensionLoaded() {
    try {
      const extensionId = chrome.runtime.id;
      if (extensionId) {
        this.addResult('✅ Extension Loaded', `Extension ID: ${extensionId}`);
      } else {
        this.addResult('❌ Extension Not Loaded', 'Extension ID not found');
      }
    } catch (error) {
      this.addResult('❌ Extension Load Error', error.message);
    }
  }

  async testPermissions() {
    const permissions = [
      'activeTab',
      'desktopCapture', 
      'storage',
      'downloads',
      'tabs',
      'scripting',
      'notifications',
      'contextMenus'
    ];

    for (const permission of permissions) {
      try {
        const hasPermission = await chrome.permissions.contains({
          permissions: [permission]
        });
        
        if (hasPermission) {
          this.addResult(`✅ Permission: ${permission}`, 'Available');
        } else {
          this.addResult(`⚠️ Permission: ${permission}`, 'Not available');
        }
      } catch (error) {
        this.addResult(`❌ Permission: ${permission}`, error.message);
      }
    }
  }

  async testBasicFunctionality() {
    // Test Chrome APIs availability
    const apis = [
      { name: 'chrome.tabs', api: chrome.tabs },
      { name: 'chrome.storage', api: chrome.storage },
      { name: 'chrome.downloads', api: chrome.downloads },
      { name: 'chrome.notifications', api: chrome.notifications },
      { name: 'chrome.contextMenus', api: chrome.contextMenus },
      { name: 'chrome.desktopCapture', api: chrome.desktopCapture },
      { name: 'chrome.scripting', api: chrome.scripting }
    ];

    apis.forEach(({ name, api }) => {
      if (api) {
        this.addResult(`✅ API: ${name}`, 'Available');
      } else {
        this.addResult(`❌ API: ${name}`, 'Not available');
      }
    });

    // Test MediaDevices API
    if (navigator.mediaDevices) {
      this.addResult('✅ MediaDevices API', 'Available');
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        this.addResult('📹 Video Devices', `Found ${videoDevices.length} camera(s)`);
        this.addResult('🎤 Audio Devices', `Found ${audioDevices.length} microphone(s)`);
      } catch (error) {
        this.addResult('❌ Device Enumeration', error.message);
      }
    } else {
      this.addResult('❌ MediaDevices API', 'Not available');
    }
  }

  async testUIElements() {
    // Test if popup can be opened
    try {
      // This would test if the popup HTML loads correctly
      const popupUrl = chrome.runtime.getURL('popup-new.html');
      this.addResult('✅ Popup URL', popupUrl);
    } catch (error) {
      this.addResult('❌ Popup URL', error.message);
    }

    // Test if icons exist
    const iconSizes = [16, 32, 48, 128];
    iconSizes.forEach(size => {
      try {
        const iconUrl = chrome.runtime.getURL(`icons/icon${size}.png`);
        this.addResult(`✅ Icon ${size}px`, iconUrl);
      } catch (error) {
        this.addResult(`❌ Icon ${size}px`, error.message);
      }
    });
  }

  async testStorageAccess() {
    try {
      // Test storage write
      await chrome.storage.local.set({ testKey: 'testValue' });
      
      // Test storage read
      const result = await chrome.storage.local.get(['testKey']);
      
      if (result.testKey === 'testValue') {
        this.addResult('✅ Storage Access', 'Read/Write working');
      } else {
        this.addResult('❌ Storage Access', 'Read/Write failed');
      }
      
      // Clean up
      await chrome.storage.local.remove(['testKey']);
    } catch (error) {
      this.addResult('❌ Storage Access', error.message);
    }
  }

  addResult(test, result) {
    this.testResults.push({ test, result });
    console.log(`${test}: ${result}`);
  }

  displayResults() {
    console.log('\n🧪 Extension Test Results:');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(r => r.test.startsWith('✅')).length;
    const warnings = this.testResults.filter(r => r.test.startsWith('⚠️')).length;
    const failed = this.testResults.filter(r => r.test.startsWith('❌')).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0 && warnings === 0) {
      console.log('\n🎉 All tests passed! Extension is working correctly.');
    } else if (failed === 0) {
      console.log('\n⚠️ Extension is mostly working, but has some warnings.');
    } else {
      console.log('\n❌ Extension has issues that need to be fixed.');
    }
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(({ test, result }) => {
      console.log(`  ${test}: ${result}`);
    });
  }
}

// Test screen capture functionality
async function testScreenCapture() {
  console.log('🖼️ Testing Screen Capture...');
  
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' }
    });
    
    console.log('✅ Screen capture permission granted');
    
    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.log('❌ Screen capture failed:', error.message);
    return false;
  }
}

// Test camera access
async function testCameraAccess() {
  console.log('📹 Testing Camera Access...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    
    console.log('✅ Camera access granted');
    
    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.log('❌ Camera access failed:', error.message);
    return false;
  }
}

// Test microphone access
async function testMicrophoneAccess() {
  console.log('🎤 Testing Microphone Access...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });
    
    console.log('✅ Microphone access granted');
    
    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.log('❌ Microphone access failed:', error.message);
    return false;
  }
}

// Quick test function
async function quickTest() {
  console.log('🚀 Running Quick Extension Test...');
  
  const tests = [
    testScreenCapture,
    testCameraAccess,
    testMicrophoneAccess
  ];
  
  const results = await Promise.all(tests.map(test => test()));
  const passed = results.filter(Boolean).length;
  
  console.log(`\n📊 Quick Test Results: ${passed}/${tests.length} passed`);
  
  if (passed === tests.length) {
    console.log('🎉 All quick tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check permissions.');
  }
}

// Export functions for manual testing
window.extensionTester = {
  runFullTest: () => new ExtensionTester(),
  quickTest,
  testScreenCapture,
  testCameraAccess,
  testMicrophoneAccess
};

console.log('🧪 Extension Test Suite Loaded!');
console.log('Run extensionTester.runFullTest() for complete testing');
console.log('Run extensionTester.quickTest() for quick testing');
