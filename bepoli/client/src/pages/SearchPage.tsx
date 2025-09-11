import { useState } from 'react';
import { searchUsers } from '../services/users';
import { Link } from 'react-router-dom';

export default function SearchPage(){
  const [q,setQ]=useState('');
  const [res,setRes]=useState<any[]>([]);
  const onSearch = async (e:React.FormEvent)=>{
    e.preventDefault();
    setRes(await searchUsers(q));
  };
  return (
    <div>
      <h1>Cerca</h1>
      <form onSubmit={onSearch}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="username" />
        <button>Cerca</button>
      </form>
      <ul>
        {res.map(u=>(
          <li key={u.id}>
            <img src={u.profilePicUrl} style={{width:28,height:28,objectFit:'cover',borderRadius:14}}/>
            <Link to={/u/${u.id}}>{u.nome} @{u.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
