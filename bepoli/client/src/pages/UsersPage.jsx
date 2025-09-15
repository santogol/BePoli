import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { followInfo, followToggle, getPublicUser } from '../services/users';

export default function UserPage(){
  const { id='' } = useParams();
  const [pub,setPub]=useState<any>(null);
  const [info,setInfo]=useState<any>(null);

  const load = async ()=>{
    setPub(await getPublicUser(id));
    setInfo(await followInfo(id));
  };

  useEffect(()=>{ if(id) load(); },[id]);

  const onFollow = async ()=>{
    const r = await followToggle(id);
    setInfo((old:any)=>({...old, isFollowing:r.following, followersCount:r.followersCount}));
  };

  if(!pub) return null;
  return (
    <div>
      <h1>{pub.nome} @{pub.username}</h1>
      <p>{pub.bio}</p>
      <p>Followers: {info?.followersCount} · Following: {info?.followingCount}</p>
      <button onClick={onFollow}>
        {info?.isFollowing ? 'Smetti di seguire' : 'Segui'}
      </button>
    </div>
  );
}
