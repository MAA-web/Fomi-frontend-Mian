# FOMI - Figment of My Imagination

A modern, interactive AI-powered creative platform built with Next.js 15, React 19, and Tailwind CSS. FOMI provides a comprehensive suite of AI tools for image generation, video creation, editing, and more.

## 🚀 Features

### Core AI Tools
- **Image Generation** - Create stunning images with AI prompts
- **Video Generation** - Generate videos from text descriptions
- **Image Editing** - Advanced image editing and manipulation
- **Inpainting** - Seamless image restoration and modification
- **Canvas Drawing** - Interactive drawing and creation tools
- **Model Training** - Train custom AI models with your data
- **Image Enhancement** - Upscale and improve image quality

### Interactive Homepage
- **Expandable Hero Section** - Dynamic center image that expands to reveal additional features
- **Animated Action Buttons** - Smooth hover animations with Lottie icons
- **Collage Gallery** - Scattered image collage around the hero image
- **Responsive Design** - Optimized for all device sizes
- **Smooth Transitions** - Elegant animations and micro-interactions

### User Experience
- **Modern UI/UX** - Clean, intuitive interface with beautiful animations
- **Navigation Dock** - Floating dock with quick access to all tools
- **User Authentication** - Firebase-powered authentication system
- **Profile Management** - User profiles and settings
- **Gallery System** - Browse and manage generated content

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **CSS Modules** - Scoped styling for components
- **Lucide React** - Beautiful icon library
- **Lottie Animations** - Smooth animated icons

### Animation & Effects
- **Framer Motion** - Advanced animations
- **TSParticles** - Particle effects and backgrounds
- **TW Animate CSS** - Tailwind animation utilities

### Backend & Services
- **Firebase** - Authentication and backend services
- **Firebase Auth** - User authentication system

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Class Variance Authority** - Component variant management

## 📁 Project Structure

```
fomi-frontend/
├── public/                    # Static assets
│   ├── collage/              # Hero collage images
│   ├── gallery/              # Gallery images
│   ├── icons/                # Lottie animations and icons
│   └── marque/               # Marquee images
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── ImageGen/         # Image generation page
│   │   ├── video/            # Video generation page
│   │   ├── edit/             # Image editing page
│   │   ├── inpaint/          # Inpainting page
│   │   ├── canvas/           # Canvas drawing page
│   │   ├── train/            # Model training page
│   │   ├── Enhance/          # Image enhancement page
│   │   ├── gallery/          # Gallery page
│   │   ├── auth/             # Authentication pages
│   │   ├── profile/          # User profile page
│   │   ├── settings/         # Settings page
│   │   ├── pricing/          # Pricing page
│   │   ├── page.jsx          # Homepage
│   │   ├── layout.js         # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── homepage.module.css # Homepage styles
│   ├── components/           # Reusable components
│   │   ├── layout/           # Layout components
│   │   │   └── Header.jsx    # Navigation header
│   │   ├── pages/            # Page-specific components
│   │   │   ├── homepage/     # Homepage components
│   │   │   ├── ImageGen/     # Image generation components
│   │   │   ├── video/        # Video components
│   │   │   ├── edit/         # Editing components
│   │   │   ├── inpaint/      # Inpainting components
│   │   │   └── canvas/       # Canvas components
│   │   ├── ui/               # UI components
│   │   │   ├── dock.jsx      # Navigation dock
│   │   │   ├── sparkles.jsx  # Sparkle effects
│   │   │   └── compare.jsx   # Comparison component
│   │   └── animate-ui/       # Animation components
│   └── lib/                  # Utility libraries
│       ├── firebase.js       # Firebase configuration
│       ├── utils.js          # Utility functions
│       └── ThemeContext.js   # Theme management
├── package.json              # Dependencies and scripts
├── next.config.mjs          # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── components.json          # Component configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Durrani123/fomi-frontend.git
   cd fomi-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Key Components

### Homepage (`src/app/page.jsx`)
The main landing page featuring:
- Interactive hero section with expandable functionality
- Animated action buttons with Lottie icons
- Scattered collage images around the hero
- Smooth scroll animations
- Responsive grid layout

### Header (`src/components/layout/Header.jsx`)
Navigation component with:
- Floating dock navigation
- User authentication menu
- Quick access to all AI tools
- Responsive design

### Image Generation (`src/app/ImageGen/`)
Complete image generation workflow:
- Prompt input controls
- Image preview and generation
- Batch processing capabilities
- Advanced settings

### Model Training (`src/app/train/`)
Custom model training interface:
- Image upload and management
- Training parameter controls
- Model selection and configuration
- Progress tracking

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS 4 with custom configuration for:
- Custom color palette
- Animation utilities
- Responsive breakpoints
- Component variants

### Firebase Setup
Firebase is configured for:
- User authentication
- Real-time database (if needed)
- File storage (if needed)

### Theme System
Ready for dark/light theme implementation with:
- CSS custom properties
- Theme context provider
- Smooth transitions

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Tablet optimizations
- Desktop enhancements
- Touch-friendly interactions

## 🎯 Performance Optimizations

- **Next.js Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic route-based code splitting
- **Lazy Loading** - Components and images loaded on demand
- **CSS Optimization** - Purged unused styles in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library
- **Framer Motion** - For the smooth animations

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**FOMI** - Where imagination meets AI technology. 🚀✨
