import { api, ensureCsrf } from '../api';

export const me = ()=> api.get('/api/user').then(r=>r.data);
export const myPosts = ()=> api.get('/api/user/'+'me' as any) // NON FARE COSÌ
// ^ il tuo backend vuole /api/user/:id, quindi recupera prima me() per l'id:

export const postsByUser = (id:string)=> api.get(/api/user/${id}/posts).then(r=>r.data);
export const updateProfile = async (bio:string, file?:File|null)=>{
  await ensureCsrf();
  const fd = new FormData();
  fd.append('bio', bio);
  if (file) fd.append('profilePic', file);
  await api.post('/api/update-profile', fd, { headers:{'Content-Type':'multipart/form-data'} });
};
