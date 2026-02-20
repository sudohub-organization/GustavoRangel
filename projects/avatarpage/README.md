# My Avatar

A 3D interactive avatar application built with Three.js that loads a GLTF/GLB model with bone manipulation and mouse tracking.

## Features

- **3D GLTF/GLB Model Loading**: Loads and displays animated 3D characters
- **Bone Manipulation**: Direct control over character bones for pose customization
- **Mouse Head Tracking**: Avatar head follows mouse cursor movement
- **Arm Pose Control**: Arms positioned in natural standing pose
- **Animation Support**: Plays skeletal animations from the model
- **Responsive Design**: Adapts to any screen size
- **Modern ES6 Architecture**: No build tools required, runs directly in the browser

## Requirements

### Browser Requirements
- Modern web browser with ES6 module support (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+)
- JavaScript enabled
- WebGL support (available in all modern browsers)

### Development Requirements
- A local web server (required for ES6 modules to work properly)
- No build tools or package managers needed

## How to Use Locally

### Option 1: Using Python (Recommended)

If you have Python installed:

**Python 3.x:**
```bash
python -m http.server 8000
```

**Python 2.x:**
```bash
python -m SimpleHTTPServer 8000
```

Then open your browser and navigate to: `http://localhost:8000`

### Option 2: Using Node.js

If you have Node.js installed, you can use `npx`:

```bash
npx http-server -p 8000
```

Then open your browser and navigate to: `http://localhost:8000`

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Using Browser Extensions

Install a local web server extension for your browser:
- Chrome: "Web Server for Chrome"
- Firefox: "Simple Web Server"

