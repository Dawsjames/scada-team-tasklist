// Quick Add Task Component

// DOM Elements
const quickAddInput = document.getElementById('quickAddInput');

// Quick Add Task Function
function quickAddTask(description) {
  if (!description.trim()) return;

  // Parse input to separate name and description if format is "Name: Description"
  let name = description.trim();
  let taskDescription = '';

  // If the input contains a colon, split it into name and description
  const colonPos = description.indexOf(':');
  if (colonPos > 0) {
    name = description.substring(0, colonPos).trim();
    taskDescription = description.substring(colonPos + 1).trim();
  }

  // Create new task object
  const newTask = {
    name: name, // Store the name part
    description: taskDescription, // Store the description part (if any)
    completed: false,
    assignee: '', // Unassigned by default
    dueDate: '',
    priority: 'Medium', // Default priority
    // Always default to 'other' for project/category as requested
    category: 'other',
    createdAt: firebase.firestore.Timestamp.now(), // Use Firestore timestamp
  };

  console.log('Adding quick task:', newTask); // Debug log

  // Add to Firestore
  db.collection('tasks')
    .add(newTask)
    .then((docRef) => {
      console.log('Quick task added with ID: ', docRef.id); // Debug log

      // Add task with Firestore ID to local array
      tasks.push({
        id: docRef.id,
        ...newTask,
      });

      // Clear input field
      quickAddInput.value = '';

      // Update UI
      updateTaskList();
      if (typeof updateStatistics === 'function') {
        updateStatistics();
      }

      // Also update team member progress and UI (if these functions exist)
      if (typeof updateTeamMemberProgress === 'function') {
        updateTeamMemberProgress();
      }
      if (typeof updateTeamMembers === 'function') {
        updateTeamMembers();
      }
    })
    .catch((error) => {
      console.error('Error adding quick task: ', error);
      alert('Error adding task. Please try again.');
    });
}

// Initialize quick add task event listeners
function initQuickAddListeners() {
  if (!quickAddInput) {
    console.error('Quick add input not found');
    return;
  }

  console.log('Initializing quick add listeners');

  // Quick Add Task Input - Listen for Enter key press
  quickAddInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      quickAddTask(this.value);
    }
  });
}

// Make the function globally available
window.quickAddTask = quickAddTask;
window.initQuickAddListeners = initQuickAddListeners;
