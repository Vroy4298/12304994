"use client"

import {useEffect,useState} from "react"

import {
Container,
Card,
Typography,
Chip,
CircularProgress
} from "@mui/material"

export default function Home(){

const [data,setData]=useState([])
const [loading,setLoading]=useState(true)

useEffect(()=>{

fetch('http://localhost:5000/api/notifications')
.then(res=>res.json())
.then(res=>{
setData(res)
setLoading(false)
})

},[])

if(loading){
return <CircularProgress/>
}

return(

<Container maxWidth="md" sx={{mt:5}}>

<Typography variant="h4" mb={3}>
Priority Notifications
</Typography>

{
data.map(item=>(

<Card
key={item.ID}
sx={{
p:1.5,
mb:1.5
}}
>

<Chip
label={item.Type}

color={
item.Type==='Placement'
?'success'
:item.Type==='Result'
?'primary'
:'warning'
}
/>
<Typography mt={1}>
{item.Message}
</Typography>

<Typography variant="body2" mt={1}>
{item.Timestamp}
</Typography>

</Card>

))
}

</Container>

)

}