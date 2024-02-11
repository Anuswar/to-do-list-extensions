(function () {
  const inputBoxElement = document.getElementById("input-box");
  const listContainerElement = document.getElementById("list-container");
  const sortableList = document.querySelector(".sortable-list");
  const pendingNum = document.querySelector(".pending-num");
  const clearButton = document.querySelector(".clear-button");
  const addTaskButton = document.querySelector("button");
  const filters = document.querySelectorAll(".filters span");

  const safeLocalStorage = getSafeLocalStorage();

  document.body.addEventListener("load", updateTime);
  document.body.addEventListener("click", keepInputFocused);
  sortableList.addEventListener("dragover", initSortableList);
  sortableList.addEventListener("dragenter", (e) => e.preventDefault());
  listContainerElement.addEventListener("dblclick", handleDblClick);
  inputBoxElement.addEventListener("keypress", handleKeyPress);
  inputBoxElement.addEventListener("input", autoExpandTextarea);
  addTaskButton.addEventListener("click", addTask);
  clearButton.addEventListener("click", clearTasks);

  document.addEventListener("DOMContentLoaded", initialize);

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
      if (notificationContainer.contains(notification)) {
        // Check if it's a child before removing
        notificationContainer.removeChild(notification);
      }
    };
    notification.appendChild(closeBtn);

    notificationContainer.appendChild(notification);

    setTimeout(() => {
      if (notificationContainer.contains(notification)) {
        // Check if it's a child before removing
        notificationContainer.removeChild(notification);
      }
    }, 3000);
  }

  filters.forEach((btn) => {
    // New Block
    btn.addEventListener("click", () => {
      document.querySelector("span.active").classList.remove("active");
      btn.classList.add("active");
      renderTaskList(btn.id);
    });
  });

  function updateTime() {
    const data = new Date();
    const h = data.getHours();
    const m = data.getMinutes();
    const s = data.getSeconds();
    document.getElementById("hour").textContent = `${h < 10 ? "0" : ""}${h}:${
      m < 10 ? "0" : ""
    }${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function keepInputFocused(e) {
    if (e.target !== inputBoxElement) {
      inputBoxElement.focus();
    }
  }

  function autoExpandTextarea() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
  }

  function handleDblClick(e) {
    if (e.target.tagName === "LI") {
      const li = e.target;
      const span = li.querySelector("span");
      const currentText = li.textContent.slice(0, -1);

      const textarea = document.createElement("textarea");
      textarea.value = currentText;
      textarea.rows = 1;
      textarea.style.width = "calc(100% - 30px)";
      textarea.style.overflow = "hidden";

      li.textContent = "";
      li.appendChild(textarea);
      li.appendChild(span);

      textarea.focus();
      textarea.style.height = `${textarea.scrollHeight}px`;

      textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = `${this.scrollHeight}px`;
      });

      textarea.addEventListener("blur", function () {
        const newText = this.value;
        li.textContent = newText;
        li.appendChild(span);

        const index = Array.from(listContainerElement.children).indexOf(li);
        const tasks = safeLocalStorage.getItem("tasks");
        tasks[index].value = newText;
        safeLocalStorage.setItem("tasks", JSON.stringify(tasks));
      });
    }
  }

  listContainerElement.addEventListener("click", function(event) {
    const target = event.target;
    if (target.tagName === "LI") {
      target.classList.toggle("checked");
      const index = Array.from(listContainerElement.children).indexOf(target);
      const tasks = safeLocalStorage.getItem("tasks");
      tasks[index].status = target.classList.contains("checked") ? "completed" : "pending";
      safeLocalStorage.setItem("tasks", JSON.stringify(tasks));
      renderTaskList(document.querySelector("span.active").id);
    } else if (target.tagName === "SPAN") {
      const listItem = target.parentElement;
      const index = Array.from(listContainerElement.children).indexOf(listItem);
      const tasks = safeLocalStorage.getItem("tasks");
      tasks.splice(index, 1);
      safeLocalStorage.setItem("tasks", JSON.stringify(tasks));
      listItem.remove();
      renderTaskList(document.querySelector("span.active").id);
    }
  });

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  }

  function addTask() {
    let taskValue = inputBoxElement.value.trim();
    if (!taskValue) {
      showError("You must write something!");
      return;
    }

    taskValue = sanitizeInput(taskValue);

    const tasks = safeLocalStorage.getItem("tasks");
    tasks.push({ value: taskValue, status: "pending" }); // Modified line
    safeLocalStorage.setItem("tasks", JSON.stringify(tasks));

    renderTaskList();
    addDragAndDropListeners();
    inputBoxElement.value = "";
  }

  function clearTasks() {
    listContainerElement.innerHTML = "";
    safeLocalStorage.setItem("tasks", JSON.stringify([]));
    updatePendingTasks();
    inputBoxElement.focus();
  }

  function initialize() {
    const data = new Date();
    document.getElementById("date").textContent = data.toDateString();
    updateTime();
    setInterval(updateTime, 500);

    inputBoxElement.style.height = `${inputBoxElement.scrollHeight}px`;

    renderTaskList();
    addDragAndDropListeners();
    inputBoxElement.focus();
  }

  function renderTaskList(filter = "all") {
    const fragment = document.createDocumentFragment();
    const tasks = safeLocalStorage.getItem("tasks");

    tasks.forEach((task, id) => {
      if (filter === task.status || filter === "all") {
        const taskItem = document.createElement("li");
        taskItem.textContent = task.value;
        taskItem.className = "item pending";
        taskItem.draggable = true;
        if (task.status === "completed") taskItem.classList.add("checked");

        const removeSpan = document.createElement("span");
        removeSpan.textContent = "\u00D7";
        taskItem.appendChild(removeSpan);

        fragment.appendChild(taskItem);
      }
    });

    listContainerElement.innerHTML = "";
    listContainerElement.appendChild(fragment);

    updatePendingTasks();
  }

  function addDragAndDropListeners() {
    const items = sortableList.querySelectorAll(".item");
    items.forEach((item) => {
      ["dragstart", "dragend"].forEach((event) => {
        item.addEventListener(event, () => item.classList.toggle("dragging"));
      });
    });
  }

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

    saveNewOrder();
    inputBoxElement.focus();
  }

  function saveNewOrder() {
    const items = document.querySelectorAll(".item");
    const newOrder = Array.from(items).map((item) => {
      return {
        value: item.textContent.slice(0, -1),
        status: item.classList.contains("checked") ? "completed" : "pending", // Modified line
      };
    });
    safeLocalStorage.setItem("tasks", JSON.stringify(newOrder));
  }

  function updatePendingTasks() {
    const tasks = safeLocalStorage.getItem("tasks");
    const pendingTasks = tasks.filter((task) => task.status === "pending");
    pendingNum.textContent =
      pendingTasks.length === 0 ? "0" : pendingTasks.length;
    clearButton.style.pointerEvents =
      pendingTasks.length === 0 ? "none" : "auto";
  }

  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  }

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
      notificationContainer.removeChild(notification);
    }, 3000);
  }
})();
