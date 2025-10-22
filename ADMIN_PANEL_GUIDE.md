# Admin Panel Documentation

## Overview
The MovieTrack Admin Panel provides comprehensive administration capabilities for managing users, monitoring platform statistics, and tracking user activity.

## Features

### 1. **Dashboard**
- Real-time platform statistics
- User growth charts (last 30 days)
- Movies by genre distribution
- Active users count
- Recent activity feed
- New user registrations

### 2. **User Management**
- View all registered users
- Search users by name/email
- Filter users by status (Active/Banned) or role (Admin/User)
- Ban/Unban users
- Delete users (with all associated data)
- View detailed user information including:
  - User profile
  - Movie collection
  - Recent activity logs

### 3. **Activity Logs**
- Track all user actions:
  - Login/Logout
  - Registration
  - Movie operations (Add/Update/Delete)
  - Search and filtering
  - Profile updates
  - Ban/Unban actions
- Filter by action type
- Filter by date
- View IP addresses

### 4. **Platform Statistics**
- Users by status (Active vs Banned)
- Content distribution (Movies vs TV Shows)
- Top genres
- Daily active users chart
- Most active users
- Popular movies

## Access Control

### Creating an Admin User
To create your first admin user, you need to manually update the database:

1. Register a normal user account through the app
2. Connect to your MongoDB database
3. Find the user in the `users` collection
4. Update the `role` field from `'user'` to `'admin'`

Example MongoDB update command:
```javascript
db.users.updateOne(
  { email: "admin@movietrack.com" },
  { $set: { role: "admin" } }
)
```

### Admin Login
1. Navigate to `/admin-login.html`
2. Enter admin credentials
3. System verifies admin role before granting access
4. Redirects to admin dashboard

**Note:** Regular users cannot access the admin panel even if they know the URL. The system verifies the `role` field on every request.

## How to Use

### Accessing the Admin Panel
```
http://localhost:3000/admin-login.html
```

### Dashboard Features

#### Quick Stats Cards
- **Total Users**: All registered users
- **Total Movies**: All movies/shows added
- **Active Users**: Users active in last 24 hours
- **Avg Movies/User**: Platform average

#### Charts
- **User Growth**: Line chart showing new registrations over 30 days
- **Movies by Genre**: Pie chart showing content distribution

#### Recent Sections
- **Recent Activity**: Last 10 user actions
- **New Users**: Recently registered users

### User Management

#### Search and Filter
```javascript
// Search users
Type in search box: "john" → Shows all users with "john" in name/email

// Filter by status
Select filter: "Active Only" → Shows only active users
Select filter: "Banned Only" → Shows only banned users
Select filter: "Admins Only" → Shows only admin users
```

#### User Actions

**View User Details:**
- Click "View" button
- See complete user profile
- View user's movie collection
- Check recent activity

**Ban User:**
- Click "Ban" button
- Confirm action
- User loses all access immediately
- Activity is logged

**Unban User:**
- Click "Unban" button for banned users
- Confirm action
- User regains access
- Activity is logged

**Delete User:**
- Click "Delete" button
- Confirm action (IRREVERSIBLE)
- Deletes user + all movies + all activity logs
- Cannot delete admin users

### Activity Logs

#### Filter Options
```javascript
// By Action Type
All Actions
Login
Register
Add Movie
Delete Movie
Update Movie
Banned
Unbanned

// By Date
Select date from date picker → Shows activities from that day
```

#### Activity Information
Each log entry shows:
- Timestamp (date and time)
- User name
- Action type (with icon)
- Action details
- IP address

### Statistics Page

#### Available Charts
1. **Users by Status**: Pie chart (Active/Banned)
2. **Content Distribution**: Bar chart (Movies/TV Shows)
3. **Top Genres**: Horizontal bar chart (Top 8 genres)
4. **Daily Active Users**: Line chart (Last 7 days)

## API Endpoints

All admin endpoints require authentication token with admin role.

### Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

### Users
```http
GET /api/admin/users?page=1&limit=20&search=john&filter=active
GET /api/admin/users/:id
PUT /api/admin/users/:id/ban
PUT /api/admin/users/:id/unban
DELETE /api/admin/users/:id
```

### Activity Logs
```http
GET /api/admin/activity-logs?page=1&limit=50&action=login&date=2025-10-22
```

### Statistics
```http
GET /api/admin/stats
```

## Security Features

### Authentication
- JWT token-based authentication
- Token includes user ID and role
- All admin routes verify token AND admin role

### Authorization
- Role-based access control (RBAC)
- Admin routes use `protect` + `adminOnly` middleware
- Regular users cannot access admin endpoints (403 Forbidden)

### User Protection
- Admins cannot ban other admins
- Admins cannot delete other admins
- Banned users cannot access any routes

### Activity Logging
- All admin actions are logged
- Logs include:
  - User ID and name
  - Action type
  - Action details
  - IP address
  - Timestamp

## Auto-Refresh

The dashboard automatically refreshes every 30 seconds when active, keeping stats up-to-date without manual refresh.

## Responsive Design

The admin panel is fully responsive:
- Desktop: Full sidebar navigation
- Tablet: Collapsible navigation
- Mobile: Stacked layout with hamburger menu

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Cannot Access Admin Panel
**Problem:** Redirected to login page
**Solution:** 
1. Ensure you're logged in with an admin account
2. Check `localStorage.userRole` in browser console
3. Verify database has `role: 'admin'` for your user

### Statistics Not Loading
**Problem:** Charts show "Loading..."
**Solution:**
1. Check browser console for errors
2. Verify backend is running
3. Check MongoDB connection
4. Ensure Chart.js is loaded

### Activity Logs Empty
**Problem:** No logs showing
**Solution:**
1. Perform some actions in the app
2. Check if ActivityLog model is properly saving
3. Verify date/action filters aren't too restrictive

### User Actions Not Working
**Problem:** Ban/Delete buttons not responding
**Solution:**
1. Check browser console for errors
2. Verify token is valid
3. Check network tab for API responses
4. Ensure you're not trying to ban/delete an admin

## Best Practices

### Regular Monitoring
- Check dashboard daily for unusual activity
- Review activity logs weekly
- Monitor user growth trends

### User Management
- Only ban users for policy violations
- Document reason for banning users
- Regularly review banned users list

### Data Cleanup
- Consider deleting inactive accounts after 12 months
- Archive activity logs older than 6 months
- Regular database backups before bulk deletions

## Future Enhancements

Planned features:
- Real-time updates with WebSockets
- Email notifications for admin actions
- Bulk user operations
- Export data to CSV/PDF
- Advanced analytics dashboard
- Custom reports generation
- User communication system
- Content moderation tools

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check backend server logs
4. Verify database connection and data

## Version
Current Version: 1.0.0
Last Updated: October 22, 2025
