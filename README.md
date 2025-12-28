# 🎨 AI Portfolio Generator - Premium Edition

A modern, feature-rich portfolio generator with a beautiful multi-step wizard interface that guides users through creating stunning professional portfolios. Refined and ready for deployment.

## ✨ Features

### 🧙‍♂️ Multi-Step Wizard Interface
- **6 Intuitive Steps**: Personal Info → Skills & Edu → Projects → Template → Typography → Review
- **Progress Tracking**: Visual progress bar with step indicators.
- **Form Validation**: Real-time validation at each step.
- **Smooth Animations**: Professional transitions and micro-interactions.
- **Theme Toggle**: Switch between dark and light modes for the interface.

### 🎨 7 Premium Templates
1. **Minimal**: Clean and simple design for a professional look.
2. **Creative**: Vibrant, bento-grid style modern design.
3. **Professional**: Corporate and elegant design for business executives.
4. **Modern**: Sleek, dark-themed and highly realistic.
5. **Minimal Noir**: Ultra-minimalist and sophisticated black-themed.
6. **Executive**: High-authority, classic serif design.
7. **Artisan**: Bold, creative layout for visual artists and designers.

### ✍️ Typography Options
- **Outfit**: Modern & Bold, geometric and highly readable.
- **Inter**: Classic Sans, professional and clean look.
- **Playfair**: Elegant Serif, sophisticated and traditional.

### 📁 Advanced File Support
- **Profile Photo**: Personalized branding with image uploads.
- **Project Images**: Showcase your work visually.
- **Resume Upload**: Direct integration of your PDF resume.
- **Certificates**: Highlight your credentials with multiple file uploads.
- **Storage**: Organized and secure file handling via Multer.

### 🚀 Smart & AI Features
- **AI About Me**: Auto-generate a professional bio based on your specific details.
- **Dynamic Projects**: Add unlimited projects with descriptions and links.
- **Real-time Preview**: See your portfolio update as you build it.
- **One-Click Download**: Export your complete, standalone portfolio as a single HTML file.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (distributed with Node.js)

### Installation

1. **Navigate to the project directory**
   ```bash
   cd portfolio-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # For production
   npm start

   # For development (auto-reload)
   npm run dev
   ```

4. **Open your browser**
   Navigate to: `http://localhost:3000`

---

## 🏗️ Project Structure

```
portfolio-generator/
├── public/                # Frontend assets
│   ├── css/
│   │   └── wizard.css     # Main application styles
│   ├── js/
│   │   └── wizard.js      # Core application logic
│   ├── templates/         # Portfolio templates (HTML)
│   ├── index.html         # Landing / Login page
│   └── wizard.html        # Main Generator application
├── uploads/               # User uploaded images and documents
├── server.js              # Refined Express server
├── package.json           # Project metadata and dependencies
└── README.md              # You are here
```

---

## 🔧 Technical Details

- **Backend**: Express.js with Node.js
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Variables, Flexbox, Grid)
- **Uploads**: Multer for handling multi-part form data
- **Templating**: Custom server-side placeholder replacement engine
- **Typography**: Google Fonts integration (Outfit, Inter, Playfair Display)

---

## 🔒 Deployment Notes

- **Uploads Directory**: Ensure the `uploads/` folder is writable by the server process.
- **Environment**: Use `PORT` environment variable to customize the listening port.
- **Security**: For public production, consider adding a database for persistent storage and session-based authentication.

---

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ by Antigravity**
