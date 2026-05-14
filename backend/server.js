require('dotenv').config();

const express=require('express');
const cors=require('cors');

const {loggingMiddleware,logger}=require('../middleware/loggingMiddleware');

const nr=require('./routes/notificationRoutes');

const app=express();

app.use(loggingMiddleware);

app.use(cors());
app.use(express.json());

app.use('/api/notifications',nr);

app.get('/',(req,res)=>{
res.json({m:'Running'})
});

app.use((err,req,res,next)=>{

logger.error(err.message);

res.status(500).json({
e:'Error'
})

});

app.listen(5000,()=>{

console.log('server running');

logger.info('Started');

});