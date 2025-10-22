# Admin System Architecture & Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MovieTrack Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐              ┌──────────────────┐          │
│  │  Regular Users  │              │   Admin Users    │          │
│  │   (role: user)  │              │  (role: admin)   │          │
│  └────────┬────────┘              └────────┬─────────┘          │
│           │                                 │                    │
│           ├─── Login/Register               ├─── Admin Login    │
│           ├─── Add/Edit Movies              ├─── View Dashboard │
│           ├─── Search/Filter                ├─── Manage Users   │
│           └─── View Statistics              ├─── View Logs      │
│                                             └─── View Stats     │
│                                                                   │
│           ▼                                 ▼                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Express Backend                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ Auth Routes  │  │ Movie Routes │  │ Admin Routes │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         │                  │                  │           │  │
│  │         └──────────┬───────┴──────────────────┘           │  │
│  │                    │                                       │  │
│  │         ┌──────────▼──────────┐                           │  │
│  │         │   Middleware        │                           │  │
│  │         │  - protect()        │                           │  │
│  │         │  - adminOnly()      │                           │  │
│  │         │  - checkBanned()    │                           │  │
│  │         └──────────┬──────────┘                           │  │
│  │                    │                                       │  │
│  └────────────────────┼───────────────────────────────────────┘
│                       │                                        │
│           ┌───────────▼───────────┐                           │
│           │    MongoDB Atlas      │                           │
│           │  - Users Collection   │                           │
│           │  - Movies Collection  │                           │
│           │  - Activity Logs      │                           │
│           └───────────────────────┘                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Regular User Login
```
User Login Request
       │
       ▼
POST /api/auth/login
       │
       ├─── Find user in database
       ├─── Verify password (bcrypt)
       ├─── Update lastLogin
       ├─── Log activity (ActivityLog)
       ├─── Generate JWT token
       └─── Return token + user data
              │
              ▼
       User stores token in localStorage
              │
              └─── Includes: id, name, email, role
```

### Admin Login
```
Admin Login Request
       │
       ▼
POST /api/auth/login (same endpoint)
       │
       ├─── Find user in database
       ├─── Verify password
       ├─── Check role === 'admin'
       ├─── Update lastLogin
       ├─── Log activity
       ├─── Generate JWT token
       └─── Return token + user data (with role)
              │
              ▼
       Frontend verifies role
              │
              ├─── If admin → Redirect to admin dashboard
              └─── If user → Access denied
```

## Authorization Flow

### Regular Route Access
```
Request with JWT Token
       │
       ▼
protect() Middleware
       │
       ├─── Verify token
       ├─── Extract user ID
       ├─── Find user in database
       ├─── Check if user.status === 'banned'
       │    │
       │    ├─── If banned → 403 Forbidden
       │    └─── If active → Continue
       │
       └─── Attach user to req.user
              │
              ▼
       Route Handler
```

### Admin Route Access
```
Request with JWT Token
       │
       ▼
protect() Middleware
       │
       ├─── Verify token
       ├─── Check user exists
       ├─── Check user.status === 'active'
       └─── Attach user to req.user
              │
              ▼
adminOnly() Middleware
       │
       ├─── Check req.user.role === 'admin'
       │    │
       │    ├─── If admin → Continue
       │    └─── If user → 403 Forbidden
       │
       ▼
Admin Route Handler
```

## Activity Logging Flow

```
User Action (any route)
       │
       ▼
Route Handler
       │
       ├─── Perform action (add movie, login, etc.)
       ├─── Action successful?
       │    │
       │    └─── Yes → Log activity
       │              │
       │              ▼
       │         ActivityLog.create({
       │           userId: req.user.id,
       │           userName: req.user.name,
       │           action: 'action_type',
       │           details: 'description',
       │           ipAddress: req.ip,
       │           timestamp: Date.now()
       │         })
       │
       └─── Return response
```

## Admin Dashboard Data Flow

### Dashboard Loading
```
Admin Dashboard Page Load
       │
       ▼
GET /api/admin/dashboard
       │
       ├─── Count total users
       ├─── Count total movies
       ├─── Count active users (24h)
       ├─── Aggregate user growth (30 days)
       ├─── Find recent users (5)
       └─── Get recent activity (10)
              │
              ▼
       Return JSON with all data
              │
              ▼
       Frontend renders:
       ├─── Stats cards
       ├─── User growth chart (Chart.js)
       ├─── Recent activity list
       └─── Recent users list
```

### User Management
```
Admin clicks Users tab
       │
       ▼
GET /api/admin/users?page=1&limit=20
       │
       ├─── Find all users
       ├─── Apply search filter (if any)
       ├─── Apply status filter (if any)
       ├─── Apply role filter (if any)
       ├─── Count user's movies
       ├─── Paginate results
       └─── Return users with pagination data
              │
              ▼
       Frontend renders:
       ├─── User table
       ├─── Action buttons
       └─── Pagination controls
```

### Ban User Flow
```
Admin clicks "Ban" button
       │
       ▼
Confirmation modal shows
       │
       ├─── Cancel → Close modal
       └─── Confirm ▼
              │
       PUT /api/admin/users/:id/ban
              │
              ├─── Find user
              ├─── Check user.role !== 'admin'
              ├─── Update user.status = 'banned'
              ├─── Log activity (banned)
              └─── Return success
                     │
                     ▼
              Frontend:
              ├─── Show success message
              ├─── Reload user list
              └─── User can no longer login
```

## Database Schema Relationships

```
┌─────────────────────┐
│      Users          │
├─────────────────────┤
│ _id: ObjectId       │◄────────┐
│ name: String        │         │
│ email: String       │         │
│ password: String    │         │
│ role: String        │         │  References
│ status: String      │         │
│ lastLogin: Date     │         │
│ createdAt: Date     │         │
└─────────────────────┘         │
                                │
┌─────────────────────┐         │
│      Movies         │         │
├─────────────────────┤         │
│ _id: ObjectId       │         │
│ user: ObjectId      │─────────┤
│ title: String       │         │
│ year: Number        │         │
│ status: String      │         │
│ rating: Number      │         │
│ ...                 │         │
└─────────────────────┘         │
                                │
┌─────────────────────┐         │
│   ActivityLog       │         │
├─────────────────────┤         │
│ _id: ObjectId       │         │
│ userId: ObjectId    │─────────┘
│ userName: String    │
│ action: String      │
│ details: String     │
│ ipAddress: String   │
│ timestamp: Date     │
└─────────────────────┘
```

## User States Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     User States                          │
└─────────────────────────────────────────────────────────┘

    Register
       │
       ▼
   ┌──────┐
   │ USER │ ◄──── Default role: 'user'
   │ACTIVE│       Default status: 'active'
   └───┬──┘
       │
       ├──────► Can login
       ├──────► Can add movies
       ├──────► Can view own data
       └──────► Cannot access admin panel
       
       │
       │ Admin promotes to admin
       ▼
   ┌──────┐
   │ADMIN │ ◄──── role: 'admin'
   │ACTIVE│       status: 'active'
   └───┬──┘
       │
       ├──────► Can login
       ├──────► Can add movies
       ├──────► Can access admin panel
       ├──────► Can manage users
       └──────► Cannot be banned by other admins
       
       
   ┌──────┐
   │ USER │       Admin bans user
   │ACTIVE│ ──────────────────────►
   └──────┘
       │
       │
       ▼
   ┌──────┐
   │ USER │ ◄──── role: 'user'
   │BANNED│       status: 'banned'
   └───┬──┘
       │
       ├──────► Cannot login (403 Forbidden)
       ├──────► All API requests blocked
       └──────► Can be unbanned by admin
       
       │
       │ Admin unbans user
       ▼
   ┌──────┐
   │ USER │ ◄──── Back to active state
   │ACTIVE│
   └──────┘
```

## Chart Data Flow

```
Statistics Page Load
       │
       ▼
GET /api/admin/stats
       │
       ├─── Aggregate users by status
       │    └─── { active: 120, banned: 5 }
       │
       ├─── Aggregate movies by type
       │    └─── { movie: 450, tv: 180 }
       │
       ├─── Aggregate movies by genre
       │    └─── [{ _id: 'Action', count: 85 }, ...]
       │
       ├─── Aggregate daily active users (7 days)
       │    └─── [{ _id: '2025-10-22', count: 45 }, ...]
       │
       └─── Return all aggregated data
              │
              ▼
       Frontend processes data
              │
              ├─── Users Status → Pie Chart
              ├─── Content Type → Bar Chart
              ├─── Top Genres → Horizontal Bar Chart
              └─── Daily Active → Line Chart
                     │
                     ▼
              Chart.js renders visualizations
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
└─────────────────────────────────────────────────────────┘

Layer 1: HTTPS (Production)
   │
   ├─── Encrypted communication
   └─── Prevents man-in-the-middle attacks

Layer 2: JWT Authentication
   │
   ├─── Signed tokens
   ├─── Expiration time
   └─── Cannot be tampered with

Layer 3: Password Hashing
   │
   ├─── bcrypt with 10 salt rounds
   ├─── One-way encryption
   └─── Secure password storage

Layer 4: Middleware Protection
   │
   ├─── protect() - Verifies JWT
   ├─── adminOnly() - Checks role
   └─── checkBanned() - Blocks banned users

Layer 5: Role-Based Access Control
   │
   ├─── User role: Limited access
   ├─── Admin role: Full access
   └─── Stored in database + JWT

Layer 6: Activity Logging
   │
   ├─── All actions tracked
   ├─── IP addresses logged
   └─── Audit trail for security review

Layer 7: Input Validation
   │
   ├─── express-validator
   ├─── Mongoose schema validation
   └─── Prevents injection attacks
```

## Real-Time Updates (Future Enhancement)

```
Current: Polling (30s refresh)
       │
       ├─── Dashboard auto-refreshes every 30 seconds
       ├─── Calls same API endpoints
       └─── Updates stats and charts

Future: WebSocket Implementation
       │
       ▼
   ┌──────────┐          ┌──────────┐
   │  Client  │◄────────►│  Server  │
   │(Browser) │ WebSocket│(Socket)  │
   └────┬─────┘          └────┬─────┘
        │                     │
        │ Real-time events    │
        │◄────────────────────┤
        │                     │
        │ • New user joined   │
        │ • User banned       │
        │ • Movie added       │
        │ • Activity logged   │
        │                     │
        └─────────────────────┘
        
        Instant updates without refresh!
```

## Component Hierarchy

```
admin-dashboard.html
├── Navigation Bar
│   ├── Brand Logo
│   ├── Nav Links
│   │   ├── Dashboard
│   │   ├── Users
│   │   ├── Activity
│   │   └── Statistics
│   └── User Menu
│       └── Logout Button
│
├── Dashboard Section
│   ├── Stats Cards (4)
│   ├── Charts Container
│   │   ├── User Growth Chart
│   │   └── Genre Chart
│   ├── Recent Activity Widget
│   └── Recent Users Widget
│
├── Users Section
│   ├── Header with Search & Filters
│   ├── Users Table
│   │   └── Action Buttons per User
│   └── Pagination
│
├── Activity Section
│   ├── Header with Filters
│   ├── Activity Table
│   └── Pagination
│
├── Statistics Section
│   ├── Charts Grid (4)
│   │   ├── Users Status Chart
│   │   ├── Content Type Chart
│   │   ├── Top Genres Chart
│   │   └── Daily Active Chart
│   └── Stats Tables
│       ├── Top Users
│       └── Popular Movies
│
└── Modals
    ├── User Details Modal
    └── Confirm Action Modal
```

## API Response Structure

### Dashboard Response
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalMovies": 680,
    "activeUsersToday": 45,
    "bannedUsers": 3
  },
  "userGrowth": [
    { "_id": "2025-10-01", "count": 5 },
    { "_id": "2025-10-02", "count": 8 }
  ],
  "recentUsers": [...],
  "activitySummary": {...}
}
```

### Users List Response
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "movieCount": 15,
      "createdAt": "2025-10-01",
      "lastLogin": "2025-10-22"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 8,
    "total": 150,
    "prev": null,
    "next": { "page": 2, "limit": 20 }
  }
}
```

---

## Summary

The admin system is built with:
- **Layered Security**: Multiple protection layers
- **Role-Based Access**: User vs Admin separation
- **Activity Tracking**: Complete audit trail
- **Real-time Analytics**: Dashboard with auto-refresh
- **Scalable Architecture**: Easy to extend
- **User-Friendly UI**: Intuitive interface

**Everything is ready to use!** 🎉
