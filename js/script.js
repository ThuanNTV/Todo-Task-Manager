/**
 * Todo Master - Smart Task Manager
 * Main JavaScript functionality
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const todoForm = document.getElementById("todo-form");
  const todoTitle = document.getElementById("todo-title");
  const todoDate = document.getElementById("todo-date");
  const todoImage = document.getElementById("todo-image");
  const todoDescription = document.getElementById("todo-description");
  const todoPriority = document.getElementById("todo-priority");

  const clearTask = document.querySelector(".clear-task");
  const progressList = document.querySelector(".progress-list .tasks-wrapper");
  const completedList = document.querySelector(
    ".completed-list .tasks-wrapper"
  );
  const progressCount = document.querySelector(".progress-list .task-count");
  const completedCount = document.querySelector(".completed-list .task-count");

  // Initialize with default date (today)
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  todoDate.value = formattedDate;

  // Load tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Initialize application
  initApp();

  /**
   * Initialize application
   */
  function initApp() {
    renderTasks();
    updateTaskCounts();

    // Event listeners
    todoForm.addEventListener("submit", handleTaskSubmit);
    progressList.addEventListener("click", handleTaskActions);
    completedList.addEventListener("click", handleTaskActions);

    const submitBtn = todoForm.querySelector(".submit-btn");
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-icon">✏️</span> Creat Task';

    // Trong file script.js
    // Xử lý preview ảnh
    document
      .getElementById("todo-image")
      .addEventListener("change", function (e) {
        const preview = document.getElementById("image-preview");
        const file = e.target.files[0];

        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            preview.classList.add("error");
            preview.querySelector(".preview-text").textContent =
              "File too large!";
            return;
          }

          if (!file.type.match("image.*")) {
            preview.classList.add("error");
            preview.querySelector(".preview-text").textContent =
              "Invalid file type!";
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            preview.classList.remove("error");
            preview.classList.add("has-image");
            preview.querySelector(".preview-image").src = e.target.result;
          };
          reader.readAsDataURL(file);
        } else {
          preview.classList.remove("has-image", "error");
          preview.querySelector(".preview-image").src = "";
        }
      });

    // Xử lý drag and drop
    const dropZone = document.querySelector(".image-upload-container");

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.backgroundColor = "var(--primary-50)";
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.style.backgroundColor = "transparent";
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.style.backgroundColor = "transparent";
      const file = e.dataTransfer.files[0];
      document.getElementById("todo-image").files = e.dataTransfer.files;
      document.getElementById("todo-image").dispatchEvent(new Event("change"));
    });

    // Xóa preview khi submit form
    document
      .getElementById("todo-form")
      .addEventListener("submit", function () {
        const previewContainer = document.getElementById("image-preview");
        previewContainer.classList.remove("has-image");
        previewContainer.querySelector(".preview-image").src = "";
      });

    // Clear all tasks
    clearTask.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear all tasks?")) {
        tasks = [];
        localStorage.removeItem("tasks");
        progressList.innerHTML = "";
        completedList.innerHTML = "";
        updateTaskCounts();
        renderTasks();
        showNotification("All tasks cleared!", "success");
      }
    });
  }

  /**
   * Handle task form submission
   * @param {Event} e - Form submit event
   */
  function handleTaskSubmit(e) {
    e.preventDefault();

    // Get form values
    const title = todoTitle.value.trim();
    const date = todoDate.value;
    const description = todoDescription.value.trim();
    const priority = todoPriority.value;

    // Validate form
    if (!title || !date) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Handle image upload
    let imageData = null;
    const imageFile = todoImage.files[0];

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imageData = e.target.result;
        // Continue with task creation
        createTask(title, date, description, priority, imageData);
      };
      reader.readAsDataURL(imageFile);
    } else {
      // Create task without image
      createTask(title, date, description, priority, imageData);
    }
  }

  /**
   * Create a new task
   * @param {string} title - Task title
   * @param {string} date - Due date
   * @param {string} description - Task description
   * @param {string} priority - Task priority
   * @param {string|null} imageData - Base64 encoded image
   */
  function createTask(title, date, description, priority, imageData) {
    // Create new task object
    const newTask = {
      id: generateUniqueId(),
      title,
      date,
      description,
      priority,
      image: imageData,
      status: "progress",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    // Add to tasks array
    tasks.unshift(newTask);

    // Save to localStorage
    saveTasks();

    // Re-render tasks
    renderTasks();
    updateTaskCounts();

    // Reset form
    todoForm.reset();
    todoDate.value = formattedDate;

    // Show success notification
    showNotification("Task created successfully!", "success");
  }

  /**
   * Handle task actions (delete, edit, complete, archive)
   * @param {Event} e - Click event
   */
  function handleTaskActions(e) {
    const taskCard = e.target.closest(".task-card");

    if (!taskCard) return;

    const taskId = taskCard.dataset.id;
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) return;

    // Delete button
    if (e.target.closest(".delete-btn")) {
      tasks.splice(taskIndex, 1);
      taskCard.remove();
      saveTasks();
      updateTaskCounts();
      showNotification("Task deleted successfully!", "success");
      renderTasks();
    }

    // Complete button
    if (e.target.closest(".complete-btn")) {
      tasks[taskIndex].status = "completed";
      tasks[taskIndex].completedAt = new Date().toISOString();

      // Move to completed list
      saveTasks();
      renderTasks();
      updateTaskCounts();
      showNotification("Task completed!", "success");
    }

    // Edit button
    if (e.target.closest(".edit-btn")) {
      editTask(tasks[taskIndex]);
    }

    // Archive button
    if (e.target.closest(".archive-btn")) {
      tasks[taskIndex].status = "archived";
      saveTasks();
      renderTasks();
      updateTaskCounts();
      showNotification("Task archived!", "success");
      renderTasks();
    }
  }

  /**
   * Edit task
   * @param {Object} task - Task object
   */
  function editTask(task) {
    // Fill form with task data
    todoTitle.value = task.title;
    todoDate.value = task.date;
    todoDescription.value = task.description;
    todoPriority.value = task.priority;

    // Change form submit button
    const submitBtn = todoForm.querySelector(".submit-btn");
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-icon">✏️</span> Update Task';

    // Scroll to form
    todoForm.scrollIntoView({ behavior: "smooth" });

    // Focus on title
    todoTitle.focus();

    // Create update handler
    const updateHandler = function (e) {
      e.preventDefault();

      // Get updated values
      const title = todoTitle.value.trim();
      const date = todoDate.value;
      const description = todoDescription.value.trim();
      const priority = todoPriority.value;

      // Handle image upload
      let imageData = task.image;
      const imageFile = todoImage.files[0];

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imageData = e.target.result;
          updateTaskData();
        };
        reader.readAsDataURL(imageFile);
      } else {
        updateTaskData();
      }

      function updateTaskData() {
        // Update task data
        task.title = title;
        task.date = date;
        task.description = description;
        task.priority = priority;
        task.image = imageData;

        // Save to localStorage
        saveTasks();

        // Re-render tasks
        renderTasks();

        // Reset form and button
        todoForm.reset();
        todoDate.value = formattedDate;
        submitBtn.innerHTML = originalBtnText;

        // Remove update handler
        todoForm.removeEventListener("submit", updateHandler);

        // Restore original submit handler
        todoForm.addEventListener("submit", handleTaskSubmit);

        // Show success notification
        showNotification("Task updated successfully!", "success");
      }
    };

    // Remove default submit handler
    todoForm.removeEventListener("submit", handleTaskSubmit);

    // Add update handler
    todoForm.addEventListener("submit", updateHandler);
  }

  /**
   * Render tasks in their respective lists
   */
  function renderTasks() {
    // Clear current lists
    progressList.innerHTML = "";
    completedList.innerHTML = "";

    // Filter tasks by status
    const progressTasks = tasks
      .filter((task) => task.status === "progress")
      .sort((a, b) => {
        // Tạo object ánh xạ mức độ ưu tiên
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    const completedTasks = tasks
      .filter((task) => task.status === "completed")
      .sort((a, b) => {
        // Tạo object ánh xạ mức độ ưu tiên
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    // Render progress tasks
    if (progressTasks.length === 0) {
      progressList.innerHTML =
        '<div class="empty-state">No tasks in progress</div>';
    } else {
      progressTasks.forEach((task) => {
        progressList.appendChild(createTaskCard(task));
      });
    }

    // Render completed tasks
    if (completedTasks.length === 0) {
      completedList.innerHTML =
        '<div class="empty-state">No completed tasks</div>';
    } else {
      completedTasks.forEach((task) => {
        completedList.appendChild(createTaskCard(task));
      });
    }
  }

  /**
   * Create a task card element
   * @param {Object} task - Task object
   * @returns {HTMLElement} - Task card element
   */
  function createTaskCard(task) {
    const taskCard = document.createElement("article");
    taskCard.className = `task-card ${
      task.status === "completed" ? "completed" : ""
    }`;
    taskCard.dataset.priority = task.priority;
    taskCard.dataset.id = task.id;

    // Format date for display
    const dateObj = new Date(
      task.status === "completed" ? task.completedAt : task.date
    );
    const formattedDisplayDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const dateAttr =
      task.status === "completed" ? "data-completed" : "data-due";
    taskCard.setAttribute(
      dateAttr,
      task.status === "completed" ? task.completedAt.split("T")[0] : task.date
    );

    // Create task card HTML
    taskCard.innerHTML = `
      <header class="task-header">
        <h4 class="task-title">${escapeHTML(task.title)}</h4>
        <time class="task-date" datetime="${task.date}">
          ${
            task.status === "completed" ? "Completed: " : "Due: "
          }${formattedDisplayDate}
        </time>
      </header>
      
      <div class="task-body">
        ${
          task.image
            ? `
          <figure class="task-image">
            <img src="${task.image}" alt="${escapeHTML(
                task.title
              )}" loading="lazy">
            <figcaption class="image-caption">Task attachment</figcaption>
          </figure>
        `
            : ""
        }
        
        <div class="task-content">
          <p class="task-description">${escapeHTML(task.description)}</p>
          <ul class="task-meta">
            <li class="priority-tag ${task.priority}-priority">
              ${capitalize(task.priority)} Priority
            </li>
            <li class="task-status">${capitalize(task.status)}</li>
          </ul>
        </div>
      </div>
      
      <footer class="task-actions">
        <button type="button" class="action-btn delete-btn" aria-label="Delete task">
          🗑️ Delete
        </button>
        ${
          task.status === "progress"
            ? `
          <button type="button" class="action-btn edit-btn" aria-label="Edit task">
            ✏️ Edit
          </button>
          <button type="button" class="action-btn complete-btn" aria-label="Mark task as complete">
            ✅ Complete
          </button>
        `
            : `
          <button type="button" class="action-btn archive-btn" aria-label="Archive task">
            📦 Archive
          </button>
        `
        }
      </footer>
    `;

    return taskCard;
  }

  /**
   * Update task counts
   */
  function updateTaskCounts() {
    const progressTasks = tasks.filter((task) => task.status === "progress");
    const completedTasks = tasks.filter((task) => task.status === "completed");

    progressCount.textContent = `${progressTasks.length} task${
      progressTasks.length !== 1 ? "s" : ""
    }`;
    completedCount.textContent = `${completedTasks.length} task${
      completedTasks.length !== 1 ? "s" : ""
    }`;
  }

  /**
   * Save tasks to localStorage
   */
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  /**
   * Show notification
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error)
   */
  function showNotification(message, type = "info") {
    // Check if notification container exists
    let notificationContainer = document.querySelector(
      ".notification-container"
    );

    if (!notificationContainer) {
      // Create notification container
      notificationContainer = document.createElement("div");
      notificationContainer.className = "notification-container";
      notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
      `;
      document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      background: ${
        type === "success"
          ? "var(--success-500)"
          : type === "error"
          ? "var(--danger-500)"
          : "var(--primary-500)"
      };
      color: white;
      padding: 12px 20px;
      margin-bottom: 10px;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-md);
      opacity: 0;
      transform: translateX(50px);
      transition: all 0.3s ease;
    `;

    notification.innerHTML = message;

    // Add to container
    notificationContainer.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(50px)";

      // Remove from DOM after animation
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 10000);
  }

  /**
   * Generate unique ID
   * @returns {string} - Unique ID
   */
  function generateUniqueId() {
    return (
      "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    );
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  function capitalize(str) {
    // Check if str is undefined or null before accessing charAt
    if (str === undefined || str === null) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} unsafe - Unsafe string
   * @returns {string} - Safe string
   */
  function escapeHTML(unsafe) {
    if (unsafe === null || unsafe === undefined) {
      return "";
    }

    // Ensure we're working with a string
    const str = String(unsafe);

    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
