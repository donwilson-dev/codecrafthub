# CodeCraftHub

CodeCraftHub is a beginner-friendly full-stack learning project. It includes an Express REST API for managing courses and a vanilla HTML, CSS, and JavaScript dashboard that talks to the API with `fetch`.

The project stores all course data in `courses.json`, so no database setup is required.

## Features

- Vanilla JavaScript dashboard served by Express
- Create, read, update, and delete courses
- Course statistics for total, not started, in progress, and completed courses
- JSON file-based persistence
- Responsive layout for mobile, tablet, and desktop
- Visible success and error messages
- Simple code structure for beginners

## Project Structure

```text
codecrafthub/
|-- public/
|   |-- index.html
|   |-- styles.css
|   `-- script.js
|-- app.js
|-- courses.json
|-- package.json
|-- package-lock.json
|-- README.md
`-- LICENSE
```

## Setup

Install dependencies:

```bash
npm install
```

Start the full project:

```bash
npm start
```

The dashboard will be available at:

```text
http://localhost:5000
```

The API will be available at:

```text
http://localhost:5000/api/courses
```

You can also run the server directly:

```bash
node app.js
```

## Frontend Dashboard

The frontend lives in the `public/` folder and is served by Express using `express.static`.

It supports:

- Loading all courses on page load
- Adding a new course
- Editing all user-controlled course fields
- Deleting a course
- Refreshing the course list
- Showing API errors in the page
- Displaying course stats

No frontend frameworks, build tools, or external UI libraries are used.

## API Integration

The dashboard uses these API endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/courses` | Load all courses |
| `POST` | `/api/courses` | Create a new course |
| `PUT` | `/api/courses/:id` | Update an existing course |
| `DELETE` | `/api/courses/:id` | Delete a course |
| `GET` | `/api/courses/stats` | Load course statistics |

The frontend calls the API at:

```text
http://localhost:5000/api/courses
```

## Course Model

Each course uses this structure:

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

## Example API Requests

Create a course:

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Node.js Basics\",\"description\":\"Learn Express CRUD APIs.\",\"target_date\":\"2026-08-01\",\"status\":\"Not Started\"}"
```

Get all courses:

```bash
curl http://localhost:5000/api/courses
```

Update a course:

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"In Progress\"}"
```

Delete a course:

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

Get stats:

```bash
curl http://localhost:5000/api/courses/stats
```

## File-Based Persistence

All data is stored in `courses.json`.

The backend:

- reads from `courses.json` during requests
- writes to `courses.json` after create, update, and delete operations
- creates the file automatically if it does not exist
- safely treats empty or invalid JSON as an empty course list

## Screenshots

Add screenshots here after running the dashboard locally.

```text
Desktop screenshot placeholder
Mobile screenshot placeholder
```

## Testing Checklist

- Start the server with `npm start`
- Open `http://localhost:5000`
- Create a course from the dashboard
- Edit the course
- Delete the course
- Confirm `courses.json` updates after changes
- Confirm stats update after changes
- Test the layout on a narrow mobile-width screen

## Troubleshooting

If Express cannot be found, run:

```bash
npm install
```

If port `5000` is already in use, stop the other process or set a different port:

```bash
$env:PORT=5001
npm start
```
