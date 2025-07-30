# StudyTracker - Comprehensive Study Session Analytics

A full-stack web application for tracking study sessions, managing subjects, and visualizing learning analytics. Built with React, Node.js, Express, MongoDB, and D3.js.

## 🎯 Project Overview

StudyTracker helps students monitor their study habits, track time across different subjects, and gain insights through interactive data visualizations. The application demonstrates modern web development practices and comprehensive analytics features.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Study Session Tracking**: Real-time session timing with detailed metadata
- **Subject Management**: Organize studies by academic subjects with custom colors and goals
- **Analytics Dashboard**: Interactive visualizations and progress tracking
- **Goal Setting**: Personal daily/weekly study time targets with progress monitoring

### Advanced Features
- **Interactive D3.js Visualizations**: Time series charts, pie charts, and analytics graphs
- **Responsive Design**: Mobile-first design with Material-UI components
- **Real-time Session Timer**: Start/stop study sessions with automatic logging
- **Comprehensive Analytics**: Study patterns, effectiveness metrics, and insights
- **Data Export**: Session summaries and progress reports

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

## 🔧 Technologies Used

### Frontend Stack
- React 18.2.0
- Material-UI (MUI) 5.14.0
- D3.js 7.8.0
- React Router DOM 6.8.1
- React Hook Form 7.45.0
- Axios 1.4.0
- Date-fns 2.30.0

### Backend Stack
- Node.js with Express 4.18.2
- MongoDB with Mongoose 7.5.0
- JWT (jsonwebtoken) 9.0.2
- bcryptjs 2.4.3
- Express-validator 7.0.1
- CORS 2.8.5

### Development Tools
- Nodemon for backend development
- ESLint for code quality
- Prettier for code formatting

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

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Backend Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/studytracker.git
   cd studytracker/backend
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

4. **Start the server**:
   ```bash
   npm run dev
   ```
   Server will start on http://localhost:5000

### Frontend Setup
1. **Navigate to frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   Application will open at http://localhost:3000

### Database Setup
- **Local MongoDB**: Ensure MongoDB is running on default port 27017
- **MongoDB Atlas**: Replace MONGODB_URI with your Atlas connection string
- **Database Name**: The application will create a `studytracker` database automatically

## 📱 Usage Guide

### Getting Started
1. **Register Account**: Create a new account with name, email, and password
2. **Create Subjects**: Add academic subjects you want to track (e.g., "Computer Science", "Mathematics")
3. **Set Goals**: Configure daily and weekly study time goals in your profile
4. **Start Studying**: Use the session tracker to log study time

### Study Session Management
1. **Quick Start**: Use the "Start Session" dropdown to begin timing immediately
2. **Manual Entry**: Add past sessions with detailed information
3. **Session Details**: Record study method, location, focus rating, and notes
4. **Edit/Delete**: Modify or remove sessions as needed

### Analytics & Insights
1. **Dashboard**: View today's progress, weekly trends, and goal achievement
2. **Analytics Page**: Explore detailed charts and study pattern analysis
3. **Subject Performance**: Compare effectiveness across different subjects
4. **Time Trends**: Identify your most productive study periods

## 🎥 Demo Video Requirements

### Video Structure (5-7 minutes)
1. **Introduction** (30 seconds):
   - Project overview and purpose
   - Technology stack highlights

2. **Authentication Demo** (1 minute):
   - User registration process
   - Login functionality
   - Form validation examples

3. **Core Features** (2-3 minutes):
   - Subject creation and management
   - Study session tracking (both real-time and manual)
   - Dashboard overview with live data

4. **D3.js Visualizations** (1-2 minutes):
   - Interactive time series chart demonstration
   - Pie chart with hover effects
   - Analytics page tour

5. **Advanced Features** (1 minute):
   - Goal setting and progress tracking
   - Pattern analysis and insights
   - Responsive design demonstration

6. **Technical Highlights** (30 seconds):
   - Course topics demonstration
   - Code organization overview

### Recording Tips
- Use sample data to demonstrate full functionality
- Show responsive design on different screen sizes
- Highlight interactive elements (hover effects, animations)
- Demonstrate error handling and validation

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

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use PM2 for process management
3. Configure MongoDB Atlas for production database
4. Set up SSL certificates for HTTPS

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Asif Chowdhury**  
Virginia Tech Computer Science
