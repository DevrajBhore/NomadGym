// api/axiosConfig.js
import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_URL_API || "https://nomadgym.onrender.com/api/v1/",
  withCredentials: true,
})

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token")
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config"""
// })

export default API
