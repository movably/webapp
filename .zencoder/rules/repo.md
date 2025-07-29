---
description: Repository Information Overview
alwaysApply: true
---

# Flamingo Web App Information

## Summary
The Flamingo Web App is a Progressive Web Application (PWA) designed to control the Flamingo Chair via Web Bluetooth. It provides a user interface for chair control, configuration, and monitoring, with both standard and engineering modes.

## Structure
- **Root Directory**: Contains main HTML, JavaScript, and CSS files for the web application
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
- Web Bluetooth API
- Plotly.js (for data visualization)
- Line Awesome 1.3.0 (icon library)

## Web Application Features
**Core Functionality**:
- Bluetooth connectivity to Flamingo Chair
- Chair mode control (manual/auto)
- Chair position control (left/right sides)
- Configuration settings for chair parameters
- Engineering diagnostics mode
- WiFi setup for the chair
- Telemetry data visualization

**Progressive Web App**:
- Service worker for offline caching
- Web app manifest for installation
- Responsive design for various screen sizes

## Bluetooth Implementation
**Service UUIDs**:
- Discovery Service: 0x180A
- Chair Service: "730c0001-7ec9-4dd5-ba24-44a04e14cf08"
- Engineering Service: "1b25ee00-dadf-11eb-8d19-0242ac130003"

**Key Characteristics**:
- Auto Mode: "730c0003-7ec9-4dd5-ba24-44a04e14cf08"
- Chair State: "730c0009-7ec9-4dd5-ba24-44a04e14cf08"
- Chair Toggle: "730c0006-7ec9-4dd5-ba24-44a04e14cf08"

## User Interface
**Main Components**:
- Connection screen with Bluetooth pairing
- Chair control panel with manual/auto modes
- Configuration sliders for chair parameters
- Diagnostic tabs for engineering mode
- WiFi setup interface
- Telemetry data visualization

**Control Features**:
- Left/right side position control
- Auto mode sequence selection
- Vibration and sound settings
- Motion trigger configuration
- Timer-based automatic transitions

## Storage
**Local Storage**:
- User email for session persistence
- Chair configuration preferences

**Service Worker Cache**:
- Application assets for offline use
- Named cache: 'playbulb-candle'