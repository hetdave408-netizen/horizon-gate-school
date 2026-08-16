// Vercel serverless functions are short-lived, so opening a fresh MongoDB
// connection on every request would exhaust connections fast. This caches
// the connection on the global object, which Vercel reuses across "warm"
// invocations of the same function instance.

const mongoose = require('mongoose');

let cached = global._hgMongooseConn;
if (!cached) {
  cached = global._hgMongooseConn = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set (set it in Vercel → Project → Settings → Environment Variables).');
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };
