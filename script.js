class ToDoApp {
  constructor() {
    this.tasks = [];
    this.currentFilter = "all";
    this.initializeElements();
    this.bindEvents();
    this.loadTasksFromStorage();
    this.removeSampleTasks(); // Remove HTML sample tasks
    this.render();
  }

  // Initialize DOM elements
  initializeElements() {
    this.taskInput = document.getElementById("taskInput");
    this.addBtn = document.getElementById("addBtn");
    this.tasksList = document.getElementById("tasksList");
    this.emptyState = document.getElementById("emptyState");
    this.totalTasks = document.getElementById("totalTasks");
    this.completedTasks = document.getElementById("completedTasks");
    this.filterBtns = document.querySelectorAll(".filter-btn");
    this.clearCompleted = document.getElementById("clearCompleted");
    this.clearAll = document.getElementById("clearAll");
  }

  // Remove sample tasks from HTML
  removeSampleTasks() {
    this.tasksList.innerHTML = "";
  }

  // Bind event listeners
  bindEvents() {
    this.addBtn.addEventListener("click", () => this.addTask());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    // Filter buttons
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.setFilter(e.target.dataset.filter)
      );
    });

    // Bulk actions
    this.clearCompleted.addEventListener("click", () =>
      this.clearCompletedTasks()
    );
    this.clearAll.addEventListener("click", () => this.clearAllTasks());

    // Focus input on page load
    this.taskInput.focus();
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Add new task
  addTask() {
    const text = this.taskInput.value.trim();

    // Validation
    if (!text) {
      this.showNotification("Please enter a task!", "error");
      this.taskInput.focus();
      return;
    }

    if (text.length > 100) {
      this.showNotification(
        "Task is too long! Maximum 100 characters.",
        "error"
      );
      return;
    }

    const task = {
      id: this.generateId(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task); // Add to beginning for newest first
    this.taskInput.value = "";
    this.saveToStorage();
    this.render();
    this.showNotification("Task added successfully!", "success");
    this.taskInput.focus(); // Keep focus for quick adding
  }

  // Toggle task completion
  toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
      this.render();

      const message = task.completed
        ? "Task completed! 🎉"
        : "Task marked as active";
      this.showNotification(message, "success");
    }
  }

  // Edit task
  editTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) return;

    const newText = prompt("Edit task:", task.text);
    if (newText !== null && newText.trim() !== "") {
      const trimmedText = newText.trim();
      if (trimmedText.length > 100) {
        this.showNotification(
          "Task is too long! Maximum 100 characters.",
          "error"
        );
        return;
      }

      task.text = trimmedText;
      this.saveToStorage();
      this.render();
      this.showNotification("Task updated successfully!", "success");
    }
  }

  // Delete task
  deleteTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) return;

    if (confirm(`Are you sure you want to delete "${task.text}"?`)) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.saveToStorage();
      this.render();
      this.showNotification("Task deleted successfully!", "success");
    }
  }

  // Set filter
  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    this.render();
  }

  // Get filtered tasks
  getFilteredTasks() {
    switch (this.currentFilter) {
      case "active":
        return this.tasks.filter((task) => !task.completed);
      case "completed":
        return this.tasks.filter((task) => task.completed);
      default:
        return this.tasks;
    }
  }

  // Clear completed tasks
  clearCompletedTasks() {
    const completedCount = this.tasks.filter((task) => task.completed).length;

    if (completedCount === 0) {
      this.showNotification("No completed tasks to clear!", "error");
      return;
    }

    if (
      confirm(
        `Delete ${completedCount} completed task${
          completedCount > 1 ? "s" : ""
        }?`
      )
    ) {
      this.tasks = this.tasks.filter((task) => !task.completed);
      this.saveToStorage();
      this.render();
      this.showNotification(
        `${completedCount} completed task${
          completedCount > 1 ? "s" : ""
        } cleared!`,
        "success"
      );
    }
  }

  // Clear all tasks
  clearAllTasks() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to clear!", "error");
      return;
    }

    if (
      confirm(`Delete all ${this.tasks.length} tasks? This cannot be undone!`)
    ) {
      this.tasks = [];
      this.saveToStorage();
      this.render();
      this.showNotification("All tasks cleared!", "success");
    }
  }

  // Main render function
  render() {
    this.updateStats();
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      this.showEmptyState();
    } else {
      this.renderTasks(filteredTasks);
    }
  }

  // Render tasks list
  renderTasks(tasks) {
    this.emptyState.classList.add("hidden");

    this.tasksList.innerHTML = tasks
      .map(
        (task) => `
            <li class="task-item ${
              task.completed ? "completed" : ""
            }" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${
                  task.completed ? "checked" : ""
                } 
                       onchange="todoApp.toggleTask('${task.id}')">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="action-icon edit-btn" onclick="todoApp.editTask('${
                      task.id
                    }')" 
                            title="Edit task" ${
                              task.completed ? 'style="opacity: 0.5;"' : ""
                            }>
                        ✏️
                    </button>
                    <button class="action-icon delete-btn" onclick="todoApp.deleteTask('${
                      task.id
                    }')" 
                            title="Delete task">
                        🗑️
                    </button>
                </div>
            </li>
        `
      )
      .join("");
  }

  // Show empty state
  showEmptyState() {
    this.emptyState.classList.remove("hidden");
    this.tasksList.innerHTML = "";

    // Update empty state message based on current filter
    const emptyMessages = {
      all: {
        icon: "📋",
        title: "No tasks yet!",
        message: "Add your first task above to get started.",
      },
      active: {
        icon: "✅",
        title: "No active tasks!",
        message: "All tasks are completed. Great job!",
      },
      completed: {
        icon: "📝",
        title: "No completed tasks!",
        message: "Complete some tasks to see them here.",
      },
    };

    const { icon, title, message } = emptyMessages[this.currentFilter];
    this.emptyState.innerHTML = `
            <div class="empty-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${message}</p>
        `;
  }

  // Update task statistics
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((task) => task.completed).length;

    this.totalTasks.textContent = total;
    this.completedTasks.textContent = completed;

    // Update filter button badges (optional enhancement)
    this.updateFilterBadges();
  }

  // Update filter buttons with task counts
  updateFilterBadges() {
    const counts = {
      all: this.tasks.length,
      active: this.tasks.filter((task) => !task.completed).length,
      completed: this.tasks.filter((task) => task.completed).length,
    };

    this.filterBtns.forEach((btn) => {
      const filter = btn.dataset.filter;
      const count = counts[filter];
      btn.textContent = `${
        filter.charAt(0).toUpperCase() + filter.slice(1)
      } (${count})`;
    });
  }

  // localStorage functions
  saveToStorage() {
    localStorage.setItem("codealpha-todos", JSON.stringify(this.tasks));
  }

  loadTasksFromStorage() {
    try {
      const saved = localStorage.getItem("codealpha-todos");
      this.tasks = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading tasks from storage:", error);
      this.tasks = [];
      this.showNotification("Error loading saved tasks", "error");
    }
  }

  // Utility: Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Enhanced notification system
  showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notif) => notif.remove());

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Notification styles
    const styles = {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "15px 20px",
      borderRadius: "10px",
      color: "white",
      fontWeight: "600",
      fontSize: "14px",
      zIndex: "1000",
      maxWidth: "300px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      animation: "slideInRight 0.3s ease-out",
      cursor: "pointer",
    };

    // Type-specific colors
    const colors = {
      success: "linear-gradient(135deg, #00ff9d, #00d4ff)",
      error: "#ff4757",
      info: "#667eea",
    };

    Object.assign(notification.style, styles);
    notification.style.background = colors[type] || colors.info;

    // Add CSS animation
    if (!document.getElementById("notification-styles")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "notification-styles";
      styleSheet.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
      document.head.appendChild(styleSheet);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Click to dismiss
    notification.addEventListener("click", () => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease-out";
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }
}

// Initialize app when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  window.todoApp = new ToDoApp();

  // Add some keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + / to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      todoApp.taskInput.focus();
    }
  });
});
