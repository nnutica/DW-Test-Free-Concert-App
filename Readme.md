# 🎟️ DW-Test: Full-Stack Reservation System

**Developed by:** Nitinat Loruthai (Nut)  
**Role:** Full-Stack Developer  
**Assignment:** Full-stack developer assignment (Next.js + NestJS) 

---

A high-performance, responsive web application for discovering and booking concert tickets. Built with a modern tech stack focusing on scalability, security, and exceptional user experience.

## 🏗️ Architecture & Implementation

The project is structured as a **Monorepo** to ensure seamless orchestration between the frontend and backend services.

- **Frontend (Next.js 16+):** Developed with a focus on
- **Responsive Design** and Server-side data fetching. Styled using
- **Tailwind CSS** with custom HTML/CSS components to meet Figma specifications.
- **Backend (NestJS):** Built using a modular architecture (Controllers, Services, DTOs) for clean separation of concerns.
- **Database (PostgreSQL):** Containerized via Docker and managed through **Prisma ORM** for type-safe database access and versioned migrations.
- **Authentication:** Implemented **JWT-based authentication** with Role-Based Access Control (RBAC) to distinguish between `ADMIN` and `USER` roles.

## 🚀 Getting Started (Run in < 5 Minutes)

The entire environment is containerized for easy setup.

### 1. Prerequisites

- Docker and Docker Compose installed.
- Git installed.

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/nnutica/DW-Test-Free-Concert-App.git
cd DW-Test-Free-Concert-App

# Start the application
docker-compose up --build


3. Access the Services
Frontend: http://localhost:3000

Backend API: http://localhost:3001

Database: localhost:5432 (DB Name: DW_TEST)
```

### 4. Testing & Validation

We prioritize reliability and robustness through comprehensive testing.

- **Backend Unit Tests:** Covers CRUD operations, reservation logic, and edge cases such as booking full concerts.

```bash
cd backend && npm run test
Validation: Strict server-side validation using class-validator to handle unauthorized roles or invalid data.
```

### 5. Work Log & Process Review

This project was completed in approximately 2.5 hours of active development, demonstrating efficient planning and execution.

- **11:00 - 12:00:** Project initialization, Docker setup, and JWT Authentication system.

- **13:30 - 14:00:** Backend API development (Concerts CRUD & Reservation Logic).

- **14:30 - 15:30:** Frontend Responsive UI implementation and API Integration.

- **15:30 - 16:00:** Unit Testing, final bug fixes, and documentation.

### 6. Tech Stack & Libraries

- **Core:** Next.js, NestJS, TypeScript

- **Database:** PostgreSQL, Prisma ORM

- **Styling:** Tailwind CSS

Security: Passport.js, JWT, Bcrypt

Validation: Class-validator

Tools: Docker, Docker Compose, Jest

💡 Bonus Responses

### 1. Performance Optimization

To handle massive datasets and high traffic, I would implement:

- **Caching**: Utilize Redis to cache concert listings and availability, reducing the load on PostgreSQL.

- **Indexing**: Apply database indexes on frequently queried columns like `concert_id` and `user_id`.

CDN: Use a Content Delivery Network for static assets to improve global load times.

2. Concurrency Control (Race Conditions)
   To prevent over-booking when 1,000 users try to reserve the last 10 seats simultaneously:

Database Transactions: Wrap the seat availability check and the reservation creation in a single ACID Transaction.

Pessimistic Locking: Implement SELECT FOR UPDATE on the concert row during the transaction to lock the record until the seat is confirmed.

Message Queues: For extreme scale, use a queue (like BullMQ) to process booking requests sequentially.
