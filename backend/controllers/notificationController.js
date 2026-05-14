const axios=require('axios')

const {logger}=require('../../middleware/loggingMiddleware')

const getNotifications=async(req,res)=>{

try{

await logger.info('fetching notifications')

const r=await axios.get(
'http://4.224.186.213/evaluation-service/notifications',
{
headers:{
Authorization:`Bearer ${process.env.TOKEN}`
}
}
)

const n=r.data.notifications || []

const p={
Placement:3,
Result:2,
Event:1
}

const t=n
.sort((a,b)=>{

if(p[b.Type]!==p[a.Type]){
return p[b.Type]-p[a.Type]
}

return new Date(b.Timestamp)-new Date(a.Timestamp)

})
.slice(0,10)

await logger.info('notifications sorted')

res.json(t)

}catch(err){

await logger.error(err.message)

res.status(500).json({
message:'server error'
})

}

}

module.exports={getNotifications}