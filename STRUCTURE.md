# Frontend Structure Explanation

## Folder Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── OrderStatus.jsx       # Status badge component
│   │   ├── NotificationPanel.jsx # Notification dropdown panel
│   │   └── ProtectedRoute.jsx    # Route protection wrapper
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx       # Authentication state management
│   │   └── SocketContext.jsx     # Socket.IO state management
│   │
│   ├── pages/               # Page-level components
│   │   ├── Login.jsx             # Login page
│   │   ├── Signup.jsx            # Signup page
│   │   ├── UserDashboard.jsx     # End user dashboard
│   │   ├── RestaurantDashboard.jsx # Restaurant owner dashboard
│   │   ├── RiderDashboard.jsx    # Rider dashboard
│   │   └── AdminDashboard.jsx    # Admin dashboard
│   │
│   ├── services/            # API and external services
│   │   ├── api.js                # Axios instance and API functions
│   │   └── socket.js             # Socket.IO client setup
│   │
│   ├── utils/               # Utility functions
│   │   └── jwt.js               # JWT token decoding utilities
│   │
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
│
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── index.html               # HTML template
```

## Key Files Explained

### 1. `main.jsx`
- Entry point of the React application
- Renders the App component into the DOM
- Wraps app in React.StrictMode

### 2. `App.jsx`
- Main application component
- Sets up React Router with all routes
- Wraps app with AuthProvider and SocketProvider
- Defines protected routes with role-based access

### 3. `context/AuthContext.jsx`
- Manages authentication state (user, token)
- Provides signup, signin, logout functions
- Handles token storage in localStorage
- Initializes socket connection on login
- Provides role checking utilities

### 4. `context/SocketContext.jsx`
- Manages Socket.IO connection state
- Listens for real-time events:
  - `order_update`: Updates order status in real-time
  - `new_notification`: Adds new notifications
- Provides functions to update orders and notifications

### 5. `services/api.js`
- Centralized Axios instance with base URL
- Request interceptor: Attaches JWT token to headers
- Response interceptor: Handles 401 errors (auto-logout)
- Exports organized API functions:
  - `authAPI`: signup, signin
  - `userAPI`: getProfile, updateProfile
  - `restaurantAPI`: getAll, getById, getMenuItems, etc.
  - `orderAPI`: create, getMyOrders, updateStatus, etc.
  - `paymentAPI`: getByOrderId
  - `notificationAPI`: getAll, markAsRead, delete, etc.

### 6. `services/socket.js`
- Socket.IO client initialization
- Connects with JWT token authentication
- Provides functions: initSocket, getSocket, disconnectSocket

### 7. `utils/jwt.js`
- JWT token decoding utility
- Extracts user role and ID from token
- Used for role-based routing and permissions

### 8. `pages/Login.jsx`
- Login form (email, password)
- Calls signin API
- Redirects based on user role after successful login
- Shows success message from signup redirect

### 9. `pages/Signup.jsx`
- Signup form (name, email, password, role)
- Role selection: end_user, restaurant, rider
- Calls signup API
- Redirects to login on success

### 10. `pages/UserDashboard.jsx`
- End user main dashboard
- Features:
  - Browse restaurants
  - View menu items
  - Add items to cart
  - Place orders
  - View order history with real-time updates
  - View notifications

### 11. `pages/RestaurantDashboard.jsx`
- Restaurant owner dashboard
- Features:
  - Select restaurant (if multiple)
  - View incoming orders
  - Update order status: PREPARING → READY
  - Real-time order updates

### 12. `pages/RiderDashboard.jsx`
- Rider dashboard
- Features:
  - View available orders (status: READY)
  - Accept orders
  - View assigned orders
  - Update status: PICKED_UP → DELIVERED
  - Tab-based UI for available vs my orders

### 13. `components/ProtectedRoute.jsx`
- Route protection wrapper
- Checks authentication status
- Checks role requirements
- Redirects unauthorized users

### 14. `components/OrderStatus.jsx`
- Reusable status badge component
- Color-coded status indicators
- Maps status codes to readable labels

### 15. `components/NotificationPanel.jsx`
- Notification dropdown panel
- Fetches notifications from API
- Displays unread/read state
- Mark as read / delete functionality
- Real-time updates via socket

## Data Flow

### Authentication Flow
1. User submits login/signup form
2. API call via `authAPI`
3. JWT token stored in localStorage
4. AuthContext updates user state
5. Socket connection initialized with token
6. Redirect to role-based dashboard

### Order Flow (End User)
1. Browse restaurants → Fetch from API
2. Select restaurant → Fetch menu items
3. Add items to cart → Local state
4. Place order → API call creates order
5. Order appears in "My Orders"
6. Real-time updates via socket

### Order Flow (Restaurant)
1. View incoming orders → Fetch from API
2. Update status → API call
3. Socket emits `order_update`
4. All connected clients receive update
5. UI updates automatically

### Socket Flow
1. User logs in → Socket connects with JWT
2. User joins room: `user_{userId}`
3. Backend emits events to user room
4. Frontend receives events via SocketContext
5. State updates automatically
6. UI re-renders with new data

## Environment Variables

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Running the Application

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173`