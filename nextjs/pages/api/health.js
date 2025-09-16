// Health check endpoint for Next.js frontend
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'healthy',
      service: 'Study Partner Frontend',
      timestamp: new Date().toISOString()
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
