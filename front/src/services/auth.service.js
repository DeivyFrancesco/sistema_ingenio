import api from "../api/api";

// Login
export const login = (data) => {
    return api.post("/auth/login", data);
};

// Register
export const register = (data) => {
    return api.post("/auth/register", data);
};