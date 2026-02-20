import dbConnect from '../../../lib/dbConnect';
import { Config } from '../../../server/models/Config';

export default async function handler(req, res) {
  const {
    query: { key },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const config = await Config.findOne({ key }).lean();
        if (!config) {
          return res.status(404).json({ success: false, error: 'Config not found' });
        }
        res.status(200).json(config.value);
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
