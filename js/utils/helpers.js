// Helper utility functions

// Generate unique ID for local use
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get current active tab
function getCurrentActiveTab() {
  return document.querySelector('.tab.active').getAttribute('data-filter');
}

// Get current member filter
function getCurrentMemberFilter() {
  return memberFilter.value;
}

// Get initial letter from name for avatar
function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '';
}

// Check if task is overdue
function isTaskOverdue(task) {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  return (task.status !== 'Completed') && dueDate < today;
}

// Function to update team member progress based on tasks
function updateTeamMemberProgress() {
  // Reset all progress first
  teamMembers.forEach((member) => {
    member.progress = 0;
  });

  // Count total tasks per member
  const taskCounts = {};
  const completedCounts = {};

  tasks.forEach((task) => {
    if (task.assignee) {
      // Initialize counters if not exists
      if (!taskCounts[task.assignee]) {
        taskCounts[task.assignee] = 0;
        completedCounts[task.assignee] = 0;
      }

      // Increment task count
      taskCounts[task.assignee]++;

      // Increment completed count if task is completed
      // Check both new status field and legacy completed field
      if (task.status === 'Completed' || task.completed) {
        completedCounts[task.assignee]++;
      }
    }
  });

  // Calculate progress percentage for each member
  teamMembers.forEach((member) => {
    if (taskCounts[member.name] && taskCounts[member.name] > 0) {
      member.progress = Math.round(
        (completedCounts[member.name] / taskCounts[member.name]) * 100
      );
    } else {
      member.progress = 0;
    }

    // Update member status based on activity
    // If they have tasks assigned but none completed, set to busy
    if (taskCounts[member.name] > 0 && completedCounts[member.name] === 0) {
      member.status = 'busy';
    }
    // If they have completed all their tasks, set to online
    else if (
      taskCounts[member.name] > 0 &&
      completedCounts[member.name] === taskCounts[member.name]
    ) {
      member.status = 'online';
    }
    // If no tasks are assigned, set to offline
    else if (!taskCounts[member.name] || taskCounts[member.name] === 0) {
      member.status = 'offline';
    }

    // Update in Firebase
    db.collection('team_members')
      .doc(member.id)
      .update({
        progress: member.progress,
        status: member.status,
      })
      .catch((error) => {
        console.error('Error updating team member:', error);
      });
  });
}

// Update task status directly in Firestore
function updateTaskStatus(taskId, status) {
  db.collection('tasks')
    .doc(taskId)
    .update({
      status: status,
      // For backward compatibility, set completed based on status
      completed: status === 'Completed',
      updatedAt: firebase.firestore.Timestamp.now(),
    })
    .then(() => {
      // Update team member progress after status change
      updateTeamMemberProgress();
      updateTeamMembers();
    })
    .catch((error) => {
      console.error('Error updating task status: ', error);
    });
}

// Migrate legacy tasks to new status format
function migrateTasksToNewFormat() {
  console.log('Migrating legacy tasks to new status format');
  
  tasks.forEach((task) => {
    // Only migrate tasks that don't have a status field
    if (!task.status && task.id) {
      const newStatus = task.completed ? 'Completed' : 'Pending';
      
      // Update in Firestore
      db.collection('tasks')
        .doc(task.id)
        .update({
          status: newStatus,
          // Update category if needed
          category: convertLegacyCategory(task.category || task.project),
          updatedAt: firebase.firestore.Timestamp.now(),
        })
        .then(() => {
          console.log(`Migrated task ${task.id} to status: ${newStatus}`);
        })
        .catch((error) => {
          console.error(`Error migrating task ${task.id}:`, error);
        });
        
      // Update in local array
      task.status = newStatus;
      task.category = convertLegacyCategory(task.category || task.project);
    }
  });
}

// Convert legacy category to new category
function convertLegacyCategory(category) {
  if (!category) return 'frontend'; // Default to frontend
  
  // Map old categories to new ones
  switch(category) {
    case 'r3':
    case 'r8-250':
      return 'frontend';
    case 'r8-125':
    case 'other':
      return 'backend';
    default:
      // If it's already in the new format, return as is
      return ['frontend', 'backend'].includes(category) ? category : 'frontend';
  }
}