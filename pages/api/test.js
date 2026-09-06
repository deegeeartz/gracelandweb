export default function handler(req, res) {
  res.status(200).json({ url: req.url, originalUrl: req.originalUrl, path: req.query });
}
