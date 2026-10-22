# Frontend Architecture, Complete Request Lifecycle & File-by-File Guide

This document explains the full end-to-end journey of the SubTracker frontend application: from the moment a user clicks a Vercel URL in their browser, through asset retrieval, React runtime initialization, routing, authentication, state management, HTTP communication with the backend API, to Virtual DOM reconciliation and user interactions.

It also contains a thorough, file-by-file breakdown of every single file in the frontend repository.

---

## Table of Contents
1. [End-to-End Frontend Workflow: From Vercel Click to Backend & Back](#1-end-to-end-frontend-workflow-from-vercel-click-to-backend--back)
   - [Phase 1: Domain Click, DNS & Vercel Edge Server](#phase-1-domain-click-dns--vercel-edge-server)
   - [Phase 2: Single Page Application (SPA) Routing & `vercel.json`](#phase-2-single-page-application-spa-routing--verceljson)
   - [Phase 3: Browser Receives & Parses `index.html`](#phase-3-browser-receives--parses-indexhtml)
   - [Phase 4: Asset Fetching & Vite Rollup Code Splitting](#phase-4-asset-fetching--vite-rollup-code-splitting)
   - [Phase 5: React 19 Bootstrap (`main.jsx`)](#phase-5-react-19-bootstrap-mainjsx)
   - [Phase 6: Auth Context Initialization & Token Recovery](#phase-6-auth-context-initialization--token-recovery)
   - [Phase 7: React Router Matching & Route Protection](#phase-7-react-router-matching--route-protection)
   - [Phase 8: Mounting the Dashboard & Initial Render](#phase-8-mounting-the-dashboard--initial-render)
   - [Phase 9: Sending HTTP Requests to Backend via Axios](#phase-9-sending-http-requests-to-backend-via-axios)
   - [Phase 10: Backend Processing, CORS & Response Handshake](#phase-10-backend-processing-cors--response-handshake)
   - [Phase 11: Response Interception, State Update & Virtual DOM Diffing](#phase-11-response-interception-state-update--virtual-dom-diffing)
   - [Phase 12: Interactive User Actions & Full CRUD Cycle](#phase-12-interactive-user-actions--full-crud-cycle)
2. [Visual Architecture Diagrams](#2-visual-architecture-diagrams)
   - [Complete End-to-End System Workflow](#complete-end-to-end-system-workflow)
   - [Component Hierarchy & Data Flow](#component-hierarchy--data-flow)
3. [Comprehensive File-by-File Breakdown](#3-comprehensive-file-by-file-breakdown)
   - [Root Configuration Files](#root-configuration-files)
   - [Application Entry & Core (`src/`)](#application-entry--core-src)
   - [Authentication & Context (`src/context/`)](#authentication--context-srccontext)
   - [API Service Layer (`src/services/`)](#api-service-layer-srcservices)
   - [Pages Layer (`src/pages/`)](#pages-layer-srcpages)
   - [Components Layer (`src/components/`)](#components-layer-srccomponents)
   - [Utility Layer (`src/utils/`)](#utility-layer-srcutils)
   - [Static & Assets (`public/` & `src/assets/`)](#static--assets-public--srcassets)

---

## 1. End-to-End Frontend Workflow: From Vercel Click to Backend & Back

Here is the exact technical step-by-step lifecycle of what happens when a user opens your application.

```
[ User clicks Vercel Link ]
          │
          ▼
[ Phase 1: DNS & Anycast Edge ] ──▶ [ Phase 2: vercel.json SPA Rewrite ]
          │
          ▼
[ Phase 3: Browser receives index.html ] ──▶ [ Phase 4: Download Bundles (JS/CSS) ]
          │
          ▼
[ Phase 5: React 19 createRoot() ] ──▶ [ Phase 6: AuthContext reads localStorage ]
          │
          ▼
[ Phase 7: React Router evaluates URL ] ──▶ [ ProtectedRoute checks Auth ]
          │
          ▼
[ Phase 8: Dashboard mounts (loading=true) ] ──▶ [ useEffect triggers fetchSubscriptions() ]
          │
          ▼
[ Phase 9: Axios attaches Bearer Token ] ──▶ [ Dispatches HTTP GET to Render Backend ]
          │
          ▼
[ Phase 10: Render Express verifies JWT & MongoDB queries ]
          │
          ▼
[ Phase 11: Axios receives JSON ] ──▶ [ setSubscriptions(data) ] ──▶ [ Re-render UI ]
```

---

### Phase 1: Domain Click, DNS & Vercel Edge Server

1. **User Action**: The user clicks a link like `https://subtracker-frontend.vercel.app/dashboard` or enters it into the address bar.
2. **DNS Resolution**: The browser checks its local cache, operating system DNS cache, and recurses to DNS resolvers to resolve `subtracker-frontend.vercel.app` into an IP address belonging to Vercel's Global Anycast Network.
3. **TLS/SSL Handshake**: The browser and Vercel edge node establish a secure HTTPS connection using TLS 1.3 encryption.
4. **Vercel Edge Node**: The request reaches the geographically closest Vercel server.

---

### Phase 2: Single Page Application (SPA) Routing & `vercel.json`

In a traditional multi-page website, visiting `/dashboard` tells the web server to search for a file named `dashboard.html`. If that file does not exist, the server returns a `404 Not Found`.

In a **Single Page Application (SPA)** like SubTracker, there is **only one** HTML file: `index.html`. All other pages (`/login`, `/register`, `/dashboard`) are virtual routes managed by JavaScript in the browser.

This is governed by your `client/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
**What this does**:
- When a user directly visits `https://subtracker-frontend.vercel.app/dashboard`, the Vercel edge server intercepts the request.
- The regex `/(.*)` matches any incoming URL path.
- Instead of returning a 404 error, Vercel serves `client/index.html` while keeping the URL `/dashboard` in the browser's address bar.

---

### Phase 3: Browser Receives & Parses `index.html`

The browser receives the initial response with HTTP status `200 OK`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Fonts & Metadata -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>SubTracker — Subscription Manager</title>
  </head>
  <body class="bg-gray-50 text-gray-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

1. **HTML Tokenization**: The browser constructs the initial Document Object Model (DOM).
2. **Font Optimization**: `preconnect` establishes early connections to Google Fonts servers to download the `Inter` font family without layout shifts.
3. **The Mount Target**: `<div id="root"></div>` is empty. At this moment, the screen is blank (or shows the background color `bg-gray-50`).
4. **Module Script Encountered**: The browser encounters `<script type="module" src="/src/main.jsx"></script>`. In modern ES Modules (`type="module"`), the script executes deferred, after HTML parsing completes.

---

### Phase 4: Asset Fetching & Vite Rollup Code Splitting

During development, Vite serves native ES modules directly. In production (`npm run build`), Vite uses **Rollup** to bundle, minify, and split your code according to `client/vite.config.js`:

```javascript
build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
        output: {
            manualChunks(id) {
                if (id.includes('node_modules')) {
                    if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router/')) {
                        return 'react-vendor';
                    }
                    return 'vendor';
                }
            },
        },
    },
}
```

**Why this code splitting matters**:
- `react-vendor-[hash].js`: Contains React, ReactDOM, and React Router. Because these libraries rarely change, the browser caches this file indefinitely (304 Not Modified / Cache-Control: immutable).
- `vendor-[hash].js`: Contains third-party utilities like Axios, Recharts, and Lucide React.
- `index-[hash].js`: Contains your application source code (`App.jsx`, components, context).
- `index-[hash].css`: Contains minified Tailwind CSS classes used across the project.

The browser downloads these files in parallel over HTTP/2 or HTTP/3 multiplexing.

---

### Phase 5: React 19 Bootstrap (`main.jsx`)

Once `main.jsx` and its dependencies execute:
```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster position="top-right" />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
```

1. `document.getElementById('root')`: Selects the empty `<div>` in `index.html`.
2. `createRoot(...)`: React 19 creates the root fiber and internal fiber architecture for scheduling rendering and concurrent features.
3. `<StrictMode>`: Development tool that double-invokes render phases and effects to detect unexpected side effects and deprecated patterns.
4. `<BrowserRouter>`: Initializes HTML5 History API listeners (`popstate`), allowing React Router to control navigation.
5. `<AuthProvider>`: Wraps the entire component tree so all child routes and components can access authentication state.
6. `<Toaster>`: Injects a floating container for toast notification popups into the top-right corner.

---

### Phase 6: Auth Context Initialization & Token Recovery

Before any page renders, `client/src/context/AuthContext.jsx` runs its initial state logic:

```javascript
const [user, setUser] = useState(() => {
    try {
        const savedUser = localStorage.getItem('subtracker_user');
        const savedToken = localStorage.getItem('subtracker_token');
        if (savedToken) {
            setAuthToken(savedToken); // Configures Axios headers
        }
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        return null;
    }
});
```

1. It reads the browser's persistent `localStorage`.
2. If the user previously logged in, `subtracker_token` (a JWT string) and `subtracker_user` (JSON object with `{ id, name, email }`) are restored.
3. `setAuthToken(savedToken)` sets the default Axios header:
   ```javascript
   API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```
4. If no token exists, `user` defaults to `null`.

---

### Phase 7: React Router Matching & Route Protection

Next, `client/src/App.jsx` evaluates the URL path:

```jsx
<Routes>
    <Route path="/login" element={<LoginPage onLogin={login} />} />
    <Route path="/register" element={<RegisterPage onRegister={register} />} />
    <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        }
    />
    <Route path="/" element={<RootRedirect />} />
    <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

#### What happens if user navigates to `/`:
`<RootRedirect>` checks `user`:
- If `user` is logged in: redirects to `/dashboard`.
- If `user` is `null`: redirects to `/login`.

#### What happens if user visits `/dashboard`:
`<ProtectedRoute>` inspects `user`:
```javascript
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading SubTracker...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};
```
- If unauthenticated, it immediately renders `<Navigate to="/login" replace />`. The browser URL changes to `/login` and renders `<LoginPage />`.
- If authenticated, it renders `<Dashboard />`.

---

### Phase 8: Mounting the Dashboard & Initial Render

When `<Dashboard />` mounts:
1. Local states are initialized:
   ```javascript
   const [subscriptions, setSubscriptions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   ```
2. **Initial Render**:
   - Because `loading = true`, `<StatCards>` and `<SpendingChart>` render skeleton loading placeholders.
   - `<SubscriptionTable>` renders *"Loading subscriptions..."*.
3. **Effect Trigger**:
   ```javascript
   useEffect(() => {
       fetchSubscriptions();
   }, []);
   ```
   After the initial render paints to the screen, `useEffect` executes `fetchSubscriptions()`.

---

### Phase 9: Sending HTTP Requests to Backend via Axios

`fetchSubscriptions()` calls `getSubscriptions()` from `client/src/services/api.js`:

```javascript
export const getSubscriptions = (params = {}) => API.get('/subscriptions', { params });
```

#### The Request Pipeline in `api.js`:
1. **Base URL Resolution**:
   ```javascript
   const API = axios.create({
       baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
   });
   ```
   - In production (on Vercel), Vite replaces `import.meta.env.VITE_API_URL` with `https://subtracker-api-y6sa.onrender.com/api` (from `.env.production`).
   - In local development, it defaults to `http://localhost:5001/api`.
2. **Request Interceptor Execution**:
   Before the network request leaves the browser, Axios runs:
   ```javascript
   API.interceptors.request.use((config) => {
       const token = localStorage.getItem('subtracker_token');
       if (token) {
           config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
   });
   ```
   It injects the HTTP header:
   `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...`

---

### Phase 10: Backend Processing, CORS & Response Handshake

1. **CORS Preflight (if applicable)**:
   Since the frontend origin (`https://...vercel.app`) differs from the backend origin (`https://...onrender.com`), the browser automatically sends an HTTP `OPTIONS` request.
   The backend responds with headers:
   - `Access-Control-Allow-Origin: https://subtracker-frontend.vercel.app`
   - `Access-Control-Allow-Headers: Authorization, Content-Type`
2. **The Actual GET Request**:
   The browser sends:
   `GET /api/subscriptions HTTP/1.1`
3. **Backend Execution (Express 5 & MongoDB)**:
   - Backend `authMiddleware` intercepts the request.
   - It validates the JWT signature using `JWT_SECRET`.
   - It decodes `req.user = decodedToken`.
   - The subscription controller runs:
     `Subscription.find({ user: req.user._id })`.
   - MongoDB returns an array of subscription documents.
4. **Backend Response**:
   Express responds with status `200 OK` and a JSON body containing the user's subscriptions.

---

### Phase 11: Response Interception, State Update & Virtual DOM Diffing

1. **Axios Response Interceptor**:
   ```javascript
   API.interceptors.response.use(
       (response) => response,
       (error) => {
           if (error.response?.status === 401) {
               // Token expired or invalid!
               localStorage.removeItem('subtracker_token');
               localStorage.removeItem('subtracker_user');
               window.location.href = '/login';
           }
           return Promise.reject(error);
       }
   );
   ```
   If valid, the promise resolves and returns the data payload.

2. **State Updates in `Dashboard`**:
   ```javascript
   setSubscriptions(res.data);
   setLoading(false);
   ```

3. **Pure Derived State Calculation**:
   During the re-render, React executes:
   - Total monthly spend calculation loop
   - Annual spend calculation loop
   - Category summation for Recharts (`categoryTotals`)
   - Upcoming renewals within 7 days filtering
   - Filter & search evaluation (`filteredSubscriptions`)

4. **Virtual DOM Reconciliation**:
   - React constructs a new Virtual DOM tree representing the loaded state.
   - It compares this tree with the previous loading skeleton tree (**Diffing**).
   - It computes the minimal set of real browser DOM updates (**Commit Phase**).
   - The browser paints the updated UI: stat cards show spend numbers, Recharts animates the donut chart, and the table lists subscription rows.

---

### Phase 12: Interactive User Actions & Full CRUD Cycle

Here is how a real user action (e.g., adding a new subscription) flows through the system:

```
[ Click "+ Add Subscription" ] ──▶ setModalOpen(true) ──▶ Modal Renders Form
                                                               │
[ Fill inputs & Submit Form ] ◀────────────────────────────────┘
          │
          ▼
[ e.preventDefault() ] ──▶ Client-side validation checks
          │
          ▼
[ API.post('/subscriptions', formData) ] ──▶ Backend saves to MongoDB
          │
          ▼
[ toast.success('Netflix added successfully') ]
          │
          ▼
[ setModalOpen(false) ] ──▶ [ fetchSubscriptions() refreshes list ]
```

1. **Click Event**: User clicks `<Button onClick={handleAdd}>+ Add Subscription</Button>`.
2. **State Change**: `handleAdd` sets `setModalOpen(true)`.
3. **Modal Mount**: `<Modal>` renders with `<SubscriptionForm>`.
4. **Controlled Inputs**: As the user types the subscription name and cost, local state inside `SubscriptionForm` updates on every keystroke.
5. **Form Submission**: User clicks "Save".
   - `handleSubmit(e)` prevents page refresh (`e.preventDefault()`).
   - Validates that name and cost are provided.
   - Calls parent's `handleSubmit(formData)` in `App.jsx`.
6. **Axios Request**: `createSubscription(formData)` sends `POST /api/subscriptions` with JWT.
7. **Feedback**:
   - `toast.success('"Netflix" added successfully')` triggers a popup in the top-right corner.
   - `setModalOpen(false)` closes the modal.
   - `fetchSubscriptions()` re-queries the backend so stats, charts, and table rows update immediately.

---

## 2. Visual Architecture Diagrams

### Complete End-to-End System Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant Vercel as Vercel Edge CDN
    participant React as React Runtime (SPA)
    participant Axios as Axios (api.js)
    participant Render as Render Backend (Express)
    participant DB as MongoDB Atlas

    User->>Browser: Enters URL / clicks Vercel link
    Browser->>Vercel: GET /dashboard
    Note over Vercel: vercel.json rewrites all paths to /index.html
    Vercel-->>Browser: Returns index.html + CSS/JS bundles
    Browser->>React: Executes main.jsx -> createRoot()
    React->>React: AuthProvider reads localStorage token
    React->>React: React Router matches /dashboard (ProtectedRoute)
    React->>Browser: Paints Dashboard (loading=true)
    React->>Axios: useEffect triggers getSubscriptions()
    Note over Axios: Request interceptor injects Authorization: Bearer <token>
    Axios->>Render: HTTP GET /api/subscriptions
    Note over Render: authMiddleware verifies JWT token
    Render->>DB: Subscription.find({ user: userId })
    DB-->>Render: Return documents
    Render-->>Axios: HTTP 200 OK [ { name: "Netflix", cost: 649, ... } ]
    Axios-->>React: Promise resolves with response data
    React->>React: setSubscriptions(data), setLoading(false)
    Note over React: Computes stats, chartData, upcomingRenewals
    React->>Browser: Reconciles Virtual DOM & paints charts, stats & table
```

---

### Component Hierarchy & Data Flow

```mermaid
graph TD
    Root[main.jsx: createRoot] --> StrictMode
    StrictMode --> BrowserRouter
    BrowserRouter --> AuthProvider
    AuthProvider --> Toaster[Toaster - react-hot-toast]
    AuthProvider --> App[App.jsx - Router]

    App -->|Public Route| LoginPage[pages/LoginPage.jsx]
    App -->|Public Route| RegisterPage[pages/RegisterPage.jsx]
    App -->|Protected Route| ProtectedRoute[ProtectedRoute]
    ProtectedRoute --> Dashboard[Dashboard Component]

    Dashboard --> Header[Navbar & User Actions]
    Dashboard --> StatCards[dashboard/StatCards.jsx]
    Dashboard --> UpcomingAlerts[dashboard/UpcomingAlerts.jsx]
    Dashboard --> SpendingChart[dashboard/SpendingChart.jsx]
    Dashboard --> Filters[subscriptions/SubscriptionFilters.jsx]
    Dashboard --> Table[subscriptions/SubscriptionTable.jsx]
    Dashboard --> Modal[common/Modal.jsx]
    Dashboard --> ConfirmDialog[common/ConfirmDialog.jsx]

    Modal --> SubForm[subscriptions/SubscriptionForm.jsx]

    Table --> TableRow[Table Rows & Action Buttons]
```

---

## 3. Comprehensive File-by-File Breakdown

### Root Configuration Files

#### 1. `client/package.json`
- **Purpose**: Defines metadata, build scripts, and dependencies for the frontend.
- **Key Scripts**:
  - `"dev": "vite"`: Launches the local Vite development server with Hot Module Replacement (HMR).
  - `"build": "vite build"`: Runs the production build using Rollup, outputting optimized bundles to `client/dist`.
  - `"preview": "vite preview"`: Serves the built `dist` folder locally for pre-deployment inspection.
  - `"lint": "oxlint"`: High-performance linting.
- **Key Dependencies**:
  - `react` & `react-dom` (v19): Core library and DOM renderer.
  - `react-router-dom` (v7): Client-side routing.
  - `axios`: HTTP client with interceptors for API calls.
  - `recharts`: SVG chart rendering library (used for donut chart).
  - `lucide-react`: Modern SVG icon library.
  - `react-hot-toast`: Lightweight notification banner library.
  - `@tailwindcss/vite` & `tailwindcss` (v4): Zero-config Tailwind CSS engine.

#### 2. `client/vercel.json`
- **Purpose**: Configures Vercel platform routing for Single Page Applications.
- **Content**:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Function**: Prevents HTTP 404 errors when users refresh or directly visit deep routes like `/dashboard` or `/login`.

#### 3. `client/vite.config.js`
- **Purpose**: Vite build tool configuration.
- **Plugins**:
  - `@vitejs/plugin-react`: Enables Fast Refresh and JSX transformation.
  - `@tailwindcss/vite`: Compiles Tailwind CSS v4 directly in Vite's pipeline.
- **Chunk Optimization**:
  - Groups `react`, `react-dom`, and `react-router` into a separate chunk called `react-vendor` so client browsers cache React independently of application code.

#### 4. `client/index.html`
- **Purpose**: The single HTML shell loaded by the browser.
- **Key Elements**:
  - Meta tags for viewport responsiveness, encoding, and SEO descriptions.
  - Preconnect links for Google Fonts (`Inter`).
  - `<div id="root"></div>`: The mounting node for the React application.
  - `<script type="module" src="/src/main.jsx"></script>`: Module entry point.

#### 5. `client/.env`, `.env.example`, `.env.production`
- **Purpose**: Environment variable management.
- **Key Variables**:
  - `VITE_API_URL`: The base endpoint of the backend API.
  - In `.env` (local): `http://localhost:5001/api`.
  - In `.env.production` (production): `https://subtracker-api-y6sa.onrender.com/api`.
  - **Note on `VITE_` prefix**: Vite only exposes environment variables prefixed with `VITE_` to client-side code via `import.meta.env.VITE_*` to prevent accidentally leaking private server secrets.

#### 6. `client/.oxlintrc.json` & `.gitignore`
- **`.oxlintrc.json`**: Linter configuration for code quality rules.
- **`.gitignore`**: Excludes `node_modules`, `dist`, `.env.local`, and build artifacts from Git version control.

---

### Application Entry & Core (`src/`)

#### 7. `client/src/main.jsx`
- **Purpose**: The JavaScript root entry point of the React app.
- **Responsibilities**:
  1. Finds `#root` in the DOM and calls `createRoot()`.
  2. Wraps the app in `<StrictMode>` for development safety checks.
  3. Wraps the app in `<BrowserRouter>` to provide routing context.
  4. Wraps the app in `<AuthProvider>` to provide global auth state.
  5. Renders `<App />`.
  6. Configures the global `<Toaster>` component with dark-mode styling, durations, and green/red accent icons.

#### 8. `client/src/index.css`
- **Purpose**: Global stylesheet.
- **Content**:
  - `@import "tailwindcss";`: Imports the Tailwind CSS v4 design system.
  - `@layer base`: Applies smooth font-antialiasing and base background styling (`#f9fafb`) to the `<body>` element.

#### 9. `client/src/App.jsx`
- **Purpose**: The central controller and top-level router of the application.
- **Sub-components Defined Inside**:
  - `ProtectedRoute`: Checks if the user is logged in. If not, redirects to `/login`.
  - `RootRedirect`: Redirects root path `/` to `/dashboard` or `/login`.
  - `Dashboard`: The primary application dashboard containing:
    - State management for `subscriptions`, `loading`, `error`, `modalOpen`, `editing`, `deleteTarget`, and `filters`.
    - Pure calculation loops for `monthlySpend`, `annualSpend`, `activeSubs`, `categoryTotals`, and `upcomingRenewals`.
    - Filter and sorting logic for subscriptions.
    - Handlers: `handleAdd`, `handleEdit`, `handleDeleteConfirm`, `handleSubmit`, `handleToggleAutoPay`, and `handleQuickStatus`.
    - Renders navbar, `<StatCards>`, `<UpcomingAlerts>`, `<SpendingChart>`, `<SubscriptionFilters>`, `<SubscriptionTable>`, `<Modal>`, and `<ConfirmDialog>`.
  - `App`: Configures the `<Routes>` table (`/login`, `/register`, `/dashboard`, `/`, `*`).

---

### Authentication & Context (`src/context/`)

#### 10. `client/src/context/AuthContext.jsx`
- **Purpose**: Centralized authentication state management using React Context.
- **State Provided**:
  - `user`: Holds current user profile `{ _id, name, email }` or `null`.
  - `loading`: Boolean indicating auth initialization.
- **Methods Provided**:
  - `login(email, password)`: Calls `loginUser` API, saves token & user to `localStorage`, sets Axios auth header, updates `user` state, and displays welcome toast.
  - `register(name, email, password)`: Calls `registerUser` API, stores credentials, and updates state.
  - `logout()`: Clears `localStorage`, removes Axios header, sets `user` to `null`, and navigates to `/login`.
- **Custom Hook `useAuth()`**:
  - Provides a clean way for any component to consume authentication context: `const { user, logout } = useAuth();`.

---

### API Service Layer (`src/services/`)

#### 11. `client/src/services/api.js`
- **Purpose**: Encapsulates all backend HTTP network communications.
- **Key Architecture**:
  - **Axios Instance**: Configured with `baseURL = import.meta.env.VITE_API_URL`.
  - **Request Interceptor**: Automatically pulls `subtracker_token` from `localStorage` and appends `Authorization: Bearer <token>` to every outgoing request.
  - **Response Interceptor**: Detects HTTP `401 Unauthorized` responses. If a session token expires, it clears `localStorage` and redirects the user to `/login`.
  - **Exported API Functions**:
    - `registerUser(data)`: `POST /api/auth/register`
    - `loginUser(data)`: `POST /api/auth/login`
    - `getSubscriptions(params)`: `GET /api/subscriptions`
    - `createSubscription(data)`: `POST /api/subscriptions`
    - `updateSubscription(id, data)`: `PUT /api/subscriptions/:id`
    - `deleteSubscription(id)`: `DELETE /api/subscriptions/:id`
    - `getSummary(params)`: `GET /api/subscriptions/summary`
    - `getUpcoming()`: `GET /api/subscriptions/upcoming`

---

### Pages Layer (`src/pages/`)

#### 12. `client/src/pages/LoginPage.jsx`
- **Purpose**: Public sign-in page.
- **Features**:
  - Email and password inputs with client validation.
  - Calls `auth.login(email, password)`.
  - Displays error banners on invalid credentials.
  - Loading spinner state on submit button during API transit.
  - Navigation link to `/register`.

#### 13. `client/src/pages/RegisterPage.jsx`
- **Purpose**: Public account registration page.
- **Features**:
  - Full Name, Email, and Password form inputs.
  - Validates minimum password length (at least 6 characters).
  - Calls `auth.register(name, email, password)`.
  - Redirects to `/dashboard` upon successful creation.

#### 14. `client/src/pages/Login.jsx` & `Register.jsx`
- **Purpose**: Alternate/legacy page wrappers that forward to `LoginPage.jsx` and `RegisterPage.jsx`.

---

### Components Layer (`src/components/`)

#### Dashboard Components (`src/components/dashboard/`)
#### 15. `StatCards.jsx`
- **Purpose**: Top dashboard metric row.
- **Displays**:
  1. **Total Monthly Spend**: Formatted in INR (`₹`).
  2. **Projected Annual Spend**: Monthly spend multiplied by 12.
  3. **Active Subscriptions**: Count of subscriptions with status `"Active"`.
- **Skeleton State**: Shows pulsating gray loading placeholders while `loading = true`.

#### 16. `SpendingChart.jsx`
- **Purpose**: Donut/pie chart visualizing spending breakdown by category.
- **Technology**: Uses `recharts` (`ResponsiveContainer`, `PieChart`, `Pie`, `Cell`, `Tooltip`).
- **Features**:
  - Dynamic slice color mapping from a curated color palette.
  - Hover tooltips showing category name and exact amount.
  - Displays total monthly spend centered beneath the chart.
  - Shows an empty-state message if no active spending exists.

#### 17. `UpcomingAlerts.jsx`
- **Purpose**: Alert banner highlighting subscriptions due for renewal in the next 7 days.
- **Features**:
  - Shows subscription name, cost, category, and renewal date.
  - Visual urgency indicator (e.g., "Renews in 1 day" vs "Renews in 6 days").

---

#### Subscription Components (`src/components/subscriptions/`)
#### 18. `SubscriptionTable.jsx`
- **Purpose**: The primary data table listing subscriptions.
- **Features**:
  - Columns: Name, Category, Cost, Billing Cycle, Next Billing Date, Status, Actions.
  - Formats cost in INR using `formatCurrency`.
  - Color-coded badges for statuses (`Active` = emerald, `Paused` = amber, `Cancelled` = gray).
  - Action buttons: Quick-toggle Auto-Pay, Quick Status toggle (Pause/Activate), Edit button, Delete button.
  - Shows empty state when no subscriptions match filters.

#### 19. `SubscriptionForm.jsx`
- **Purpose**: The form used inside the Add / Edit modal.
- **Fields**:
  - Subscription Name (text input)
  - Cost in INR (number input)
  - Billing Cycle (dropdown: monthly, yearly, weekly)
  - Category (dropdown: Entertainment, Productivity, Cloud Services, Utilities, Health & Fitness, Other)
  - Start Date / First Billing Date (date input)
  - Auto-Pay toggle (checkbox)
- **Features**:
  - Pre-populates with subscription data when editing.
  - Validates all fields before firing `onSubmit(formData)`.

#### 20. `SubscriptionFilters.jsx`
- **Purpose**: Toolbar above the table for searching, filtering, and sorting.
- **Features**:
  - Search input (filters dynamically by subscription name).
  - Category dropdown filter.
  - Status dropdown filter (All, Active, Paused, Cancelled).
  - Sort field selector (Next Billing, Name, Cost) and sort order toggle (Ascending / Descending).

---

#### Common UI Components (`src/components/common/`)
#### 21. `Button.jsx`
- **Purpose**: Reusable button with consistent styling across the app.
- **Props**: `variant` (`primary`, `secondary`, `danger`), `size`, `loading`, `disabled`, `children`, `onClick`.

#### 22. `Input.jsx`
- **Purpose**: Standardized input field wrapper with label and error message support.

#### 23. `Modal.jsx`
- **Purpose**: Accessible modal overlay container.
- **Features**:
  - Dark backdrop blur.
  - Closes on Escape key press.
  - Closes when clicking outside the modal content box.
  - Disables background window scrolling while open.

#### 24. `ConfirmDialog.jsx`
- **Purpose**: Safe replacement for browser `window.confirm()`.
- **Usage**: Used to confirm deletion of a subscription with clear "Cancel" and red "Delete" buttons.

---

### Utility Layer (`src/utils/`)

#### 25. `client/src/utils/constants.js`
- **Purpose**: Centralized constants used across forms and filters.
- **Exports**:
  - `CATEGORIES`: List of subscription category strings.
  - `STATUSES`: Array of status options (`Active`, `Paused`, `Cancelled`).
  - `BILLING_CYCLES`: Array of cycle options (`monthly`, `yearly`, `weekly`).
  - `SORT_OPTIONS`: Options for sorting subscriptions.
  - `CURRENCY_SYMBOL`: Default currency sign (`₹`).
  - `SELECT_CLASSES`: Reusable Tailwind class string for `<select>` elements.

#### 26. `client/src/utils/formatters.js`
- **Purpose**: Date and currency formatting helper functions.
- **Exports**:
  - `formatCurrency(amount)`: Formats numbers into Indian Rupee strings using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
  - `getISTDateParts(dateInput)`: Normalizes date objects or ISO strings into year, month, and day parts in Indian Standard Time (`Asia/Kolkata`).
  - `toDateInputValue(dateInput)`: Formats dates into `YYYY-MM-DD` strings required by HTML `<input type="date">`.
  - `formatDate(dateStr)`: Formats dates into human-readable strings like `"Mar 15, 2026"`.
  - `daysUntil(dateStr)`: Calculates the exact number of days remaining between today and the target billing date.

---

### Static & Assets (`public/` & `src/assets/`)
- **`client/public/favicon.svg`**: Site favicon displayed in the browser tab.
- **`client/src/assets/`**: Static image assets and icons imported directly into components.

---
*This document provides the complete architectural and file-level reference for the entire SubTracker frontend application.*
