(function () {
  // Cache DOM elements
  const inputBoxElement = document.getElementById("input-box");
  const listContainerElement = document.getElementById("list-container");
  const sortableList = document.querySelector(".sortable-list");
  const pendingNum = document.querySelector(".pending-num");
  const clearButton = document.querySelector(".clear-button");
  const addTaskButton = document.querySelector("#addTaskButton");

  // Initialize a safe localStorage wrapper to handle potential errors
  const safeLocalStorage = getSafeLocalStorage();

  // Set up event listeners for various interactions
  document.body.addEventListener("load", updateTime);
  document.body.addEventListener("click", keepInputFocused);
  sortableList.addEventListener("dragover", initSortableList);
  sortableList.addEventListener("dragenter", (e) => e.preventDefault());
  listContainerElement.addEventListener("click", handleListClick);
  inputBoxElement.addEventListener("input", autoExpandTextarea);
  inputBoxElement.addEventListener("keypress", handleKeyPress); // Ensure keypress event is attached
  addTaskButton.addEventListener("click", addTask);
  clearButton.addEventListener("click", clearTasks);

  // Initialize the application once the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", initialize);

  // Wrapper for localStorage with error handling
  function getSafeLocalStorage() {
    return {
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error(`Error setting item in localStorage: ${error}`);
          showError(
            "Unable to save data. Please ensure that Local Storage is enabled and not full."
          );
        }
      },
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : [];
        } catch (error) {
          console.error(`Error getting item from localStorage: ${error}`);
          showError(
            "Unable to retrieve data. Please ensure that Local Storage is enabled."
          );
          return [];
        }
      },
    };
  }

  // Function to update the time display
  function updateTime() {
    const data = new Date();
    const h = data.getHours();
    const m = data.getMinutes();
    const s = data.getSeconds();
    document.getElementById("hour").textContent = `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Keep the input box focused if the user clicks elsewhere on the page
  function keepInputFocused(e) {
    if (e.target !== inputBoxElement) {
      inputBoxElement.focus();
    }
  }

  // Automatically expand the textarea as the user types
  function autoExpandTextarea() {
    this.style.height = 'auto'; // Reset the height to auto to calculate the new height
    this.style.height = `${this.scrollHeight}px`; // Set the height based on scrollHeight
  }

  // Handle clicks on the task list (mark as completed or delete task)
  function handleListClick(e) {
    const tasks = safeLocalStorage.getItem("tasks");
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
      const index = Array.from(listContainerElement.children).indexOf(e.target);
      tasks[index].status = e.target.classList.contains("checked") ? "completed" : "pending";
      safeLocalStorage.setItem("tasks", JSON.stringify(tasks));
      updatePendingTasks();
    } else if (e.target.tagName === "SPAN") {
      const index = Array.from(listContainerElement.children).indexOf(e.target.parentElement);
      tasks.splice(index, 1);
      safeLocalStorage.setItem("tasks", JSON.stringify(tasks));
      renderTaskList();
    }
  }

  // Add a new task when the user presses the "Enter" key
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  }

  // Add a new task to the list
  function addTask() {
    let taskValue = inputBoxElement.value.trim();
    if (!taskValue) {
      showError("You must write something!");
      return;
    }

    taskValue = sanitizeInput(taskValue);

    const tasks = safeLocalStorage.getItem("tasks");
    tasks.push({ value: taskValue, status: "pending" });
    safeLocalStorage.setItem("tasks", JSON.stringify(tasks));

    renderTaskList();
    addDragAndDropListeners();
    inputBoxElement.value = "";
    autoExpandTextarea.call(inputBoxElement); // Adjust height after adding task
  }

  // Clear all tasks from the list
  function clearTasks() {
    listContainerElement.innerHTML = "";
    safeLocalStorage.setItem("tasks", JSON.stringify([]));
    updatePendingTasks();
    inputBoxElement.focus();
  }

  // Initialize the app: set up date, time, and render existing tasks
  function initialize() {
    const data = new Date();
    document.getElementById("date").textContent = data.toDateString();
    updateTime();
    setInterval(updateTime, 500);

    // Initialize the textarea height
    inputBoxElement.style.height = `${inputBoxElement.scrollHeight}px`;

    renderTaskList();
    addDragAndDropListeners();
    inputBoxElement.focus();
  }

  // Render the task list from localStorage
  function renderTaskList() {
    const fragment = document.createDocumentFragment();
    const tasks = safeLocalStorage.getItem("tasks");

    tasks.forEach((task, id) => {
      const taskItem = document.createElement("li");
      taskItem.textContent = task.value;
      taskItem.className = "item";
      taskItem.draggable = true;
      if (task.status === "completed") taskItem.classList.add("checked");

      const removeSpan = document.createElement("span");
      removeSpan.textContent = "\u00D7";
      taskItem.appendChild(removeSpan);

      fragment.appendChild(taskItem);
    });

    listContainerElement.innerHTML = "";
    listContainerElement.appendChild(fragment);

    updatePendingTasks();
  }

  // Add drag-and-drop functionality to the task list
  function addDragAndDropListeners() {
    const items = sortableList.querySelectorAll(".item");
    items.forEach((item) => {
      item.addEventListener("dragstart", () => {
        item.classList.add("dragging");
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        saveNewOrder();
      });
    });
  }

  // Initialize sortable list for drag-and-drop
  function initSortableList(e) {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    if (!draggingItem) return;

    let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];
    let nextSibling = siblings.find((sibling) => {
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });

    if (nextSibling) {
      sortableList.insertBefore(draggingItem, nextSibling);
    } else {
      sortableList.appendChild(draggingItem);
    }
  }

  // Save the new order of tasks after dragging
  function saveNewOrder() {
    const items = document.querySelectorAll(".item");
    const newOrder = Array.from(items).map((item) => {
      return {
        value: item.textContent.slice(0, -1),
        status: item.classList.contains("checked") ? "completed" : "pending",
      };
    });
    safeLocalStorage.setItem("tasks", JSON.stringify(newOrder));
  }

  // Update the pending tasks counter
  function updatePendingTasks() {
    const tasks = safeLocalStorage.getItem("tasks");
    const pendingTasks = tasks.filter((task) => task.status === "pending");
    pendingNum.textContent =
      pendingTasks.length === 0 ? "0" : pendingTasks.length;
    clearButton.style.pointerEvents =
      pendingTasks.length === 0 ? "none" : "auto";
  }

  // Sanitize user input to prevent XSS attacks
  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  }

  // Display an error notification
  function showError(message) {
    const notificationContainer = document.getElementById(
      "notification-container"
    );
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    const closeBtn = document.createElement("span");
    closeBtn.className = "closebtn";
    closeBtn.textContent = "×";
    closeBtn.onclick = function () {
      notificationContainer.removeChild(notification);
    };
    notification.appendChild(closeBtn);

    notificationContainer.appendChild(notification);

    setTimeout(() => {
      if (notificationContainer.contains(notification)) {
        notificationContainer.removeChild(notification);
      }
    }, 4000);
  }
})();
