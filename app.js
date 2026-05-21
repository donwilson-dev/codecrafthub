const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const COURSES_FILE = path.join(__dirname, "courses.json");
const VALID_STATUSES = ["Not Started", "In Progress", "Completed"];

app.use(express.json());

function loadCourses() {
  try {
    if (!fs.existsSync(COURSES_FILE)) {
      fs.writeFileSync(COURSES_FILE, "[]", "utf8");
      return [];
    }

    const fileContent = fs.readFileSync(COURSES_FILE, "utf8");

    if (!fileContent.trim()) {
      return [];
    }

    const courses = JSON.parse(fileContent);

    if (!Array.isArray(courses)) {
      return [];
    }

    return courses;
  } catch (error) {
    return [];
  }
}

function saveCourses(courses) {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2), "utf8");
}

function getNextId(courses) {
  if (courses.length === 0) {
    return 1;
  }

  const highestId = courses.reduce((maxId, course) => {
    return course.id > maxId ? course.id : maxId;
  }, 0);

  return highestId + 1;
}

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validateCourseInput(courseData, requireAllFields) {
  const requiredFields = ["name", "description", "target_date", "status"];

  if (requireAllFields) {
    for (const field of requiredFields) {
      if (!isNonEmptyString(courseData[field])) {
        return `${field} is required and must be a non-empty string.`;
      }
    }
  } else {
    for (const field of requiredFields) {
      if (
        courseData[field] !== undefined &&
        !isNonEmptyString(courseData[field])
      ) {
        return `${field} must be a non-empty string.`;
      }
    }
  }

  if (courseData.status !== undefined && !isValidStatus(courseData.status)) {
    return `status must be one of: ${VALID_STATUSES.join(", ")}.`;
  }

  return null;
}

function findCourseById(courses, id) {
  return courses.find((course) => course.id === id);
}

app.post("/api/courses", (req, res) => {
  try {
    const validationError = validateCourseInput(req.body, true);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const courses = loadCourses();
    const newCourse = {
      id: getNextId(courses),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date.trim(),
      status: req.body.status.trim(),
      created_at: new Date().toISOString(),
    };

    courses.push(newCourse);
    saveCourses(courses);

    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({ error: "Unable to create course." });
  }
});

app.get("/api/courses", (req, res) => {
  try {
    const courses = loadCourses();
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ error: "Unable to load courses." });
  }
});

app.get("/api/courses/stats", (req, res) => {
  try {
    const courses = loadCourses();
    const stats = {
      total: courses.length,
      completed: courses.filter((course) => course.status === "Completed")
        .length,
      in_progress: courses.filter((course) => course.status === "In Progress")
        .length,
      not_started: courses.filter((course) => course.status === "Not Started")
        .length,
    };

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: "Unable to load course stats." });
  }
});

app.get("/api/courses/search", (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!isNonEmptyString(searchTerm)) {
      return res.status(400).json({ error: "q query parameter is required." });
    }

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const courses = loadCourses();
    const results = courses.filter((course) => {
      const name = course.name.toLowerCase();
      const description = course.description.toLowerCase();

      return (
        name.includes(normalizedSearchTerm) ||
        description.includes(normalizedSearchTerm)
      );
    });

    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: "Unable to search courses." });
  }
});

app.get("/api/courses/:id", (req, res) => {
  try {
    const courseId = Number(req.params.id);

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ error: "Course id must be a number." });
    }

    const courses = loadCourses();
    const course = findCourseById(courses, courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    return res.json(course);
  } catch (error) {
    return res.status(500).json({ error: "Unable to load course." });
  }
});

app.put("/api/courses/:id", (req, res) => {
  try {
    const courseId = Number(req.params.id);

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ error: "Course id must be a number." });
    }

    const validationError = validateCourseInput(req.body, false);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const courses = loadCourses();
    const courseIndex = courses.findIndex((course) => course.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    const existingCourse = courses[courseIndex];
    const updatedCourse = {
      ...existingCourse,
      name:
        req.body.name !== undefined
          ? req.body.name.trim()
          : existingCourse.name,
      description:
        req.body.description !== undefined
          ? req.body.description.trim()
          : existingCourse.description,
      target_date:
        req.body.target_date !== undefined
          ? req.body.target_date.trim()
          : existingCourse.target_date,
      status:
        req.body.status !== undefined
          ? req.body.status.trim()
          : existingCourse.status,
      id: existingCourse.id,
      created_at: existingCourse.created_at,
    };

    courses[courseIndex] = updatedCourse;
    saveCourses(courses);

    return res.json(updatedCourse);
  } catch (error) {
    return res.status(500).json({ error: "Unable to update course." });
  }
});

app.delete("/api/courses/:id", (req, res) => {
  try {
    const courseId = Number(req.params.id);

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ error: "Course id must be a number." });
    }

    const courses = loadCourses();
    const courseIndex = courses.findIndex((course) => course.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    courses.splice(courseIndex, 1);
    saveCourses(courses);

    return res.json({ message: "Course deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to delete course." });
  }
});

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log("CodeCraftHub API is starting...");
  console.log(`Data will be stored in: ${COURSES_FILE}`);
  console.log(`API is available at: http://localhost:${PORT}`);
});
