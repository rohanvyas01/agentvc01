# AgentVC - Frontend Only

A React-based frontend application for AgentVC, the world's first AI investor that helps founders practice their pitch and raise capital faster.

## 🚀 Features

- **Landing Page**: Beautiful, responsive landing page showcasing AgentVC
- **PDF Processing**: Upload and analyze pitch decks with text extraction and OCR
- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and Framer Motion
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **PDF Processing**: PDF.js + Tesseract.js for text extraction and OCR
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentvc-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AudioRecorder.tsx
│   ├── AuthModal.tsx
│   ├── Header.tsx
│   ├── PitchDeckViewer.tsx
│   └── VideoPlayer.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Library configurations
│   └── supabase.ts
├── pages/             # Page components
│   └── LandingPage.tsx
├── services/          # API and service layers
│   ├── api.ts
│   ├── pdfParser.ts
│   └── supabaseService.ts
├── App.tsx            # Main app component
├── main.tsx          # App entry point
└── index.css         # Global styles
```

## 🎨 Design System

The application uses a custom design system with:

- **Colors**: Indigo, purple, and cyan gradients with dark theme
- **Typography**: Inter font family with multiple weights
- **Components**: Glass morphism effects and smooth animations
- **Spacing**: 8px grid system
- **Responsive**: Mobile-first approach with breakpoints

## 📱 Features

### Landing Page
- Hero section with video introduction
- Problem/solution presentation
- Feature showcase
- Responsive design
- Call-to-action sections

### PDF Processing
- Upload pitch deck PDFs
- Text extraction using PDF.js
- OCR fallback with Tesseract.js
- Comprehensive content analysis
- Page-by-page viewing

### UI Components
- Audio recorder with playback
- Video player with custom controls
- Modal dialogs with multi-step forms
- Animated transitions and micro-interactions

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_APP_ENV=development
VITE_APP_NAME=AgentVC
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 🔮 Future Backend Integration

The frontend is prepared for backend integration with placeholder services:

- **Authentication**: User signup/login system
- **Database**: User profiles and pitch deck storage
- **AI Processing**: Pitch analysis and feedback
- **File Storage**: Secure pitch deck storage

All backend-dependent features currently show "Backend not implemented yet" messages and are ready for integration when the backend is available.

## 📄 License

This project is proprietary software for AgentVC.

## 🤝 Contributing

This is a private project. Please contact the development team for contribution guidelines.