# 🚀 Quick Start: Admin Panel

Get your admin panel up and running in 5 minutes!

## Step 1: Start the Server ✅

The backend server should already be running. If not:

```bash
cd backend
node server.js
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected Successfully
```

## Step 2: Create Admin User 👑

### Option A: Using the Script (Recommended)

```bash
cd backend
node create-admin.js your-email@example.com
```

**Example:**
```bash
node create-admin.js admin@movietrack.com
```

You'll see:
```
✅ User successfully updated to admin!
─────────────────────
Name:  Your Name
Email: admin@movietrack.com
Role:  admin
─────────────────────
```

### Option B: Direct Database Update

If you prefer, update directly in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Step 3: Start Frontend Server 🌐

Open a new terminal:

```bash
cd frontend
python -m http.server 3000
```

Or use Live Server in VS Code.

## Step 4: Access Admin Panel 🔐

1. Open your browser
2. Go to: **http://localhost:3000/admin-login.html**
3. Enter your admin credentials
4. Click "Access Admin Panel"

## Step 5: Explore the Dashboard 🎯

### Dashboard (Home)
- View platform statistics
- See user growth chart
- Check recent activity
- Monitor new users

### Users Section
- View all registered users
- Search by name/email
- Filter by status (Active/Banned)
- Ban or unban users
- Delete users (be careful!)

### Activity Logs
- See all user actions
- Filter by action type
- Filter by date
- Track IP addresses

### Statistics
- View users by status chart
- See content distribution
- Check top genres
- Monitor daily active users

## Common First Actions 🎬

### 1. View All Users
```
Click "Users" in navigation → See all registered users
```

### 2. Check Platform Stats
```
Stay on Dashboard → View quick stats cards
```

### 3. Monitor Recent Activity
```
Dashboard → Scroll to "Recent Activity" section
```

### 4. View Activity Logs
```
Click "Activity Logs" → See all tracked actions
```

### 5. Check Platform Statistics
```
Click "Statistics" → View detailed charts
```

## Testing the Admin Panel 🧪

### Test User Management

1. **View User Details**
   - Go to Users section
   - Click "View" on any user
   - Modal opens with user info

2. **Ban a User** (Test Only)
   - Click "Ban" on a regular user
   - Confirm the action
   - User status changes to "Banned"

3. **Unban the User**
   - Click "Unban" on the banned user
   - Confirm the action
   - User status changes to "Active"

### Test Activity Tracking

1. Open the app in another tab
2. Login as a regular user
3. Add a movie
4. Go back to admin panel
5. Check Activity Logs
6. You'll see the "Add Movie" action logged!

### Test Filters

1. **User Filter**
   - Select "Active Only" dropdown
   - See only active users

2. **Activity Filter**
   - Select "Login" from action filter
   - See only login activities

3. **Date Filter**
   - Select today's date
   - See only today's activities

## Keyboard Shortcuts ⌨️

- `Tab` - Navigate between fields
- `Enter` - Submit login form
- `Esc` - Close modals (coming soon)

## Mobile Access 📱

The admin panel is responsive! Access it from:
- Desktop ✅
- Tablet ✅
- Mobile ✅

## Auto-Refresh Feature 🔄

The dashboard automatically refreshes every 30 seconds:
- Updates statistics
- Refreshes charts
- Shows latest activity

No need to manually reload!

## Security Reminders 🔒

✅ **DO:**
- Keep admin credentials secure
- Logout when done
- Review activity logs regularly
- Only ban users when necessary

❌ **DON'T:**
- Share admin login URL publicly
- Give admin access to untrusted users
- Delete users without backing up data
- Ban users without valid reason

## Troubleshooting 🔧

### Problem: Can't Access Admin Panel

**Solution 1:** Check if you're using correct URL
```
Correct: http://localhost:3000/admin-login.html
Wrong:   http://localhost:3000/login.html
```

**Solution 2:** Verify admin role in database
```bash
# MongoDB Shell
db.users.findOne({ email: "your-email" }, { role: 1 })
# Should return: { role: "admin" }
```

**Solution 3:** Clear browser cache
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

### Problem: "Access Denied" Error

This means your account is not admin.

**Solution:**
```bash
cd backend
node create-admin.js your-email@example.com
```

### Problem: Dashboard Not Loading

**Check:**
1. Backend server is running (port 5000)
2. Frontend server is running (port 3000)
3. MongoDB is connected
4. Browser console for errors (F12)

**Fix:**
```bash
# Restart backend
cd backend
node server.js

# Restart frontend
cd frontend
python -m http.server 3000
```

### Problem: Charts Not Showing

**Cause:** Chart.js might not have loaded

**Solution:**
1. Check internet connection (Chart.js loads from CDN)
2. Hard refresh: `Ctrl + Shift + R`
3. Check browser console for errors

## Quick Reference Card 📇

### URLs
- Admin Login: `http://localhost:3000/admin-login.html`
- Admin Dashboard: `http://localhost:3000/admin-dashboard.html`
- Regular App: `http://localhost:3000`

### Default Ports
- Backend API: `5000`
- Frontend: `3000`

### Admin Commands
```bash
# Create admin user
node create-admin.js email@example.com

# Start backend
node server.js

# Start frontend
python -m http.server 3000
```

### API Endpoints
```
GET    /api/admin/dashboard          - Dashboard data
GET    /api/admin/users               - List users
GET    /api/admin/users/:id           - User details
PUT    /api/admin/users/:id/ban       - Ban user
PUT    /api/admin/users/:id/unban     - Unban user
DELETE /api/admin/users/:id           - Delete user
GET    /api/admin/activity-logs       - Activity logs
GET    /api/admin/stats               - Statistics
```

## Next Steps 📚

1. ✅ Read **ADMIN_PANEL_GUIDE.md** for complete documentation
2. ✅ Explore all admin features
3. ✅ Test user management
4. ✅ Review activity logs
5. ✅ Check platform statistics

## Need More Help? 🆘

- **Complete Guide:** ADMIN_PANEL_GUIDE.md
- **Admin Setup:** CREATE_ADMIN_USER.md
- **Implementation Details:** ADMIN_IMPLEMENTATION_SUMMARY.md
- **Main README:** README.md

## Congratulations! 🎉

You're now ready to manage your MovieTrack platform like a pro!

**Admin Panel v1.0.0**

---

*Built with ❤️ for MovieTrack*
*Last Updated: October 22, 2025*
