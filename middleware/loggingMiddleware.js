const fs=require('fs');const path=require('path');
class AF_JG{
constructor(){this.d=path.join(__dirname,'../logs');if(!fs.existsSync(this.d))fs.mkdirSync(this.d,{recursive:true});}
w(l,m,md){const f=path.join(this.d,`${new Date().toISOString().split('T')[0]}.log`);fs.appendFileSync(f,JSON.stringify({t:new Date().toISOString(),l,m,md})+'\n');}
log(l,m,md={}){this.w(l,m,md);}
info(m,md={}){this.w('INFO',m,md);}
warn(m,md={}){this.w('WARN',m,md);}
error(m,md={}){this.w('ERROR',m,md instanceof Error?{m:md.message,s:md.stack}:md);}
}
const logger=new AF_JG();
const loggingMiddleware=(req,res,next)=>{
const s=Date.now();
logger.info('Req',{m:req.method,u:req.originalUrl,i:req.ip,h:req.headers,b:req.body});
res.on('finish',()=>logger.info('Res',{m:req.method,u:req.originalUrl,s:res.statusCode,d:Date.now()-s}));
res.on('error',e=>logger.error('Err',e));
next();
};
module.exports={AF_JG,logger,loggingMiddleware};
