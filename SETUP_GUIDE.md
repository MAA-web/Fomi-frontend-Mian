# FOMI Frontend Setup Guide

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   ```
   http://localhost:3000
   ```

## 🔧 API Configuration

The frontend is configured to connect to the real backend API at `https://api.tarum.ai`.

### Backend Endpoints

The application uses the following service endpoints:
- **Authentication Service:** `https://api.tarum.ai/user-service/auth/*`
- **Image Generation:** `https://api.tarum.ai/image-service/*`
- **Video Generation:** `https://api.tarum.ai/video-service/*`
- **Enhancement:** `https://api.tarum.ai/enhance-service/*`
- **Inpainting:** `https://api.tarum.ai/inpaint-service/*`
- **Canvas:** `https://api.tarum.ai/canvas-service/*`
- **Training:** `https://api.tarum.ai/train-service/*`

### Environment Configuration

1. **Create a `.env.local` file in the root directory:**
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_BASE_URL=https://api.tarum.ai
   
   # Other environment variables
   NEXT_PUBLIC_APP_NAME=FOMI
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

2. **Restart the development server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Manual Testing
- Navigate to `http://localhost:3000/testing`
- Use the interactive AuthTester component
- Test all authentication flows with real-time feedback

### Automated Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
fomi-frontend/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # React components
│   │   ├── layout/            # Layout components (Header, etc.)
│   │   ├── pages/             # Page-specific components
│   │   ├── testing/           # Testing components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── api/               # API layer
│   │   │   ├── client.js      # Base API client
│   │   │   ├── auth.js        # Authentication API service
│   │   │   └── images.js      # Image generation API service
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state management
│   │   └── utils.js           # Utility functions
│   └── types/                 # Type definitions
├── public/                    # Static assets
└── package.json
```

## 🔐 Authentication Flow

1. **Registration:** User creates account with email/password
2. **Google OAuth:** User logs in with Google account
3. **Token Management:** JWT tokens are automatically refreshed
4. **Profile Management:** Users can update their profile
5. **Credit System:** Credits are managed for AI generation features

## 🌐 API Endpoints

The frontend connects to these backend endpoints:

### Authentication Service (`/auth/*`)
- `POST /auth/register` - User registration
- `POST /auth/google/login` - Google OAuth login
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `DELETE /auth/profile` - Delete user account
- `POST /auth/{userId}/credits` - Add credits
- `GET /auth/health` - Health check

### Image Generation (`/image/*`)
- `POST /image/generate` - Generate images from text
- `GET /image/{id}` - Get generation status
- `GET /image/{id}/result` - Get generated image

### Video Generation (`/video/*`)
- `POST /video/generate` - Generate videos from text
- `GET /video/{id}` - Get generation status
- `GET /video/{id}/result` - Get generated video

### Other Services
- **Enhancement:** `/enhance/*` - Image enhancement
- **Inpainting:** `/inpaint/*` - Image inpainting
- **Canvas:** `/canvas/*` - Canvas drawing
- **Training:** `/train/*` - Model training

## 🛠️ Development

### Adding New API Services
1. Create a new service file in `src/lib/api/`
2. Extend the base `ApiClient` class
3. Add type definitions in `src/types/api.js`
4. Create corresponding hooks in `src/lib/hooks/`
5. Add tests in `src/lib/api/__tests__/`

### State Management
- **Zustand stores** in `src/lib/store/`
- **Custom hooks** in `src/lib/hooks/`
- **API services** in `src/lib/api/`

## 🚨 Troubleshooting

### NetworkError when attempting to fetch resource
This error occurs when the frontend cannot connect to the backend API. **Solutions:**
1. Check that your backend server is running
2. Verify the API URL in `.env.local` is correct
3. Check network connectivity and CORS settings
4. Ensure the backend endpoints are accessible

### Authentication issues
1. Check that JWT tokens are being sent correctly
2. Verify token refresh is working
3. Check backend authentication middleware
4. Review browser console for CORS errors

### Tests failing
1. Ensure all dependencies are installed: `npm install`
2. Check Jest configuration in `package.json`
3. Verify test files are in the correct location

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

---

**Need help?** Check the `TESTING_GUIDE.md` for detailed testing instructions or create an issue in the repository.
