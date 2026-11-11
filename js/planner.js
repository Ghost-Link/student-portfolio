/* ==========================================================================
   planner.js — academic planner
   Adds, completes and deletes tasks with localStorage persistence.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "me-planner-tasks-v1";
  var DAY = 24 * 60 * 60 * 1000;
  var PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

  var form = document.querySelector("#task-form");
  if (!form) {
    return;
  }

  var titleInput = document.querySelector("#task-title");
  var courseInput = document.querySelector("#task-course");
  var dueInput = document.querySelector("#task-due");
  var priorityInput = document.querySelector("#task-priority");
  var titleField = document.querySelector("#task-title-field");
  var dueField = document.querySelector("#task-due-field");
  var titleError = document.querySelector("#task-title-error");
  var dueError = document.querySelector("#task-due-error");
  var tableBody = document.querySelector("#task-list");
  var tableWrap = document.querySelector("#task-table-wrap");
  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-task-filter]")
  );
  var sortSelect = document.querySelector("#task-sort");
  var clearCompletedBtn = document.querySelector("#clear-completed");
  var resetDemoBtn = document.querySelector("#reset-demo");
  var statusRegion = document.querySelector("#planner-status");
  var toast = document.querySelector("#planner-toast");

  var statTotal = document.querySelector("#stat-total");
  var statCompleted = document.querySelector("#stat-completed");
  var statPending = document.querySelector("#stat-pending");
  var statProgress = document.querySelector("#stat-progress");
  var progressFill = document.querySelector("#progress-fill");
  var progressBar = document.querySelector("#progress-bar");

  var state = {
    tasks: [],
    filter: "all",
    sort: "due"
  };

  var storageWarningShown = false;
  var toastTimer = null;

  /* ---------- Utilities ---------- */
  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "task-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function toISODate(date) {
    return (
      date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate())
    );
  }

  function addDays(days) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return toISODate(date);
  }

  function startOfToday() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function parseISODate(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function announce(message) {
    if (!statusRegion) {
      return;
    }
    statusRegion.textContent = "";
    window.setTimeout(function () {
      statusRegion.textContent = message;
    }, 30);
  }

  function showToast(message) {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  /* ---------- Data ---------- */
  function seedTasks() {
    return [
      {
        id: uid(),
        title: "Complete Network Security lab 4",
        course: "CYB 301 · Network Security",
        due: addDays(2),
        priority: "high",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Submit threat-modelling report",
        course: "CYB 308 · Ethical Hacking",
        due: addDays(5),
        priority: "high",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Revise for the Cryptography quiz",
        course: "CYB 312 · Cryptography",
        due: addDays(1),
        priority: "medium",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Document SentinelScan findings",
        course: "Portfolio · Project 01",
        due: addDays(7),
        priority: "medium",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Read chapter 6 — incident response",
        course: "CYB 320 · Security Operations",
        due: addDays(-1),
        priority: "low",
        completed: true,
        createdAt: new Date(Date.now() - 4 * DAY).toISOString()
      },
      {
        id: uid(),
        title: "Update portfolio case study",
        course: "Career & portfolio",
        due: addDays(0),
        priority: "low",
        completed: true,
        createdAt: new Date(Date.now() - 2 * DAY).toISOString()
      }
    ];
  }

  function normalizeTask(raw) {
    if (!raw || typeof raw.title !== "string" || !raw.title.trim()) {
      return null;
    }

    var priority = ["low", "medium", "high"].indexOf(raw.priority) !== -1
      ? raw.priority
      : "medium";

    var due =
      typeof raw.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.due)
        ? raw.due
        : "";

    return {
      id: typeof raw.id === "string" ? raw.id : uid(),
      title: raw.title.trim().slice(0, 80),
      course:
        typeof raw.course === "string" && raw.course.trim()
          ? raw.course.trim().slice(0, 60)
          : "General study",
      due: due,
      priority: priority,
      completed: Boolean(raw.completed),
      createdAt:
        typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString()
    };
  }

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return null;
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed.map(normalizeTask).filter(Boolean);
    } catch (error) {
      return null;
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (error) {
      if (!storageWarningShown) {
        storageWarningShown = true;
        showToast("Browser storage is unavailable — tasks will last this visit only.");
      }
    }
  }

  /* ---------- Formatting ---------- */
  function formatDue(iso, completed) {
    if (!iso) {
      return { text: "No date", className: "due" };
    }

    var date = parseISODate(iso);
    var today = startOfToday();
    var diff = Math.round((date - today) / DAY);
    var options = { day: "numeric", month: "short" };

    if (date.getFullYear() !== today.getFullYear()) {
      options.year = "numeric";
    }

    var label = date.toLocaleDateString("en-GB", options);

    if (completed) {
      return { text: label, className: "due" };
    }
    if (diff === 0) {
      return { text: "Today", className: "due due--today" };
    }
    if (diff === 1) {
      return { text: "Tomorrow", className: "due" };
    }
    if (diff < 0) {
      return { text: label + " · overdue", className: "due due--overdue" };
    }
    return { text: label, className: "due" };
  }

  /* ---------- Sorting & filtering ---------- */
  function compareTasks(a, b) {
    if (state.sort === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (state.sort === "priority") {
      if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (a.due && b.due && a.due !== b.due) {
        return a.due.localeCompare(b.due);
      }
      if (a.due && !b.due) {
        return -1;
      }
      if (!a.due && b.due) {
        return 1;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (a.due && b.due && a.due !== b.due) {
      return a.due.localeCompare(b.due);
    }
    if (a.due && !b.due) {
      return -1;
    }
    if (!a.due && b.due) {
      return 1;
    }
    var priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  }

  function visibleTasks() {
    return state.tasks
      .filter(function (task) {
        if (state.filter === "active") {
          return !task.completed;
        }
        if (state.filter === "completed") {
          return task.completed;
        }
        return true;
      })
      .sort(compareTasks);
  }

  /* ---------- Rendering ---------- */
  function createCell(label) {
    var cell = document.createElement("td");
    if (label) {
      cell.setAttribute("data-label", label);
    }
    return cell;
  }

  function buildEmptyRow() {
    var row = document.createElement("tr");
    row.className = "empty-row";

    var cell = document.createElement("td");
    cell.colSpan = 6;

    var wrapper = document.createElement("div");
    wrapper.className = "empty-state";

    var icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';

    var heading = document.createElement("h3");
    var copy = document.createElement("p");

    if (state.filter === "completed") {
      heading.textContent = "Nothing completed yet";
      copy.textContent =
        "Tick a task once it is finished and it will appear here.";
    } else if (state.filter === "active") {
      heading.textContent = "All caught up";
      copy.textContent =
        "There are no active tasks. Add something new or enjoy the break.";
    } else {
      heading.textContent = "Your planner is empty";
      copy.textContent =
        "Add your first task above — it will be saved in this browser automatically.";
    }

    wrapper.appendChild(icon);
    wrapper.appendChild(heading);
    wrapper.appendChild(copy);
    cell.appendChild(wrapper);
    row.appendChild(cell);
    return row;
  }

  function buildTaskRow(task) {
    var row = document.createElement("tr");
    row.className = "task-row" + (task.completed ? " is-complete" : "");
    row.setAttribute("data-id", task.id);

    /* Done */
    var doneCell = createCell("Done");
    var label = document.createElement("label");
    label.className = "task-check";
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("data-action", "toggle");
    checkbox.setAttribute(
      "aria-label",
      task.completed
        ? "Mark " + task.title + " as not completed"
        : "Mark " + task.title + " as completed"
    );
    label.appendChild(checkbox);
    doneCell.appendChild(label);

    /* Task */
    var taskCell = createCell("Task");
    var title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    taskCell.appendChild(title);

    /* Course */
    var courseCell = createCell("Course");
    var course = document.createElement("span");
    course.className = "task-course";
    course.textContent = task.course;
    courseCell.appendChild(course);

    /* Due */
    var dueCell = createCell("Due");
    var due = document.createElement("span");
    var dueInfo = formatDue(task.due, task.completed);
    due.className = dueInfo.className;
    due.textContent = dueInfo.text;
    if (task.due) {
      due.setAttribute(
        "title",
        "Due " +
          parseISODate(task.due).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })
      );
    }
    dueCell.appendChild(due);

    /* Priority */
    var priorityCell = createCell("Priority");
    var priority = document.createElement("span");
    priority.className = "priority priority--" + task.priority;
    priority.textContent = task.priority;
    priorityCell.appendChild(priority);

    /* Actions */
    var actionCell = createCell("Actions");
    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("data-action", "delete");
    deleteBtn.setAttribute("aria-label", "Delete task: " + task.title);
    deleteBtn.title = "Delete task";
    deleteBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
    actionCell.appendChild(deleteBtn);

    row.appendChild(doneCell);
    row.appendChild(taskCell);
    row.appendChild(courseCell);
    row.appendChild(dueCell);
    row.appendChild(priorityCell);
    row.appendChild(actionCell);

    return row;
  }

  function updateCounts() {
    var total = state.tasks.length;
    var completed = state.tasks.filter(function (task) {
      return task.completed;
    }).length;
    var active = total - completed;

    document.querySelectorAll("[data-count]").forEach(function (node) {
      var key = node.getAttribute("data-count");
      node.textContent =
        key === "all" ? total : key === "active" ? active : completed;
    });

    if (statTotal) {
      statTotal.textContent = total;
    }
    if (statCompleted) {
      statCompleted.textContent = completed;
    }
    if (statPending) {
      statPending.textContent = active;
    }

    var percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (statProgress) {
      statProgress.textContent = percent + "%";
    }
    if (progressFill) {
      progressFill.style.width = percent + "%";
    }
    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", String(percent));
    }

    if (clearCompletedBtn) {
      clearCompletedBtn.disabled = completed === 0;
    }
  }

  function render() {
    if (!tableBody) {
      return;
    }

    tableBody.textContent = "";
    var tasks = visibleTasks();

    if (tasks.length === 0) {
      tableBody.appendChild(buildEmptyRow());
    } else {
      var fragment = document.createDocumentFragment();
      tasks.forEach(function (task) {
        fragment.appendChild(buildTaskRow(task));
      });
      tableBody.appendChild(fragment);
    }

    updateCounts();
  }

  function setFilter(filter) {
    state.filter = filter;
    filterButtons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-task-filter") === filter)
      );
    });
    render();
  }

  /* ---------- Form validation ---------- */
  function setFieldError(field, input, errorNode, message) {
    if (!field || !input || !errorNode) {
      return;
    }
    field.classList.toggle("has-error", Boolean(message));
    field.classList.toggle("is-valid", !message && input.value.trim() !== "");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    errorNode.textContent = message;
  }

  function validateTitle() {
    var value = titleInput.value.trim();
    var message = "";

    if (!value) {
      message = "Please give the task a title.";
    } else if (value.length < 3) {
      message = "Use at least 3 characters for the task title.";
    }

    setFieldError(titleField, titleInput, titleError, message);
    return !message;
  }

  function validateDue() {
    var value = dueInput.value;
    var message = "";

    if (value && value < toISODate(new Date())) {
      message = "Choose today or a future date.";
    }

    setFieldError(dueField, dueInput, dueError, message);
    return !message;
  }

  /* ---------- Actions ---------- */
  function addTask(event) {
    event.preventDefault();

    var titleValid = validateTitle();
    var dueValid = validateDue();

    if (!titleValid || !dueValid) {
      if (!titleValid) {
        titleInput.focus();
      } else {
        dueInput.focus();
      }
      announce("Please fix the highlighted planner fields.");
      return;
    }

    var task = {
      id: uid(),
      title: titleInput.value.trim(),
      course: courseInput.value.trim() || "General study",
      due: dueInput.value,
      priority: priorityInput.value,
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    saveTasks();
    setFilter("all");
    setSort("due");

    form.reset();
    priorityInput.value = "medium";
    titleInput.value = "";
    courseInput.value = "";
    dueInput.value = "";
    setFieldError(titleField, titleInput, titleError, "");
    setFieldError(dueField, dueInput, dueError, "");
    dueInput.min = toISODate(new Date());

    render();
    titleInput.focus();
    announce('Task "' + task.title + '" added.');
    showToast("Task added to your planner.");
  }

  function setSort(value) {
    state.sort = value;
    if (sortSelect) {
      sortSelect.value = value;
    }
  }

  function toggleTask(id, completed) {
    var task = state.tasks.find(function (item) {
      return item.id === id;
    });
    if (!task) {
      return;
    }

    task.completed = completed;
    saveTasks();
    render();

    var newCheckbox = tableBody.querySelector(
      'tr[data-id="' + id + '"] [data-action="toggle"]'
    );
    if (newCheckbox) {
      newCheckbox.focus();
    } else if (tableWrap) {
      /* The row left the current view (filter changed) — keep focus in the table. */
      tableWrap.focus();
    }

    announce(
      completed
        ? '"' + task.title + '" marked as completed.'
        : '"' + task.title + '" marked as active.'
    );
    showToast(completed ? "Task completed. Nice work!" : "Task moved back to active.");
  }

  function deleteTask(id) {
    var task = state.tasks.find(function (item) {
      return item.id === id;
    });
    if (!task) {
      return;
    }

    state.tasks = state.tasks.filter(function (item) {
      return item.id !== id;
    });

    saveTasks();
    render();

    if (tableWrap) {
      tableWrap.focus();
    }

    announce('Task "' + task.title + '" deleted.');
    showToast("Task deleted.");
  }

  function clearCompleted() {
    var completedCount = state.tasks.filter(function (task) {
      return task.completed;
    }).length;

    if (completedCount === 0) {
      return;
    }

    if (!window.confirm("Remove all " + completedCount + " completed tasks?")) {
      return;
    }

    state.tasks = state.tasks.filter(function (task) {
      return !task.completed;
    });
    saveTasks();
    render();
    announce("Completed tasks cleared.");
    showToast(completedCount + " completed tasks cleared.");
  }

  function resetDemo() {
    if (
      !window.confirm(
        "Replace the current task list with the sample planner data?"
      )
    ) {
      return;
    }

    state.tasks = seedTasks();
    saveTasks();
    setFilter("all");
    setSort("due");
    render();
    announce("Sample tasks loaded.");
    showToast("Sample planner data restored.");
  }

  /* ---------- Events ---------- */
  if (form) {
    form.addEventListener("submit", addTask);
  }

  if (titleInput) {
    titleInput.addEventListener("input", function () {
      if (titleField.classList.contains("has-error")) {
        validateTitle();
      }
    });
  }

  if (dueInput) {
    dueInput.addEventListener("change", validateDue);
  }

  if (tableBody) {
    tableBody.addEventListener("change", function (event) {
      if (event.target.matches('[data-action="toggle"]')) {
        var row = event.target.closest("tr");
        if (row) {
          toggleTask(row.getAttribute("data-id"), event.target.checked);
        }
      }
    });

    tableBody.addEventListener("click", function (event) {
      var button = event.target.closest('[data-action="delete"]');
      if (!button) {
        return;
      }
      var row = button.closest("tr");
      if (row) {
        deleteTask(row.getAttribute("data-id"));
      }
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-task-filter") || "all";
      setFilter(filter);
      announce("Showing " + filter + " tasks.");
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      setSort(sortSelect.value);
      render();
      announce("Task list sorted by " + sortSelect.options[sortSelect.selectedIndex].text.toLowerCase() + ".");
    });
  }

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", clearCompleted);
  }

  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", resetDemo);
  }

  /* ---------- Initialise ---------- */
  var stored = loadTasks();
  state.tasks = stored === null ? seedTasks() : stored;
  if (stored === null) {
    saveTasks();
  }

  if (dueInput) {
    dueInput.min = toISODate(new Date());
  }

  if (sortSelect) {
    state.sort = sortSelect.value || "due";
  }

  filterButtons.forEach(function (button) {
    button.setAttribute(
      "aria-pressed",
      String(button.getAttribute("data-task-filter") === "all")
    );
  });

  render();
})();
