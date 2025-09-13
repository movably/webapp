---
description: Repository Information Overview
alwaysApply: true
---

# Flamingo Web App Information

## Summary
A web application for controlling the Flamingo Chair via Web Bluetooth. The app allows users to connect to the chair, control its movements, configure settings, and monitor its status. It features both manual and automatic control modes, diagnostic capabilities, and WiFi configuration options.

## Structure
- **Root Directory**: Contains HTML, JavaScript, CSS, and image files for the main application
- **js/**: Contains jQuery library and additional JavaScript functionality
- **img/**: Contains image assets used in the application
- **code.getmdl.io/**: Contains Material Design Lite CSS and JavaScript libraries

## Language & Runtime
**Language**: JavaScript (ES6)
**Runtime**: Web Browser with Web Bluetooth API support
**Framework**: Material Design Lite (MDL)

## Dependencies
**Main Dependencies**:
- jQuery 3.5.1
- Material Design Lite 1.0.4
- Morris.js 0.5.1
- Line Awesome 1.3.0 (icons)
- W3.CSS 4.0

## Main Components

### Web Bluetooth Implementation
**Main File**: `FlamingoBle.js`
**Description**: Implements Bluetooth Low Energy (BLE) communication with the Flamingo Chair
**Key Features**:
- Defines BLE service and characteristic UUIDs
- Handles device connection and disconnection
- Provides methods for reading and writing chair settings
- Manages notifications for real-time chair events

### User Interface
**Main Files**: `index.html`, `styles.css`, `styles2.css`
**Description**: Provides the user interface for controlling the chair
**Key Features**:
- Connection interface with Bluetooth device selection
- Manual control panel for left and right chair sides
- Auto mode configuration with different sequence options
- Diagnostic information display
- WiFi setup interface

### Application Logic
**Main File**: `app.js`
**Description**: Contains the main application logic
**Key Features**:
- Handles UI state management
- Processes chair events and updates UI accordingly
- Manages auto mode and manual control functionality
- Implements diagnostic features for engineering mode

### Progressive Web App Features
**Files**: `manifest.json`, `sw.js`
**Description**: Enables Progressive Web App functionality
**Key Features**:
- Offline capability through service worker caching
- Home screen installation support
- Mobile-friendly responsive design

## Usage & Operations
**Connection**:
```javascript
// Connect to the Flamingo Chair
document.querySelector('#connect').addEventListener('click', function() {
  FlamingoBle.request(onDisconnect)
  .then(_ => connectDevice())
  .catch(error => {
    console.error('Error:', error);
  });
});
```

**Manual Control**:
```javascript
// Toggle left or right side of the chair
document.querySelector('#left').addEventListener('click', function() {
  FlamingoBle.toggleLeft();
});

document.querySelector('#right').addEventListener('click', function() {
  FlamingoBle.toggleRight();
});
```

**Auto Mode**:
```javascript
// Enable auto mode
document.querySelector('#auto-switch').addEventListener('change', function() {
  if (this.checked) {
    FlamingoBle.setAutoMode(1);
  } else {
    FlamingoBle.setAutoMode(0);
  }
});
```

## Testing
The repository doesn't contain explicit testing frameworks or test files. Testing appears to be done manually through the browser interface.

## Browser Compatibility
The application requires Web Bluetooth API support, which is available in:
- Chrome (desktop and Android)
- Edge (Chromium-based)
- Opera

Safari and Firefox require enabling experimental features to use Web Bluetooth.