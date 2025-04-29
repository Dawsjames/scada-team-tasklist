// Team Members Component

// DOM Elements for Team Members
const teamMembersContainer = document.getElementById('team-members');
const addMemberButton = document.getElementById('add-member-button');
const memberModalTitle = document.getElementById('member-modal-title');
const memberNameInput = document.getElementById('memberName');
const memberRoleInput = document.getElementById('memberRole');
const memberStatusInput = document.getElementById('memberStatus');
const memberIdInput = document.getElementById('memberId');
const saveMemberButton = document.getElementById('saveMemberButton');
const deleteMemberButton = document.getElementById('deleteMemberButton');

// Update team members UI
function updateTeamMembers() {
  teamMembersContainer.innerHTML = '';

  teamMembers.forEach((member) => {
    const memberElement = document.createElement('div');
    memberElement.className = 'team-member';
    memberElement.dataset.id = member.id;

    // Only display role for Sir Rey and Rhea
    const roleDisplay =
      member.name === 'Sir Rey' || member.name === 'Rhea'
        ? `<div class="role">${member.role}</div>`
        : `<div class="role">${member.role || ''}</div>`;

    const initial = getInitial(member.name);

    memberElement.innerHTML = `
            <div class="avatar">
                <span class="avatar-initial">${initial}</span>
                ${
                  member.status
                    ? `<div class="status-dot status-${member.status}"></div>`
                    : ''
                }
            </div>
            <div class="name">${member.name}</div>
            ${roleDisplay}
            <div class="member-progress">
                <div class="member-progress-bar" style="width: ${
                  member.progress
                }%;"></div>
            </div>
        `;

    teamMembersContainer.appendChild(memberElement);

    // Make team member clickable for editing
    memberElement.addEventListener('click', function () {
      openEditMemberModal(this.dataset.id);
    });
  });

  // Populate member filter dropdown
  memberFilter.innerHTML = '<option value="all">All Members</option>';
  teamMembers.forEach((member) => {
    const option = document.createElement('option');
    option.value = member.name;
    option.textContent = member.name;
    memberFilter.appendChild(option);
  });

  // Populate assignee dropdown in task modal
  taskAssigneeInput.innerHTML = '<option value="">Unassigned</option>';
  teamMembers.forEach((member) => {
    const option = document.createElement('option');
    option.value = member.name;
    option.textContent = member.name;
    taskAssigneeInput.appendChild(option);
  });
}

// Add a new team member
function addMember() {
  const name = memberNameInput.value.trim();
  if (!name) {
    alert('Please enter a member name');
    return;
  }

  // Use the entered role value directly
  const role = memberRoleInput.value.trim();

  const newMember = {
    name: name,
    role: role,
    status: memberStatusInput.value,
    progress: 0,
    createdAt: new Date(),
  };

  // Add to Firestore
  db.collection('team_members')
    .add(newMember)
    .then((docRef) => {
      // Add member with Firestore ID to local array
      teamMembers.push({
        id: docRef.id,
        ...newMember,
      });
      updateTeamMembers();
      closeMemberModal();
    })
    .catch((error) => {
      console.error('Error adding member: ', error);
      alert('Error adding member. Please try again.');
    });
}

// Update an existing team member
function updateMember() {
  const memberId = memberIdInput.value;
  if (!memberId) return;

  const name = memberNameInput.value.trim();
  if (!name) {
    alert('Please enter a member name');
    return;
  }

  // Use the entered role value directly
  const role = memberRoleInput.value.trim();

  const updatedMember = {
    name: name,
    role: role,
    status: memberStatusInput.value,
    updatedAt: new Date(),
  };

  // Update in Firestore
  db.collection('team_members')
    .doc(memberId)
    .update(updatedMember)
    .then(() => {
      // Update member in local array
      const memberIndex = teamMembers.findIndex((m) => m.id === memberId);
      if (memberIndex !== -1) {
        // Preserve progress from the original member
        const originalProgress = teamMembers[memberIndex].progress;
        teamMembers[memberIndex] = {
          id: memberId,
          ...updatedMember,
          progress: originalProgress,
        };
      }
      updateTeamMembers();
      closeMemberModal();
    })
    .catch((error) => {
      console.error('Error updating member: ', error);
      alert('Error updating member. Please try again.');
    });
}

// Delete a team member
function deleteMember(memberId) {
  // Check if member has any assigned tasks
  const hasTasks = tasks.some((task) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return task.assignee === member.name;
  });

  if (hasTasks) {
    alert(
      'Cannot delete member with assigned tasks. Please reassign tasks first.'
    );
    return;
  }

  if (confirm('Are you sure you want to delete this team member?')) {
    // Delete from Firestore
    db.collection('team_members')
      .doc(memberId)
      .delete()
      .then(() => {
        // Remove from local array
        teamMembers = teamMembers.filter((m) => m.id !== memberId);
        updateTeamMembers();
        closeMemberModal();
      })
      .catch((error) => {
        console.error('Error deleting member: ', error);
        alert('Error deleting member. Please try again.');
      });
  }
}

// Initialize event listeners for team members
function initTeamMembersListeners() {
  // Add member button opens modal
  addMemberButton.addEventListener('click', openAddMemberModal);

  // Save member button
  saveMemberButton.addEventListener('click', function () {
    const memberId = memberIdInput.value;
    if (memberId) {
      updateMember();
    } else {
      addMember();
    }
  });

  // Delete member button
  deleteMemberButton.addEventListener('click', function () {
    const memberId = memberIdInput.value;
    if (memberId) {
      deleteMember(memberId);
    }
  });
}
