import wretch from "wretch";

const api = wretch("http://127.0.0.1:8000").accept("application/json");

export default api;
