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
const taskStatusSelect = document.getElementById('taskStatus'); // Changed to select instead of checkbox
const taskAssigneeInput = document.getElementById('taskAssignee');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskPriorityInput = document.getElementById('taskPriority');
const taskCategoryInput = document.getElementById('taskProject'); // We'll use this for backward compatibility
const taskIdInput = document.getElementById('taskId');
const saveTaskButton = document.getElementById('saveTaskButton');
const deleteTaskButton = document.getElementById('deleteTaskButton');

// Store current filters for persistence during task operations
let currentFilters = {
  tab: 'all',
  member: 'all',
  project: 'all'
};

// Task status sequence for cycling
const statusSequence = ['Pending', 'To be Deployed', 'Completed'];

// Map tab data-filter attributes to status values (for consistent comparison)
const tabToStatusMap = {
  'pending': 'Pending',
  'to-be-deployed': 'To be Deployed',
  'completed': 'Completed',
  'all': 'all',
  'high-priority': 'high-priority',
  'overdue': 'overdue'
};

// Project data - Updated to only include Frontend and Backend
const projects = [
  { id: 'frontend', name: 'Frontend', color: 'var(--design-color)' },
  { id: 'backend', name: 'Backend', color: 'var(--development-color)' },
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

  console.log('Initializing projects');

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
  return projects.find((p) => p.id === projectId) || projects[0]; // Default to Frontend
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

  // Get active filters and store them
  currentFilters.tab = getCurrentActiveTab();
  currentFilters.member = getCurrentMemberFilter();
  currentFilters.project = getCurrentProjectFilter();

  console.log('Updating task list with filters:', currentFilters);

  // Apply filters to tasks
  let filteredTasks = filterTasks(
    currentFilters.tab,
    currentFilters.member,
    currentFilters.project
  );

  console.log(`Found ${filteredTasks.length} tasks matching filters`);

  // Clear current task list
  taskList.innerHTML = '';

  // Show empty state if no tasks match filters
  if (filteredTasks.length === 0) {
    renderEmptyState();
    return;
  }

  // Render each task
  filteredTasks.forEach((task) => renderTaskItem(task));

  // Update tab highlights
  updateTabsBasedOnTask();
}

/**
 * Get current project filter
 */
function getCurrentProjectFilter() {
  return projectFilter ? projectFilter.value : 'all';
}

/**
 * Get current member filter
 */
function getCurrentMemberFilter() {
  return memberFilter ? memberFilter.value : 'all';
}

/**
 * Get current active tab
 */
function getCurrentActiveTab() {
  const activeTab = document.querySelector('.tab.active');
  if (!activeTab) {
    console.error('No active tab found');
    return 'all'; // Default to 'all' if no active tab
  }
  
  const filter = activeTab.getAttribute('data-filter');
  console.log('Active tab filter:', filter);
  return filter || 'all';
}

/**
 * Filter tasks based on tab, member, and project filters
 */
function filterTasks(tabFilter, memberFilter, projectFilter) {
  console.log('Filtering tasks:', { tabFilter, memberFilter, projectFilter });
  console.log('Total tasks before filtering:', tasks.length);
  
  // Deep clone the tasks array to avoid mutation issues
  let result = JSON.parse(JSON.stringify(tasks));
  
  // Map tab filter to status if needed
  const statusFilter = tabToStatusMap[tabFilter] || tabFilter;

  // Apply tab filter based on new status system
  if (tabFilter !== 'all') {
    switch (tabFilter) {
      case 'pending':
        result = result.filter((task) => task.status === 'Pending');
        break;
      case 'to-be-deployed':
        result = result.filter((task) => task.status === 'To be Deployed');
        break;
      case 'completed':
        result = result.filter((task) => task.status === 'Completed');
        break;
      case 'high-priority':
        result = result.filter((task) => task.priority === 'High');
        break;
      case 'overdue':
        result = result.filter((task) => isTaskOverdue(task));
        break;
    }
  }

  console.log(`After tab filter (${tabFilter}):`, result.length);

  // Apply member filter if not 'all'
  if (memberFilter !== 'all') {
    result = result.filter((task) => task.assignee === memberFilter);
    console.log(`After member filter (${memberFilter}):`, result.length);
  }

  // Apply project filter if not 'all'
  if (projectFilter !== 'all') {
    // Check for both category and project fields
    result = result.filter(
      (task) => {
        const taskCategory = task.category || task.project || 'frontend';
        return taskCategory === projectFilter;
      }
    );
    console.log(`After project filter (${projectFilter}):`, result.length);
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
  const hasPending = memberTasks.some((task) => task.status === 'Pending');
  const hasToBeDeploy = memberTasks.some((task) => task.status === 'To be Deployed');
  const hasCompleted = memberTasks.some((task) => task.status === 'Completed');
  const hasOverdue = memberTasks.some((task) => isTaskOverdue(task));

  // Update tabs with indicators
  if (hasPending) {
    document
      .querySelector('.tab[data-filter="pending"]')
      ?.classList.add('has-assigned');
  }
  
  if (hasToBeDeploy) {
    document
      .querySelector('.tab[data-filter="to-be-deployed"]')
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
 * Cycle task status to next in sequence
 */
function cycleTaskStatus(taskId, event) {
  // Stop event propagation to prevent opening the task edit modal
  event.stopPropagation();
  
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // Get current status or default to 'Pending'
  const currentStatus = task.status || 'Pending';
  
  // Find current index in sequence
  const currentIndex = statusSequence.indexOf(currentStatus);
  
  // Calculate next status (cycle back to beginning if at end)
  const nextIndex = (currentIndex + 1) % statusSequence.length;
  const nextStatus = statusSequence[nextIndex];
  
  console.log(`Cycling task ${taskId} from ${currentStatus} to ${nextStatus}`);
  
  // Update status
  updateTaskStatus(taskId, nextStatus);
}

/**
 * Set task to completed status immediately
 */
function completeTask(taskId, event) {
  // Stop event propagation to prevent opening the task edit modal
  event.stopPropagation();
  
  console.log(`Completing task ${taskId}`);
  
  // Update status to Completed
  updateTaskStatus(taskId, 'Completed');
}

/**
 * Update task status in both local memory and Firebase
 */
function updateTaskStatus(taskId, newStatus) {
  // Find task in local array
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  console.log(`Updating task ${taskId} status to ${newStatus}`);
  
  // Update status in local array
  tasks[taskIndex].status = newStatus;
  
  // For backwards compatibility
  tasks[taskIndex].completed = (newStatus === 'Completed');
  
  // Update UI immediately for better user experience
  updateTaskList();
  if (typeof updateStatistics === 'function') {
    updateStatistics();
  }
  
  // Update in Firebase
  db.collection('tasks')
    .doc(taskId)
    .update({
      status: newStatus,
      completed: (newStatus === 'Completed'),
      updatedAt: firebase.firestore.Timestamp.now()
    })
    .then(() => {
      console.log(`Task ${taskId} status updated to ${newStatus} in Firestore`);
      
      // Update team data if needed
      if (typeof updateTeamMemberProgress === 'function') {
        updateTeamMemberProgress();
      }
      if (typeof updateTeamMembers === 'function') {
        updateTeamMembers();
      }
    })
    .catch(error => {
      console.error('Error updating task status:', error);
      
      // Revert local change if Firebase update fails
      if (taskIndex !== -1) {
        const originalStatus = tasks[taskIndex].status;
        tasks[taskIndex].status = originalStatus;
        tasks[taskIndex].completed = (originalStatus === 'Completed');
        
        // Refresh the UI with original data
        updateTaskList();
        if (typeof updateStatistics === 'function') {
          updateStatistics();
        }
      }
    });
}

/**
 * Render a single task item in the list with compact design and status buttons
 */
function renderTaskItem(task) {
  // Create task element
  const taskElement = document.createElement('div');
  taskElement.className = 'task-item';
  taskElement.dataset.id = task.id;
  taskElement.dataset.status = task.status || 'Pending'; // Add status as data attribute

  // Find assignee information
  const assignee = teamMembers.find((member) => member.name === task.assignee);
  const assigneeInitial = assignee ? getInitial(assignee.name) : '';

  // Get project information - check both category and project fields
  const projectId = task.category || task.project || 'frontend';
  const project = getProject(projectId);
  
  // Ensure task has a status (for legacy data)
  const taskStatus = task.status || (task.completed ? 'Completed' : 'Pending');
  
  // Determine task status class - convert spaces to dashes for CSS
  const statusClass = taskStatus.toLowerCase().replace(/\s+/g, '-');

  // Build task HTML with redesigned layout and status buttons
  taskElement.innerHTML = `
        <div class="task-status-indicator status-${statusClass}">
            <span class="status-dot"></span>
        </div>
        <div class="task-content">
            <div class="task-title ${statusClass}">
                ${
                  task.priority === 'High'
                    ? '<span class="priority-dot"></span>'
                    : ''
                }
                ${task.name || task.description}
            </div>
            ${
              task.description && task.name
                ? `<div class="task-description ${statusClass}">${task.description}</div>`
                : ''
            }
            <div class="task-meta">
                <div class="task-project">
                    <span class="project-dot" style="background-color: ${
                      project.color
                    }"></span>
                    ${project.name}
                </div>
                <div class="task-status">${taskStatus}</div>
                ${
                  task.dueDate
                    ? `<div class="task-date">${new Date(
                        task.dueDate
                      ).toLocaleDateString()}</div>`
                    : ''
                }
            </div>
        </div>
        <div class="task-actions">
            <button class="task-cycle-btn" title="Cycle Status">⟳</button>
            <button class="task-complete-btn" title="Complete Task">✓</button>
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

  const taskId = taskElement.dataset.id;
  
  // Add cycle button listener
  const cycleButton = taskElement.querySelector('.task-cycle-btn');
  if (cycleButton) {
    cycleButton.addEventListener('click', (e) => cycleTaskStatus(taskId, e));
  }
  
  // Add complete button listener
  const completeButton = taskElement.querySelector('.task-complete-btn');
  if (completeButton) {
    completeButton.addEventListener('click', (e) => completeTask(taskId, e));
  }

  // Make the entire task item clickable to open edit modal (except buttons)
  taskElement.addEventListener('click', function (e) {
    // Only open modal if we didn't click on a button
    if (!e.target.closest('button')) {
      console.log('Task clicked, opening edit modal for:', taskId);
      openEditTaskModal(taskId);
    }
  });
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
    status: taskStatusSelect ? taskStatusSelect.value : 'Pending', // Use the new status field
    assignee: taskAssigneeInput ? taskAssigneeInput.value : '',
    dueDate: taskDueDateInput ? taskDueDateInput.value : '',
    priority: taskPriorityInput ? taskPriorityInput.value : 'Medium',
    category: taskCategoryInput ? taskCategoryInput.value : 'frontend',
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
    status: taskStatusSelect ? taskStatusSelect.value : 'Pending', // Use new status field
    assignee: taskAssigneeInput ? taskAssigneeInput.value : '',
    dueDate: taskDueDateInput ? taskDueDateInput.value : '',
    priority: taskPriorityInput ? taskPriorityInput.value : 'Medium',
    category: taskCategoryInput ? taskCategoryInput.value : 'frontend',
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
  if (taskStatusSelect) taskStatusSelect.value = 'Pending'; // Set default status to Pending
  if (taskAssigneeInput) taskAssigneeInput.value = '';
  if (taskDueDateInput) taskDueDateInput.value = '';
  if (taskPriorityInput) taskPriorityInput.value = 'Medium';
  if (taskCategoryInput) taskCategoryInput.value = 'frontend'; // Default to Frontend
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
  
  // Set status based on new or legacy data structure
  if (taskStatusSelect) {
    if (task.status) {
      taskStatusSelect.value = task.status;
    } else {
      // Legacy data conversion - if task has completed property
      taskStatusSelect.value = task.completed ? 'Completed' : 'Pending';
    }
  }
  
  if (taskAssigneeInput) taskAssigneeInput.value = task.assignee || '';
  if (taskDueDateInput) taskDueDateInput.value = task.dueDate || '';
  if (taskPriorityInput) taskPriorityInput.value = task.priority || 'Medium';

  // Check both category and project fields
  if (taskCategoryInput) {
    const category = task.category || task.project;
    if (category === 'r3' || category === 'r8-250' || category === 'r8-125' || category === 'other') {
      // Convert old categories to new ones (example mapping)
      taskCategoryInput.value = category === 'r3' || category === 'r8-250' ? 'frontend' : 'backend';
    } else {
      taskCategoryInput.value = category || 'frontend';
    }
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
 * Fix tabs if they don't have proper data-filter attributes
 */
function ensureTabsHaveDataFilters() {
  console.log('Checking and fixing tab data-filter attributes');
  
  if (!tabs || tabs.length === 0) {
    console.error('No tabs found');
    return;
  }
  
  // Expected tab filters
  const expectedFilters = ['all', 'pending', 'to-be-deployed', 'completed', 'high-priority', 'overdue'];
  
  // Check each tab
  tabs.forEach(tab => {
    const filter = tab.getAttribute('data-filter');
    if (!filter) {
      // Try to determine filter from tab text content
      const text = tab.textContent.trim().toLowerCase();
      
      if (text.includes('all')) {
        tab.setAttribute('data-filter', 'all');
      } else if (text.includes('pending')) {
        tab.setAttribute('data-filter', 'pending');
      } else if (text.includes('to be deployed') || text.includes('deploy')) {
        tab.setAttribute('data-filter', 'to-be-deployed');
      } else if (text.includes('completed')) {
        tab.setAttribute('data-filter', 'completed');
      } else if (text.includes('high') || text.includes('priority')) {
        tab.setAttribute('data-filter', 'high-priority');
      } else if (text.includes('overdue')) {
        tab.setAttribute('data-filter', 'overdue');
      } else {
        // Default to 'all' if we can't determine
        tab.setAttribute('data-filter', 'all');
      }
      
      console.log(`Added missing data-filter "${tab.getAttribute('data-filter')}" to tab with text: ${text}`);
    }
  });
  
  // Make sure at least one tab is active
  const hasActiveTab = Array.from(tabs).some(tab => tab.classList.contains('active'));
  if (!hasActiveTab && tabs.length > 0) {
    tabs[0].classList.add('active');
    console.log('No active tab found - set first tab as active');
  }
}

/**
 * Normalize task status values across all tasks for consistent filtering
 */
function normalizeTaskStatuses() {
  console.log('Normalizing task status values for consistent filtering');
  
  // Fix any inconsistent status values
  tasks.forEach(task => {
    if (!task.status) {
      // Convert legacy format
      task.status = task.completed ? 'Completed' : 'Pending';
    }
    
    // Ensure consistent status formatting
    if (task.status === 'to be deployed' || task.status === 'to-be-deployed') {
      task.status = 'To be Deployed';
    } else if (task.status === 'completed' || task.status === 'done') {
      task.status = 'Completed';
    } else if (task.status === 'pending' || task.status === 'todo' || task.status === 'to-do') {
      task.status = 'Pending';
    }
    
    // Ensure completed flag is consistent with status
    task.completed = (task.status === 'Completed');
  });
}

/**
 * Initialize task-related event listeners
 */
function initTasksListeners() {
  console.log('Initializing tasks listeners');

  // Fix tab data-filter attributes
  ensureTabsHaveDataFilters();
  
  // Normalize status values in tasks
  normalizeTaskStatuses();

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