const express=require('express');const r=express.Router();
const {getPriorityInbox}=require('../controllers/notificationController');
r.get('/priority',getPriorityInbox);
r.get('/',(req,res)=>res.json({success:true,data:[{id:1,type:'Event',title:'T',createdAt:new Date(),isRead:false},{id:2,type:'Placement',title:'G',createdAt:new Date(),isRead:true},{id:3,type:'Result',title:'R',createdAt:new Date(),isRead:false}]}));
module.exports=r;
