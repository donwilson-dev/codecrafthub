const API_BASE_URL = "http://localhost:5000/api/courses";
const VALID_STATUSES = ["Not Started", "In Progress", "Completed"];

const courseForm = document.getElementById("courseForm");
const submitButton = document.getElementById("submitButton");
const refreshButton = document.getElementById("refreshButton");
const coursesContainer = document.getElementById("coursesContainer");
const emptyState = document.getElementById("emptyState");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const courseCount = document.getElementById("courseCount");
const totalCourses = document.getElementById("totalCourses");
const notStartedCourses = document.getElementById("notStartedCourses");
const inProgressCourses = document.getElementById("inProgressCourses");
const completedCourses = document.getElementById("completedCourses");

let courses = [];

document.addEventListener("DOMContentLoaded", loadDashboard);
courseForm.addEventListener("submit", handleCreateCourse);
refreshButton.addEventListener("click", () => {
  clearMessage();
  loadDashboard();
});

async function loadDashboard() {
  setLoading(true);

  try {
    courses = await apiRequest(API_BASE_URL);
    renderCourses();
    await loadStats();
  } catch (error) {
    showMessage(error.message, "error");
    courses = [];
    renderCourses();
    updateStatsFromCourses();
  } finally {
    setLoading(false);
  }
}

async function loadStats() {
  try {
    const stats = await apiRequest(`${API_BASE_URL}/stats`);
    totalCourses.textContent = stats.total ?? 0;
    notStartedCourses.textContent = stats.not_started ?? 0;
    inProgressCourses.textContent = stats.in_progress ?? 0;
    completedCourses.textContent = stats.completed ?? 0;
  } catch (error) {
    updateStatsFromCourses();
  }
}

async function handleCreateCourse(event) {
  event.preventDefault();
  clearMessage();

  const formData = getFormData(courseForm);
  const validationError = validateCourse(formData);

  if (validationError) {
    showMessage(validationError, "error");
    return;
  }

  setButtonLoading(submitButton, "Adding...");

  try {
    await apiRequest(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    courseForm.reset();
    showMessage("Course added successfully.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    resetButton(submitButton, "Add Course");
  }
}

async function handleUpdateCourse(courseId, form) {
  clearMessage();

  const formData = getFormData(form);
  const validationError = validateCourse(formData);

  if (validationError) {
    showMessage(validationError, "error");
    return;
  }

  const saveButton = form.querySelector("[data-save-button]");
  setButtonLoading(saveButton, "Saving...");

  try {
    await apiRequest(`${API_BASE_URL}/${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    showMessage("Course updated successfully.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    resetButton(saveButton, "Save Changes");
  }
}

async function handleDeleteCourse(courseId) {
  const shouldDelete = window.confirm("Delete this course?");

  if (!shouldDelete) {
    return;
  }

  clearMessage();

  try {
    await apiRequest(`${API_BASE_URL}/${courseId}`, {
      method: "DELETE",
    });

    showMessage("Course deleted successfully.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error("Unable to reach the API. Make sure the backend is running on port 5000.");
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "The request failed. Please try again.");
  }

  return data;
}

function renderCourses() {
  coursesContainer.innerHTML = "";

  if (courses.length === 0) {
    emptyState.classList.remove("hidden");
    courseCount.textContent = "No courses yet";
    return;
  }

  emptyState.classList.add("hidden");
  courseCount.textContent = `${courses.length} course${courses.length === 1 ? "" : "s"}`;

  courses.forEach((course) => {
    coursesContainer.appendChild(createCourseCard(course));
  });
}

function createCourseCard(course) {
  const card = document.createElement("article");
  card.className = "course-card";

  const badgeClass = getStatusClass(course.status);

  card.innerHTML = `
    <div class="course-card-header">
      <div>
        <h3>${escapeHtml(course.name)}</h3>
        <p class="course-meta">Course ID: ${course.id}</p>
      </div>
      <span class="status-badge ${badgeClass}">${escapeHtml(course.status)}</span>
    </div>
    <p class="course-description">${escapeHtml(course.description)}</p>
    <div class="course-meta">
      <span>Target date: ${escapeHtml(course.target_date)}</span>
      <span>Created: ${formatDate(course.created_at)}</span>
    </div>
    <div class="course-actions">
      <button class="button secondary-button" type="button" data-edit-toggle>Edit</button>
      <button class="button danger-button" type="button" data-delete-button>Delete</button>
    </div>
    <form class="edit-form hidden" novalidate>
      <div class="form-group">
        <label for="edit-name-${course.id}">Course name</label>
        <input id="edit-name-${course.id}" name="name" type="text" value="${escapeAttribute(course.name)}" />
      </div>
      <div class="form-group">
        <label for="edit-description-${course.id}">Description</label>
        <textarea id="edit-description-${course.id}" name="description" rows="3">${escapeHtml(course.description)}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="edit-target-date-${course.id}">Target date</label>
          <input id="edit-target-date-${course.id}" name="target_date" type="date" value="${escapeAttribute(course.target_date)}" />
        </div>
        <div class="form-group">
          <label for="edit-status-${course.id}">Status</label>
          <select id="edit-status-${course.id}" name="status">
            ${createStatusOptions(course.status)}
          </select>
        </div>
      </div>
      <div class="course-actions">
        <button class="button primary-button" type="submit" data-save-button>Save Changes</button>
        <button class="button secondary-button" type="button" data-cancel-button>Cancel</button>
      </div>
    </form>
  `;

  const editButton = card.querySelector("[data-edit-toggle]");
  const deleteButton = card.querySelector("[data-delete-button]");
  const cancelButton = card.querySelector("[data-cancel-button]");
  const editForm = card.querySelector(".edit-form");

  editButton.addEventListener("click", () => {
    editForm.classList.toggle("hidden");
  });

  cancelButton.addEventListener("click", () => {
    editForm.classList.add("hidden");
  });

  deleteButton.addEventListener("click", () => handleDeleteCourse(course.id));
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleUpdateCourse(course.id, editForm);
  });

  return card;
}

function createStatusOptions(selectedStatus) {
  return VALID_STATUSES.map((status) => {
    const selected = status === selectedStatus ? "selected" : "";
    return `<option value="${status}" ${selected}>${status}</option>`;
  }).join("");
}

function getFormData(form) {
  const formData = new FormData(form);

  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    target_date: String(formData.get("target_date") || "").trim(),
    status: String(formData.get("status") || "").trim(),
  };
}

function validateCourse(course) {
  if (!course.name || !course.description || !course.target_date || !course.status) {
    return "Please complete all course fields.";
  }

  if (!VALID_STATUSES.includes(course.status)) {
    return "Please choose a valid status.";
  }

  return "";
}

function updateStatsFromCourses() {
  totalCourses.textContent = courses.length;
  notStartedCourses.textContent = courses.filter((course) => course.status === "Not Started").length;
  inProgressCourses.textContent = courses.filter((course) => course.status === "In Progress").length;
  completedCourses.textContent = courses.filter((course) => course.status === "Completed").length;
}

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
  refreshButton.disabled = isLoading;
}

function setButtonLoading(button, text) {
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.textContent = text;
}

function resetButton(button, fallbackText) {
  button.disabled = false;
  button.textContent = button.dataset.originalText || fallbackText;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function clearMessage() {
  message.textContent = "";
  message.className = "message hidden";
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClass(status) {
  if (status === "Completed") {
    return "status-completed";
  }

  if (status === "In Progress") {
    return "status-in-progress";
  }

  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
