🏥 MediPro Server

Backend API for MediPro Hospital Website

MediPro Server is the backend for the MediPro Hospital Management Web Application.
It provides REST APIs for user appointments, doctor management, and hospital-related product operations.
All CRUD operations (GET, POST, PUT, DELETE) are implemented.

🚀 Features
Appointment Management

Book doctor appointments

Save appointment data

View user-specific appointment history

Doctor Management

GET all doctors

POST new doctors

PUT update doctor info

DELETE doctors

Hospital Products & Shop

GET all products

POST new products

PUT update products

DELETE products

Cart & order management

Authentication

JWT-based authentication

User login & registration

Protected API routes

🛠️ Technologies Used
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API framework
MongoDB	Database
Mongoose / Native Driver	Database operations
JWT	Authentication
Dotenv	Environment variables management
Cors	API security
📁 Folder Structure
medipro-server/
│
├── index.js          # Main server file
├── .env              # Environment variables (PORT, DB URI)
├── package.json      
│
├── routes/           # API routes
│     ├── doctors.js
│     ├── appointments.js
│     ├── products.js
│     └── users.js
│
├── controllers/      # Route handlers
├── middleware/       # JWT auth middleware
└── models/           # MongoDB schema models

📡 API Operations
GET

/doctors → Get all doctors

/products → Get all hospital products

/appointments/:email → Get user appointments

POST

/addDoctor → Add a new doctor

/appointments → Create a new appointment

/addProduct → Add a new product

PUT

/updateDoctor/:id → Update doctor information

/updateProduct/:id → Update product

DELETE

/deleteDoctor/:id

/deleteProduct/:id

/deleteAppointment/:id

🔐 Authentication (JWT)

Sensitive routes are protected using JWT tokens:

Authorization: Bearer <token>

▶ How to Run Locally
git clone https://github.com/1997Maruf/medipro-server.git
cd medipro-server
npm install
npm start


Create a .env file:

PORT=5000
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

🌐 Related Links

Client Live Link: https://unrivaled-frangollo-8524c5.netlify.app/

Client GitHub Repo: https://github.com/1997Maruf/medipro-clint

Server GitHub Repo: https://github.com/1997Maruf/medipro-server
