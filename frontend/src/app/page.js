'use client';import{useState,useEffect}from'react';import{Container,Typography,Card,CardContent,Chip,Switch,FormControlLabel,Pagination,Box,CircularProgress}from'@mui/material';import axios from'axios';
export default function Home(){
const[n,setN]=useState([]);const[l,setL]=useState(true);const[p,setP]=useState(false);const[page,setPage]=useState(1);const[e,setE]=useState(null);
useEffect(()=>{
const f=async()=>{try{setL(true);const r=await axios.get(p?'http://localhost:5000/api/notifications/priority':'http://localhost:5000/api/notifications');setN(r.data.data||[]);setE(null);}catch(err){setE('Error');}finally{setL(false);}};f();
},[p]);
const i=10;const c=n.slice((page-1)*i,page*i);
const cM={'Placement':'error','Result':'warning','Event':'info'};
return(
<Container maxWidth="md" sx={{py:4}}>
<Box display="flex" justifyContent="space-between" mb={3}>
<Typography variant="h4" fontWeight="bold">Notifications</Typography>
<FormControlLabel control={<Switch checked={p} onChange={(ev)=>setP(ev.target.checked)}/>} label="Priority Inbox"/>
</Box>
{l?<CircularProgress/>:e?<Typography color="error">{e}</Typography>:c.map(x=>(
<Card key={x.id} sx={{mb:2,bgcolor:x.isRead?'#fff':'#f0f8ff',borderLeft:`4px solid ${x.isRead?'#ccc':'#1976d2'}`}}>
<CardContent>
<Box display="flex" justifyContent="space-between">
<Typography variant="h6" fontWeight={x.isRead?'normal':'bold'}>{x.title}</Typography>
<Chip label={x.type} color={cM[x.type]||'default'} size="small"/>
</Box>
<Typography variant="body2" color="text.secondary" mt={1}>{new Date(x.createdAt).toLocaleString()}</Typography>
</CardContent>
</Card>
))}
{!l&&!e&&n.length>0&&(<Box display="flex" justifyContent="center" mt={4}><Pagination count={Math.ceil(n.length/i)} page={page} onChange={(ev,v)=>setPage(v)}/></Box>)}
</Container>
);}
