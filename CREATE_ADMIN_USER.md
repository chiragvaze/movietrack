# Create Admin User Script

This script helps you create your first admin user for the MovieTrack admin panel.

## Method 1: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to your MongoDB database
3. Navigate to `movietrack` database → `users` collection
4. Find your user by email
5. Click "Edit Document"
6. Add or modify the `role` field to `"admin"`
7. Click "Update"

## Method 2: Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh "YOUR_MONGODB_CONNECTION_STRING"

# Use your database
use movietrack

# Update user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

# Verify the change
db.users.findOne({ email: "your-email@example.com" })
```

## Method 3: Using Node.js Script

Create a file `create-admin.js` in the `backend` folder:

```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const email = process.argv[2];
        
        if (!email) {
            console.error('Please provide an email: node create-admin.js user@example.com');
            process.exit(1);
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error('User not found with email:', email);
            process.exit(1);
        }
        
        user.role = 'admin';
        await user.save();
        
        console.log('✅ User updated to admin successfully!');
        console.log('User:', user.name);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
```

Run the script:
```bash
cd backend
node create-admin.js your-email@example.com
```

## Steps to Create First Admin

1. **Register a regular user account**
   - Go to http://localhost:3000/signup.html
   - Create an account with your email
   - Remember your credentials

2. **Make the user admin**
   - Use one of the methods above
   - Update the user's role to "admin"

3. **Login to admin panel**
   - Go to http://localhost:3000/admin-login.html
   - Login with your credentials
   - You'll be redirected to the admin dashboard

## Verify Admin Access

After making a user admin, you can verify by:

1. **Check Database**
   ```javascript
   db.users.findOne({ email: "your-email@example.com" }, { role: 1 })
   // Should return: { role: "admin" }
   ```

2. **Test Login**
   - Login to admin panel
   - If successful, you'll see the dashboard
   - If not admin, you'll be denied access

3. **Check Token**
   - Login to regular app
   - Open browser console
   - Type: `localStorage.getItem('userRole')`
   - Should return: `"admin"`

## Troubleshooting

### "User not found"
- Ensure the user is registered in the app first
- Check the email spelling
- Verify database connection

### "Access Denied" on admin login
- Verify the `role` field is exactly `"admin"` (lowercase)
- Clear browser cache and cookies
- Try logging out and logging in again
- Check browser console for errors

### Admin panel redirects to login
- Check if token exists: `localStorage.getItem('token')`
- Check if role is admin: `localStorage.getItem('userRole')`
- Verify token is valid (not expired)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit admin credentials to Git**
2. **Use strong passwords for admin accounts**
3. **Limit number of admin accounts (1-3 recommended)**
4. **Regularly review admin activity logs**
5. **Never share admin login URL publicly**
6. **Use HTTPS in production**
7. **Enable 2FA in future versions**

## Production Setup

For production deployment:

1. **Create admin before deploying**
   - Set up admin user in local database
   - Test admin access locally
   - Then deploy to production

2. **Or create after deployment**
   - Deploy the app
   - Connect to production database
   - Use MongoDB Atlas UI to update user role
   - Or use MongoDB shell with production connection string

3. **Environment Variables**
   - Ensure `JWT_SECRET` is strong and unique
   - Set `NODE_ENV=production`
   - Use secure MONGO_URI

## Next Steps

After creating your admin account:

1. ✅ Login to admin panel
2. ✅ Explore the dashboard
3. ✅ Review user management features
4. ✅ Check activity logs
5. ✅ Familiarize yourself with statistics
6. ✅ Read the ADMIN_PANEL_GUIDE.md for detailed documentation

## Support

If you encounter issues:
1. Check this guide
2. Review ADMIN_PANEL_GUIDE.md
3. Check server logs
4. Verify database connection
5. Check browser console for errors
