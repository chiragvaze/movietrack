# MovieTrack Backend API

Complete REST API for the MovieTrack application built with Node.js, Express, and MongoDB.

## 🚀 Features

- ✅ User authentication (signup/login) with JWT
- ✅ Secure password hashing with bcryptjs
- ✅ CRUD operations for movies
- ✅ User-specific data isolation
- ✅ Input validation
- ✅ Rate limiting
- ✅ Security headers with Helmet
- ✅ CORS enabled
- ✅ Error handling

## 📋 Prerequisites

Before running this backend, make sure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - **Local MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud - FREE) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)

## 🛠️ Installation

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` file with your settings:

**For Local MongoDB:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movietrack
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://127.0.0.1:5500
```

**For MongoDB Atlas (Cloud):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movietrack
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://127.0.0.1:5500
```

**Important:** Change `JWT_SECRET` to a random string!

### Step 3: Start MongoDB (if using local)

**Windows:**
```bash
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

### Step 4: Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
📍 API URL: http://localhost:5000
🌍 Environment: development
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Movies (All require authentication)

#### Get All Movies
```http
GET /api/movies
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query parameters:
GET /api/movies?status=watched
GET /api/movies?sort=title
```

#### Get Movie Statistics
```http
GET /api/movies/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Single Movie
```http
GET /api/movies/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Add Movie
```http
POST /api/movies
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "The Shawshank Redemption",
  "year": 1994,
  "status": "watched",
  "rating": 5,
  "notes": "Amazing movie!"
}
```

#### Update Movie
```http
PUT /api/movies/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "status": "watched"
}
```

#### Delete Movie
```http
DELETE /api/movies/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🗂️ Project Structure

```
backend/
├── models/
│   ├── User.js          # User model
│   └── Movie.js         # Movie model
├── routes/
│   ├── auth.js          # Authentication routes
│   └── movies.js        # Movie routes
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── .env                 # Environment variables (create this)
├── .env.example         # Environment example
├── .gitignore          # Git ignore file
├── package.json        # Dependencies
├── server.js           # Main server file
└── README.md           # This file
```

## 🔧 Testing with Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints
3. First, register a user
4. Copy the JWT token from the response
5. Use the token in the Authorization header for other requests

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - express-validator
- **Rate Limiting** - Prevents brute force attacks
- **Helmet** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Sensitive data protection

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running. Start it with `mongod`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` file or kill the process using port 5000

### JWT Error
```
Error: secretOrPrivateKey must have a value
```
**Solution:** Make sure JWT_SECRET is set in your `.env` file

## 📚 Environment Variables Explained

- `PORT` - Port number for the server (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_EXPIRE` - Token expiration time (e.g., 7d, 30d)
- `CLIENT_URL` - Frontend URL for CORS

## 🚀 Deployment

### Deploy to Render (Free)

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Set environment variables
6. Deploy!

### Deploy to Railway (Free)

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add MongoDB plugin
5. Set environment variables
6. Deploy!

## 📝 License

MIT License - Feel free to use for learning and personal projects.

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Make sure all dependencies are installed
3. Verify MongoDB is running
4. Check `.env` file configuration

---

**Built with ❤️ for MovieTrack**
