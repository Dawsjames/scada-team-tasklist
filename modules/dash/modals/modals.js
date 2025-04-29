// Modals Component

// DOM Elements
const taskModal = document.getElementById('taskModal');
const memberModal = document.getElementById('memberModal');
const closeModalButton = document.getElementById('close-modal');
const closeMemberModalButton = document.getElementById('close-member-modal');

// Task Modal Functions
function openAddTaskModal() {
  console.log('Opening Add Task Modal from modals.js');

  // Check if modal exists
  if (!taskModal) {
    console.error('Task modal element not found');
    return;
  }

  // Get elements dynamically to avoid variable redeclaration issues
  const modalTitle = document.getElementById('modal-title');
  const taskNameInput = document.getElementById('taskName');
  const taskDescriptionInput = document.getElementById('taskDescription');
  const taskStatusInput = document.getElementById('taskStatus');
  const taskAssigneeInput = document.getElementById('taskAssignee');
  const taskDueDateInput = document.getElementById('taskDueDate');
  const taskPriorityInput = document.getElementById('taskPriority');
  const taskProjectInput = document.getElementById('taskProject');
  const taskIdInput = document.getElementById('taskId');
  const deleteTaskButton = document.getElementById('deleteTaskButton');

  // Set values if elements exist
  if (modalTitle) modalTitle.textContent = 'Add Task';
  if (taskNameInput) taskNameInput.value = '';
  if (taskDescriptionInput) taskDescriptionInput.value = '';
  if (taskStatusInput) taskStatusInput.checked = false;
  if (taskAssigneeInput) taskAssigneeInput.value = '';
  if (taskDueDateInput) taskDueDateInput.value = '';
  if (taskPriorityInput) taskPriorityInput.value = 'Medium';
  if (taskProjectInput) taskProjectInput.value = 'other'; // Default to other as requested
  if (taskIdInput) taskIdInput.value = '';

  // Hide delete button
  if (deleteTaskButton) deleteTaskButton.style.display = 'none';

  // Show the modal
  taskModal.style.display = 'flex';
}

function openEditTaskModal(taskId) {
  console.log('Opening Edit Task Modal from modals.js for task:', taskId);

  if (!taskId) {
    console.error('No task ID provided');
    return;
  }

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error('Task not found:', taskId);
    return;
  }

  if (!taskModal) {
    console.error('Task modal element not found');
    return;
  }

  // Get elements dynamically to avoid variable redeclaration issues
  const modalTitle = document.getElementById('modal-title');
  const taskNameInput = document.getElementById('taskName');
  const taskDescriptionInput = document.getElementById('taskDescription');
  const taskStatusInput = document.getElementById('taskStatus');
  const taskAssigneeInput = document.getElementById('taskAssignee');
  const taskDueDateInput = document.getElementById('taskDueDate');
  const taskPriorityInput = document.getElementById('taskPriority');
  const taskProjectInput = document.getElementById('taskProject');
  const taskIdInput = document.getElementById('taskId');
  const deleteTaskButton = document.getElementById('deleteTaskButton');

  // Set values if elements exist
  if (modalTitle) modalTitle.textContent = 'Edit Task';
  if (taskNameInput) taskNameInput.value = task.name || '';
  if (taskDescriptionInput) taskDescriptionInput.value = task.description || '';
  if (taskStatusInput) taskStatusInput.checked = task.completed || false;
  if (taskAssigneeInput) taskAssigneeInput.value = task.assignee || '';
  if (taskDueDateInput) taskDueDateInput.value = task.dueDate || '';
  if (taskPriorityInput) taskPriorityInput.value = task.priority || 'Medium';

  // Check both category and project fields
  if (taskProjectInput) {
    taskProjectInput.value = task.category || task.project || 'other';
  }

  if (taskIdInput) taskIdInput.value = task.id;

  // Show delete button
  if (deleteTaskButton) deleteTaskButton.style.display = 'block';

  // Show the modal
  taskModal.style.display = 'flex';
}

function closeTaskModal() {
  if (taskModal) {
    taskModal.style.display = 'none';
  } else {
    console.error('Cannot close task modal - element not found');
  }
}

// Team Member Modal Functions
function openAddMemberModal() {
  console.log('Opening Add Member Modal');

  // Check if modal exists
  if (!memberModal) {
    console.error('Member modal element not found');
    return;
  }

  // Get elements dynamically
  const memberModalTitle = document.getElementById('member-modal-title');
  const memberNameInput = document.getElementById('memberName');
  const memberRoleInput = document.getElementById('memberRole');
  const memberStatusInput = document.getElementById('memberStatus');
  const memberIdInput = document.getElementById('memberId');
  const deleteMemberButton = document.getElementById('deleteMemberButton');

  // Set values if elements exist
  if (memberModalTitle) memberModalTitle.textContent = 'Add Team Member';
  if (memberNameInput) memberNameInput.value = '';
  if (memberRoleInput) {
    memberRoleInput.value = '';
    if (memberRoleInput.disabled) memberRoleInput.disabled = false;
  }
  if (memberStatusInput) memberStatusInput.value = 'offline';
  if (memberIdInput) memberIdInput.value = '';

  // Hide delete button
  if (deleteMemberButton) deleteMemberButton.style.display = 'none';

  // Show the modal
  memberModal.style.display = 'flex';
}

function openEditMemberModal(memberId) {
  console.log('Opening Edit Member Modal for member:', memberId);

  if (!memberId) {
    console.error('No member ID provided');
    return;
  }

  const member = teamMembers.find((m) => m.id === memberId);
  if (!member) {
    console.error('Member not found:', memberId);
    return;
  }

  if (!memberModal) {
    console.error('Member modal element not found');
    return;
  }

  // Get elements dynamically
  const memberModalTitle = document.getElementById('member-modal-title');
  const memberNameInput = document.getElementById('memberName');
  const memberRoleInput = document.getElementById('memberRole');
  const memberStatusInput = document.getElementById('memberStatus');
  const memberIdInput = document.getElementById('memberId');
  const deleteMemberButton = document.getElementById('deleteMemberButton');

  // Set values if elements exist
  if (memberModalTitle) memberModalTitle.textContent = 'Edit Team Member';
  if (memberNameInput) memberNameInput.value = member.name || '';

  if (memberRoleInput) {
    memberRoleInput.value = member.role || '';

    // Disable role input for Sir Rey and Rhea
    if (member.name === 'Sir Rey' || member.name === 'Rhea') {
      memberRoleInput.disabled = true;
    } else {
      memberRoleInput.disabled = false;
    }
  }

  if (memberStatusInput) memberStatusInput.value = member.status || 'offline';
  if (memberIdInput) memberIdInput.value = memberId;

  // Show delete button
  if (deleteMemberButton) deleteMemberButton.style.display = 'block';

  // Show the modal
  memberModal.style.display = 'flex';
}

function closeMemberModal() {
  if (memberModal) {
    memberModal.style.display = 'none';
  } else {
    console.error('Cannot close member modal - element not found');
  }
}

// Make functions globally available to avoid "not defined" errors
window.openAddTaskModal = openAddTaskModal;
window.openEditTaskModal = openEditTaskModal;
window.closeTaskModal = closeTaskModal;
window.openAddMemberModal = openAddMemberModal;
window.openEditMemberModal = openEditMemberModal;
window.closeMemberModal = closeMemberModal;

// Initialize modal event listeners
function initModalListeners() {
  console.log('Initializing modal listeners');

  // Log found elements for debugging
  console.log('Modal elements check:', {
    taskModal: !!taskModal,
    memberModal: !!memberModal,
    closeModalButton: !!closeModalButton,
    closeMemberModalButton: !!closeMemberModalButton,
  });

  // Check if the elements exist before adding listeners
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeTaskModal);
  } else {
    console.error('Close modal button not found');
  }

  if (closeMemberModalButton) {
    closeMemberModalButton.addEventListener('click', closeMemberModal);
  } else {
    console.error('Close member modal button not found');
  }

  // Close modal by clicking outside
  window.addEventListener('click', function (event) {
    if (event.target === taskModal) {
      closeTaskModal();
    }
    if (event.target === memberModal) {
      closeMemberModal();
    }
  });
}

// Make the initialization function globally available
window.initModalListeners = initModalListeners;
