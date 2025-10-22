// Environment Configuration
// This file handles API URL configuration for different environments

const config = {
    development: {
        API_URL: 'http://localhost:5000'
    },
    production: {
        // Update this with your deployed backend URL after deployment
        API_URL: 'https://your-backend-url.onrender.com'
    }
};

// Detect environment
// In production, change this to 'production' or set via environment variable
const environment = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' 
                   ? 'development' 
                   : 'production';

// Export configuration
const API_URL = config[environment].API_URL;

console.log(`🌍 Environment: ${environment}`);
console.log(`🔗 API URL: ${API_URL}`);
