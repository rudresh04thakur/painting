import dbConnect from '../../../lib/dbConnect';
import Painting from '../../../server/models/Painting';

export default async function handler(req, res) {
  const { method } = req;
  const { page = 1, limit = 10, featured, category, artist, style, onSale, customizable, sort = 'newest' } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const query = {};
        if (featured) query.isFeatured = featured === 'true';
        if (category) query.category = category;
        if (artist) query.artist = artist;
        if (style) query.style = style;
        if (onSale) query.onSale = onSale === 'true';
        if (customizable) query.customizable = customizable === 'true';

        const sortOptions = {};
        if (sort === 'price_asc') sortOptions.price = 1;
        else if (sort === 'price_desc') sortOptions.price = -1;
        else if (sort === 'oldest') sortOptions.createdAt = 1;
        else sortOptions.createdAt = -1; // newest by default

        const paintings = await Painting.find(query)
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .lean();
        
        const total = await Painting.countDocuments(query);

        res.status(200).json({ 
          success: true, 
          items: paintings,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
