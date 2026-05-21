# Company Tracker PWA

A clean, high-performance Progressive Web App (PWA) to track companies, job searches, and application meta-information. Built with pure HTML, CSS, and vanilla JavaScript.

## 🚀 Features

- **PWA Ready**: Installable on iOS, Android, and Desktop as a standalone application.
- **Offline Support**: Works without an internet connection using Service Workers.
- **Local Persistence**: All data is stored securely in your browser's `localStorage`.
- **Zero Dependencies**: No frameworks or build steps required.

## 🛠 Tech Stack

- **HTML5**: Semantic structure.
- **CSS3**: Modern layout with custom properties, gradients, and backdrop filters.
- **Vanilla JS (ES Modules)**: Lightweight state management and UI logic.
- **Web App Manifest**: For OS integration and PWA capabilities.
- **Service Workers**: For asset caching and offline reliability.

## 🖥 Local Development

To run this project locally without a dedicated server, you can use any static host:

```bash
# Using Python
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## 📂 Project Structure

- `index.html`: Main application shell.
- `styles.css`: UI styling and responsive design.
- `app.js`: Data logic and DOM orchestration.
- `sw.js`: Service worker for caching and offline support.
- `manifest.json`: PWA configuration and icons.
- `icon.svg`: Vector application icon.

---
*Created by [Fedor Ivachev](https://fedorivachev.github.io)*
