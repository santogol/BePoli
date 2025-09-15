import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { updateProfile, postsByUser } from '../services/profile';

export default function ProfilePage(){
  const { user, refresh } = useAuth();
  const [bio,setBio]=useState(user?.bio||'');
  const [file,setFile]=useState<File|null>(null);
  const [posts,setPosts]=useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      if(user?._id){
        setPosts(await postsByUser(user._id));
      }
    })();
  },[user?._id]);

  const onSave = async (e:React.FormEvent)=>{
    e.preventDefault();
    await updateProfile(bio, file);
    await refresh();
    alert('Profilo aggiornato');
  };

  return (
    <div>
      <h1>Il mio profilo</h1>
      <form onSubmit={onSave}>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="La tua bio"/>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button>Salva</button>
      </form>

      <h2>I miei post</h2>
      {posts.map(p=>(
        <div key={p._id}>
          <div>{p.desc}</div>
          {p.imageUrl && <img src={p.imageUrl} style={{maxWidth:'100%'}}/>}
        </div>
      ))}
    </div>
  );
}
