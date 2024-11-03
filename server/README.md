
# Server
Owl watch Authentication and storage server.

## ⛩ Project Structure
```
📁 /Owl_Watch/
│
├──📁 /auth/                                 # Authentication
│     └──📄 passport.js                      # Pasport and google Oauth setup
│
├──📁 /controllers/                          # Logics for handling requests
│     ├──📄 authController.js                # Authentication handling
│     ├──📄 userController.js                # user request handling
│     └──📄 sessionController.js             # UI (Browser session) related request handling
│
├──📁 /middleware/                           # Authenticator middleware
│     └──📄 authMiddleware                   # ---
│
├──📁 /models/                               # Database models (if using a database)
│     ├──📄 userModel.js                     # Schema for user data
│     └──📄 sessionModel.js                  # Schema for tab session data
│
├──📁 /page/                                 # Page view
│     └──📄 ...js, .htm, .png,               # page and page assets
│
├──📁 /routes/                               # API routes
│     ├──📄 authRoutes.js                    # API endpoints authentication
│     ├──📄 userRoutes.js                    # API endpoints for user data
│     └──📄 sessionRoutes.js                 # API endpoints for session management
│
├──📁 /debug/                               # Debugging and development helper
│     └──📄 debug.js                        # show all api accessible Routes
│
│
├──📄 /.env                                 # server enviromental variables
├──📄 /app.js                               # server Defination and initialization
├──📄 nodemon.json                          # dev server configuration
├──📄 /server.js                            # Main server file to start the application
├──📄 /package.json                         # Project dependencies and scripts
└──📄 /README.md                            # Backend Specific README.md

```

## Installation ⬇️
```
$ git clone https://github.com/HucksApp/Owl-Watch
$ cd server
$ npm install
$ npm start # run Locally
 or
$ npm run dev  # for nodemon development server
```
