# 🎵 Spotify Clone

A full-featured Spotify clone built with modern web technologies. This app lets you stream music, chat with others in real-time, view analytics, and even get AI-based music recommendations.

---

## 🚀 Features

- 🎸 Listen to music, play next and previous songs  
- 🔈 Volume control with an interactive slider  
- 🎧 Admin dashboard to create and manage albums and songs  
- 💬 Real-time Chat App integrated into Spotify  
- 👨🏼‍💼 Online/Offline status indicators  
- 👀 See what other users are listening to in real-time  
- 📊 Aggregated data and charts in the Analytics page  
- 🤖 AI-powered music recommendation system  
- 🌐 Fully responsive and modern UI  

---

## 🤖 AI-Powered Recommendations

The AI feature personalizes your music experience using three types of recommendations:

- **Mood-based**: Songs that match your emotional state (e.g., Happy, Sad, Energetic, Relaxed)  
- **Time-based**: Music for different times of day (e.g., Morning, Afternoon, Evening, Night)  
- **Activity-based**: Playlists based on your current activity (e.g., Working, Exercising, Studying, Partying)  

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS  
- **Backend**: Node.js, Express, MongoDB  
- **Authentication**: Clerk  
- **AI Integration**: Gemini API  
- **Media Management**: Cloudinary  
- **Real-time Chat**: Socket.io or WebSockets  

---

## 🔐 Environment Variables

### Backend (`/backend/.env`)

```

PORT=your_port 
MONGODB_URI=your_mongodb_uri 
ADMIN_EMAIL=admin_email 
NODE_ENV=development_or_production

CLOUDINARY_API_KEY=your_key 
CLOUDINARY_API_SECRET=your_secret CLOUDINARY_CLOUD_NAME=your_cloud_name

CLERK_SECRET_KEY=your_clerk_secret CLERK_PUBLISHABLE_KEY=your_clerk_publishable GEMINI_API_KEY=your_gemini_key

```

---

### Frontend (`/frontend/.env`)

```

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable

```

---

