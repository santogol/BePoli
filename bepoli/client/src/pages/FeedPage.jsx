import { useEffect, useState } from 'react';
import { fetchFeed, likePost, commentPost, createPost } from '../services/posts';

type Post = {
  _id:string;
  userId:{ _id:string; username:string; nome:string };
  desc:string; location:string; createdAt:string;
  imageUrl?:string|null; likes:number; comments:number;
  commentsData?:{ text:string; createdAt:string; userId:{username?:string;nome?:string} }[];
};

export default function FeedPage(){
  const [posts,setPosts]=useState<Post[]>([]);
  const [desc,setDesc]=useState('');
  const [image,setImage]=useState<File|null>(null);

  const load = async ()=> setPosts(await fetchFeed(1));
  useEffect(()=>{ load(); },[]);

  const onLike = async (id:string)=>{
    const { likes } = await likePost(id);
    setPosts(p=>p.map(x=>x._id===id?{...x,likes}:x));
  };

  const onComment = async (id:string)=>{
    const text = prompt('Commento?') || '';
    if(!text.trim()) return;
    const { comments } = await commentPost(id, text);
    setPosts(p=>p.map(x=>x._id===id?{...x,comments}:x));
  };

  const onCreate = async (e:React.FormEvent)=>{
    e.preventDefault();
    await createPost({ desc, image, location: 'Vicino a: Roma' });
    setDesc(''); setImage(null);
    await load();
  };

  return (
    <div>
      <h1>Feed</h1>

      <form onSubmit={onCreate}>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Scrivi un post..." />
        <input type="file" onChange={e=>setImage(e.target.files?.[0]||null)} />
        <button type="submit">Pubblica</button>
      </form>

      {posts.map(p=>(
        <article key={p._id} style={{border:'1px solid #ccc', padding:8, margin:'12px 0'}}>
          <div><b>{p.userId.nome}</b> @{p.userId.username} · {new Date(p.createdAt).toLocaleString()}</div>
          <div>{p.desc}</div>
          {p.imageUrl && <img src={p.imageUrl} alt="" style={{maxWidth:'100%'}}/>}
          <div>Posizione: {p.location}</div>
          <div>
            <button onClick={()=>onLike(p._id)}>❤ {p.likes}</button>
            <button onClick={()=>onComment(p._id)}>💬 {p.comments}</button>
          </div>
        </article>
      ))}
    </div>
  );
}
