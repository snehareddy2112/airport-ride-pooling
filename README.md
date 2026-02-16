# 🚗 AIRPORT RIDE POOLING SYSTEM

A scalable backend system that groups passengers into shared airport cabs while respecting seat, luggage, and detour constraints. Designed to handle high concurrency with low latency using optimized matching algorithms and MongoDB transactions.

---

## 📌 1. System Overview

This system:

* Groups passengers traveling in the same direction into shared cabs
* Respects seat and luggage capacity constraints
* Ensures passenger-specific detour tolerance
* Minimizes total travel deviation
* Handles real-time cancellations safely
* Dynamically calculates fare per passenger
* Designed to scale to **10,000 concurrent users** and **100 RPS**

---

## 🛠 Tech Stack

| Category             | Technology                      |
| -------------------- | ------------------------------- |
| Backend              | Node.js, Express.js             |
| Database             | MongoDB (Atlas)                 |
| Data Modeling        | Mongoose                        |
| Concurrency Handling | MongoDB Transactions            |
| Matching Logic       | Greedy Route Matching Algorithm |
| Pricing Logic        | Dynamic Fare Calculation Engine |
| Frontend (Demo)      | HTML, CSS, JavaScript           |
| API Testing          | Postman                         |
| Version Control      | Git & GitHub                    |

---

## 🚀 Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/snehareddy2112/airport-ride-pooling
cd airport-ride-pooling/backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 4️⃣ Run Server

```bash
node server.js
```

### 🌐 Open in Browser

```
http://localhost:5000
```

---

## 📡 API Documentation

Postman Collection available at:

```
/docs/airport-ride-pooling.postman_collection.json
```

Import it into Postman to test all APIs.

---

## 1️⃣ Create Ride

**POST** `/ride/request`

### 📥 Request

```json
{
  "pickup_lat": 17.2403,
  "pickup_lng": 78.4294,
  "drop_lat": 17.3850,
  "drop_lng": 78.4867,
  "seats_required": 1,
  "luggage_count": 1,
  "detour_tolerance_km": 5,
  "direction": "FROM_AIRPORT"
}
```

### ✅ Success Response

```json
{
  "message": "Ride booked successfully",
  "fare": 120,
  "ride": {
    "_id": "ride_id",
    "ride_group_id": "group_id",
    "status": "CONFIRMED"
  }
}
```

### ❌ Error Example (Seats Exceeded)

```json
{
  "message": "Ride booking failed",
  "error": "Seats requested exceed cab capacity"
}
```

### ❌ Error Example (Luggage Exceeded)

```json
{
  "message": "Ride booking failed",
  "error": "Luggage exceeds cab capacity"
}
```

---

## 2️⃣ Cancel Ride

**POST** `/ride/cancel/:rideRequestId`

### ✅ Success Response

```json
{
  "message": "Ride cancelled successfully"
}
```

### ❌ Error Example

```json
{
  "message": "Ride cannot be cancelled"
}
```

---

## 3️⃣ Get Ride Request

**GET** `/ride/request/:id`

Returns ride details including fare and status.

---

## 4️⃣ Get Ride Group

**GET** `/ride/group/:id`

Returns:

* `cab_id`
* `direction`
* `seats_used`
* `luggage_used`
* `status`

---

## 5️⃣ List Active Groups

**GET** `/ride/groups`

Returns all active forming groups.

---

# 🧠 Matching Algorithm (DSA Approach)

### Steps

1. Fetch candidate groups where:

   ```
   status = FORMING
   direction = requested direction
   ```

2. For each group:

   * Validate seat capacity
   * Validate luggage capacity
   * Simulate route including new passenger
   * Compute additional detour distance
   * Validate passenger detour tolerance

3. Choose group with minimum additional distance.

4. If none valid → create new group.

---

### ⏱ Time Complexity

Let:

* **G** = number of forming ride groups
* **P** = passengers per group (max 4)

Matching complexity:

```
O(G * P log P)
```

Since **P ≤ 4 (constant)**, effectively:

```
O(G)
```

Scales efficiently.

---

### 📦 Space Complexity

```
O(G + P)
```

Minimal in-memory overhead.

---

# 🔒 Concurrency Handling Strategy

### Problem

Multiple users may try to join the same ride group simultaneously.

### Solution

* MongoDB transactions
* Atomic `findOneAndUpdate`
* Capacity constraints enforced inside update query
* Rollback on failure

### Prevents

* Seat overbooking
* Luggage overflow
* Race conditions

---

# 🗄 Database Schema & Indexing

## RideGroup

### Fields

* `cab_id`
* `direction`
* `seats_used`
* `luggage_used`
* `status`

### Index

```js
{ status: 1, direction: 1, seats_used: 1, luggage_used: 1 }
```

Optimizes matching queries.

---

## RideRequest

### Fields

* `pickup_lat`
* `drop_lat`
* `seats_required`
* `luggage_count`
* `detour_tolerance_km`
* `ride_group_id`
* `fare`
* `status`

### Index

```js
{ ride_group_id: 1, status: 1 }
```

Optimizes group passenger lookups.

---

# 💰 Dynamic Pricing Formula

```
baseFare = baseDistance × rate_per_km

sharedFare = baseFare / passengerCount

surgeFactor = 1 + (activeGroups / totalActiveCabs)

detourCost = extraDistance × detour_rate

finalFare =
(sharedFare × surgeFactor) + detourCost
```

Each passenger pays an individual share of total route cost.

---

## 🏗 High Level Architecture

The system follows a layered architecture:

* **Client Layer** – Browser UI or Postman sends API requests.
* **API Layer (Express.js)** – Handles routing and request parsing.
* **Controller Layer** – Validates input and forwards requests.
* **Service Layer** – Contains core business logic and transaction handling.
* **Matching Engine** – Responsible for grouping passengers.
* **Pricing Engine** – Calculates dynamic fare.
* **Database Layer (MongoDB)** – Stores ride groups and ride requests with proper indexing.

### Scalability Design

* Stateless APIs allow horizontal scaling.
* MongoDB Atlas supports clustering and sharding.
* Indexed queries ensure low-latency data access.

---

## 🧩 Low Level Design

### Core Components

**RideRequest**

* Stores passenger booking details.
* Linked to a RideGroup.

**RideGroup**

* Represents a shared ride.
* Tracks seat and luggage utilization.

**Cab**

* Defines vehicle capacity constraints.

**RideService**

* Handles ride creation and cancellation.
* Manages database transactions.

**MatchingEngine**

* Implements grouping logic.

**PricingEngine**

* Calculates per-passenger fare.

---

## 🔧 Design Principles Used

* **Separation of Concerns** – Controllers, services, and engines are separated.
* **Transaction Safety** – MongoDB transactions prevent race conditions.
* **Stateless API Design** – Enables horizontal scaling.
* **Modular Architecture** – Matching and pricing are independently extensible.

---

# 📊 Scalability Justification

## ✅ 10,000 Concurrent Users

* Stateless APIs allow horizontal scaling
* Multiple Node instances behind load balancer
* MongoDB Atlas cluster support

## ✅ 100 Requests Per Second

* Indexed database queries
* Lightweight O(n) matching
* No external API calls
* Single transaction per request

## ✅ Latency < 300ms

* Indexed filters
* Small constant passenger size (≤4)
* Minimal computation per request
* Efficient DB operations

---

# 📌 Assumptions

* Coordinates are pre-resolved (via geocoding in real-world systems)
* Cab capacity fixed at 4 seats & 4 luggage
* Matching based on drop proximity
* No real-time GPS tracking implemented (design-ready)

---

# 🧪 Example Flow

* Create first ride → New group created
* Create second nearby ride → Joins same group
* Create distant ride → New group created
* Cancel ride → Seats updated atomically

---

# 📦 Deliverables Included

✔ Complete working backend
✔ Demo UI
✔ Postman API documentation
✔ Indexed MongoDB models
✔ Concurrency-safe booking
✔ Algorithm complexity explanation
✔ Scalability justification

---

## 👩‍💻 Author

**Sneha**
