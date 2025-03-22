document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const newTaskBtn = document.getElementById("newTaskBtn")
    const taskModal = document.getElementById("taskModal")
    const closeModal = document.getElementById("closeModal")
    const cancelTask = document.getElementById("cancelTask")
    const taskForm = document.getElementById("taskForm")
    const cardMenus = document.querySelectorAll(".card-menu")
    const searchInput = document.querySelector(".search-bar input")
    const navItems = document.querySelectorAll(".nav-item")
    const userProfile = document.querySelector(".user-profile")
    const statusColumns = document.querySelectorAll(".status-column")
  
    // App State
    let tasks = JSON.parse(localStorage.getItem("tasks")) || []
    let pinnedTasks = JSON.parse(localStorage.getItem("pinnedTasks")) || []
    const currentFilter = "all"
  
    // Initialize App
    initApp()
  
    // Modal Functions
    function openTaskModal() {
      taskModal.style.display = "flex"
      document.body.style.overflow = "hidden" // Prevent scrolling when modal is open
  
      // Animation for modal appearance
      setTimeout(() => {
        taskModal.querySelector(".modal").style.transform = "translateY(0)"
        taskModal.style.opacity = "1"
      }, 10)
    }
  
    function closeTaskModal() {
      taskModal.querySelector(".modal").style.transform = "translateY(-20px)"
      taskModal.style.opacity = "0"
  
      setTimeout(() => {
        taskModal.style.display = "none"
        document.body.style.overflow = "auto" // Re-enable scrolling
        taskForm.reset() // Reset form fields
      }, 300) // Match transition duration
    }
  
    // Event Listeners
    newTaskBtn.addEventListener("click", openTaskModal)
    closeModal.addEventListener("click", closeTaskModal)
    cancelTask.addEventListener("click", closeTaskModal)
  
    // Close modal when clicking outside
    taskModal.addEventListener("click", (e) => {
      if (e.target === taskModal) {
        closeTaskModal()
      }
    })
  
    // Task Form Submission
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      // Get form values
      const title = document.getElementById("taskTitle").value
      const description = document.getElementById("taskDescription").value
      const category = document.getElementById("taskCategory").value
      const status = document.getElementById("taskStatus").value
      const time = document.getElementById("taskTime").value
  
      // Create new task object
      const newTask = {
        id: generateId(),
        title: title,
        description: description,
        category: category,
        status: status,
        time: time || formatTime(new Date()),
        createdAt: new Date().toISOString(),
        isPinned: false,
      }
  
      // Add task to array
      tasks.push(newTask)
  
      // Save to localStorage
      saveTasksToLocalStorage()
  
      // Render the new task
      renderTasks()
  
      // Close modal
      closeTaskModal()
  
      // Show success notification
      showNotification("Task created successfully!")
    })
  
    // Card Menu Dropdown
    cardMenus.forEach((menu) => {
      menu.addEventListener("click", function (e) {
        e.stopPropagation() // Prevent event bubbling
  
        // Close any open dropdowns first
        closeAllDropdowns()
  
        // Create dropdown menu
        const dropdown = createDropdownMenu(this)
        document.body.appendChild(dropdown)
  
        // Position the dropdown
        positionDropdown(dropdown, this)
  
        // Add event listener to close dropdown when clicking outside
        setTimeout(() => {
          document.addEventListener("click", closeDropdownOnClickOutside)
        }, 0)
      })
    })
  
    function createDropdownMenu(menuElement) {
      const taskCard = menuElement.closest(".task-card")
      const taskId = taskCard.dataset.id
      const isPinned = pinnedTasks.some((task) => task.id === taskId)
  
      const dropdown = document.createElement("div")
      dropdown.className = "dropdown-menu"
      dropdown.innerHTML = `
              <ul>
                  <li data-action="edit"><i class="fas fa-edit"></i> Edit Task</li>
                  <li data-action="${isPinned ? "unpin" : "pin"}">
                      <i class="fas ${isPinned ? "fa-thumbtack fa-rotate-90" : "fa-thumbtack"}"></i> 
                      ${isPinned ? "Unpin Task" : "Pin Task"}
                  </li>
                  <li data-action="move-todo"><i class="fas fa-list"></i> Move to To Do</li>
                  <li data-action="move-progress"><i class="fas fa-spinner"></i> Move to In Progress</li>
                  <li data-action="move-completed"><i class="fas fa-check-circle"></i> Move to Completed</li>
                  <li data-action="delete" class="delete-action"><i class="fas fa-trash"></i> Delete Task</li>
              </ul>
          `
  
      // Add event listeners to dropdown items
      dropdown.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", function () {
          const action = this.dataset.action
          handleDropdownAction(action, taskCard)
          closeAllDropdowns()
        })
      })
  
      return dropdown
    }
  
    function positionDropdown(dropdown, menuElement) {
      const rect = menuElement.getBoundingClientRect()
      dropdown.style.position = "absolute"
      dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`
      dropdown.style.left = `${rect.left + window.scrollX - 150}px` // Align to right
      dropdown.style.zIndex = "1000"
  
      // Add animation
      dropdown.style.opacity = "0"
      dropdown.style.transform = "translateY(-10px)"
  
      setTimeout(() => {
        dropdown.style.opacity = "1"
        dropdown.style.transform = "translateY(0)"
      }, 10)
    }
  
    function closeDropdownOnClickOutside(e) {
      if (!e.target.closest(".dropdown-menu") && !e.target.closest(".card-menu")) {
        closeAllDropdowns()
      }
    }
  
    function closeAllDropdowns() {
      const dropdowns = document.querySelectorAll(".dropdown-menu")
      dropdowns.forEach((dropdown) => {
        dropdown.remove()
      })
      document.removeEventListener("click", closeDropdownOnClickOutside)
    }
  
    function handleDropdownAction(action, taskCard) {
      const taskId = taskCard.dataset.id
  
      switch (action) {
        case "edit":
          editTask(taskId)
          break
        case "pin":
          pinTask(taskId)
          break
        case "unpin":
          unpinTask(taskId)
          break
        case "move-todo":
          moveTask(taskId, "todo")
          break
        case "move-progress":
          moveTask(taskId, "inprogress")
          break
        case "move-completed":
          moveTask(taskId, "completed")
          break
        case "delete":
          deleteTask(taskId)
          break
      }
    }
  
    // Task Management Functions
    function editTask(taskId) {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return
  
      // Populate form with task data
      document.getElementById("taskTitle").value = task.title
      document.getElementById("taskDescription").value = task.description
      document.getElementById("taskCategory").value = task.category
      document.getElementById("taskStatus").value = task.status
      document.getElementById("taskTime").value = task.time
  
      // Change form submit behavior
      const submitBtn = taskForm.querySelector('button[type="submit"]')
      submitBtn.textContent = "Update Task"
  
      // Store the task ID in a data attribute
      taskForm.dataset.editTaskId = taskId
  
      // Change form submission handler
      const originalSubmit = taskForm.onsubmit
      taskForm.onsubmit = (e) => {
        e.preventDefault()
  
        // Update task object
        task.title = document.getElementById("taskTitle").value
        task.description = document.getElementById("taskDescription").value
        task.category = document.getElementById("taskCategory").value
        task.status = document.getElementById("taskStatus").value
        task.time = document.getElementById("taskTime").value
  
        // Save to localStorage
        saveTasksToLocalStorage()
  
        // Render updated tasks
        renderTasks()
  
        // Reset form and close modal
        taskForm.reset()
        delete taskForm.dataset.editTaskId
        submitBtn.textContent = "Create Task"
  
        // Restore original submit handler
        taskForm.onsubmit = originalSubmit
  
        closeTaskModal()
        showNotification("Task updated successfully!")
      }
  
      // Open modal
      openTaskModal()
    }
  
    function pinTask(taskId) {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return
  
      // Add to pinned tasks
      task.isPinned = true
      pinnedTasks.push(task)
  
      // Save to localStorage
      saveTasksToLocalStorage()
  
      // Render tasks
      renderTasks()
      showNotification("Task pinned successfully!")
    }
  
    function unpinTask(taskId) {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return
  
      // Remove from pinned tasks
      task.isPinned = false
      pinnedTasks = pinnedTasks.filter((t) => t.id !== taskId)
  
      // Save to localStorage
      saveTasksToLocalStorage()
  
      // Render tasks
      renderTasks()
      showNotification("Task unpinned successfully!")
    }
  
    function moveTask(taskId, newStatus) {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return
  
      // Update task status
      task.status = newStatus
  
      // Save to localStorage
      saveTasksToLocalStorage()
  
      // Render tasks
      renderTasks()
      showNotification(`Task moved to ${formatStatus(newStatus)}!`)
    }
  
    function deleteTask(taskId) {
      // Confirm deletion
      if (confirm("Are you sure you want to delete this task?")) {
        // Remove from tasks array
        tasks = tasks.filter((t) => t.id !== taskId)
  
        // Remove from pinned tasks if it's there
        pinnedTasks = pinnedTasks.filter((t) => t.id !== taskId)
  
        // Save to localStorage
        saveTasksToLocalStorage()
  
        // Render tasks
        renderTasks()
        showNotification("Task deleted successfully!")
      }
    }
  
    // Rendering Functions
    function renderTasks() {
      // Update Today's Activities
      renderTodayActivities()
  
      // Update Pinned Activities
      renderPinnedActivities()
  
      // Update Status Columns
      renderStatusColumns()
  
      // Reinitialize card menu event listeners
      initCardMenus()
    }
  
    function renderTodayActivities() {
      const todaySection = document.querySelector(".section-heading:first-of-type")
      const taskRow = todaySection.nextElementSibling
  
      // Filter tasks for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
  
      const todayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= today && taskDate < tomorrow
      })
  
      // Update count
      todaySection.querySelector(".count").textContent = `(${todayTasks.length})`
  
      // Clear existing tasks
      taskRow.innerHTML = ""
  
      // Add tasks
      if (todayTasks.length === 0) {
        taskRow.innerHTML = '<div class="empty-state">No tasks for today. Create a new task!</div>'
      } else {
        todayTasks.slice(0, 3).forEach((task) => {
          taskRow.appendChild(createTaskCard(task))
        })
      }
    }
  
    function renderPinnedActivities() {
      const pinnedSection = document.querySelector(".section-heading:nth-of-type(2)")
      const taskRow = pinnedSection.nextElementSibling
  
      // Update count
      pinnedSection.querySelector(".count").textContent = `(${pinnedTasks.length})`
  
      // Clear existing tasks
      taskRow.innerHTML = ""
  
      // Add tasks
      if (pinnedTasks.length === 0) {
        taskRow.innerHTML = '<div class="empty-state">No pinned tasks. Pin important tasks to see them here!</div>'
      } else {
        pinnedTasks.slice(0, 3).forEach((task) => {
          taskRow.appendChild(createPinnedTaskCard(task))
        })
      }
    }
  
    function renderStatusColumns() {
      // To Do Column
      const todoColumn = document.querySelector(".status-column.to-do")
      const todoTasks = tasks.filter((task) => task.status === "todo")
      renderStatusColumn(todoColumn, todoTasks)
  
      // In Progress Column
      const progressColumn = document.querySelector(".status-column.in-progress")
      const progressTasks = tasks.filter((task) => task.status === "inprogress")
      renderStatusColumn(progressColumn, progressTasks)
  
      // Completed Column
      const completedColumn = document.querySelector(".status-column.completed")
      const completedTasks = tasks.filter((task) => task.status === "completed")
      renderStatusColumn(completedColumn, completedTasks)
    }
  
    function renderStatusColumn(column, filteredTasks) {
      // Update count
      column.querySelector(".status-count").textContent = filteredTasks.length
  
      // Clear existing tasks (except header)
      const header = column.querySelector(".status-header")
      column.innerHTML = ""
      column.appendChild(header)
  
      // Add tasks
      if (filteredTasks.length === 0) {
        const emptyState = document.createElement("div")
        emptyState.className = "empty-state"
        emptyState.textContent = "No tasks in this column"
        column.appendChild(emptyState)
      } else {
        filteredTasks.forEach((task) => {
          column.appendChild(createTaskCard(task))
        })
      }
    }
  
    function createTaskCard(task) {
      const card = document.createElement("div")
      card.className = "task-card"
      card.dataset.id = task.id
  
      card.innerHTML = `
              <div class="card-menu">
                  <i class="fas fa-ellipsis-h"></i>
              </div>
              <div class="task-tag ${task.category}">${formatCategory(task.category)}</div>
              <h3>${task.title}</h3>
              <p>${task.description}</p>
              <div class="task-footer">
                  <div class="task-status">${task.status === "online" ? "Online" : "Offline"}</div>
                  <div class="task-time">${task.time}</div>
              </div>
          `
  
      return card
    }
  
    function createPinnedTaskCard(task) {
      const card = document.createElement("div")
      card.className = "task-card"
      card.dataset.id = task.id
  
      const categoryColor = getCategoryColor(task.category)
  
      card.innerHTML = `
              <div class="card-menu">
                  <i class="fas fa-ellipsis-h"></i>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="width: 10px; height: 10px; background: ${categoryColor}; border-radius: 50%; margin-right: 8px;"></span>
                  <span>${formatCategory(task.category)}</span>
                  <span style="margin-left: auto;">
                      <i class="far fa-star"></i> 3
                  </span>
              </div>
              <p>${task.description}</p>
              <div class="user-avatars">
                  <div class="user-avatar">
                      <img src="https://via.placeholder.com/30" alt="User">
                  </div>
                  <div class="user-avatar">
                      <img src="https://via.placeholder.com/30" alt="User">
                  </div>
                  <div class="user-avatar">
                      <img src="https://via.placeholder.com/30" alt="User">
                  </div>
              </div>
          `
  
      return card
    }
  
    // Initialize card menu event listeners
    function initCardMenus() {
      const cardMenus = document.querySelectorAll(".card-menu")
  
      cardMenus.forEach((menu) => {
        // Remove existing event listeners
        const newMenu = menu.cloneNode(true)
        menu.parentNode.replaceChild(newMenu, menu)
  
        // Add new event listener
        newMenu.addEventListener("click", function (e) {
          e.stopPropagation()
  
          // Close any open dropdowns first
          closeAllDropdowns()
  
          // Create dropdown menu
          const dropdown = createDropdownMenu(this)
          document.body.appendChild(dropdown)
  
          // Position the dropdown
          positionDropdown(dropdown, this)
  
          // Add event listener to close dropdown when clicking outside
          setTimeout(() => {
            document.addEventListener("click", closeDropdownOnClickOutside)
          }, 0)
        })
      })
    }
  
    // Utility Functions
    function generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  
    function formatTime(date) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    }
  
    function formatCategory(category) {
      switch (category) {
        case "work":
          return "Work"
        case "meeting":
          return "Meeting"
        case "important":
          return "Important"
        default:
          return category.charAt(0).toUpperCase() + category.slice(1)
      }
    }
  
    function formatStatus(status) {
      switch (status) {
        case "todo":
          return "To Do"
        case "inprogress":
          return "In Progress"
        case "completed":
          return "Completed"
        default:
          return status.charAt(0).toUpperCase() + status.slice(1)
      }
    }
  
    function getCategoryColor(category) {
      switch (category) {
        case "work":
          return "#673ab7" // Purple
        case "meeting":
          return "#2196f3" // Blue
        case "important":
          return "#ff9800" // Orange
        default:
          return "#9e9e9e" // Gray
      }
    }
  
    function saveTasksToLocalStorage() {
      localStorage.setItem("tasks", JSON.stringify(tasks))
      localStorage.setItem("pinnedTasks", JSON.stringify(pinnedTasks))
    }
  
    function showNotification(message) {
      // Create notification element
      const notification = document.createElement("div")
      notification.className = "notification"
      notification.textContent = message
  
      // Style the notification
      Object.assign(notification.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "12px 20px",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: "1000",
        opacity: "0",
        transform: "translateY(20px)",
        transition: "opacity 0.3s, transform 0.3s",
      })
  
      // Add to DOM
      document.body.appendChild(notification)
  
      // Trigger animation
      setTimeout(() => {
        notification.style.opacity = "1"
        notification.style.transform = "translateY(0)"
      }, 10)
  
      // Remove after delay
      setTimeout(() => {
        notification.style.opacity = "0"
        notification.style.transform = "translateY(20px)"
  
        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 3000)
    }
  
    // Initialize the app
    function initApp() {
      // Add data-id attributes to existing task cards
      document.querySelectorAll(".task-card").forEach((card, index) => {
        if (!card.dataset.id) {
          card.dataset.id = `existing-${index}`
        }
      })
  
      // Initialize drag and drop
      initDragAndDrop()
  
      // Initialize search functionality
      initSearch()
  
      // Initialize navigation
      initNavigation()
  
      // Initialize user profile dropdown
      initUserProfile()
    }
  
    // Drag and Drop Functionality
    function initDragAndDrop() {
      const taskCards = document.querySelectorAll(".task-card")
  
      taskCards.forEach((card) => {
        card.setAttribute("draggable", true)
  
        card.addEventListener("dragstart", function (e) {
          e.dataTransfer.setData("text/plain", this.dataset.id)
          this.classList.add("dragging")
        })
  
        card.addEventListener("dragend", function () {
          this.classList.remove("dragging")
        })
      })
  
      statusColumns.forEach((column) => {
        column.addEventListener("dragover", function (e) {
          e.preventDefault()
          this.classList.add("drag-over")
        })
  
        column.addEventListener("dragleave", function () {
          this.classList.remove("drag-over")
        })
  
        column.addEventListener("drop", function (e) {
          e.preventDefault()
          this.classList.remove("drag-over")
  
          const taskId = e.dataTransfer.getData("text/plain")
          const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`)
  
          if (taskCard) {
            // Determine which status column this is
            let newStatus
            if (this.classList.contains("to-do")) {
              newStatus = "todo"
            } else if (this.classList.contains("in-progress")) {
              newStatus = "inprogress"
            } else if (this.classList.contains("completed")) {
              newStatus = "completed"
            }
  
            // Update task status if it's one of our managed tasks
            const task = tasks.find((t) => t.id === taskId)
            if (task) {
              moveTask(taskId, newStatus)
            } else {
              // For demo tasks that don't have real IDs
              this.appendChild(taskCard)
            }
          }
        })
      })
    }
  
    // Search Functionality
    function initSearch() {
      searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase()
  
        if (searchTerm.length > 0) {
          // Filter tasks
          const filteredTasks = tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm),
          )
  
          // Highlight search results
          document.querySelectorAll(".task-card").forEach((card) => {
            card.style.display = "none"
          })
  
          filteredTasks.forEach((task) => {
            const card = document.querySelector(`.task-card[data-id="${task.id}"]`)
            if (card) {
              card.style.display = "block"
  
              // Highlight matching text
              const title = card.querySelector("h3")
              const description = card.querySelector("p")
  
              title.innerHTML = highlightText(task.title, searchTerm)
              description.innerHTML = highlightText(task.description, searchTerm)
            }
          })
        } else {
          // Reset display
          document.querySelectorAll(".task-card").forEach((card) => {
            card.style.display = "block"
  
            // Reset highlighting
            const title = card.querySelector("h3")
            const description = card.querySelector("p")
  
            if (title) title.textContent = title.textContent
            if (description) description.textContent = description.textContent
          })
        }
      })
    }
  
    function highlightText(text, searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, "gi")
      return text.replace(regex, '<span class="highlight">$1</span>')
    }
  
    // Navigation
    function initNavigation() {
      navItems.forEach((item) => {
        item.addEventListener("click", function () {
          // Remove active class from all items
          navItems.forEach((navItem) => {
            navItem.classList.remove("active")
          })
  
          // Add active class to clicked item
          this.classList.add("active")
        })
      })
    }
  
    // User Profile Dropdown
    function initUserProfile() {
      userProfile.addEventListener("click", () => {
        // Create dropdown
        const dropdown = document.createElement("div")
        dropdown.className = "user-dropdown"
        dropdown.innerHTML = `
                  <div class="dropdown-header">
                      <div class="avatar">
                          <img src="https://via.placeholder.com/40" alt="User profile">
                      </div>
                      <div>
                          <div class="user-name">John Alby</div>
                          <div class="user-email">john.alby@example.com</div>
                      </div>
                  </div>
                  <ul>
                      <li><i class="fas fa-user"></i> My Profile</li>
                      <li><i class="fas fa-cog"></i> Settings</li>
                      <li><i class="fas fa-palette"></i> Theme</li>
                      <li><i class="fas fa-sign-out-alt"></i> Logout</li>
                  </ul>
              `
  
        // Style dropdown
        Object.assign(dropdown.style, {
          position: "absolute",
          top: "60px",
          right: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "250px",
          zIndex: "1000",
          opacity: "0",
          transform: "translateY(-10px)",
          transition: "opacity 0.3s, transform 0.3s",
        })
  
        // Add to DOM
        document.body.appendChild(dropdown)
  
        // Trigger animation
        setTimeout(() => {
          dropdown.style.opacity = "1"
          dropdown.style.transform = "translateY(0)"
        }, 10)
  
        // Close when clicking outside
        function closeDropdown(e) {
          if (!dropdown.contains(e.target) && !userProfile.contains(e.target)) {
            dropdown.style.opacity = "0"
            dropdown.style.transform = "translateY(-10px)"
  
            setTimeout(() => {
              dropdown.remove()
            }, 300)
  
            document.removeEventListener("click", closeDropdown)
          }
        }
  
        setTimeout(() => {
          document.addEventListener("click", closeDropdown)
        }, 0)
      })
    }
  
    // Add CSS for new elements
    const style = document.createElement("style")
    style.textContent = `
          /* Dropdown Menu */
          .dropdown-menu {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              overflow: hidden;
              transition: opacity 0.3s, transform 0.3s;
          }
          
          .dropdown-menu ul {
              list-style: none;
              padding: 0;
              margin: 0;
          }
          
          .dropdown-menu li {
              padding: 10px 15px;
              cursor: pointer;
              transition: background-color 0.2s;
          }
          
          .dropdown-menu li:hover {
              background-color: #f5f5f5;
          }
          
          .dropdown-menu li i {
              margin-right: 10px;
              width: 16px;
          }
          
          .dropdown-menu .delete-action {
              color: #e53935;
          }
          
          /* Modal Styles */
          .modal-overlay {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              justify-content: center;
              align-items: center;
              opacity: 0;
              transition: opacity 0.3s ease;
          }
          
          .modal {
              background-color: white;
              border-radius: 12px;
              width: 90%;
              max-width: 500px;
              max-height: 90vh;
              overflow-y: auto;
              transform: translateY(-20px);
              transition: transform 0.3s ease;
          }
          
          .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 20px;
              border-bottom: 1px solid #eee;
          }
          
          .modal-header h2 {
              margin: 0;
              font-size: 18px;
          }
          
          .close-modal {
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
          }
          
          .form-group {
              margin-bottom: 15px;
              padding: 0 20px;
          }
          
          .form-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: 500;
          }
          
          .form-control {
              width: 100%;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
          }
          
          .form-footer {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              padding: 15px 20px;
              border-top: 1px solid #eee;
          }
          
          .btn {
              padding: 10px 15px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              font-weight: 500;
          }
          
          .btn-primary {
              background-color: #4052FF;
              color: white;
          }
          
          .btn-secondary {
              background-color: #f5f5f5;
              color: #333;
          }
          
          /* Notification */
          .notification {
              border-left: 4px solid #4CAF50;
          }
          
          /* Search Highlight */
          .highlight {
              background-color: #FFEB3B;
              font-weight: bold;
          }
          
          /* Empty State */
          .empty-state {
              padding: 20px;
              text-align: center;
              color: #999;
              font-style: italic;
          }
          
          /* User Dropdown */
          .user-dropdown .dropdown-header {
              padding: 15px;
              display: flex;
              align-items: center;
              gap: 15px;
              border-bottom: 1px solid #eee;
          }
          
          .user-dropdown .user-name {
              font-weight: 600;
          }
          
          .user-dropdown .user-email {
              font-size: 12px;
              color: #666;
          }
          
          .user-dropdown ul {
              list-style: none;
              padding: 0;
              margin: 0;
          }
          
          .user-dropdown li {
              padding: 12px 15px;
              cursor: pointer;
              transition: background-color 0.2s;
              display: flex;
              align-items: center;
              gap: 10px;
          }
          
          .user-dropdown li:hover {
              background-color: #f5f5f5;
          }
          
          /* Drag and Drop */
          .task-card.dragging {
              opacity: 0.5;
              border: 2px dashed #4052FF;
          }
          
          .status-column.drag-over {
              background-color: #f0f4ff;
              border: 2px dashed #4052FF;
          }
      `
  
    document.head.appendChild(style)
  })
  
  