const API_URL = import.meta.env.ENV_API_URL;

const callApi = async (endpoint, method = "GET", body = null) => {
  const token = sessionStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "An error occured");
  }
  return response.json();
};

export const fetchData = (endpoint) => {
  return callApi(endpoint, "GET");
};

export const postData = (endpoint, data) => {
  return callApi(endpoint, "POST", data);
};

export const updateData = (endpoint, data) => {
  return callApi(endpoint, "PUT", data);
};

export const deleteData = (endpoint, data) => {
  return callApi(endpoint, "DELETE", data);
};
