# Real-Time Chat Application

This is a fully-featured real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for instant messaging. It includes a responsive user interface with support for both light and dark modes, group management, user profiles, and a range of other features to enhance the chatting experience.

## Features

1. **Secure JWT authentication**: Ensures secure login and session management.
2. **MongoDB data storage**: Stores user information, messages, and groups.
3. **Real-time messaging with Socket.IO**: Instant delivery of messages in both direct and group chats.
4. **User profile and group management**: Users can manage their profiles and create or join groups.
5. **Light and dark mode support**: UI theme can be toggled between light and dark modes.
6. **Responsive UI with Chakra UI**: The design adapts seamlessly across various devices and screen sizes.
7. **Online status tracking**: Real-time updates to show who is online.
8. **Typing event detection**: Displays when a user is typing in a chat.
9. **Image compression for message attachments**: Images sent in chat are automatically compressed to save bandwidth.
10. **Framer Motion for animations**: Smooth animations for UI transitions.
11. **Deployed on Render**: The app is hosted on Render for live access.
12. **Used Joi library for backend validation**: Ensures that input data is valid and secure.



## Tech Stack

- **Frontend**: React, Chakra UI, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **Real-time Communication**: Socket.IO
- **Validation**: Joi for backend validation
- **Hosting**: Render

## Setup and Installation

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Render](https://render.com/) account (optional for deployment)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
2. Navigate to the backend folder:

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
3. Install dependencies:
   ```bash
   npm install
4. Create a .env file with the following environment variables:

   ```bash
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=http://localhost:5000
   PORT=3000
5. Start the backend server:
   ```bash
   node index.js

### Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd client
2. Install dependencies:
   ```bash
   npm install
3. Update BASE_URL in assets/BASE_URL:
   ```bash
   BASE_URL=http://localhost:3000
4. Start the react app:
   ```bash
   npm run dev
   ```

## Run the Application

1. Ensure both the backend and frontend servers are running.
2. Open your browser and navigate to [http://localhost:5000](http://localhost:5000). ( whatever is your frontend url)

## Usage

- **Sign Up**: Create a new account.
- **Login**: Log in securely using your credentials.
- **Create or Join Groups**: Manage or join chat groups.
- **Send Messages**: Exchange real-time messages with other users or groups.
- **Toggle Theme**: Switch between light and dark modes.
- **View Profiles**: Manage your user profile and view others.
- **Typing Indicator**: See when someone is typing in the chat.
- **Online status**: See users online/offline in real-time.

## Deployment

This application is deployed on Render. You can check it out live at:
[Live Demo](https://chat-app-5u97.onrender.com/)

## Contributing

Feel free to open issues or submit pull requests for improvements. All contributions are welcome!

