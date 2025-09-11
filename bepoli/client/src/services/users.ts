import { api, ensureCsrf } from '../api';

export const getPublicUser = (id:string)=> api.get(/api/user-public/${id}).then(r=>r.data);
export const followToggle = async (id:string)=>{
  await ensureCsrf();
  return api.post(/api/follow/${id}).then(r=>r.data); // {following, followersCount, ...}
};
export const followInfo = (id:string)=> api.get(/api/follow-info/${id}).then(r=>r.data);
export const searchUsers = (q:string, page=1, limit=10)=>
  api.get('/api/search-users', { params:{ q, page, limit } }).then(r=>r.data);
export const recentUsers = ()=> api.get('/api/recent-users').then(r=>r.data);
