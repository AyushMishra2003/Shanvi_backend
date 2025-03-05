import redis from "../redisClient.js";

export const addUser = async (req, res) => {
  const { id, name } = req.body;
  await redis.set(`user:${id}`, JSON.stringify({ id, name }));
  res.send("✅ User stored in Redis!");
};

export const getUser = async (req, res) => {
    try {
      const keys = await redis.keys("user:*"); // सभी user keys लो
  
      if (keys.length === 0) {
        return res.status(404).send("❌ No users found!");
      }
  
      const users = await redis.mget(keys); // सभी keys के values लो
      const parsedUsers = users.map(user => JSON.parse(user)); // JSON में बदलो
  
      res.json(parsedUsers); // Response भेजो
    } catch (error) {
      res.status(500).send("❌ Error fetching users");
    }
  };
  
