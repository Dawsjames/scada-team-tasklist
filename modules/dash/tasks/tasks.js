// Tasks Component - Redesigned version
// Manages task listing, filtering by projects, and task operations

// DOM Elements
const taskList = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task-button');
const tabs = document.querySelectorAll('.tab');
const memberFilter = document.getElementById('memberFilter');
const projectFilter = document.getElementById('projectFilter');
const modalTitle = document.getElementById('modal-title');
const taskNameInput = document.getElementById('taskName');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskStatusInput = document.getElementById('taskStatus');
const taskAssigneeInput = document.getElementById('taskAssignee');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskProjectInput = document.getElementById('taskProject');
const taskIdInput = document.getElementById('taskId');
const saveTaskButton = document.getElementById('saveTaskButton');
const deleteTaskButton = document.getElementById('deleteTaskButton');

// Project data
const projects = [
  { id: 'r3', name: 'R3', color: 'var(--planning-color)' },
  { id: 'r8-250', name: 'R8 250', color: 'var(--design-color)' },
  { id: 'r8-125', name: 'R8 125', color: 'var(--development-color)' },
  { id: 'other', name: 'Other', color: 'var(--warning-color)' },
];

/**
 * Initialize projects - populate dropdown menus
 */
function initProjects() {
  // Populate project filter dropdown
  projectFilter.innerHTML = '<option value="all">All Projects</option>';

  // Populate task modal project dropdown
  taskProjectInput.innerHTML = '';

  projects.forEach((project) => {
    // Add to filter dropdown
    const filterOption = document.createElement('option');
    filterOption.value = project.id;
    filterOption.textContent = project.name;
    projectFilter.appendChild(filterOption);

    // Add to task modal dropdown
    const modalOption = document.createElement('option');
    modalOption.value = project.id;
    modalOption.textContent = project.name;
    taskProjectInput.appendChild(modalOption);
  });
}

/**
 * Get project by ID
 */
function getProject(projectId) {
  return projects.find((p) => p.id === projectId) || projects[3]; // Default to "Other"
}

/**
 * Update task list display based on current filters
 */
function updateTaskList() {
  // Get active filters
  const activeTabFilter = getCurrentActiveTab();
  const activeMemberFilter = getCurrentMemberFilter();
  const activeProjectFilter = getCurrentProjectFilter();

  // Apply filters to tasks
  let filteredTasks = filterTasks(
    activeTabFilter,
    activeMemberFilter,
    activeProjectFilter
  );

  // Clear current task list
  taskList.innerHTML = '';

  // Show empty state if no tasks match filters
  if (filteredTasks.length === 0) {
    renderEmptyState();
    return;
  }

  // Render each task
  filteredTasks.forEach((task) => renderTaskItem(task));

  // Update tab highlights and attach event listeners
  attachCheckboxListeners();
  updateTabsBasedOnAssignment();
}

/**
 * Get current project filter
 */
function getCurrentProjectFilter() {
  return projectFilter.value;
}

/**
 * Filter tasks based on tab, member, and project filters
 */
function filterTasks(tabFilter, memberFilter, projectFilter) {
  let result = [...tasks];

  // Apply tab filter
  switch (tabFilter) {
    case 'pending':
      result = result.filter((task) => !task.completed);
      break;
    case 'completed':
      result = result.filter((task) => task.completed);
      break;
    case 'overdue':
      result = result.filter((task) => isTaskOverdue(task));
      break;
    // 'all' case doesn't need filtering
  }

  // Apply member filter if not 'all'
  if (memberFilter !== 'all') {
    result = result.filter((task) => task.assignee === memberFilter);
  }

  // Apply project filter if not 'all'
  if (projectFilter !== 'all') {
    result = result.filter((task) => task.project === projectFilter);
  }

  return result;
}

/**
 * Render empty state message when no tasks match filters
 */
function renderEmptyState() {
  const message =
    tasks.length === 0
      ? 'No tasks yet. Click "Add Task" to create your first task.'
      : 'No tasks match the current filters.';

  taskList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            ${message}
        </div>
    `;
}

/**
 * Render a single task item in the list with compact design
 */
function renderTaskItem(task) {
  // Create task element
  const taskElement = document.createElement('div');
  taskElement.className = 'task-item';
  taskElement.dataset.id = task.id;

  // Find assignee information
  const assignee = teamMembers.find((member) => member.name === task.assignee);
  const assigneeInitial = assignee ? getInitial(assignee.name) : '';

  // Get project information
  const project = getProject(task.project);

  // Build task HTML with redesigned layout
  taskElement.innerHTML = `
        <div class="task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
        </div>
        <div class="task-content">
            <div class="task-title ${task.completed ? 'completed' : ''}">
                ${task.name || 'Untitled Task'}
            </div>
            <div class="task-description ${task.completed ? 'completed' : ''}">
                ${task.description || ''}
            </div>
            <div class="task-meta">
                <div class="task-project">
                    <span class="project-dot" style="background-color: ${
                      project.color
                    }"></span>
                    ${project.name}
                </div>
                ${
                  task.dueDate
                    ? `<div class="task-date">${new Date(
                        task.dueDate
                      ).toLocaleDateString()}</div>`
                    : ''
                }
            </div>
        </div>
        <div class="task-assignee">
            ${
              task.assignee
                ? `<span class="assignee-initial">${assigneeInitial}</span>`
                : ''
            }
        </div>
    `;

  // Add to DOM
  taskList.appendChild(taskElement);

  // Add event listeners
  addTaskItemListeners(taskElement);
}

/**
 * Add event listeners to a task item
 */
function addTaskItemListeners(taskElement) {
  // Make the entire task item clickable to open edit modal
  taskElement.addEventListener('click', function (e) {
    // Ignore clicks on the checkbox itself to prevent modal from opening
    if (e.target.type !== 'checkbox') {
      const taskId = this.dataset.id;
      openEditTaskModal(taskId);
    }
  });

  // Add event listener for the checkbox
  const checkbox = taskElement.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('click', function (e) {
    // Stop event propagation to prevent modal from opening
    e.stopPropagation();
  });

  checkbox.addEventListener('change', function (e) {
    const taskId = taskElement.dataset.id;
    updateTaskCompletionStatus(taskId, this.checked);
  });
}

/**
 * Update task completion status directly in Firestore
 */
function updateTaskCompletionStatus(taskId, completed) {
  // Find the task in the local array and update it immediately
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = completed;
  }

  // Update in Firestore
  db.collection('tasks')
    .doc(taskId)
    .update({
      completed: completed,
      updatedAt: new Date(),
    })
    .then(() => {
      // Update UI immediately without waiting for Firestore response
      updateTaskList();
      updateStatistics();
      updateTeamMemberProgress();
      updateTeamMembers();
    })
    .catch((error) => {
      console.error('Error updating task completion status: ', error);
      // If there's an error, revert the local change and update UI
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = !completed;
        updateTaskList();
      }
    });
}

/**
 * Attach event listeners to task checkboxes
 */
function attachCheckboxListeners() {
  const checkboxes = document.querySelectorAll(
    '.task-item input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      const taskId = this.closest('.task-item').dataset.id;
      updateTaskCompletionStatus(taskId, this.checked);
    });
  });
}

/**
 * Update tab styling based on task assignment
 */
function updateTabsBasedOnAssignment() {
  // Get current member filter
  const currentMember = getCurrentMemberFilter();

  // Remove 'has-assigned' class from all tabs
  tabs.forEach((tab) => {
    tab.classList.remove('has-assigned');
  });

  // Only proceed if a specific member is selected (not 'all')
  if (currentMember === 'all') return;

  // Find tasks assigned to the selected member
  const memberTasks = tasks.filter((task) => task.assignee === currentMember);

  // Track which statuses have tasks
  const hasIncomplete = memberTasks.some((task) => !task.completed);
  const hasCompleted = memberTasks.some((task) => task.completed);
  const hasOverdue = memberTasks.some((task) => isTaskOverdue(task));

  // Update tabs with indicators
  if (hasIncomplete) {
    document
      .querySelector('.tab[data-filter="pending"]')
      .classList.add('has-assigned');
  }

  if (hasCompleted) {
    document
      .querySelector('.tab[data-filter="completed"]')
      .classList.add('has-assigned');
  }

  if (hasOverdue) {
    document
      .querySelector('.tab[data-filter="overdue"]')
      .classList.add('has-assigned');
  }
}

/**
 * Add a new task
 */
function addTask() {
  const name = taskNameInput.value.trim();
  const description = taskDescriptionInput.value.trim();

  if (!name) {
    alert('Please enter a task name');
    return;
  }

  const newTask = {
    name: name,
    description: description,
    completed: false,
    assignee: taskAssigneeInput.value,
    dueDate: taskDueDateInput.value,
    project: taskProjectInput.value,
    createdAt: new Date(),
  };

  // Save to Firebase
  db.collection('tasks')
    .add(newTask)
    .then((docRef) => {
      // Add to local array with Firebase ID
      tasks.push({
        id: docRef.id,
        ...newTask,
      });

      // Update UI
      updateTeamMemberProgress();
      updateTeamMembers();
      updateTaskList();
      updateStatistics();

      // Close modal
      closeTaskModal();
    })
    .catch((error) => {
      console.error('Error adding task:', error);
      alert('Error adding task. Please try again.');
    });
}

/**
 * Update an existing task
 */
function updateTask() {
  const taskId = taskIdInput.value;
  if (!taskId) return;

  const name = taskNameInput.value.trim();
  const description = taskDescriptionInput.value.trim();

  if (!name) {
    alert('Please enter a task name');
    return;
  }

  const updatedTask = {
    name: name,
    description: description,
    completed: taskStatusInput.checked,
    assignee: taskAssigneeInput.value,
    dueDate: taskDueDateInput.value,
    project: taskProjectInput.value,
    updatedAt: new Date(),
  };

  // Update in Firebase
  db.collection('tasks')
    .doc(taskId)
    .update(updatedTask)
    .then(() => {
      // Update in local array
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          id: taskId,
          ...updatedTask,
        };
      }

      // Update UI
      updateTeamMemberProgress();
      updateTeamMembers();
      updateTaskList();
      updateStatistics();

      // Close modal
      closeTaskModal();
    })
    .catch((error) => {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    });
}

/**
 * Delete an existing task
 */
function deleteTask() {
  const taskId = taskIdInput.value;
  if (!taskId) return;

  if (confirm('Are you sure you want to delete this task?')) {
    // Delete from Firebase
    db.collection('tasks')
      .doc(taskId)
      .delete()
      .then(() => {
        // Remove from local array
        tasks = tasks.filter((t) => t.id !== taskId);

        // Update UI
        updateTeamMemberProgress();
        updateTeamMembers();
        updateTaskList();
        updateStatistics();

        // Close modal
        closeTaskModal();
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      });
  }
}

/**
 * Open edit task modal with modified fields
 */
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

/**
 * Initialize task-related event listeners
 */
function initTasksListeners() {
  // Initialize projects
  initProjects();

  // Add task button
  addTaskButton.addEventListener('click', openAddTaskModal);

  // Save task button
  saveTaskButton.addEventListener('click', function () {
    const taskId = taskIdInput.value;
    if (taskId) {
      updateTask();
    } else {
      addTask();
    }
  });

  // Delete task button
  deleteTaskButton.addEventListener('click', deleteTask);

  // Tab filtering
  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      tabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');
      updateTaskList();
    });
  });

  // Member filtering
  memberFilter.addEventListener('change', updateTaskList);

  // Project filtering
  projectFilter.addEventListener('change', updateTaskList);

  // Quick Add Task with project context
  quickAddInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      quickAddTask(this.value);
    }
  });
}
