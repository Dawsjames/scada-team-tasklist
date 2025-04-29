// Main Application Entry Point

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize Firebase
  initFirebase();

  // Initialize all event listeners
  initModalListeners();
  initTeamMembersListeners();
  initTasksListeners();
  initQuickAddListeners();
});
