# MovelnSync - Carpool Backend

## Overview
This backend implements a robust carpooling API for a personal assignment project. It provides a comprehensive solution for connecting drivers and riders within organizations. Key features include:

1. **User Authentication (JWT + bcrypt)**
2. **RidePool creation, search, request, approval flows**
3. **Email notifications** (via SMTP/Nodemailer) for requests & approvals
4. **SOS endpoint** to alert driver/rider
5. **Caching** of search results (in-memory, TTL=5min)
6. **Monitoring**
7. **Global error & exception handling**

---

## Technical Implementation

1. **Authentication**  
   - JWT tokens (`jsonwebtoken`) with a secure `JWT_SECRET`  
   - Passwords hashed using `bcryptjs`  
   - `/api/auth/register` & `/api/auth/login` endpoints  
   - Protected routes via `middleware/auth.js`  

2. **Cost Estimation – Time and Space**  
   - **RidePool search**: O(log N) query on `departureTime` index, then O(K) for applying Haversine match to K candidates  
   - **Space**: Each ride document ~ <1KB; caching stores JSON arrays, typically <50KB per key  
   - **Commented complexities** in code (e.g., in `routes/rides.js`)  

3. **Handling System Failure Cases**  
   - **Global error handler** (`middleware/errorHandler.js`) catches all uncaught exceptions  
   - **Retry logic** in `EmailService` (up to 3 attempts with exponential backoff)  
   - **In-memory caching fallback**: If cache fails, requests still proceed to MongoDB  
   - **Healthcheck** (`GET /health`) ensures basic uptime check  
   - **PM2 (or nodemon in dev)** can be used to auto-restart on crash  

4. **Object-Oriented Programming Language (OOPS)**  
   - All services (`MatchService`, `EmailService`, `CacheService`) are ES6 classes using encapsulation  
   - If needed, we can extend `EmailService` for SMS notifications by subclassing a `NotificationService` base class (polymorphism demonstration)  
   - Mongoose schemas represent entities; models encapsulate data logic  

5. **Trade-offs in the System**  
   1. **MongoDB (NoSQL) vs. RDBMS**  
      - Chose MongoDB for schemaless flexibility and fast range queries on `departureTime`  
      - Trade: Loses relational joins; mitigated by denormalizing user email into ride responses  
   2. **In-Memory Cache vs. Redis**  
      - Chose `node-cache` (in-memory) for simplicity (no extra infrastructure)  
      - Trade: Cache is per-instance and not shared across multiple Node processes. If scaled to multiple servers, move to Redis.  
   3. **Haversine Stub vs. Real Google Directions API**  
      - Chose Haversine for constant-time proximity checks (no external API costs).  
      - Trade: Less accurate "route overlap"; acceptable for prototype.  

6. **System Monitoring**  
   - `prom-client` collects default Node metrics and HTTP request durations  
   - Expose `/metrics` for Prometheus to scrape (e.g., request rate, error rate, memory usage)  
   - `middleware/requestLogger.js` logs each request's method, URL, status, and latency
   - Logs are in JSON

7. **Caching**  
   - `CacheService` wraps `node-cache` with TTL=300s (5 minutes) and automatic eviction (LRU-like behavior)  
   - We cache "search rides" results under key:  
     ```
     search:{origLat}:{origLng}:{destLat}:{destLng}:{roundedTime}
     ```  
   - Reduces repeated MongoDB queries for frequent route-time combos  

8. **Error and Exception Handling**  
   - All controllers use `try/catch` and forward errors to `errorHandler`  
   - Consistent JSON error response:  
     ```json
     {
       "error": {
         "code": "ERROR_CODE",
         "message": "Human-readable message"
       }
     }
     ```  
   - Validation errors (400), Auth errors (401/403), Not Found (404), and Server errors (500) are uniformly handled  
   - Logs error stacks for debugging; alerts can be configured if error rates spike  

---

## Data Models

### User
- Authentication details (email, password hash)
- Profile information (name, display preferences)
- Role (driver or rider)
- Preferences (smoking, pets)

### RidePool
- Driver information
- Pickup and drop-off coordinates
- Departure time and seat availability
- Vehicle details
- Ride rules (female-only, smoking, pets)

### RideRequest
- Connection between rider and ride
- Request status (pending, approved, rejected)

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Rides
- `POST /api/rides` - Create a new ride
- `GET /api/rides/search` - Search for available rides
- `GET /api/rides/driver/:id/my-rides` - Get rides created by a driver
- `GET /api/rides/upcoming` - Get upcoming rides for a user
- `PATCH /api/rides/:id/status` - Update ride status

### Ride Requests
- `POST /api/rides/:id/request` - Request to join a ride
- `GET /api/rides/:id/requests` - Get requests for a ride
- `PATCH /api/rides/:rideId/requests/:requestId` - Approve/reject a request

---

## How to Run Locally

1. **Set up environment**  
   - Create `.env` with the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/carpooldb
     JWT_SECRET=your_jwt_secret_key
     EMAIL_HOST=smtp.example.com
     EMAIL_PORT=587
     EMAIL_USER=your_email@example.com
     EMAIL_PASS=your_email_password
     ```
   - Ensure MongoDB is running locally (`mongod --dbpath <your_db_path>`)  

2. **Install & Start**  
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Access API**
   - The API will be available at `http://localhost:5000/api`
   - Health check: `http://localhost:5000/health`
   - Metrics: `http://localhost:5000/metrics`
