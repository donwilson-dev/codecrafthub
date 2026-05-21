# The CodeCraftHub learning management system (LMS)

A simple REST API to track personal learning goals and courses.

---

# Overview

CodeCraftHub helps developers keep track of courses they want to learn. Built with Node.js and Express, the platform provides a straightforward REST API for managing a learner's journey.

This project uses a local JSON file (`courses.json`) for data persistence instead of a database, making it beginner-friendly and easy to understand.

---

# Features

- Full CRUD operations for course management
- JSON file-based storage (no database needed)
- RESTful API design
- Proper error handling
- Course search functionality
- Course statistics endpoint
- Beginner-friendly architecture

---

# Installation

## 1. Clone or download the project

## 2. Install Node.js dependencies

```bash
npm install
```

---

# Running the application

Start the Express server:

```bash
npm start
```

The API will be available at:

```text
http://localhost:5000
```

For development mode using nodemon:

```bash
npm run dev
```

You can also run the application directly:

```bash
node app.js
```

---

# Course Model

Each course uses the following structure:

```json
{
  "id": 1,
  "name": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals.",
  "target_date": "2026-08-01",
  "status": "Not Started",
  "created_at": "2026-05-21T12:00:00.000Z"
}
```

Valid status values:

- `Not Started`
- `In Progress`
- `Completed`

---

# API Endpoints

## 1. Add a Course

### POST `/api/courses`

Request body:

```json
{
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started"
}
```

---

## 2. Get all courses

### GET `/api/courses`

Example:

```bash
curl http://localhost:5000/api/courses
```

---

## 3. Get a specific course

### GET `/api/courses/:id`

Example:

```bash
curl http://localhost:5000/api/courses/1
```

---

## 4. Update a course

### PUT `/api/courses/:id`

Request body (all fields optional):

```json
{
  "status": "In Progress"
}
```

Example:

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"In Progress\"}"
```

---

## 5. Delete a course

### DELETE `/api/courses/:id`

Example:

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

---

## 6. Get course statistics

### GET `/api/courses/stats`

Example:

```bash
curl http://localhost:5000/api/courses/stats
```

---

## 7. Search courses

### GET `/api/courses/search?q=term`

Example:

```bash
curl "http://localhost:5000/api/courses/search?q=node"
```

---

# Testing

Use the provided curl commands or import the endpoints into Postman or Thunder Client to test the API functionality.

Test the following operations:

- Create courses
- Retrieve all courses
- Retrieve a course by ID
- Update courses
- Delete courses
- Search courses
- View course statistics

---

# File-Based Persistence

All course data is stored in `courses.json`.

The application:

- reads from the file during requests
- writes back after create/update/delete operations
- automatically creates the file if it does not exist
- safely handles empty or invalid JSON data

---

# Troubleshooting

## Problem:

"Cannot find module 'express'"

## Solution:

```bash
npm install
```

---

## Problem:

"Port already in use"

## Solution:

Stop other applications using port 5000 or change the `PORT` value in `app.js`.

---

# Project structure

```text
codecrafthub/
├── app.js             # Main Express application
├── courses.json       # Data storage (auto-created)
├── package.json       # Dependencies and scripts
├── package-lock.json  # Dependency lock file
├── README.md          # Project documentation
└── node_modules/      # Installed packages
```
