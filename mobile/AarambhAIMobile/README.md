# AARAMBH AI Mobile

A comprehensive educational platform designed specifically for Indian students, providing AI-powered learning assistance, real-time tutoring, and offline capabilities.

## 🚀 Features

### Core Features
- **AI-Powered Learning**: Multiple AI agents for different learning needs
- **Offline Functionality**: Complete offline mode with data synchronization
- **Real-time Collaboration**: Study sessions with real-time chat and collaboration
- **Comprehensive Assessment**: AI-generated assessments and detailed analytics
- **Push Notifications**: Smart reminders and learning notifications

### AI Agents
- **AI Tutor**: Interactive chat-based tutoring
- **AI Content Creator**: Generate study materials and lesson plans
- **AI Assessment Generator**: Create custom quizzes and tests
- **AI Doubt Solver**: Instant problem-solving assistance
- **AI Study Planner**: Personalized study schedules
- **AI Mentor**: Career guidance and counseling
- **AI Analytics**: Learning insights and performance tracking

### Technical Features
- **Performance Optimized**: React.memo, lazy loading, and virtualization
- **Memory Management**: Intelligent caching and cleanup
- **Bundle Splitting**: Code splitting for optimal loading
- **Image Optimization**: Smart image caching and compression
- **Real-time Updates**: Socket.IO-based real-time features

## 📱 Platforms

- **iOS**: iOS 13.0+
- **Android**: API Level 21+
- **Web**: Modern browsers (development/testing)

## 🛠 Technology Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **Expo**: Development platform and build tools
- **React Navigation**: Navigation library

### State Management
- **React Hooks**: Modern state management
- **Context API**: Global state management
- **AsyncStorage**: Local data persistence

### Backend Integration
- **REST API**: Backend service communication
- **Socket.IO**: Real-time features
- **Offline Support**: Data synchronization

### Performance & Optimization
- **React.memo**: Component optimization
- **Lazy Loading**: Code splitting and lazy imports
- **Virtualization**: Efficient list rendering
- **Image Caching**: Smart image management
- **Bundle Optimization**: Code splitting and tree shaking

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (for building)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile/AarambhAIMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

4. **Install EAS CLI** (for building)
   ```bash
   npm install -g @expo/eas-cli
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## 🚀 Development

### Running the App

#### Development Mode
```bash
npm start
# or
npx expo start
```

#### Platform-specific
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Building the App

#### Using Build Scripts
```bash
# Development build
./scripts/build.sh dev

# Production build
./scripts/build.sh production

# Platform-specific builds
./scripts/build.sh ios
./scripts/build.sh android
```

#### Using EAS Build
```bash
# Development build
eas build --profile development

# Production build
eas build --profile production

# Platform-specific
eas build --platform ios --profile production
eas build --platform android --profile production
```

## 📱 Deployment

### Using Deployment Script
```bash
# Deploy to both app stores
./scripts/deploy.sh stores

# Deploy to iOS App Store
./scripts/deploy.sh ios

# Deploy to Google Play Store
./scripts/deploy.sh android

# Deploy OTA update
./scripts/deploy.sh update

# Internal distribution
./scripts/deploy.sh internal
```

### Manual Deployment
```bash
# Submit to app stores
eas submit --platform all

# Publish OTA update
eas update --auto
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Testing
```bash
npm run test:performance
```

## 📊 Performance Optimization

### Built-in Optimizations
- **Component Memoization**: React.memo for component optimization
- **Lazy Loading**: Screen and component lazy loading
- **Virtualization**: FlatList and VirtualizedList for large datasets
- **Image Optimization**: Smart caching and compression
- **Bundle Splitting**: Code splitting and lazy imports
- **Memory Management**: Automatic cleanup and optimization

### Performance Monitoring
- **Performance Dashboard**: Built-in performance monitoring
- **Memory Monitor**: Real-time memory usage tracking
- **Bundle Analysis**: Bundle size and optimization metrics
- **Component Profiling**: Render time and performance tracking

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── optimized/      # Performance-optimized components
│   └── realtime/       # Real-time specific components
├── screens/            # Screen components
│   ├── ai/            # AI agent screens
│   ├── auth/          # Authentication screens
│   └── ...
├── services/          # API and service modules
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── constants/         # App constants
├── types/             # TypeScript type definitions
└── navigation/        # Navigation configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=https://api.aarambhai.com
EXPO_PUBLIC_SOCKET_URL=wss://api.aarambhai.com
EXPO_PUBLIC_ENV=development
```

### App Configuration
- **app.json**: Expo configuration
- **eas.json**: EAS Build configuration
- **package.json**: Dependencies and scripts

## 📚 Key Components

### AI Agents
- **AITutorScreen**: Interactive AI tutoring
- **AIContentScreen**: Content generation
- **AIAssessmentScreen**: Assessment creation
- **AIDoubtScreen**: Problem solving
- **AIPlannerScreen**: Study planning
- **AIMentorScreen**: Career guidance
- **AIAnalyticsScreen**: Learning analytics

### Performance Components
- **OptimizedFlatList**: Virtualized list component
- **OptimizedImage**: Smart image loading
- **OptimizedAnimations**: Gesture-optimized animations
- **LazyLoader**: Component lazy loading
- **MemoryMonitor**: Memory usage tracking

### Offline Features
- **OfflineStorage**: Local data management
- **OfflineSync**: Data synchronization
- **OfflineIndicator**: Connection status
- **CacheManager**: Content caching

## 🔐 Security

### Data Protection
- **Secure Storage**: Encrypted local storage
- **API Security**: Token-based authentication
- **Data Encryption**: End-to-end encryption
- **Privacy Controls**: User privacy settings

### Best Practices
- No sensitive data in source code
- Secure API communication
- Regular security updates
- User data protection

## 📈 Analytics and Monitoring

### Performance Metrics
- Component render times
- Memory usage
- Network performance
- User interactions
- App crashes and errors

### User Analytics
- Learning progress
- Feature usage
- Performance insights
- User behavior

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use performance optimization techniques
3. Write comprehensive tests
4. Document your code
5. Follow the existing code style

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use performance optimization patterns
- Maintain consistent formatting

## 🐛 Troubleshooting

### Common Issues

#### Build Issues
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start --clear
```

#### Performance Issues
- Check memory usage with MemoryMonitor
- Use Performance Dashboard for insights
- Optimize images and assets
- Review component render times

#### Offline Issues
- Check network connectivity
- Verify offline storage
- Test data synchronization
- Review cache management

## 📞 Support

For technical support and questions:
- Email: support@aarambhai.com
- Documentation: [Link to documentation]
- Issues: [Link to issue tracker]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Native team for the amazing framework
- Expo team for the development platform
- Open source community for invaluable contributions
- Indian education system for inspiration and guidance

---

**AARAMBH AI Mobile** - Empowering Indian students with AI-powered learning 🚀