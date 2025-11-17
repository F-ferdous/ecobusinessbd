# 🌱 EcoBusiness

A modern Next.js application built for sustainable businesses, featuring Firebase integration and beautiful Tailwind CSS styling.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Firebase** - Backend-as-a-Service (Auth, Firestore, Storage)
- **Firebase Tools** - Development and deployment tools

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage in your Firebase project
3. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Firebase Analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
├── hooks/             # Custom React hooks
│   └── useAuth.ts     # Firebase authentication hook
├── lib/               # Utility libraries
│   ├── firebase.ts    # Firebase client configuration
│   └── firebase-admin.ts # Firebase Admin SDK
├── types/             # TypeScript type definitions
│   └── index.ts      # Common types
└── utils/            # Utility functions
    └── index.ts      # Common utility functions
```

## 🔥 Firebase Services

### Authentication
- Email/password authentication
- User profile management
- Password reset functionality

### Firestore Database
- User profiles collection
- Real-time data synchronization
- Secure data access rules

### Storage
- File upload capabilities
- Secure file access
- Image optimization

## 🎨 Styling

This project uses Tailwind CSS v4 with:
- Responsive design principles
- Modern color palette focused on sustainability (greens and blues)
- Component-based styling
- Dark mode support ready

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Firebase Emulator (Optional)

For local development with Firebase emulators:

```bash
# Install Firebase CLI globally if not already installed
npm install -g firebase-tools

# Initialize Firebase in your project
firebase init

# Start emulators
firebase emulators:start
```

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌍 About EcoBusiness

EcoBusiness is designed to connect sustainable businesses and promote eco-friendly practices. Our mission is to build a platform where environmentally conscious companies can collaborate, share innovations, and track their positive impact on the planet.

---

Built with 💚 for a sustainable future.
