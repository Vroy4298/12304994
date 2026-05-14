const axios=require('axios')

class AF_JG{

async log(stack,level,pkg,message){

try{

await axios.post(
'http://4.224.186.213/evaluation-service/logs',

{
stack,
level,
package:pkg,
message
},

{
headers:{
Authorization:`Bearer ${process.env.TOKEN}`
}
}
)

}catch(err){
console.log(err.message)
}

}

info(m){
return this.log('backend','info','controller',m)
}

error(m){
return this.log('backend','error','controller',m)
}

warn(m){
return this.log('backend','warn','controller',m)
}

}

const logger=new AF_JG()

const loggingMiddleware=async(req,res,next)=>{
await logger.info(`${req.method} ${req.originalUrl}`)
next()
}

module.exports={logger,loggingMiddleware}