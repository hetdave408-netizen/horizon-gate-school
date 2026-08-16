const { connectToDatabase } = require('./_lib/db');
const NewsPost = require('./_lib/models/NewsPost');
const { isAdminAuthorized } = require('./_lib/adminAuth');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    const admin = isAdminAuthorized(req);

    if (req.method === 'GET') {
      const filter = admin ? {} : { published: true };
      if (req.query.category) filter.category = req.query.category;
      const items = await NewsPost.find(filter).sort({ date: -1 }).limit(100);
      return res.status(200).json(items);
    }

    // Everything below this line manages content — admin only.
    if (!admin) return res.status(401).json({ error: 'Invalid admin password.' });

    if (req.method === 'POST') {
      const { title, category, date, excerpt, imageUrl, published } = req.body || {};
      if (!title || !category || !date) {
        return res.status(400).json({ error: 'title, category, and date are required.' });
      }
      const post = await NewsPost.create({
        title: String(title).slice(0, 200),
        category,
        date: new Date(date),
        excerpt: excerpt ? String(excerpt).slice(0, 500) : undefined,
        imageUrl: imageUrl ? String(imageUrl).slice(0, 500) : undefined,
        published: published !== false,
      });
      return res.status(201).json(post);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required.' });
      if (updates.date) updates.date = new Date(updates.date);
      const post = await NewsPost.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!post) return res.status(404).json({ error: 'Not found.' });
      return res.status(200).json(post);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id query param is required.' });
      await NewsPost.findByIdAndDelete(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('/api/news error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
