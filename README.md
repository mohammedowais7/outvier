# Outvier Platform - Personal Development & Mentorship Platform

A comprehensive personal development platform that connects mentors with mentees, facilitates goal tracking, and enables collaborative learning through intelligent matching and group creation.

## 🚀 Features

### Core Features
- **Goal Management**: Create, track, and complete personal and professional goals
- **Mentor-Mentee Matching**: AI-powered matching based on skills, goals, and interests
- **Group Collaboration**: Create and manage learning groups based on shared goals
- **Event Management**: Host and attend virtual events with Zoom integration
- **Progress Tracking**: Comprehensive analytics and insights
- **Email Notifications**: Automated reminders and progress updates

### Advanced Features
- **Intelligent Matching**: Algorithm-based user matching for collaboration
- **Mentor Events**: Create events with Zoom links and participant management
- **Group Activities**: Track group meetings, discussions, and milestones
- **Email System**: Professional email templates and delivery tracking
- **Mobile App**: React Native app for iOS and Android
- **AWS Deployment**: Production-ready cloud deployment

## 📱 Mobile Apps

### Android APK Deployment
The Android app is built using React Native and can be deployed as an APK for distribution.

### iOS App Deployment
The iOS app is built using React Native and can be deployed to the App Store.

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **Redis** - Caching and task queue
- **Celery** - Background task processing
- **AWS S3** - File storage
- **AWS SES** - Email delivery
- **Docker** - Containerization

### Frontend (Mobile)
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Redux** - State management

### Infrastructure
- **AWS EC2** - Server hosting
- **AWS RDS** - Database hosting
- **AWS ElastiCache** - Redis hosting
- **AWS S3** - File storage
- **AWS CloudFront** - CDN
- **Nginx** - Load balancer

## 📋 Prerequisites

### Development Environment
- Python 3.11+
- Node.js 18+
- React Native CLI
- Expo CLI
- Docker (for containerization)
- PostgreSQL 15+
- Redis 7+

### Production Environment
- AWS Account
- Domain name
- SSL certificates
- App Store Developer Account (for iOS)
- Google Play Console Account (for Android)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DNC-Project-9-30-25
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.production.example .env

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Mobile App Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## 📦 Deployment

### Backend Deployment (AWS)

#### 1. Prepare Environment
```bash
# Copy production environment file
cp env.production.example .env.production

# Edit environment variables
nano .env.production
```

#### 2. Deploy with Docker
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

#### 3. Manual Deployment Steps
```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Run migrations
docker-compose -f docker-compose.production.yml exec web python manage.py migrate

# Collect static files
docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput
```

### Android APK Deployment

#### 1. Build APK
```bash
cd frontend

# Install dependencies
npm install

# Build for Android
npx expo build:android

# Or build locally
npx expo run:android --variant release
```

#### 2. Generate Signed APK
```bash
# Generate keystore
keytool -genkey -v -keystore outvier-release-key.keystore -alias outvier -keyalg RSA -keysize 2048 -validity 10000

# Build signed APK
npx expo build:android --type apk
```

#### 3. Distribute APK
- Upload to Google Play Console
- Or distribute directly via APK file
- Use Firebase App Distribution for testing

### iOS App Deployment

#### 1. Build for iOS
```bash
cd frontend

# Install dependencies
npm install

# Build for iOS
npx expo build:ios

# Or build locally
npx expo run:ios --configuration Release
```

#### 2. App Store Deployment
```bash
# Build for App Store
npx expo build:ios --type archive

# Upload to App Store Connect
# Use Xcode or Application Loader
```

#### 3. TestFlight Distribution
```bash
# Build for TestFlight
npx expo build:ios --type simulator

# Upload to TestFlight for beta testing
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env.production)
```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=False
DEPLOYMENT_ENV=production

# Database
DB_NAME=outvier_production
DB_USER=outvier_user
DB_PASSWORD=your-db-password
DB_HOST=your-rds-endpoint

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=outvier-platform

# Email Configuration
EMAIL_HOST_USER=your-ses-key
EMAIL_HOST_PASSWORD=your-ses-secret

# Redis
REDIS_URL=redis://your-redis-endpoint:6379/1
```

#### Mobile App (app.json)
```json
{
  "expo": {
    "name": "Outvier",
    "slug": "outvier",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.outvier.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.outvier.app"
    }
  }
}
```

## 📊 API Documentation

### Base URL
- **Development**: `http://localhost:8000/api/`
- **Production**: `https://api.outvier.com/api/`

### Key Endpoints

#### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

#### Goals
- `GET /api/goals/` - List user goals
- `POST /api/goals/` - Create goal
- `PUT /api/goals/{id}/` - Update goal
- `POST /api/goals/{id}/update_progress/` - Update goal progress

#### Mentor Events
- `GET /api/mentor-events/` - List mentor events
- `POST /api/mentor-events/` - Create mentor event
- `POST /api/mentor-events/{id}/register/` - Register for event

#### User Groups
- `GET /api/user-groups/` - List user groups
- `POST /api/user-groups/` - Create user group
- `POST /api/user-groups/{id}/join_group/` - Join group

#### Matching
- `POST /api/user-matching/find_matches/` - Find potential matches
- `POST /api/user-matching/create_group_from_event/` - Create group from event

## 🧪 Testing

### Backend Testing
```bash
# Run tests
python manage.py test

# Run specific app tests
python manage.py test apps.outvier

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Mobile App Testing
```bash
cd frontend

# Run testsaa
npm test

# Run on Android emulator
npx expo run:android

# Run on iOS simulator
npx expo run:ios
```

## 📈 Monitoring

### Application Monitoring
- **Health Check**: `https://api.outvier.com/health/`
- **Admin Panel**: `https://api.outvier.com/admin/`
- **API Documentation**: `https://api.outvier.com/api/docs/`

### Logs
```bash
# View application logs
docker-compose -f docker-compose.production.yml logs web

# View Celery logs
docker-compose -f docker-compose.production.yml logs celery

# View database logs
docker-compose -f docker-compose.production.yml logs db
```

## 🔒 Security

### Production Security
- SSL/TLS encryption
- CSRF protection
- XSS protection
- SQL injection prevention
- Rate limiting
- Secure headers

### API Security
- JWT authentication
- API key authentication
- Request validation
- Input sanitization

## 📱 Mobile App Features

### Core Features
- **User Authentication**: Login/register with email
- **Goal Management**: Create, track, and complete goals
- **Progress Tracking**: Visual progress indicators
- **Event Participation**: Join mentor events
- **Group Collaboration**: Participate in learning groups
- **Notifications**: Push notifications for updates

### Advanced Features
- **Offline Support**: Work offline with sync
- **Dark Mode**: Theme customization
- **Biometric Auth**: Fingerprint/Face ID login
- **Deep Linking**: Direct navigation to content
- **Push Notifications**: Real-time updates

## 🚀 Performance Optimization

### Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- CDN integration
- Load balancing

### Mobile App Optimization
- Image optimization
- Lazy loading
- Code splitting
- Bundle optimization
- Performance monitoring

## 📞 Support

### Documentation
- **API Docs**: `/api/docs/`
- **Admin Guide**: `/admin/`
- **Mobile App Guide**: Available in app

### Contact
- **Email**: support@outvier.com
- **GitHub Issues**: [Repository Issues]
- **Documentation**: [Project Wiki]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 Changelog

### Version 1.0.0
- Initial release
- Goal management system
- Mentor-mentee matching
- Group collaboration
- Email notifications
- Mobile app (iOS/Android)
- AWS deployment

## 🎯 Roadmap

### Version 1.1.0
- Advanced analytics
- Video call integration
- AI-powered insights
- Enhanced matching algorithm

### Version 1.2.0
- Mobile app improvements
- Offline functionality
- Push notifications
- Performance optimizations

---

**Built with ❤️ for personal development and mentorship**
