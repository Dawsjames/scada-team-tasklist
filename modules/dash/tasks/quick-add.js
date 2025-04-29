// Quick Add Task Component

// DOM Elements
const quickAddInput = document.getElementById('quickAddInput');

// Get current project filter
function getCurrentProjectFilter() {
  return projectFilter.value;
}

// Quick Add Task Function
function quickAddTask(description) {
  if (!description.trim()) return;

  // Parse task name and description from input
  // Format expected: "Task Name: Task Description"
  let name = description.trim();
  let taskDescription = '';

  // If the input contains a colon, split it into name and description
  const colonPos = description.indexOf(':');
  if (colonPos > 0) {
    name = description.substring(0, colonPos).trim();
    taskDescription = description.substring(colonPos + 1).trim();
  }

  const newTask = {
    name: name,
    description: taskDescription,
    completed: false,
    assignee: '',
    dueDate: '',
    project:
      getCurrentProjectFilter() === 'all' ? 'r3' : getCurrentProjectFilter(),
    createdAt: new Date(),
  };

  // Add to Firestore
  db.collection('tasks')
    .add(newTask)
    .then((docRef) => {
      // Add task with Firestore ID to local array
      tasks.push({
        id: docRef.id,
        ...newTask,
      });

      // Clear input field
      quickAddInput.value = '';

      // Update UI
      updateTaskList();
      updateStatistics();
    })
    .catch((error) => {
      console.error('Error adding quick task: ', error);
      alert('Error adding task. Please try again.');
    });
}

// Initialize quick add task event listeners
function initQuickAddListeners() {
  // Quick Add Task Input - Listen for Enter key press
  quickAddInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      quickAddTask(this.value);
    }
  });
}
