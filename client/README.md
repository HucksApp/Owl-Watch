# client (Owl Watch UI)
Chrome browser (tab and session manager) app UI
## ⛩ Project Structure
```
📁 /Client/
│
├──📁 /public/                                # Public static files (HTML, icons)
│     ├──📁 /icons/                           # extension icons
│     │     ├──📄 logo16.png                  # icon 16 X 16
│     │     ├──📄 logo46.png                  # icon 48 x 48
│     │     └──📄 logo128.png                 # icon 128 x 128
│     │
│     ├──📄 background.js                     # service worker (Watcher Utility , session and Tab Manager Utility)
│     ├──📄 manifest.json                     # Owl Watch extention app configuration and permissions
│     └──📄 index.html                        # UI entry point
│    
├──📁 /src/                                   # Main source code for the frontend
│     ├──📁 /components/                      # Reusable UI components 
│     │     └──📄 ....js                      # All jsx component files
│     │
│     ├──📁 /assets/                          # UI images
│     │     └──📄 ....png                     # --
│     │
│     ├──📁 /context/                         # All utility Functions structure
│     │     ├──📄 /AuthContext.js             # Authentication Functions
│     │     ├──📄 /ComandStructureContext.js  # worker utility Context
│     │     └──📄 /VoiceComandContext.js      # Voice Commands utility Context
│     │
│     ├──📁 /page/                            # main pages/ main routes
│     │     ├──📄 /Login.js                   # react component
│     │     └──📄 /Dashboard.js               # react component
│     │
│     ├──📁 /services/                        # services used
│     │     ├──📄 /api.js                     # api services (Axios configuration)
│     │     └──📄 /localstorage.js            # cache data management
│     │
│     ├──📁 /styles/                          # styles and theme
│     │     ├──📄 /theme.js                   # MUI Theme configuration
│     │     └──📄 ......css                   # css files
│     │
│     ├──📄 /App.js                           # Main application entry point
│     └──📄 /index.js                         # React entry point
│
├──📄 /.env                                   # Environment variables for app
├──📄 /package.json                           # Project dependencies and scripts
├──📄 /package-lock.json                      # Lock file for exact package versions
└──📄 /README.md                              # Frontend-specific README

```

## Installation ⬇️
```
$ git clone https://github.com/HucksApp/Owl-Watch
$ cd client
$ npm install
$ npm start
```

