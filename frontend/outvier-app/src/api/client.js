import axios from "axios";
const BASE_URL = "http://192.168.20.30:8000"; // replace with your IP
export const api = axios.create({ baseURL: `${BASE_URL}/api/` });
