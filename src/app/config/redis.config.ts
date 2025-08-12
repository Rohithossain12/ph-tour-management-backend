import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({
    username: envVars.REDIS_USERNAME,
    password:envVars.REDIS_PASSWORD,
    socket: {
        host: envVars.REDIS_HOST,
        port:Number(envVars.PORT)
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));



// await redisClient.set('foo', 'bar');
// const result = await redisClient.get('foo');
// console.log(result) 



 export const redisConnect =async()=>{
if(!redisClient.isOpen){
await redisClient.connect();
console.log("Redis Connected");
}
}
