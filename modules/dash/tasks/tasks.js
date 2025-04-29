// Tasks Component - Redesigned version
// Manages task listing, filtering by projects, and task operations

// DOM Elements
const taskList = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task-button');
const tabs = document.querySelectorAll('.tab');
const memberFilter = document.getElementById('memberFilter');
const projectFilter = document.getElementById('projectFilter');
const modalTitle = document.getElementById('modal-title');
// Added taskNameInput to handle the name field in the modal
const taskNameInput = document.getElementById('taskName');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskStatusInput = document.getElementById('taskStatus');
const taskAssigneeInput = document.getElementById('taskAssignee');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskPriorityInput = document.getElementById('taskPriority');
const taskCategoryInput = document.getElementById('taskProject'); // We'll use this for backward compatibility
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
  // Check if project filter exists
  if (!projectFilter || !taskCategoryInput) {
    console.error('Project filter or task category input not found');
    return;
  }

  // Populate project filter dropdown
  projectFilter.innerHTML = '<option value="all">All Projects</option>';

  // Populate task modal project dropdown
  taskCategoryInput.innerHTML = '';

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
    taskCategoryInput.appendChild(modalOption);
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
  // Check if task list exists
  if (!taskList) {
    console.error('Task list element not found');
    return;
  }

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
  updateTabsBasedOnTask();
}

/**
 * Get current project filter
 */
function getCurrentProjectFilter() {
  return projectFilter ? projectFilter.value : 'all';
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
    case 'high-priority':
      result = result.filter((task) => task.priority === 'High');
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
    // Check for both category and project fields
    result = result.filter(
      (task) =>
        task.category === projectFilter || task.project === projectFilter
    );
  }

  return result;
}

/**
 * Update tab styling based on task data
 */
function updateTabsBasedOnTask() {
  // Remove 'has-assigned' class from all tabs
  tabs.forEach((tab) => {
    tab.classList.remove('has-assigned');
  });

  // Only proceed if a specific member is selected (not 'all')
  const currentMember = getCurrentMemberFilter();
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
      ?.classList.add('has-assigned');
  }

  if (hasCompleted) {
    document
      .querySelector('.tab[data-filter="completed"]')
      ?.classList.add('has-assigned');
  }

  if (hasOverdue) {
    document
      .querySelector('.tab[data-filter="overdue"]')
      ?.classList.add('has-assigned');
  }
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

  // Get project information - check both category and project fields
  const projectId = task.category || task.project || 'other';
  const project = getProject(projectId);

  // Build task HTML with redesigned layout
  taskElement.innerHTML = `
        <div class="task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
        </div>
        <div class="task-content">
            <div class="task-title ${task.completed ? 'completed' : ''}">
                ${
                  task.priority === 'High'
                    ? '<span class="priority-dot"></span>'
                    : ''
                }
                ${task.name || task.description}
            </div>
            ${
              task.description && task.name
                ? `<div class="task-description ${
                    task.completed ? 'completed' : ''
                  }">${task.description}</div>`
                : ''
            }
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
  if (!taskElement) {
    console.error('Task element is null');
    return;
  }

  // Make the entire task item clickable to open edit modal
  taskElement.addEventListener('click', function (e) {
    // Ignore clicks on the checkbox itself to prevent modal from opening
    if (e.target.type !== 'checkbox') {
      const taskId = this.dataset.id;
      console.log('Task clicked, opening edit modal for:', taskId);
      openEditTaskModal(taskId);
    }
  });

  // Add event listener for the checkbox
  const checkbox = taskElement.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.addEventListener('click', function (e) {
      // Stop event propagation to prevent modal from opening
      e.stopPropagation();
    });

    checkbox.addEventListener('change', function (e) {
      const taskId = taskElement.dataset.id;
      console.log(
        'Checkbox changed for task:',
        taskId,
        'New value:',
        this.checked
      );
      updateTaskCompletionStatus(taskId, this.checked);
    });
  }
}

/**
 * Add a new task
 */
function addTask() {
  // Get name from taskNameInput if it exists
  const name = taskNameInput ? taskNameInput.value.trim() : '';

  // Get description from taskDescriptionInput if it exists
  const description = taskDescriptionInput
    ? taskDescriptionInput.value.trim()
    : '';

  // For backward compatibility, use name as description if no description is provided
  if (!name && !description) {
    alert('Please enter a task name or description');
    return;
  }

  const newTask = {
    name: name,
    description: description,
    completed: taskStatusInput ? taskStatusInput.checked : false,
    assignee: taskAssigneeInput ? taskAssigneeInput.value : '',
    dueDate: taskDueDateInput ? taskDueDateInput.value : '',
    priority: taskPriorityInput ? taskPriorityInput.value : 'Medium',
    category: taskCategoryInput ? taskCategoryInput.value : 'other',
    createdAt: firebase.firestore.Timestamp.now(),
  };

  console.log('Adding task from modal:', newTask);

  // Save to Firebase
  db.collection('tasks')
    .add(newTask)
    .then((docRef) => {
      console.log('Task added with ID: ', docRef.id);

      // Add to local array with Firebase ID
      tasks.push({
        id: docRef.id,
        ...newTask,
      });

      // Update UI
      if (typeof updateTeamMemberProgress === 'function') {
        updateTeamMemberProgress();
      }
      if (typeof updateTeamMembers === 'function') {
        updateTeamMembers();
      }
      updateTaskList();
      if (typeof updateStatistics === 'function') {
        updateStatistics();
      }

      // Close modal
      if (typeof closeTaskModal === 'function') {
        closeTaskModal();
      } else if (taskModal) {
        taskModal.style.display = 'none';
      }
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
  const taskId = taskIdInput ? taskIdInput.value : '';
  if (!taskId) {
    console.error('No task ID found');
    return;
  }

  // Get name from taskNameInput if it exists
  const name = taskNameInput ? taskNameInput.value.trim() : '';

  // Get description from taskDescriptionInput if it exists
  const description = taskDescriptionInput
    ? taskDescriptionInput.value.trim()
    : '';

  // For backward compatibility, use name as description if no description is provided
  if (!name && !description) {
    alert('Please enter a task name or description');
    return;
  }

  const updatedTask = {
    name: name,
    description: description,
    completed: taskStatusInput ? taskStatusInput.checked : false,
    assignee: taskAssigneeInput ? taskAssigneeInput.value : '',
    dueDate: taskDueDateInput ? taskDueDateInput.value : '',
    priority: taskPriorityInput ? taskPriorityInput.value : 'Medium',
    category: taskCategoryInput ? taskCategoryInput.value : 'other',
    updatedAt: firebase.firestore.Timestamp.now(),
  };

  console.log('Updating task:', taskId, updatedTask);

  // Update in Firebase
  db.collection('tasks')
    .doc(taskId)
    .update(updatedTask)
    .then(() => {
      console.log('Task updated successfully');

      // Update in local array
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          id: taskId,
          ...updatedTask,
        };
      }

      // Update UI
      if (typeof updateTeamMemberProgress === 'function') {
        updateTeamMemberProgress();
      }
      if (typeof updateTeamMembers === 'function') {
        updateTeamMembers();
      }
      updateTaskList();
      if (typeof updateStatistics === 'function') {
        updateStatistics();
      }

      // Close modal
      if (typeof closeTaskModal === 'function') {
        closeTaskModal();
      } else if (taskModal) {
        taskModal.style.display = 'none';
      }
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
  const taskId = taskIdInput ? taskIdInput.value : '';
  if (!taskId) {
    console.error('No task ID found');
    return;
  }

  if (confirm('Are you sure you want to delete this task?')) {
    console.log('Deleting task:', taskId);

    // Delete from Firebase
    db.collection('tasks')
      .doc(taskId)
      .delete()
      .then(() => {
        console.log('Task deleted successfully');

        // Remove from local array
        tasks = tasks.filter((t) => t.id !== taskId);

        // Update UI
        if (typeof updateTeamMemberProgress === 'function') {
          updateTeamMemberProgress();
        }
        if (typeof updateTeamMembers === 'function') {
          updateTeamMembers();
        }
        updateTaskList();
        if (typeof updateStatistics === 'function') {
          updateStatistics();
        }

        // Close modal
        if (typeof closeTaskModal === 'function') {
          closeTaskModal();
        } else if (taskModal) {
          taskModal.style.display = 'none';
        }
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      });
  }
}

/**
 * Open add task modal with empty fields
 */
function openAddTaskModal() {
  console.log('Opening Add Task Modal');

  if (!taskModal) {
    console.error('Task modal element not found');
    return;
  }

  if (modalTitle) modalTitle.textContent = 'Add Task';
  if (taskNameInput) taskNameInput.value = '';
  if (taskDescriptionInput) taskDescriptionInput.value = '';
  if (taskStatusInput) taskStatusInput.checked = false;
  if (taskAssigneeInput) taskAssigneeInput.value = '';
  if (taskDueDateInput) taskDueDateInput.value = '';
  if (taskPriorityInput) taskPriorityInput.value = 'Medium';
  if (taskCategoryInput) taskCategoryInput.value = 'other'; // Default to Other as requested
  if (taskIdInput) taskIdInput.value = '';

  // Hide delete button for new tasks
  if (deleteTaskButton) {
    deleteTaskButton.style.display = 'none';
  }

  // Show the modal
  taskModal.style.display = 'flex';
}

/**
 * Open edit task modal with modified fields
 */
function openEditTaskModal(taskId) {
  console.log('Opening Edit Task Modal for task:', taskId);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error('Task not found:', taskId);
    return;
  }

  if (!taskModal) {
    console.error('Task modal element not found');
    return;
  }

  if (modalTitle) modalTitle.textContent = 'Edit Task';
  if (taskNameInput) taskNameInput.value = task.name || '';
  if (taskDescriptionInput) taskDescriptionInput.value = task.description || '';
  if (taskStatusInput) taskStatusInput.checked = task.completed || false;
  if (taskAssigneeInput) taskAssigneeInput.value = task.assignee || '';
  if (taskDueDateInput) taskDueDateInput.value = task.dueDate || '';
  if (taskPriorityInput) taskPriorityInput.value = task.priority || 'Medium';

  // Check both category and project fields
  if (taskCategoryInput) {
    taskCategoryInput.value = task.category || task.project || 'other';
  }

  if (taskIdInput) taskIdInput.value = task.id;

  // Show delete button for existing tasks
  if (deleteTaskButton) {
    deleteTaskButton.style.display = 'block';
  }

  // Show the modal
  taskModal.style.display = 'flex';
}

/**
 * Update task completion status directly in Firestore
 */
function updateTaskCompletionStatus(taskId, completed) {
  if (!taskId) {
    console.error('No task ID provided');
    return;
  }

  console.log('Updating task completion status:', taskId, 'to', completed);

  // Find the task in the local array and update it immediately for UI responsiveness
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = completed;

    // Update UI immediately for responsiveness
    updateTaskList();
    if (typeof updateStatistics === 'function') {
      updateStatistics();
    }
  }

  // Update in Firestore
  db.collection('tasks')
    .doc(taskId)
    .update({
      completed: completed,
      updatedAt: firebase.firestore.Timestamp.now(),
    })
    .then(() => {
      console.log('Task completion status updated successfully');
      // Update team member progress
      if (typeof updateTeamMemberProgress === 'function') {
        updateTeamMemberProgress();
      }
      if (typeof updateTeamMembers === 'function') {
        updateTeamMembers();
      }
    })
    .catch((error) => {
      console.error('Error updating task completion status:', error);
      // If there's an error, revert the local change
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = !completed;
        updateTaskList();
        if (typeof updateStatistics === 'function') {
          updateStatistics();
        }
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
 * Initialize task-related event listeners
 */
function initTasksListeners() {
  console.log('Initializing tasks listeners');

  // Initialize projects
  initProjects();

  // Add task button
  if (addTaskButton) {
    console.log('Adding click listener to Add Task button');
    addTaskButton.addEventListener('click', openAddTaskModal);
  } else {
    console.error('Add Task button not found');
  }

  // Save task button
  if (saveTaskButton) {
    console.log('Adding click listener to Save Task button');
    saveTaskButton.addEventListener('click', function () {
      const taskId = taskIdInput ? taskIdInput.value : '';
      console.log('Save Task button clicked, task ID:', taskId);
      if (taskId) {
        updateTask();
      } else {
        addTask();
      }
    });
  } else {
    console.error('Save Task button not found');
  }

  // Delete task button
  if (deleteTaskButton) {
    console.log('Adding click listener to Delete Task button');
    deleteTaskButton.addEventListener('click', deleteTask);
  } else {
    console.error('Delete Task button not found');
  }

  // Tab filtering
  if (tabs && tabs.length > 0) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        tabs.forEach((t) => t.classList.remove('active'));
        this.classList.add('active');
        updateTaskList();
      });
    });
  } else {
    console.error('Tab elements not found');
  }

  // Member filtering
  if (memberFilter) {
    memberFilter.addEventListener('change', updateTaskList);
  } else {
    console.error('Member filter not found');
  }

  // Project filtering
  if (projectFilter) {
    projectFilter.addEventListener('change', updateTaskList);
  } else {
    console.error('Project filter not found');
  }
}
