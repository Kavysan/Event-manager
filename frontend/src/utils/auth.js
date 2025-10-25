// Save the token to localStorage
export const setToken = (token) => {
  localStorage.setItem("access_token", token);
};

// Retrieve the token from localStorage
export const getToken = () => {
  return localStorage.getItem("access_token");
};

// Remove the token (e.g., on logout)
export const removeToken = () => {
  localStorage.removeItem("access_token");
};

// Check if the user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};
