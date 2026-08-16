const { connectToDatabase } = require('./_lib/db');
const Teacher = require('./_lib/models/Teacher');
const { isAdminAuthorized } = require('./_lib/adminAuth');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    const admin = isAdminAuthorized(req);

    if (req.method === 'GET') {
      const filter = admin ? {} : { published: true };
      const items = await Teacher.find(filter).sort({ order: 1, createdAt: 1 }).limit(200);
      return res.status(200).json(items);
    }

    if (!admin) return res.status(401).json({ error: 'Invalid admin password.' });

    if (req.method === 'POST') {
      const { name, role, bio, qualifications, photoUrl, order, published } = req.body || {};
      if (!name || !role) return res.status(400).json({ error: 'name and role are required.' });
      const teacher = await Teacher.create({
        name: String(name).slice(0, 120),
        role: String(role).slice(0, 160),
        bio: bio ? String(bio).slice(0, 600) : undefined,
        qualifications: qualifications ? String(qualifications).slice(0, 300) : undefined,
        photoUrl: photoUrl ? String(photoUrl).slice(0, 500) : undefined,
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
        published: published !== false,
      });
      return res.status(201).json(teacher);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required.' });
      if (updates.order !== undefined) updates.order = Number(updates.order) || 0;
      const teacher = await Teacher.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!teacher) return res.status(404).json({ error: 'Not found.' });
      return res.status(200).json(teacher);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id query param is required.' });
      await Teacher.findByIdAndDelete(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('/api/teachers error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
