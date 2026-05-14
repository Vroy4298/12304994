# Stage 1

## Notification API

Backend API used:

GET /api/notifications

This endpoint returns notifications after sorting them based on priority and latest timestamp.

Priority order used:
1. Placement
2. Result
3. Event

I used this order because placement related notifications are more important for students.

---

# Stage 2

## Database Design

For database I think PostgreSQL is a good option because notification data is structured and relational.

Possible tables:

### students
- id
- name
- email
- roll_no

### notifications
- id
- student_id
- type
- message
- timestamp
- is_read

Indexes can be added on:
- student_id
- type
- timestamp

This helps while filtering and sorting notifications.

---

# Stage 3

## Query Optimization

As notification data increases, queries become slower especially during sorting and filtering.

Adding indexes on every field is not a good idea because inserts and updates also become slower.

A better approach is using:
- composite indexes
- pagination
- optimized filtering queries

---

# Stage 4

## Scaling and Performance

Fetching notifications repeatedly from database can increase load.

To improve performance:
- caching can be used
- pagination can reduce response size
- old notifications can be archived

This makes the system more scalable for large number of users.

---

# Stage 5

## Async Processing

Sending notifications one by one synchronously can slow down the system.

Using queues improves performance because notifications can be processed in background.

Tools like RabbitMQ or Kafka can also be used in large scale systems.

---

# Stage 6

## Backend Implementation

Backend was built using:
- Node.js
- Express

Features implemented:
- custom logging middleware
- API integration using Bearer token
- notification priority sorting
- latest notification filtering

Notifications are fetched from the provided API and sorted based on:
Placement > Result > Event

---

# Stage 7

## Frontend Implementation

Frontend was built using:
- Next.js
- Material UI

The dashboard displays notifications using cards and colored labels.

Frontend fetches data from backend API and displays latest priority notifications.