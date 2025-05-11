/**
 * TodoMaster App
 * A task management dashboard application
 */

// Constants and configurations
const CONFIG = {
  views: {
    DASHBOARD: "dashboard",
    TASKS: "tasks",
    ANALYTICS: "analytics",
    CALENDAR: "calendar",
    SETTINGS: "settings",
  },
  status: {
    COMPLETED: "completed",
    PROGRESS: "progress",
  },
  priority: {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  },
  storage: {
    TASKS_KEY: "todomaster_tasks",
    SETTINGS_KEY: "todomaster_settings",
  },
};

// Task Manager - handles all task data operations
class TaskManager {
  constructor() {
    this.tasks = [];
    this.loadTasks();
  }

  loadTasks() {
    try {
      const savedTasks = localStorage.getItem(CONFIG.storage.TASKS_KEY);
      this.tasks = savedTasks ? JSON.parse(savedTasks) : [];

      // If no tasks exist, create a sample task
      if (!this.tasks.length) {
        this.createSampleTask();
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.tasks = [];
      this.createSampleTask();
    }
  }
  createSampleTask() {
    this.tasks = [
      {
        id: crypto.randomUUID(),
        title: "Example Task",
        description: "This is an example task",
        date: new Date().toISOString().split("T")[0],
        priority: CONFIG.priority.MEDIUM,
        image: null,
        status: CONFIG.status.PROGRESS,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];
    this.saveTasks();
  }

  saveTasks() {
    localStorage.setItem(CONFIG.storage.TASKS_KEY, JSON.stringify(this.tasks));
  }

  getAllTasks() {
    return [...this.tasks];
  }

  getTaskById(id) {
    return this.tasks.find((task) => task.id === id);
  }

  validateTaskData(taskData) {
    if (
      !taskData.title ||
      typeof taskData.title !== "string" ||
      taskData.title.trim().length < 1
    ) {
      throw new Error("Task title is required");
    }
    if (!taskData.date || !this.isValidDate(taskData.date)) {
      throw new Error("Valid task date is required");
    }
    if (
      taskData.priority &&
      !Object.values(CONFIG.priority).includes(taskData.priority)
    ) {
      throw new Error("Invalid priority value");
    }
    return true;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  createTask(taskData) {
    try {
      this.validateTaskData(taskData);
      const newTask = {
        id: crypto.randomUUID(),
        title: taskData.title.trim(),
        description: taskData.description ? taskData.description.trim() : "",
        date: taskData.date,
        priority: taskData.priority || CONFIG.priority.MEDIUM,
        image: taskData.image || null,
        status: CONFIG.status.PROGRESS,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      this.tasks.push(newTask);
      this.saveTasks();
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  updateTask(taskId, updates) {
    try {
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      // Validate updates
      if (updates.title || updates.date || updates.priority) {
        this.validateTaskData({ ...this.tasks[taskIndex], ...updates });
      }

      const updatedTask = { ...this.tasks[taskIndex], ...updates };
      this.tasks[taskIndex] = updatedTask;
      this.saveTasks();
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.saveTasks();
    return true;
  }

  toggleTaskStatus(taskId) {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const updatedStatus =
      task.status === CONFIG.status.COMPLETED
        ? CONFIG.status.PROGRESS
        : CONFIG.status.COMPLETED;

    const updatedTask = this.updateTask(taskId, {
      status: updatedStatus,
      completedAt:
        updatedStatus === CONFIG.status.COMPLETED
          ? new Date().toISOString()
          : null,
    });

    return updatedTask;
  }

  filterTasks(filters = {}) {
    try {
      return this.tasks.filter((task) => {
        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);

          if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (isNaN(fromDate.getTime())) {
              throw new Error("Invalid start date");
            }
            if (taskDate < fromDate) return false;
          }

          if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(0, 0, 0, 0);
            if (isNaN(toDate.getTime())) {
              throw new Error("Invalid end date");
            }
            if (taskDate > toDate) return false;
          }
        }

        // Status filter
        if (filters.status && filters.status !== "all") {
          if (!Object.values(CONFIG.status).includes(filters.status)) {
            throw new Error("Invalid status filter");
          }
          if (task.status !== filters.status) return false;
        }

        // Priority filter
        if (filters.priority && filters.priority !== "all") {
          if (!Object.values(CONFIG.priority).includes(filters.priority)) {
            throw new Error("Invalid priority filter");
          }
          if (task.priority !== filters.priority) return false;
        }

        // Search text filter
        if (filters.searchText) {
          const searchText = filters.searchText.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(searchText);
          const descMatch = task.description
            ?.toLowerCase()
            .includes(searchText);
          if (!titleMatch && !descMatch) return false;
        }

        return true;
      });
    } catch (error) {
      console.error("Error filtering tasks:", error);
      return this.tasks; // Return unfiltered tasks in case of error
    }
  }

  sortTasks(tasks, sortBy = "createdAt-desc") {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "createdAt-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);

        case "createdAt-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);

        case "completedAt-desc":
          if (!a.completedAt && !b.completedAt) return 0;
          if (!a.completedAt) return 1;
          if (!b.completedAt) return -1;
          return new Date(b.completedAt) - new Date(a.completedAt);

        case "completedAt-asc":
          if (!a.completedAt && !b.completedAt) return 0;
          if (!a.completedAt) return -1;
          if (!b.completedAt) return 1;
          return new Date(a.completedAt) - new Date(b.completedAt);

        case "date-asc":
          return new Date(a.date) - new Date(b.date);

        case "date-desc":
          return new Date(b.date) - new Date(a.date);

        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }

  getTaskStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter((t) => t.status === CONFIG.status.COMPLETED)
        .length,
      progress: this.tasks.filter((t) => t.status === CONFIG.status.PROGRESS)
        .length,
      priorities: {
        high: this.tasks.filter((t) => t.priority === CONFIG.priority.HIGH)
          .length,
        medium: this.tasks.filter((t) => t.priority === CONFIG.priority.MEDIUM)
          .length,
        low: this.tasks.filter((t) => t.priority === CONFIG.priority.LOW)
          .length,
      },
    };
  }

  getRecentTasks(limit = 5) {
    try {
      // Get all tasks and sort by most recent activity
      const sortedTasks = this.tasks.sort((a, b) => {
        const aDate =
          a.status === CONFIG.status.COMPLETED
            ? new Date(a.completedAt)
            : new Date(a.createdAt);
        const bDate =
          b.status === CONFIG.status.COMPLETED
            ? new Date(b.completedAt)
            : new Date(b.createdAt);
        return bDate - aDate;
      });

      // Get most recent tasks
      return sortedTasks.slice(0, limit).map((task) => ({
        ...task,
        isRecent: this.isRecentActivity(task),
        activityDate:
          task.status === CONFIG.status.COMPLETED
            ? task.completedAt
            : task.createdAt,
        activityType:
          task.status === CONFIG.status.COMPLETED ? "completed" : "created",
      }));
    } catch (error) {
      console.error("Error getting recent tasks:", error);
      return [];
    }
  }

  isRecentActivity(task) {
    const now = new Date();
    const activityDate = new Date(
      task.status === CONFIG.status.COMPLETED
        ? task.completedAt
        : task.createdAt
    );
    const hoursDiff = (now - activityDate) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Consider activity recent if within last 24 hours
  }
}

// UI Controller - handles all UI interactions
class UIController {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.currentView = CONFIG.views.DASHBOARD;

    // Initialize UI elements
    this.initEventListeners();
  }

  initModalEvents() {
    // Close modal buttons
    document.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal");
        if (modal) this.closeModal(modal.id);
      });
    });

    // Modal background click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeModal(modal.id);
      });
    });

    // Edit task button
    document.getElementById("edit-task-btn")?.addEventListener("click", () => {
      const taskId =
        document.getElementById("task-detail-modal").dataset.taskId;
      if (taskId) {
        this.editTask(taskId);
      }
    });

    // Delete task button
    document
      .getElementById("delete-task-btn")
      ?.addEventListener("click", () => {
        const taskId =
          document.getElementById("task-detail-modal").dataset.taskId;
        if (taskId && confirm("Are you sure you want to delete this task?")) {
          this.taskManager.deleteTask(taskId);
          this.closeModal("task-detail-modal");
          this.updateUI();
        }
      });
    // Complete task button
    document
      .getElementById("complete-task-btn")
      ?.addEventListener("click", () => {
        const taskId =
          document.getElementById("task-detail-modal").dataset.taskId;
        if (taskId) {
          const updatedTask = this.taskManager.toggleTaskStatus(taskId);
          if (updatedTask) {
            const status = updatedTask.status;
            const completeBtn = document.getElementById("complete-task-btn");

            document.getElementById("detail-status").textContent = status;
            if (status === CONFIG.status.COMPLETED) {
              completeBtn.innerHTML =
                '<i class="fas fa-undo"></i> Mark as In Progress';
              this.showNotification("Task marked as completed!", "success");
            } else {
              completeBtn.innerHTML =
                '<i class="fas fa-check"></i> Complete Task';
              this.showNotification("Task marked as in progress!", "info");
            }

            // Update completed date display
            const completedContainer = document.getElementById(
              "detail-completed-container"
            );
            const completedDate = document.getElementById("detail-completed");

            if (status === CONFIG.status.COMPLETED && updatedTask.completedAt) {
              completedDate.textContent = new Date(
                updatedTask.completedAt
              ).toLocaleDateString();
              completedContainer.style.display = "flex";
            } else {
              completedContainer.style.display = "none";
            }

            this.updateUI();
          }
        }
      });
  }

  initEventListeners() {
    // Navigation
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const viewName = e.currentTarget.dataset.view;
        if (viewName && Object.values(CONFIG.views).includes(viewName)) {
          this.switchView(viewName);

          // Update active state
          document.querySelectorAll(".menu-item").forEach((menuItem) => {
            menuItem.classList.toggle("active", menuItem === e.currentTarget);
          });
        }
      });
    });

    // Add task buttons
    const addTaskBtn = document.getElementById("add-task-btn");
    const tasksAddBtn = document.getElementById("tasks-add-btn");

    if (addTaskBtn) {
      addTaskBtn.addEventListener("click", () => this.openTaskModal());
    }
    if (tasksAddBtn) {
      tasksAddBtn.addEventListener("click", () => this.openTaskModal());
    }

    // Task form
    const taskForm = document.getElementById("add-task-form");
    if (taskForm) {
      taskForm.addEventListener("submit", (e) => this.handleTaskFormSubmit(e));
    }

    // Image preview
    const taskImage = document.getElementById("task-image");
    if (taskImage) {
      taskImage.addEventListener("change", (e) => this.handleImagePreview(e));
    }

    // Filter and sort events
    this.initFilterListeners();

    // Initialize modal events
    this.initModalEvents();
  }

  initFilterListeners() {
    // Date filters
    [
      "filter-date-from",
      "filter-date-to",
      "task-date-from",
      "task-date-to",
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("change", () => this.updateUI());
      }
    });

    // Status and priority filters
    ["status-filter", "priority-filter"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("change", () => this.updateUI());
      }
    });

    // Sort options
    const sortBy = document.getElementById("sort-by");
    if (sortBy) {
      sortBy.addEventListener("change", () => this.updateUI());
    }
  }

  switchView(viewName) {
    if (!Object.values(CONFIG.views).includes(viewName)) {
      console.error(`Invalid view name: ${viewName}`);
      return;
    }

    try {
      // Hide all views
      document.querySelectorAll(".view-container").forEach((view) => {
        view.classList.add("hidden");
      });

      // Show selected view
      const selectedView = document.getElementById(`${viewName}-view`);
      if (selectedView) {
        selectedView.classList.remove("hidden");

        // Update UI based on view
        switch (viewName) {
          case CONFIG.views.DASHBOARD:
            this.updateDashboard();
            break;
          case CONFIG.views.TASKS:
            this.renderTasksList();
            break;
          case CONFIG.views.ANALYTICS:
            this.updateAnalytics();
            break;
          case CONFIG.views.CALENDAR:
            this.updateCalendar();
            break;
          default:
            break;
        }

        // Update navigation state
        document.querySelectorAll(".menu-item").forEach((item) => {
          item.classList.toggle("active", item.dataset.view === viewName);
        });
      } else {
        throw new Error(`View element not found: ${viewName}-view`);
      }

      this.currentView = viewName;
    } catch (error) {
      console.error("Error switching view:", error);
      // Fallback to dashboard view
      if (viewName !== CONFIG.views.DASHBOARD) {
        this.switchView(CONFIG.views.DASHBOARD);
      }
    }
  }

  updateUI() {
    switch (this.currentView) {
      case CONFIG.views.DASHBOARD:
        this.updateDashboard();
        break;
      case CONFIG.views.TASKS:
        this.renderTasksList();
        break;
      // Additional views can be added here
    }
  }

  updateDashboard() {
    this.updateStats();
    this.renderChart();
    this.renderActivities();
  }

  updateStats() {
    const stats = this.taskManager.getTaskStats();

    document.getElementById("total-tasks").textContent = stats.total;
    document.getElementById("completed-tasks").textContent = stats.completed;
    document.getElementById("progress-tasks").textContent = stats.progress;
  }
  renderChart() {
    const stats = this.taskManager.getTaskStats();
    const chart = document.getElementById("chart");

    if (!chart) return;

    const { priorities, total } = stats;
    const maxValue = Math.max(
      priorities.high,
      priorities.medium,
      priorities.low
    );
    const scalePercent = maxValue > 0 ? 70 / maxValue : 0;

    // Calculate percentages for each priority
    const highPercent =
      total > 0 ? Math.round((priorities.high / total) * 100) : 0;
    const mediumPercent =
      total > 0 ? Math.round((priorities.medium / total) * 100) : 0;
    const lowPercent =
      total > 0 ? Math.round((priorities.low / total) * 100) : 0;

    chart.innerHTML = `
      <h2>Task Priority Distribution</h2>
      <div class="chart-bar high" style="width: ${
        priorities.high * scalePercent + 20
      }%">
        High: ${priorities.high} tasks (${highPercent}%)
      </div>
      <div class="chart-bar medium" style="width: ${
        priorities.medium * scalePercent + 20
      }%">
        Medium: ${priorities.medium} tasks (${mediumPercent}%)
      </div>
      <div class="chart-bar low" style="width: ${
        priorities.low * scalePercent + 20
      }%">
        Low: ${priorities.low} tasks (${lowPercent}%)
      </div>
    `;
  }

  renderActivities() {
    const recentTasks = this.taskManager.getRecentTasks(5);
    const container = document.getElementById("activities-list");

    if (!container) return;

    if (recentTasks.length === 0) {
      container.innerHTML = '<div class="no-tasks">No recent activities</div>';
      return;
    }

    container.innerHTML = recentTasks
      .map(
        (task) => `
        <div class="task-item ${task.isRecent ? "recent" : ""}" data-task-id="${
          task.id
        }">
          <div class="task-main-info">
            <span class="priority-dot ${task.priority}"></span>
            <span class="task-title">${this.escapeHTML(task.title)}</span>
            ${task.image ? '<i class="fas fa-image"></i>' : ""}
          </div>
          <div class="task-info">
            <span class="task-date">
              ${task.activityType === "completed" ? "Completed" : "Created"}: 
              ${new Date(task.activityDate).toLocaleString()}
            </span>
            <span class="task-status ${task.status} ${
          task.isRecent ? "recent" : ""
        }">
              ${task.isRecent ? "🔥 " : ""}${task.status}
            </span>
          </div>
        </div>
      `
      )
      .join("");

    // Add click handlers
    container.querySelectorAll(".task-item").forEach((item) => {
      item.addEventListener("click", () => {
        const taskId = item.dataset.taskId;
        if (taskId) this.showTaskDetail(taskId);
      });
    });
  }

  renderTasksList() {
    const filters = {
      dateFrom: document.getElementById("task-date-from")?.value,
      dateTo: document.getElementById("task-date-to")?.value,
      status: document.getElementById("status-filter")?.value,
      priority: document.getElementById("priority-filter")?.value,
    };

    const sortByValue =
      document.getElementById("sort-by")?.value || "createdAt-desc";

    const filteredTasks = this.taskManager.filterTasks(filters);
    const sortedTasks = this.taskManager.sortTasks(filteredTasks, sortByValue);

    const container = document.getElementById("tasks-list");
    if (!container) return;

    if (sortedTasks.length === 0) {
      container.innerHTML =
        '<div class="no-tasks">No tasks found matching your filters</div>';
      return;
    }

    container.innerHTML = sortedTasks
      .map(
        (task) => `
      <div class="task-item ${task.status}" data-task-id="${task.id}">
        <div class="task-main-info">
          <span class="priority-dot ${task.priority}"></span>
          <span class="task-title">${this.escapeHTML(task.title)}</span>
          ${task.image ? '<i class="fas fa-image"></i>' : ""}
        </div>
        <div class="task-info">
          <span class="task-date">Due: ${new Date(
            task.date
          ).toLocaleDateString()}</span>
          ${
            task.status === CONFIG.status.COMPLETED
              ? `<span class="completed-date">✓ ${new Date(
                  task.completedAt
                ).toLocaleDateString()}</span>`
              : `<span class="task-status ${task.status}">${task.status}</span>`
          }
        </div>
      </div>
    `
      )
      .join("");

    // Add click handlers
    container.querySelectorAll(".task-item").forEach((item) => {
      item.addEventListener("click", () => {
        const taskId = item.dataset.taskId;
        if (taskId) this.showTaskDetail(taskId);
      });
    });
  }

  showTaskDetail(taskId) {
    const task = this.taskManager.getTaskById(taskId);
    if (!task) return;

    const modal = document.getElementById("task-detail-modal");
    modal.dataset.taskId = taskId;

    // Update task details
    document.getElementById("detail-title").textContent = task.title;
    document.getElementById("detail-description").textContent =
      task.description || "No description provided";
    document.getElementById("detail-date").textContent = new Date(
      task.date
    ).toLocaleDateString();
    document.getElementById("detail-priority").textContent = task.priority;
    document.getElementById("detail-status").textContent = task.status;
    document.getElementById("detail-created").textContent = new Date(
      task.createdAt
    ).toLocaleDateString();

    // Update complete button text based on task status
    const completeBtn = document.getElementById("complete-task-btn");
    if (task.status === CONFIG.status.COMPLETED) {
      completeBtn.innerHTML = '<i class="fas fa-undo"></i> Mark as In Progress';
    } else {
      completeBtn.innerHTML = '<i class="fas fa-check"></i> Complete Task';
    }

    // Handle completed date
    const completedContainer = document.getElementById(
      "detail-completed-container"
    );
    const completedDate = document.getElementById("detail-completed");

    if (task.status === CONFIG.status.COMPLETED && task.completedAt) {
      completedDate.textContent = new Date(
        task.completedAt
      ).toLocaleDateString();
      completedContainer.style.display = "flex";
    } else {
      completedContainer.style.display = "none";
    }

    // Handle image
    const imageContainer = document.getElementById("detail-image-container");
    if (task.image) {
      imageContainer.innerHTML = `<img src="${task.image}" alt="Task image" class="task-image">`;
      imageContainer.style.display = "block";
    } else {
      imageContainer.style.display = "none";
    }

    this.openModal("task-detail-modal");
  }

  openTaskModal(taskId = null) {
    const modal = document.getElementById("task-modal");
    const modalTitle = document.getElementById("task-modal-title");
    const form = document.getElementById("add-task-form");
    const submitBtn = document.getElementById("task-submit-btn");

    if (!form) {
      console.error("Task form not found");
      return;
    }

    // Reset form
    form.reset();
    document.getElementById("image-preview").innerHTML = "";

    if (taskId) {
      // Edit mode
      const task = this.taskManager.getTaskById(taskId);
      if (!task) return;

      modalTitle.textContent = "Edit Task";
      submitBtn.textContent = "Save Changes";

      document.getElementById("task-id").value = task.id;
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-description").value =
        task.description || "";
      document.getElementById("task-due-date").value = task.date;
      document.getElementById("task-priority").value = task.priority;

      if (task.image) {
        document.getElementById("image-preview").innerHTML = `
          <img src="${task.image}" alt="Task image preview">
        `;
      }
    } else {
      // Add mode
      modalTitle.textContent = "Add New Task";
      submitBtn.textContent = "Add Task";
      document.getElementById("task-id").value = "";

      // Set default due date to today
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("task-due-date").value = today;
    }

    this.openModal("task-modal");
  }

  handleTaskFormSubmit(e) {
    e.preventDefault();

    try {
      const form = e.target;
      const taskId = form.querySelector("#task-id").value;
      const title = form.querySelector("#task-title").value.trim();
      const description = form.querySelector("#task-description").value.trim();
      const dueDate = form.querySelector("#task-due-date").value;
      const priority = form.querySelector("#task-priority").value;
      const imagePreview = document.getElementById("image-preview");

      // Form validation
      if (!title) {
        throw new Error("Task title is required");
      }
      if (!dueDate) {
        throw new Error("Due date is required");
      }
      if (!priority || !Object.values(CONFIG.priority).includes(priority)) {
        throw new Error("Valid priority level is required");
      }

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error("Due date cannot be in the past");
      }

      // Get the image (if any)
      let image = null;
      if (imagePreview.querySelector("img")) {
        image = imagePreview.querySelector("img").src;
      }

      const taskData = {
        title,
        description,
        date: dueDate,
        priority,
        image,
      };

      if (taskId) {
        // Update existing task
        this.taskManager.updateTask(taskId, taskData);
        this.showNotification("Task updated successfully", "success");
      } else {
        // Create new task
        this.taskManager.createTask(taskData);
        this.showNotification("Task created successfully", "success");
      }

      this.closeModal("task-modal");
      this.updateUI();
    } catch (error) {
      this.showNotification(error.message, "error");
      console.error("Form submission error:", error);
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const container =
      document.getElementById("notification-container") || document.body;
    container.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById("image-preview");

    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        preview.innerHTML = `<img src="${event.target.result}" alt="Task image preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      preview.innerHTML = "";
    }
  }

  editTask(taskId) {
    this.closeModal("task-detail-modal");
    this.openTaskModal(taskId);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Hide all other modals first
      document.querySelectorAll(".modal").forEach((m) => {
        m.classList.remove("active");
      });

      // Show this modal
      modal.classList.add("active");

      // Focus first input if exists
      const firstInput = modal.querySelector("input, textarea, select");
      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");

      // Reset form if exists
      const form = modal.querySelector("form");
      if (form) {
        try {
          form.reset();
          // Clear any task ID data
          const taskIdInput = form.querySelector("#task-id");
          if (taskIdInput) {
            taskIdInput.value = "";
          }
        } catch (error) {
          console.error("Error resetting form:", error);
        }
      }

      // Clear image preview if exists
      const imagePreview = modal.querySelector("#image-preview");
      if (imagePreview) {
        imagePreview.innerHTML = "";
      }

      // Remove any error messages
      const errorMessages = modal.querySelectorAll(".error-message");
      errorMessages.forEach((msg) => msg.remove());
    }
  }

  escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// App Initializer
class App {
  constructor() {
    try {
      this.taskManager = new TaskManager();
      this.uiController = new UIController(this.taskManager);

      // Initialize with dashboard view
      this.uiController.switchView(CONFIG.views.DASHBOARD);

      console.log("App initialized successfully");
    } catch (error) {
      console.error("Error initializing app:", error);
      this.handleInitError(error);
    }
  }

  handleInitError(error) {
    // Show error message to user
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="error-message">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
          <small>Error: ${error.message}</small>
        </div>
      `;
    }
  }
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    window.todoMaster = new App();
  } catch (error) {
    console.error("Failed to start app:", error);
  }
});
