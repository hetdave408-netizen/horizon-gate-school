const { connectToDatabase } = require('./_lib/db');
const GalleryItem = require('./_lib/models/GalleryItem');
const { isAdminAuthorized } = require('./_lib/adminAuth');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    const admin = isAdminAuthorized(req);

    if (req.method === 'GET') {
      const filter = admin ? {} : { published: true };
      if (req.query.category) filter.category = req.query.category;
      const items = await GalleryItem.find(filter).sort({ createdAt: -1 }).limit(200);
      return res.status(200).json(items);
    }

    // Everything below this line manages content — admin only.
    if (!admin) return res.status(401).json({ error: 'Invalid admin password.' });

    if (req.method === 'POST') {
      const { caption, category, imageUrl, fullImageUrl, published } = req.body || {};
      if (!caption || !category || !imageUrl) {
        return res.status(400).json({ error: 'caption, category, and imageUrl are required.' });
      }
      const item = await GalleryItem.create({
        caption: String(caption).slice(0, 200),
        category,
        imageUrl: String(imageUrl).slice(0, 500),
        fullImageUrl: fullImageUrl ? String(fullImageUrl).slice(0, 500) : undefined,
        published: published !== false,
      });
      return res.status(201).json(item);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required.' });
      const item = await GalleryItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ error: 'Not found.' });
      return res.status(200).json(item);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id query param is required.' });
      await GalleryItem.findByIdAndDelete(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('/api/gallery error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
