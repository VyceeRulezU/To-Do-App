document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded successfully!")
  
    // Basic functionality test
    const newTaskBtn = document.getElementById("newTaskBtn")
    if (newTaskBtn) {
      newTaskBtn.addEventListener("click", () => {
        alert("New Task button clicked!")
      })
    } else {
      console.error("New Task button not found!")
    }
  })
  
  