**AIRPORT RIDE POOLING SYSTEM**

A scalable backend system that groups passengers into shared airport cabs while respecting seat, luggage, and detour constraints. Designed to handle high concurrency with low latency using optimized matching algorithms and MongoDB transactions.

**📌 1. System Overview**

This system:

* Groups passengers traveling in the same direction into shared cabs

* Respects seat and luggage capacity constraints

* Ensures passenger-specific detour tolerance

* Minimizes total travel deviation

* Handles real-time cancellations safely

* Dynamically calculates fare per passenger

* Designed to scale to 10,000 concurrent users and 100 RPS

**🛠 Tech Stack**

| Category                 | Technology |
|--------------------------|------------|
| Backend                  | Node.js, Express.js |
| Database                 | MongoDB (Atlas) |
| Data Modeling            | Mongoose |
| Concurrency Handling     | MongoDB Transactions |
| Matching Logic           | Greedy Route Matching Algorithm |
| Pricing Logic            | Dynamic Fare Calculation Engine |
| Frontend (Demo)          | HTML, CSS, JavaScript |
| API Testing              | Postman |
| Version Control          | Git & GitHub |


**🚀 Setup Instructions**

**1️⃣ Clone Repository**

git clone https://github.com/snehareddy2112/airport-ride-pooling

cd airport-ride-pooling/backend

**2️⃣ Install Dependencies**

npm install

**3️⃣ Configure Environment**

Create .env file:

MONGO_URI=your_mongodb_connection_string

PORT=5000

**4️⃣ Run Server**

node server.js


**Open browser**

http://localhost:5000
