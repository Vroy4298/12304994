# Stage 1

## APIs

GET /api/notifications

Returns notifications sorted based on priority and latest timestamp.

Notification Types:
- Placement
- Result
- Event

# Stage 2

PostgreSQL is a good choice because notifications are relational and large in number.

Tables:
- students
- notifications

Indexes should be added on:
- student_id
- type
- timestamp

# Stage 3

The query becomes slow because the table grows very large.

Adding indexes on every column is not good because inserts become slower.

Composite indexes are better.

# Stage 4

Notifications should not be fetched from database on every refresh.

Caching and pagination can reduce database load.

# Stage 5

The current implementation is synchronous and slow.

Using queues can make notification sending faster and more reliable.

# Stage 6

Notifications are fetched from the provided API and sorted by:
Placement > Result > Event

Latest notifications are shown first.

# Stage 7

Frontend built using Next.js and Material UI.

Displays notifications in card layout.