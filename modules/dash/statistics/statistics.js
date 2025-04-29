// Statistics Component

// DOM Elements
const totalTasksElement = document.getElementById('total-tasks');
const highPriorityTasksElement = document.getElementById('high-priority-tasks');
const overdueTasksElement = document.getElementById('overdue-tasks');
const unassignedTasksElement = document.getElementById('unassigned-tasks');

// Update statistics based on current tasks
function updateStatistics() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const percentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === 'High'
  ).length;
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task)).length;
  const unassignedTasks = tasks.filter((task) => !task.assignee).length;

  // Update progress bar and text
  progressBar.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;
  progressText.textContent = `${completedTasks} of ${totalTasks} tasks completed`;

  // Update stats cards
  totalTasksElement.textContent = totalTasks;
  highPriorityTasksElement.textContent = highPriorityTasks;
  overdueTasksElement.textContent = overdueTasks;
  unassignedTasksElement.textContent = unassignedTasks;
}
