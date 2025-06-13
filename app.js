// Strict mode for better error checking
"use strict";

// DOM Elements
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const dashboardSection = document.getElementById("dashboard-section");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

const showSignupBtn = document.getElementById("show-signup");
const showLoginBtn = document.getElementById("show-login");
const logoutBtn = document.getElementById("logout-btn");

const userEmailDisplay = document.getElementById("user-email");
const newTaskInput = document.getElementById("new-task-input");

// Helper function to switch visible sections
function showSection(section) {
  loginSection.classList.add("hidden");
  signupSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");

  section.classList.remove("hidden");
}

// Toggle to Signup form from Login
showSignupBtn.addEventListener("click", () => {
  showSection(signupSection);
  loginForm.reset();
});

// Toggle to Login form from Signup
showLoginBtn.addEventListener("click", () => {
  showSection(loginSection);
  signupForm.reset();
});

// Logout button handler
logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
  } catch (error) {
    alert("Error logging out: " + error.message);
  }
});

// Current user ID and unsubscribe function for Firestore listener
let currentUserId = null;
let unsubscribeTasksListener = null;

// Listen to Firebase auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    currentUserId = user.uid;
    userEmailDisplay.textContent = user.email;

    showSection(dashboardSection);
    loadTasksRealtime();
  } else {
    // User is signed out
    currentUserId = null;
    if (unsubscribeTasksListener) unsubscribeTasksListener();

    showSection(loginSection);
    clearTaskList();
  }
});

// Login form submit handler
loginForm.addEventListener("submit", async e => {
  e.preventDefault();

  const email = loginForm["login-email"].value.trim();
  const password = loginForm["login-password"].value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginForm.reset();
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// Signup form submit handler
signupForm.addEventListener("submit", async e => {
  e.preventDefault();

  const email = signupForm["signup-email"].value.trim();
  const password = signupForm["signup-password"].value;
  const passwordConfirm = signupForm["signup-password-confirm"].value;

  if (!email || !password || !passwordConfirm) {
    alert("Please fill out all fields.");
    return;
  }

  if (password !== passwordConfirm) {
    alert("Passwords do not match.");
    return;
  }

  if (password.length < 6) {
    alert("Password should be at least 6 characters.");
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    signupForm.reset();
  } catch (error) {
    alert("Sign up failed: " + error.message);
  }
});

// Add new task submit handler
taskForm.addEventListener("submit", async e => {
  e.preventDefault();

  const taskDesc = newTaskInput.value.trim();
  if (!taskDesc) return;

  if (!currentUserId) {
    alert("User not authenticated.");
    return;
  }

  try {
    // Add task to Firestore under user's collection "tasks"
    await db.collection("users").doc(currentUserId).collection("tasks").add({
      description: taskDesc,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    newTaskInput.value = "";
  } catch (error) {
    alert("Failed to add task: " + error.message);
  }
});

// Clear all tasks from UI
function clearTaskList() {
  taskList.innerHTML = "";
}

// Render a single task in the task list
function renderTask(doc) {
  const li = document.createElement("li");
  li.setAttribute("data-id", doc.id);
  li.tabIndex = 0;
  li.className = "task-item";

  const span = document.createElement("span");
  span.textContent = doc.data().description;
  span.className = "task-text";
  li.appendChild(span);

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.className = "task-delete-btn";
  delBtn.type = "button";
  delBtn.ariaLabel = "Delete task";

  const icon = document.createElement("span");
  icon.className = "material-icons";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "delete";
  delBtn.appendChild(icon);

  // Delete event handler
  delBtn.addEventListener("click", async () => {
    const taskId = li.getAttribute("data-id");
    if (!taskId || !currentUserId) return;
    try {
      await db.collection("users").doc(currentUserId).collection("tasks").doc(taskId).delete();
    } catch (error) {
      alert("Failed to delete task: " + error.message);
    }
  });

  li.appendChild(delBtn);
  taskList.appendChild(li);
}

// Load tasks in real-time with Firestore onSnapshot listener
function loadTasksRealtime() {
  if (!currentUserId) return;

  // Unsubscribe previous listener if any
  if (unsubscribeTasksListener) unsubscribeTasksListener();

  unsubscribeTasksListener = db
    .collection("users")
    .doc(currentUserId)
    .collection("tasks")
    .orderBy("createdAt", "asc")
    .onSnapshot(snapshot => {
      // Clear existing UI tasks
      clearTaskList();

      snapshot.forEach(doc => {
        renderTask(doc);
      });
    }, error => {
      console.error("Error fetching tasks: ", error);
      alert("Error loading tasks: " + error.message);
    });
}

