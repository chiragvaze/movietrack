const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.error('❌ Error: MongoDB connection string not found');
            process.exit(1);
        }
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');
        
        // Find all users
        const users = await User.find({}, 'name email role status createdAt').sort({ createdAt: -1 });
        
        if (users.length === 0) {
            console.log('📝 No users found in the database.');
            console.log('\nPlease register a user first:');
            console.log('Go to: http://localhost:3000/signup.html\n');
            process.exit(0);
        }
        
        console.log(`📋 Found ${users.length} user(s):\n`);
        console.log('═══════════════════════════════════════════════════════════════');
        
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name}`);
            console.log(`   Email:   ${user.email}`);
            console.log(`   Role:    ${user.role}`);
            console.log(`   Status:  ${user.status}`);
            console.log(`   Joined:  ${user.createdAt.toLocaleDateString()}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('\nTo make a user admin, run:');
        console.log('node create-admin.js <email>\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Run the script
listUsers();
