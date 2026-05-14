# Campus Notification Platform - System Design

## Stage 1: REST API Design

### Core Actions
1. Fetch all notifications for a user (with pagination).
2. Fetch unread notifications for a user.
3. Mark a specific notification as read.
4. Mark all notifications as read for a user.
5. Create a new notification (Admin/System action).

### REST API Endpoints

#### 1. Get Notifications
- **Endpoint:** `GET /api/v1/notifications`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `status` (string, enum: ['all', 'unread', 'read'], default: 'all')
  - `type` (string, enum: ['Placement', 'Event', 'Result'], optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_12345",
        "type": "Placement",
        "title": "Amazon Campus Drive",
        "message": "Amazon is visiting for SDE 1 role on 25th May.",
        "priority": 3,
        "isRead": false,
        "createdAt": "2026-05-14T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100
    }
  }
}
```

#### 2. Mark Notification as Read
- **Endpoint:** `PATCH /api/v1/notifications/:id/read`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{}`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "notif_12345",
    "isRead": true,
    "readAt": "2026-05-14T10:30:00Z"
  }
}
```

#### 3. Mark All Notifications as Read
- **Endpoint:** `PATCH /api/v1/notifications/read-all`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{}`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read."
}
```

### Real-Time Mechanism
For real-time notifications, Server-Sent Events (SSE) or WebSockets (e.g., using Socket.io) is recommended.
- **WebSocket Connection:** `wss://api.domain.com/notifications`
- **Authentication:** Token passed during connection handshake.
- **Event:** `new_notification` emitted from the server to the specific student's room/channel.

## Stage 2: Database Design

### Database Choice: PostgreSQL
**Reasoning:** While NoSQL (MongoDB) is flexible, a relational database like PostgreSQL is excellent for this because the schema is highly structured (users, notifications, mapping between them). Notifications have strong relationships with users, and PostgreSQL's powerful indexing and partitioning capabilities make it highly scalable for time-series-like data.

### Schema Design

**Table: users**
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `created_at` (TIMESTAMP)

**Table: notifications**
- `id` (UUID, Primary Key)
- `type` (ENUM: 'Placement', 'Event', 'Result')
- `title` (VARCHAR)
- `message` (TEXT)
- `priority` (INT)
- `created_at` (TIMESTAMP)

**Table: user_notifications**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> users.id)
- `notification_id` (UUID, Foreign Key -> notifications.id)
- `is_read` (BOOLEAN, Default: false)
- `read_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)

### Scaling Considerations & Solutions
**Problem:** As data volume increases (e.g., 50,000 students × 100 notifications = 5,000,000 records in `user_notifications`), queries for fetching notifications will slow down.
**Solutions:**
1. **Indexing:** Add composite indexes on `(user_id, is_read)` and `(user_id, created_at)` to speed up lookups.
2. **Table Partitioning:** Partition the `user_notifications` table by date (`created_at`). Old notifications are rarely queried.
3. **Archiving:** Move notifications older than 6 months to cold storage.

### SQL Queries
**Fetch unread notifications for a user:**
```sql
SELECT n.id, n.type, n.title, n.message, un.is_read, n.created_at
FROM user_notifications un
JOIN notifications n ON un.notification_id = n.id
WHERE un.user_id = 'user-uuid' AND un.is_read = false
ORDER BY n.created_at DESC
LIMIT 20 OFFSET 0;
```

**Mark a notification as read:**
```sql
UPDATE user_notifications
SET is_read = true, read_at = NOW()
WHERE user_id = 'user-uuid' AND notification_id = 'notif-uuid';
```

## Stage 3: Query Optimization

### Analysis of the Slow Query
Assume the slow query is:
```sql
SELECT * FROM notifications 
WHERE student_id = ? AND is_read = false 
ORDER BY created_at DESC;
```
*Note: In the schema above, this maps to the `user_notifications` table.*

**Why is it slow?**
With 5,000,000 records, filtering by `student_id` and `is_read`, and then sorting by `created_at` requires a full table scan or inefficient index usage if proper indexes aren't in place. The database has to read rows, filter them, and sort them in memory (filesort).

### Optimization Strategy
1. **Create a Composite Index:**
   A B-Tree index on `(student_id, is_read, created_at DESC)` allows the database engine to locate the exact subset of rows for the student that are unread, already in the sorted order.
   ```sql
   CREATE INDEX idx_student_unread_date ON notifications(student_id, is_read, created_at DESC);
   ```
2. **Select Specific Columns:** Replace `SELECT *` with specific columns to reduce memory overhead and network payload.
3. **Pagination:** Always enforce `LIMIT` and `OFFSET` (or keyset pagination) so the DB doesn't process massive result sets.

## Stage 4: Performance Solutions

### Caching
- **Implementation:** Use Redis to cache the unread notification count for each user, as this is queried frequently (e.g., for badges on the UI).
- **Invalidation:** Whenever a new notification is sent or a notification is marked as read, increment/decrement the Redis counter.
- **Cache Key:** `user:{user_id}:unread_count`

### Real-Time Mechanisms
- Use WebSockets to push notifications directly to the client. This prevents clients from aggressively polling the database, significantly reducing the load on the backend.

### Pagination vs. Infinite Scroll
- Use **Cursor-based pagination** (Keyset pagination) instead of offset-based pagination. Offset-based (`OFFSET 100000`) becomes very slow at high page numbers because the database still has to traverse skipped rows. Cursor-based (`WHERE created_at < ?`) uses indexes efficiently.

## Stage 5: Async Processing

### Redesign with Job Queues
Sending notifications (e.g., emails/push + saving to DB) synchronously blocks the API response. We should decouple this using a message broker (RabbitMQ or Redis BullMQ).

**Architecture:**
1. Admin triggers "Send Notification".
2. API creates the main `Notification` record.
3. API pushes a job to the Queue: `{ notification_id: '123', target: 'all_students' }`.
4. API responds immediately: `202 Accepted`.
5. Background Worker picks up the job, fetches all 50,000 students in batches, and inserts records into `user_notifications`.
6. Worker emits WebSocket events to connected clients.

**Error Handling & Reliability:**
- **Retries:** If a worker fails (e.g., DB connection issue), the queue automatically retries with exponential backoff.
- **Dead Letter Queue (DLQ):** Jobs that fail multiple times are moved to a DLQ for manual inspection.
- **Idempotency:** Ensure the worker checks if a notification was already processed for a user to avoid duplicates if a job is retried.

---

## Stage 6: Priority Inbox Implementation
*Implementation approach:*
1. The backend periodically polls `http://4.224.186.213/evaluation-service/notifications` (or accepts a direct call).
2. Uses the `AF_JG` logger to log requests and parsing steps.
3. Implements sorting based on priority constraints: Placement (High) > Result (Medium) > Event (Low), then sorts by chronological order (newest first).
4. Top 10 notifications are returned to the client.

*(Code and Screenshots available in respective project directories).*

---

## Stage 7: Frontend Implementation
*Implementation approach:*
1. React frontend built with Next.js 15.
2. Styling limited strictly to Material UI.
3. State management handling local priority toggle (sorting locally or re-fetching via API).
4. Unread items distinctly styled (bold text, subtle background highlight).
5. Integrated `axios` with error boundaries for resilience.
