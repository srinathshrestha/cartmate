import Redis from "ioredis";

/**
 * Redis client for caching and pub/sub functionality.
 * Supports WebSocket real-time synchronization across instances.
 * Uses separate clients for pub/sub to avoid blocking.
 */

// Check if Redis URL is configured
if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL not configured. Redis features will be disabled.");
}

/**
 * Creates a new Redis client instance.
 * @param {string} name - Client name for debugging
 * @returns {Redis|null} Redis client or null if not configured
 */
function createRedisClient(name = "default") {
  if (!process.env.REDIS_URL) {
    return null;
  }

  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error(`Redis ${name} connection failed after 3 retries`);
        return null;
      }
      // Exponential backoff: 50ms, 100ms, 200ms
      return Math.min(times * 50, 2000);
    },
    lazyConnect: false,
  });

  client.on("error", (error) => {
    console.error(`Redis ${name} error:`, error.message);
  });

  client.on("connect", () => {
    console.log(`Redis ${name} connected`);
  });

  return client;
}

// Main Redis client for general operations (caching, etc.)
const redis = createRedisClient("main");

// Separate publisher client for pub/sub (recommended by ioredis)
const publisher = createRedisClient("publisher");

// Separate subscriber client for pub/sub (recommended by ioredis)
const subscriber = createRedisClient("subscriber");

/**
 * Redis channel names for different event types.
 * Format: "list:{listId}:{eventType}"
 */
export const CHANNELS = {
  ITEMS: (listId) => `list:${listId}:items`,
  MESSAGES: (listId) => `list:${listId}:messages`,
  MEMBERS: (listId) => `list:${listId}:members`,
};

/**
 * Publishes an event to a Redis channel.
 * @param {string} channel - Redis channel name
 * @param {Object} data - Event data to publish
 * @returns {Promise<number>} Number of subscribers that received the message
 */
export async function publishEvent(channel, data) {
  if (!publisher) {
    console.warn("Redis publisher not available, skipping event publication");
    return 0;
  }

  try {
    const payload = JSON.stringify(data);
    const count = await publisher.publish(channel, payload);
    return count;
  } catch (error) {
    console.error("Redis publish error:", error);
    return 0;
  }
}

/**
 * Subscribes to a Redis channel and handles incoming events.
 * @param {string} channel - Redis channel name
 * @param {Function} handler - Callback function for handling events
 */
export async function subscribeToChannel(channel, handler) {
  if (!subscriber) {
    console.warn("Redis subscriber not available, cannot subscribe");
    return;
  }

  try {
    await subscriber.subscribe(channel);

    subscriber.on("message", (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const data = JSON.parse(message);
          handler(data);
        } catch (error) {
          console.error("Redis message parse error:", error);
        }
      }
    });
  } catch (error) {
    console.error("Redis subscribe error:", error);
  }
}

/**
 * Unsubscribes from a Redis channel.
 * @param {string} channel - Redis channel name
 */
export async function unsubscribeFromChannel(channel) {
  if (!subscriber) {
    return;
  }

  try {
    await subscriber.unsubscribe(channel);
  } catch (error) {
    console.error("Redis unsubscribe error:", error);
  }
}

/**
 * Caches data in Redis with optional TTL.
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (optional)
 */
export async function cacheSet(key, value, ttl = null) {
  if (!redis) {
    return;
  }

  try {
    const payload = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, payload);
    } else {
      await redis.set(key, payload);
    }
  } catch (error) {
    console.error("Redis cache set error:", error);
  }
}

/**
 * Gets data from Redis cache.
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
export async function cacheGet(key) {
  if (!redis) {
    return null;
  }

  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Redis cache get error:", error);
    return null;
  }
}

/**
 * Deletes data from Redis cache.
 * @param {string} key - Cache key
 */
export async function cacheDel(key) {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis cache delete error:", error);
  }
}

/**
 * Stores user online status in Redis.
 * @param {string} userId - User ID
 * @param {string} listId - List ID
 * @param {boolean} online - Online status
 */
export async function setUserStatus(userId, listId, online) {
  const key = `user:${userId}:list:${listId}:status`;
  if (online) {
    await cacheSet(
      key,
      { online: true, lastSeen: new Date().toISOString() },
      300,
    ); // 5 min TTL
  } else {
    await cacheDel(key);
  }
}

/**
 * Gets user online status from Redis.
 * @param {string} userId - User ID
 * @param {string} listId - List ID
 * @returns {Promise<Object|null>} Status object or null
 */
export async function getUserStatus(userId, listId) {
  const key = `user:${userId}:list:${listId}:status`;
  return await cacheGet(key);
}

export default redis;
