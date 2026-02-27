import api from "./axios";

// Register a new user (multipart/form-data for profile image)
export const registerUser = async (formData) => {
  const { data } = await api.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Login user
export const loginUser = async ({ email, phone, password }) => {
  const { data } = await api.post("/users/login", { email, phone, password });
  return data;
};

// Logout user
export const logoutUser = async () => {
  const { data } = await api.post("/users/logout");
  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const { data } = await api.get("/users/get-user");
  return data;
};

// Change password
export const changePassword = async ({
  oldPassword,
  newPassword,
  confirmPassword,
}) => {
  const { data } = await api.post("/users/change-password", {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  return data;
};

// Update account details
export const updateAccountDetails = async ({ fullName, email, phone }) => {
  const { data } = await api.post("/users/update-profile", {
    fullName,
    email,
    phone,
  });
  return data;
};

// Update profile image (multipart/form-data)
export const updateProfileImage = async (formData) => {
  const { data } = await api.post("/users/update-profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Delete account
export const deleteAccount = async () => {
  const { data } = await api.delete("/users/delete-account");
  return data;
};
