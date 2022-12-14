"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
                    User login/signup/login
 ******************************************************************************/

/** Handle login form submission. If login ok, sets up the user instance */
$loginForm.on("submit", login);

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();
  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();
  // User.login retrieves user info from API and returns User instance which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
    navAllStories();
  }
}

/** Handle signup form submission. */
$signupForm.on("submit", signup);

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  $signupForm.trigger("reset");

  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
    navAllStories();
  }
}

// Handle click of logout button - Remove their credentials from localStorage and refresh page
$navLogOut.on("click", logout);

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

/******************************************************************************
                Storing/recalling previously-logged-in-user with localStorage
  *******************************************************************************/

/** If there are user credentials in local storage, use those to log in that user. This is meant to be called on page load, just once. */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  if (!token || !username) return false;
  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username, password);
}

/** Sync current user information to localStorage. We store the username/token in localStorage so when the page is refreshed (or the user revisits the site later), they will still be logged in.*/
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  localStorage.setItem("token", currentUser.loginToken);
  localStorage.setItem("username", currentUser.username);
  localStorage.setItem("password", currentUser.password);
}

/******************************************************************************
                        General UI stuff about users
 ******************************************************************************/

/* When a user signs up or registers, we want to set up the UI for them  */
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  updateNavOnLogin();
}

/******************************************************************************
                        Update User Profile
 ******************************************************************************/
$userProfileForm.on("submit", handleUpdateUserProfile);
async function handleUpdateUserProfile(e) {
  e.preventDefault();
  const updatedUser = {
    name: $("#edit-user-name").val(),
    password: $("#edit-user-password").val(),
  };
  if (!updatedUser.password) {
    alert("Password can't be empty!");
  } else {
    currentUser = await currentUser.updateProfile(updatedUser);
    saveUserCredentialsInLocalStorage();
    location.reload();
  }
}
