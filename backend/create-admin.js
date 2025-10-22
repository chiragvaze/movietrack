const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.error('❌ Error: MongoDB connection string not found');
            console.log('\nPlease make sure you have MONGO_URI or MONGODB_URI in your .env file\n');
            process.exit(1);
        }
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');
        
        // Get email from command line
        const email = process.argv[2];
        
        if (!email) {
            console.error('❌ Error: Please provide an email address');
            console.log('\nUsage: node create-admin.js <email>');
            console.log('Example: node create-admin.js admin@movietrack.com\n');
            process.exit(1);
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            console.log('\nPlease make sure the user is registered in the app first.');
            console.log('You can register at: http://localhost:3000/signup.html\n');
            process.exit(1);
        }
        
        // Check if already admin
        if (user.role === 'admin') {
            console.log(`ℹ️  User ${user.name} is already an admin\n`);
            console.log('User Details:');
            console.log('─────────────────────');
            console.log(`Name:  ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role:  ${user.role}`);
            console.log('─────────────────────\n');
            process.exit(0);
        }
        
        // Update user to admin
        user.role = 'admin';
        await user.save();
        
        console.log('✅ User successfully updated to admin!\n');
        console.log('User Details:');
        console.log('─────────────────────');
        console.log(`Name:  ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role:  ${user.role}`);
        console.log('─────────────────────\n');
        
        console.log('Next steps:');
        console.log('1. Go to http://localhost:3000/admin-login.html');
        console.log(`2. Login with email: ${user.email}`);
        console.log('3. Access the admin dashboard\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Run the script
createAdmin();
