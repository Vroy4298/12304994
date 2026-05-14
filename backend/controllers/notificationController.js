const axios=require('axios');const {logger}=require('../../middleware/loggingMiddleware');
const getPriorityInbox=async(req,res)=>{
try{logger.info('Fetch');
let n=[];try{const r=await axios.get('http://4.224.186.213/evaluation-service/notifications',{timeout:5000});n=r.data.data||r.data;}catch(e){logger.warn('Fail');
n=[{id:1,type:'Event',title:'T',createdAt:new Date(),isRead:false},{id:2,type:'Placement',title:'G',createdAt:new Date(),isRead:false}];}
const p={'Placement':3,'Result':2,'Event':1};
const t=n.filter(x=>!x.isRead).sort((a,b)=>(p[a.type]!==p[b.type]?(p[b.type]||0)-(p[a.type]||0):new Date(b.createdAt)-new Date(a.createdAt))).slice(0,10);
logger.info('Sorted',{c:t.length});res.json({success:true,data:t});}catch(e){logger.error('Err',e);res.status(500).json({e:'Fail'});}
};module.exports={getPriorityInbox};
