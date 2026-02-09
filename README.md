# Test Automation Platform - Frontend

<div align="center">
  <img src="docs/images/vizja-logo.png" alt="Uniwersytet Vizja" width="300"/>
  
  ### Graduation Thesis Project
  **University of Economics and Human Sciences in Warsaw**
  
  **Student:** Buğra Han - 42078
  
  ---
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38bdf8.svg)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-4.3.0-646cff.svg)](https://vitejs.dev/)
  
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This is the **frontend application** of the Test Automation Platform, providing an intuitive web interface for managing and monitoring automated test executions. Built with modern React and TypeScript, it offers:

- 🎨 **Modern UI/UX** - Clean, responsive design with TailwindCSS
- ⚡ **Real-time Updates** - Live test execution monitoring via SSE
- 📊 **Interactive Dashboards** - Visual test analytics and statistics
- 🔄 **Step-by-Step Tracking** - Animated progress indicators for test steps
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

This project serves as a **graduation thesis** demonstrating modern frontend development practices, including component-based architecture, real-time data streaming, and responsive design.

---

## ✨ Features

### Core Functionality
- ✅ **Project Dashboard** - Overview of all test automation projects
- ✅ **Test Suite Management** - Browse and organize test suites by user stories
- ✅ **Test Execution** - Run individual test cases or entire suites
- ✅ **Real-time Monitoring** - Watch tests execute step-by-step with live updates
- ✅ **Test Reports** - View detailed execution results and screenshots
- ✅ **Excel Import** - Upload Product Backlog Excel files
- ✅ **Test Scheduling** - Schedule recurring test executions
- ✅ **User Authentication** - Secure login with JWT tokens

### UI/UX Features
- 🎯 **Step Progress Indicators** - Animated circular progress for each step
- 📈 **Execution Statistics** - Charts and graphs for test trends
- 🔔 **Toast Notifications** - Real-time feedback for user actions
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🔍 **Search & Filter** - Quickly find test cases and results
- 📱 **Mobile Responsive** - Optimized for all screen sizes

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Main dashboard showing project overview and recent test runs*

### Test Execution
![Test Execution](docs/screenshots/test-execution.png)
*Real-time test execution with step-by-step progress tracking*

### Test Results
![Test Results](docs/screenshots/test-results.png)
*Detailed test results with screenshots and error messages*

---

## 🛠️ Tech Stack

### Core Technologies
- **React 18.2.0** - UI library
- **TypeScript 4.9.5** - Type-safe JavaScript
- **Vite 4.3.0** - Build tool and dev server
- **React Router 6.11.0** - Client-side routing

### UI & Styling
- **TailwindCSS 3.3.0** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Framer Motion** - Animation library

### State & Data
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **EventSource** - Server-Sent Events for real-time updates

### Charts & Visualization
- **Recharts** - Composable charting library
- **React Hot Toast** - Toast notifications

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8081`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bugra-university/test_web_v2_frontend.git
   cd test_web_v2_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   
   Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   VITE_APP_NAME=Test Automation Platform
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

Build output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── StatisticsCard.tsx
│   │   │   └── RecentRuns.tsx
│   │   ├── test-execution/          # Test execution components
│   │   │   ├── TestRunner.tsx
│   │   │   ├── StepProgress.tsx
│   │   │   └── LiveLog.tsx
│   │   ├── test-results/            # Test results components
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── ScreenshotViewer.tsx
│   │   │   └── ErrorDetails.tsx
│   │   └── common/                  # Reusable components
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Spinner.tsx
│   │       └── Toast.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ProjectDetails.tsx
│   │   ├── TestExecution.tsx
│   │   ├── TestResults.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useTestExecution.ts
│   │   └── useRealTimeUpdates.ts
│   ├── services/
│   │   ├── api.ts                   # Axios instance
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   └── testService.ts
│   ├── store/
│   │   ├── authStore.ts             # Zustand auth store
│   │   └── uiStore.ts               # Zustand UI store
│   ├── types/
│   │   ├── project.ts
│   │   ├── testCase.ts
│   │   └── testResult.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🧩 Components

### Key Components

#### `<StepProgress />`
Real-time step execution progress indicator with animated circular progress.

```tsx
<StepProgress
  stepNumber={1}
  description="Navigate to login page"
  status="running" // pending | running | passed | failed
  duration={1250}
/>
```

#### `<TestRunner />`
Main component for executing and monitoring tests.

```tsx
<TestRunner
  projectId={2}
  testCaseId="US_01-TC01"
  onComplete={(result) => console.log(result)}
/>
```

#### `<LiveLog />`
Real-time log viewer with SSE integration.

```tsx
<LiveLog
  projectId={2}
  eventTypes={['step_started', 'step_completed', 'step_failed']}
/>
```

---

## 🔄 State Management

### Zustand Stores

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

#### UI Store
```typescript
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}
```

### React Query

Used for server state management:

```typescript
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: () => projectService.getAll(),
});
```

---

## 🌐 API Integration

### API Client Setup

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Real-time Updates with SSE

```typescript
// src/hooks/useRealTimeUpdates.ts
export function useRealTimeUpdates(projectId: number) {
  useEffect(() => {
    const eventSource = new EventSource(
      `${API_URL}/projects/${projectId}/test-suites/events`
    );

    eventSource.addEventListener('step_started', (event) => {
      const data = JSON.parse(event.data);
      // Update UI with step data
    });

    return () => eventSource.close();
  }, [projectId]);
}
```

---

## 🎨 Styling

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Custom Animations

```css
/* Step progress animation */
@keyframes step-progress {
  0% {
    stroke-dashoffset: 283;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.step-progress-circle {
  animation: step-progress 1s ease-in-out forwards;
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test
# or
yarn test
```

### Run Tests with Coverage
```bash
npm run test:coverage
# or
yarn test:coverage
```

---

## 🤝 Contributing

This is a graduation thesis project. Contributions are welcome for educational purposes.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of a graduation thesis at the **University of Economics and Human Sciences in Warsaw**.

**Student:** Buğra Han (ID: 42078)  
**Academic Year:** 2025/2026

---

## 📞 Contact

**Buğra Han**  
Student ID: 42078  
University of Economics and Human Sciences in Warsaw

---

<div align="center">
  <p>Made with ❤️ for graduation thesis</p>
  <p>© 2026 Uniwersytet Vizja - All Rights Reserved</p>
</div>
