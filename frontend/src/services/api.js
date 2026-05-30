import axios from 'axios';
const API = axios.create({ baseURL: '/api' });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
API.interceptors.response.use(res => res, async err => {
  if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
  return Promise.reject(err);
});
export const authAPI = {
  register: (data) => API.post('/auth/register/', data),
  login:    (data) => API.post('/auth/login/', data),
  me:       ()     => API.get('/auth/me/'),
  logout:   (data) => API.post('/auth/logout/', data),
};
export const chatAPI = {
  conversations:     ()         => API.get('/chatbot/conversations/'),
  getConversation:   (id)       => API.get(`/chatbot/conversations/${id}/`),
  supprimerConv:     (id)       => API.delete(`/chatbot/conversations/${id}/`),
  envoyer:           (formData) => API.post('/chatbot/envoyer/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
export const culturesAPI = {
  recommander: (data) => API.post('/cultures/recommander/', data),
  liste:       ()     => API.get('/cultures/liste/'),
};
export default API;
