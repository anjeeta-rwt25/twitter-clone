# 🐦 Twitter Clone

A Twitter-like social media app built with React, Firebase, and Tailwind CSS.
Includes authentication, tweeting, profiles, notifications, messaging with Gemini AI bots and a responsive Twitter-style layout.

# ✨ Features

🔑 Firebase Authentication (Signup/Login/Logout)
🏠 Twitter-style Sidebar navigation (Home, Explore, Notifications, Messages, Profile)
📝 Tweet feed with text & optional images
🔍 Explore Page with Trends + Who to follow
💬 Real-time Messages (via Firestore)
🤖 AI Bot replying using Gemini API via Firebase Functions
🔔 Notifications (with badge counters)
👤 Profile page with user tweets
📱 Responsive Layout with Sidebar + Feed + Right Sidebar

# 🛠️ Tech Stack

Frontend: React, React Router, Tailwind CSS
Backend: Firebase (Auth, Firestore, Storage, Functions)
AI: Gemini API (@google/generative-ai) via Firebase Cloud Functions
Hosting: Firebase Hosting

# 📂 Project Structure

twitter-clone/
│
├── backend/                # Backend API + server
│   ├── server.js           # Express server entry
│   ├── package.json        # Backend dependencies
│   ├── requirements.txt    # API/other requirements
│   └── src/
│       ├── models/         # Database schemas
│       ├── routes/         # API routes
│       └── utils/          # Helper functions
│
├── frontend/               # React frontend app
│   ├── public/
│   │   └── index.html      # Root HTML template
│   │
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── AuthForm.jsx          # Login/signup form
│   │   │   ├── Feed.jsx              # Tweet feed display
│   │   │   ├── ProtectedRoute.jsx    # Secure routes
│   │   │   ├── PublicRoute.jsx       # Public routes
│   │   │   ├── RightBar.jsx          # Trends/suggestions
│   │   │   ├── Sidebar.jsx           # Navigation menu
│   │   │   └── TweetBox.jsx          # Post new tweet
│   │   │
│   │   ├── pages/                    # Full app pages
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Signup page
│   │   │   ├── Profile.jsx           # User profile page
│   │   │   ├── ProfileSetup.jsx      # Profile setup page
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Feed.js               # Feed container
│   │   │   ├── Home.jsx              # Home timeline
│   │   │   ├── Explore.jsx           # Explore page
│   │   │   ├── Notification.jsx      # Notifications
│   │   │   └── Messages.jsx          # Chat/messages page
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js        # Auth state manager
│   │   │
│   │   ├── firebase.js     # Firebase config
│   │   ├── App.jsx         # Root React component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   │
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # TailwindCSS setup
│   └── postcss.config.js   # PostCSS setup
│
├── README.md               # Project documentation

# 📦 Installation & Setup

1️⃣ Clone the Repo
git clone https://github.com/anjeeta-rwt25/Twitter-clone.git
cd twitter-clone

2️⃣ Install Frontend Dependencies
npm install react react-dom react-router-dom firebase tailwindcss postcss autoprefixer react-icons
* If you need Tailwind setup:
   npx tailwindcss init -p

3️⃣ Setup Firebase Project
1.Go to Firebase Console
2.Create a new project
3.Enable:
   (i)Authentication → Email/Password
   (ii)Firestore Database
   (iii)Storage
   (iv)Functions
4.Add Firebase config to src/firebase.js:
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

4️⃣ Backend Setup (Firebase Functions + Gemini API)

Go inside backend/
  cd backend
npm install          # install backend dependencies
  * For Python dependencies (if required)
      python3 -m venv .venv
      source .venv/bin/activate
     pip install -r requirements.txt
npm init -y
npm install firebase-functions firebase-admin @google/generative-ai dotenv
  
Create .env file inside backend/:
  GEMINI_API_KEY=your-gemini-api-key

6️⃣ Run Locally

Frontend:
  npm start

Backend:
  node server.js
  
📄 License

This project is licensed under the MIT License.
