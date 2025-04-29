// Firebase initialization module
let db;

// Function to initialize Firebase
function initFirebase() {
  // Initialize Firebase with config from config.js
  firebase.initializeApp(firebaseConfig);

  // Initialize Firestore
  db = firebase.firestore();

  // Load team members first, then tasks
  fetchTeamMembers();
}

// Function to fetch team members from Firestore
function fetchTeamMembers() {
  db.collection('team_members')
    .get()
    .then((snapshot) => {
      teamMembers = [];
      snapshot.forEach((doc) => {
        teamMembers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // After loading team members, load tasks
      loadTasksFromFirebase();
    })
    .catch((error) => {
      console.error('Error loading team members from Firebase:', error);
      // Initialize empty array and continue
      teamMembers = [];
      loadTasksFromFirebase();
    });
}

// Function to load tasks from Firebase
function loadTasksFromFirebase() {
  db.collection('tasks')
    .get()
    .then((snapshot) => {
      tasks = [];
      snapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Update team member progress based on tasks
      updateTeamMemberProgress();

      // Then update UI
      updateTeamMembers();
      updateTaskList();
      updateStatistics();
    })
    .catch((error) => {
      console.error('Error loading tasks from Firebase:', error);
      // Initialize empty tasks array if there's an error
      tasks = [];

      // Still update UI with empty tasks
      updateTeamMemberProgress();
      updateTeamMembers();
      updateTaskList();
      updateStatistics();
    });
}
