#   🦉 OWL WATCH  🦉
Owl Watch is a Chrome extension designed to help users manage their tabs efficiently, with features that allow tracking, closing inactive tabs, removing dublication, voice command and improving productivity

![OWL WATCH](https://github.com/user-attachments/assets/a87625c6-6413-47fb-949f-589e3d8356c4)

# [CLIENT  (Frontend UI)](./client) 
## 🧰 Features
### UI/UX 📱⇢💻

* Watcher : background tab watcher
* Tab Manager : Tab managemant
* Session Manager : Session Manager
* Quick Actions : Quick action Acesss
* Voice Command : Voice command Action
* Login : Google OAuth and Owl Watch API
### API Integration 🚀
- Connects with the Owl Watch (Backend)
- Authentication
- session storage
### Frontend Technology Stack 📚
* Framework: React.js
* Caching: Chrome Local storage
* HTTP: Axios
* Library: Material-UI, Framer-motion
* Styling: Material-UI, CSS

#  [SERVER (Backend API)](./server)
## 🧰 Features
### server
  - User Authentication with Passport and Google Oauth 🔐
  - Session storage and retreval in mongodb 🛢🔄
## Technology Stack 📚
- CORE: Express.js
- Transport: http
- Authentication: Passport, Google Oauth
- Database: MongoDb


## ⛩ Project Structure
```
📁 /Owl_watch/
│
├──📁 /client/  Owl watch chrome Extension App ui                        # go to client for 'client' Full structure                              
│     
└──📁 /server/   Owl watch api (session and Authentication management)   # go to server for 'server' Full structure      
```

## Installation ⬇️
```
$ git clone https://github.com/HucksApp/Owl-Watch   # Clone repo
# navigate to UI or API 
$ npm install    
```
