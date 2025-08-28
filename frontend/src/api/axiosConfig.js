// api/axiosConfig.js
import axios from "axios"

// Determine the API base URL. Prefer an explicit environment variable
// but fall back to a sensible default depending on the build environment.
const baseURL =
  import.meta.env.VITE_URL_API ??
  (import.meta.env.DEV
    ? "http://localhost:2000/api"
    : "https://nomadgym.onrender.com/api/v1")

const API = axios.create({
  baseURL,
  withCredentials: true,
})

export default API
