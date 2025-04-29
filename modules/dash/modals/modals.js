// Modals Component

// DOM Elements
const taskModal = document.getElementById('taskModal');
const memberModal = document.getElementById('memberModal');
const closeModalButton = document.getElementById('close-modal');
const closeMemberModalButton = document.getElementById('close-member-modal');

// Task Modal Functions
function openAddTaskModal() {
  modalTitle.textContent = 'Add Task';
  taskNameInput.value = '';
  taskDescriptionInput.value = '';
  taskStatusInput.checked = false; // Default to unchecked/pending
  taskAssigneeInput.value = '';
  taskDueDateInput.value = '';
  // Use the currently selected project
  taskProjectInput.value =
    getCurrentProjectFilter() === 'all' ? 'r3' : getCurrentProjectFilter();
  taskIdInput.value = '';

  // Hide delete button for new tasks
  deleteTaskButton.style.display = 'none';

  taskModal.style.display = 'flex';
}

function openEditTaskModal(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  modalTitle.textContent = 'Edit Task';
  taskNameInput.value = task.name || '';
  taskDescriptionInput.value = task.description || '';
  taskStatusInput.checked = task.completed;
  taskAssigneeInput.value = task.assignee || '';
  taskDueDateInput.value = task.dueDate || '';
  taskProjectInput.value = task.project || 'r3'; // Default to R3 if not set
  taskIdInput.value = task.id;

  // Show delete button for existing tasks
  deleteTaskButton.style.display = 'block';

  taskModal.style.display = 'flex';
}

function closeTaskModal() {
  taskModal.style.display = 'none';
}

// Team Member Modal Functions
function openAddMemberModal() {
  memberModalTitle.textContent = 'Add Team Member';
  memberNameInput.value = '';
  memberRoleInput.value = '';
  memberRoleInput.disabled = false;
  memberStatusInput.value = 'offline';
  memberIdInput.value = '';

  // Hide delete button for new members
  deleteMemberButton.style.display = 'none';

  memberModal.style.display = 'flex';
}

function openEditMemberModal(memberId) {
  const member = teamMembers.find((m) => m.id === memberId);
  if (!member) return;

  memberModalTitle.textContent = 'Edit Team Member';
  memberNameInput.value = member.name || '';
  memberRoleInput.value = member.role || '';

  // Disable role input for Sir Rey and Rhea
  if (member.name === 'Sir Rey' || member.name === 'Rhea') {
    memberRoleInput.disabled = true;
  } else {
    memberRoleInput.disabled = false;
  }

  memberStatusInput.value = member.status || 'offline';
  memberIdInput.value = memberId;

  // Show delete button for existing members
  deleteMemberButton.style.display = 'block';

  memberModal.style.display = 'flex';
}

function closeMemberModal() {
  memberModal.style.display = 'none';
}

// Initialize modal event listeners
function initModalListeners() {
  // Close modal buttons
  closeModalButton.addEventListener('click', closeTaskModal);
  closeMemberModalButton.addEventListener('click', closeMemberModal);

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
