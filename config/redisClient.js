// redisClient.js
import redis from 'redis'

const redisClient = redis.createClient({
  host: '127.0.0.1', // or your redis host
  port: 6379,        // default Redis port

});

redisClient.on('connect', () => {
  console.log('✅ Redis connected!');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});


export default redisClient
