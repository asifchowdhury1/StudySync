# StudyTracker - Comprehensive Study Session Analytics

## 📖 App Description and Purpose

StudyTracker is a full-stack web application designed to help students monitor their study habits, track time across different subjects, and gain insights through interactive data visualizations. The application serves as a comprehensive study analytics platform that enables users to:

- **Track Study Sessions**: Record detailed study sessions with timing, subjects, methods, and personal ratings
- **Visualize Progress**: View interactive charts and graphs of study patterns and trends
- **Set and Monitor Goals**: Establish daily and weekly study targets with progress tracking
- **Analyze Performance**: Identify peak productivity times, effective study methods, and subject focus areas
- **Manage Academic Subjects**: Organize studies by courses with custom colors and individual goal setting

This project demonstrates modern full-stack web development practices while providing a practical tool for academic success. Built with React, Node.js, Express, MongoDB, and D3.js, it showcases comprehensive implementation of contemporary web technologies.

## ✨ Features with Screenshots

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Study Session Tracking**: Real-time session timing with detailed metadata
- **Subject Management**: Organize studies by academic subjects with custom colors and goals
- **Analytics Dashboard**: Interactive visualizations and progress tracking
- **Goal Setting**: Personal daily/weekly study time targets with progress monitoring

![Dashboard Screenshot](screenshots/dashboard.png)
*Main dashboard showing study progress, goals, and today's sessions*

### Advanced Features
- **Interactive D3.js Visualizations**: Time series charts, pie charts, and analytics graphs
- **Responsive Design**: Mobile-first design with Material-UI components
- **Real-time Session Timer**: Start/stop study sessions with automatic logging
- **Comprehensive Analytics**: Study patterns, effectiveness metrics, and insights
- **Data Export**: Session summaries and progress reports

![Analytics Screenshot](screenshots/analytics.png)
*Advanced analytics page with D3.js visualizations and study pattern analysis*

![Sessions Screenshot](screenshots/sessions.png)
*Session management interface with real-time timer and detailed logging*

![Subjects Screenshot](screenshots/subjects.png)
*Subject management with progress tracking and color-coded organization*

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with functional components and hooks
- **UI Library**: Material-UI (MUI) for consistent, accessible components
- **Routing**: React Router v6 for client-side navigation
- **State Management**: Context API with useReducer for complex state
- **Data Visualization**: D3.js for interactive charts and graphs
- **Forms**: React Hook Form for efficient form handling
- **HTTP Client**: Axios for API communication

### Backend (Node.js/Express)
- **Framework**: Express.js with RESTful API design
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Express-validator for input sanitization
- **Security**: CORS protection and input validation
- **API Documentation**: Comprehensive endpoint documentation

## 🔧 Technology Stack Used

### Frontend Technologies
- **React 18.2.0** - Modern JavaScript framework with hooks and functional components
- **Material-UI (MUI) 5.14.0** - Comprehensive React component library for consistent UI design
- **D3.js 7.8.0** - Data visualization library for interactive charts and graphs
- **React Router DOM 6.8.1** - Client-side routing for single-page application navigation
- **React Hook Form 7.45.0** - Performant form library with minimal re-renders

### Backend Technologies
- **Node.js with Express 4.18.2** - JavaScript runtime and web framework for RESTful API
- **CORS 2.8.5** - Cross-origin resource sharing configuration
- **Mock Data System** - Simulated backend responses for demonstration purposes

### Development & Build Tools
- **Nodemon** - Automatic server restart during development
- **ESLint** - JavaScript code quality and consistency checking
- **Create React App** - Build toolchain and development server

## 📋 Course Topics Demonstrated

This project comprehensively demonstrates all required CS3744 course topics:

### 1. Thinking in React
- **Component Hierarchy**: Clear separation between presentational and container components
- **Data Flow**: Unidirectional data flow with props and state management
- **Component Design**: Reusable components (StatCard, LoadingSpinner, D3Charts)

### 2. Event Handling
- **Form Submissions**: Login, registration, session creation with validation
- **User Interactions**: Button clicks, form inputs, modal dialogs
- **Advanced Events**: D3.js chart interactions, hover effects, tooltips

### 3. State Management
- **useState**: Local component state for UI interactions
- **useReducer**: Complex state management for sessions and subjects
- **Context API**: Global authentication state with AuthContext
- **Custom Hooks**: useApi, useLocalStorage for reusable logic

### 4. Component Design Patterns
- **Container/Presenter**: Separation of logic and presentation
- **Higher-Order Components**: Authentication wrapper patterns
- **Compound Components**: Dialog components with multiple parts
- **Render Props**: Flexible component composition

### 5. React Router
- **Routing Setup**: BrowserRouter with nested routes
- **Protected Routes**: Authentication-based route protection
- **Navigation**: Programmatic navigation with useNavigate
- **Route Parameters**: Dynamic routing for sessions and subjects

### 6. Data Fetching & Integration
- **API Integration**: Custom hooks for data fetching
- **Loading States**: Comprehensive loading and error handling
- **CRUD Operations**: Create, read, update, delete functionality
- **Real-time Updates**: Optimistic updates and cache invalidation

## 🎨 D3.js Visualizations

### Interactive Time Series Chart
- **Line Chart**: Study time trends over daily/weekly/monthly periods
- **Area Chart**: Filled area visualization for better trend visibility
- **Tooltips**: Hover interactions showing detailed session information
- **Responsive Design**: Adapts to container size with proper margins

### Subject Distribution Pie Chart
- **Dynamic Colors**: Subject-specific colors for visual consistency
- **Interactive Elements**: Hover effects with data highlighting
- **Legend**: Dynamic legend showing subject names and percentages
- **Animations**: Smooth transitions and hover animations

### Analytics Features
- **Pattern Recognition**: Study method and location effectiveness
- **Progress Tracking**: Goal achievement visualization
- **Comparative Analysis**: Subject performance comparisons

## 🚀 Installation and Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas) - [Installation Guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/studytracker.git
cd studytracker
```

### Step 2: Backend Setup
1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/studytracker
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   ✅ Backend server will start on http://localhost:5000

### Step 3: Frontend Setup
1. **Open a new terminal and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm start
   ```
   ✅ Application will automatically open at http://localhost:3000

### Step 4: Verify Installation
1. Open http://localhost:3000 in your browser
2. The application will load directly to the Dashboard
3. Navigate between pages to explore all features!

> **Note**: Both backend and frontend servers must be running simultaneously for full functionality. The application uses mock data for demonstration purposes, so no database setup is required.

## 📱 Usage Guide

### Application Overview
The StudyTracker application demonstrates a comprehensive study analytics platform with sample data pre-loaded for demonstration purposes.

### Navigation & Features
1. **Dashboard**: Overview of study statistics with interactive D3.js visualizations
2. **Sessions**: Study session management with detailed tracking capabilities
3. **Subjects**: Subject organization with progress monitoring and color coding
4. **Analytics**: Advanced analytics with time series charts and pattern analysis

### Interactive Elements
- **D3.js Charts**: Hover over data points for detailed tooltips and interactions
- **Responsive Design**: Test the interface on different screen sizes
- **Material-UI Components**: Consistent design language throughout the application
- **Real-time Updates**: All interactions demonstrate state management patterns

## 🎥 Demo Video

**Video Duration: 1-2 minutes**

[Demo Video Placeholder - Video will be uploaded to this location]

*The demo video showcases the complete StudyTracker application functionality including user authentication, session tracking, subject management, and interactive D3.js visualizations. The video demonstrates all core features and highlights the responsive design across different screen sizes.*

**Video Content Overview:**
- User registration and authentication
- Dashboard with real-time analytics
- Study session creation and management
- Interactive D3.js charts and visualizations
- Subject management with progress tracking
- Mobile responsiveness demonstration

## 🔐 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/me - Get current user
PUT /api/auth/goals - Update study goals
```

### Session Management
```
GET /api/sessions - List sessions with pagination
POST /api/sessions - Create new session
GET /api/sessions/:id - Get specific session
PUT /api/sessions/:id - Update session
DELETE /api/sessions/:id - Delete session
GET /api/sessions/summary/today - Today's summary
```

### Subject Management
```
GET /api/subjects - List all subjects
POST /api/subjects - Create new subject
GET /api/subjects/:id - Get specific subject
PUT /api/subjects/:id - Update subject
DELETE /api/subjects/:id - Delete subject
GET /api/subjects/:id/sessions - Get subject sessions
```

### Analytics Endpoints
```
GET /api/analytics/dashboard - Dashboard statistics
GET /api/analytics/time-series - Time series data
GET /api/analytics/subjects - Subject analytics
GET /api/analytics/patterns - Study pattern analysis
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end workflow tests

## 🔮 Future Development Roadmap

### Phase 1: Enhanced Analytics (Q1 2024)
- **Study Streak Tracking**: Daily/weekly study streak counters with gamification
- **Advanced Pattern Recognition**: Machine learning insights for optimal study times
- **Comparative Analytics**: Compare performance with anonymized peer data
- **Export Functionality**: PDF reports and CSV data export for academic advisors

### Phase 2: Collaboration Features (Q2 2024)
- **Study Groups**: Create and join collaborative study sessions
- **Shared Subjects**: Group study tracking for team projects
- **Peer Progress Sharing**: Optional progress sharing with study partners
- **Study Challenges**: Competitive elements to motivate consistent studying

### Phase 3: Integration & Automation (Q3 2024)
- **Calendar Integration**: Sync with Google Calendar, Outlook, and Canvas
- **Mobile Application**: React Native app for iOS and Android
- **Smart Reminders**: AI-powered study session reminders based on patterns
- **LMS Integration**: Direct integration with learning management systems

### Phase 4: Advanced Intelligence (Q4 2024)
- **Predictive Analytics**: Forecast exam readiness based on study patterns
- **Personalized Recommendations**: Custom study schedules and method suggestions
- **Voice Commands**: Voice activation for hands-free session tracking
- **Wearable Integration**: Apple Watch and Fitbit integration for automatic tracking

## 📞 Contact Information

**Developer**: Asif Chowdhury  
**Email**: [asifc@vt.edu](mailto:asifc@vt.edu)  
**Institution**: Virginia Tech - Computer Science Department  
**Course**: CS3744 - GUI Design and Web Programming  

### Project Repository
- **GitHub**: [StudyTracker Repository](https://github.com/yourusername/studytracker)
- **Live Demo**: [Coming Soon - Deployment Link]

### Support & Feedback
For questions, bug reports, or feature requests:
1. **Email**: asifc@vt.edu
2. **GitHub Issues**: Create an issue in the project repository
3. **Course Forum**: Post in the CS3744 course discussion board

---

**Acknowledgments**
- Virginia Tech CS3744 Course Staff for guidance and support
- Material-UI team for excellent React components and design system
- D3.js community for powerful data visualization capabilities

**Note**: This project was developed as part of CS3744 coursework at Virginia Tech, demonstrating comprehensive full-stack web development skills, modern React patterns, and professional software engineering practices.
