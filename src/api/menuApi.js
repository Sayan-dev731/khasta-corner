import api from "./axios";

// Add a menu item (multipart/form-data for imageFood)
export const addMenuItem = async (formData) => {
  const { data } = await api.post("/menu/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Get a single menu item by ID
export const getMenuItem = async (id) => {
  const { data } = await api.get(`/menu/get/${id}`);
  return data;
};

// Edit menu item details (no image)
export const editMenuItem = async (id, updates) => {
  const { data } = await api.post(`/menu/edit/${id}`, updates);
  return data;
};

// Edit menu item image (multipart/form-data)
export const editMenuItemImage = async (id, formData) => {
  const { data } = await api.post(`/menu/edit/image/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Delete a menu item
export const deleteMenuItemApi = async (id) => {
  const { data } = await api.delete(`/menu/delete/${id}`);
  return data;
};
