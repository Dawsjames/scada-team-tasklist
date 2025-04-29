// UI Updates Utility Functions
// This file contains helper functions for updating the UI

/**
 * Updates all UI components based on current state
 */
function updateAllUI() {
  updateTeamMembers();
  updateTaskList();
  updateStatistics();
}

/**
 * Refreshes UI after a task is added/updated/deleted
 */
function refreshTasksUI() {
  updateTeamMemberProgress();
  updateTeamMembers();
  updateTaskList();
  updateStatistics();
}

/**
 * Updates UI after team member progress changes
 */
function refreshTeamUI() {
  updateTeamMembers();
  updateTaskList(); // To update assignment displays
  updateStatistics();
}
