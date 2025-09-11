import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

type User = { _id:string; username:string; nome:string; bio?:string };
type AuthCtx = { user:User|null; refresh:()=>Promise<void>; logout:()=>Promise<void> };
const Ctx = createContext<AuthCtx>({ user:null, refresh:async()=>{}, logout:async()=>{} });
export const useAuth = ()=>useContext(Ctx);

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [user,setUser]=useState<User|null>(null);

  const refresh = async ()=>{
    try {
      const {data} = await api.get('/api/user'); // usa sessione+fingerprint
      setUser(data);
    } catch { setUser(null); }
  };

  const logout = async ()=>{
    try { await api.post('/logout'); } finally { setUser(null); }
  };

  useEffect(()=>{ refresh(); },[]);
  return <Ctx.Provider value={{user,refresh,logout}}>{children}</Ctx.Provider>;
}
