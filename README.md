# 🔐 SecurePass Studio

A modern, feature-rich password generator with AI assistance, strength analysis, and an interactive typing game.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 🛡️ Password Generation
- Customizable password length (4-128 characters)
- Minimum requirements for uppercase, lowercase, digits, and symbols
- Option to avoid similar characters (I, l, 1, 0, O)
- No repeating characters option
- One-click copy to clipboard

### 📊 Strength Analysis
- Real-time entropy calculation in bits
- Visual 5-segment strength meter
- Strength labels: Weak → Fair → Good → Strong → Very Strong

### 🤖 AI-Powered Generation
- Natural language password generation using Google Gemini API
- Describe what you need, get a custom secure password
- Example: "A strong password for my bank account"

### 📜 Password History
- Local storage persistence
- Search and filter functionality
- Sort by: newest, oldest, strongest, weakest, longest, shortest
- Pagination support
- Quick copy and delete actions

### 🎮 Password Challenge Game
- Test your typing speed and accuracy
- Progressive difficulty (passwords get longer each level)
- Score tracking with high score persistence
- 10-second timer per round

### 🎨 User Experience
- Light/Dark theme toggle
- Fully responsive design (mobile, tablet, desktop)
- Keyboard shortcuts for power users
- Smooth animations and transitions
- Accessibility compliant

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Generate password |
| `C` | Copy password |
| `T` | Toggle theme |
| `H` | Toggle password visibility |
| `/` | Focus search |
| `?` | Show help modal |
| `Esc` | Close modal |

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Gemini API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/securepass-studio.git
cd securepass-studio
```

2. Open `index.html` in your browser, or serve with a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. (Optional) Add your Gemini API key in `script.js` for AI features:
```javascript
const GEMINI_API_KEY = 'your-api-key-here';
```

## 📁 Project Structure

```
securepass-studio/
├── index.html      # Main HTML structure
├── main.css        # Styles and theming
├── script.js       # Application logic
└── README.md       # Documentation
```

## 🔧 Configuration

### Gemini API Setup
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Replace the API key in `script.js`

### Theme Customization
Modify CSS variables in `main.css`:
```css
:root {
  --accent: #c45d35;      /* Primary accent color */
  --success: #4a9d5b;     /* Success state */
  --warning: #c98a2e;     /* Warning state */
  --error: #c94a4a;       /* Error state */
}
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No dependencies
- **Google Gemini API** - AI password generation
- **LocalStorage** - Data persistence

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 👥 Authors

- **Harsh Saini**
- **Aditya Chauhan**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Fonts](https://fonts.google.com/) - Inter font family
- [Google Gemini](https://ai.google.dev/) - AI capabilities
