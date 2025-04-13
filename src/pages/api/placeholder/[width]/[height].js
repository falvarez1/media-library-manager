export default function handler(req, res) {
  const { width, height } = req.query;
  
  // Set the response content type to a PNG image
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // Create a simple SVG placeholder with the requested dimensions
  const svg = `
    <svg 
      width="${width}" 
      height="${height}" 
      viewBox="0 0 ${width} ${height}" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill="#f3f4f6" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      <text 
        x="50%" 
        y="50%" 
        font-family="sans-serif" 
        font-size="24" 
        text-anchor="middle" 
        dominant-baseline="middle"
        fill="#9ca3af"
      >
        ${width} × ${height}
      </text>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 0 20 L 20 20 L 20 0" fill="none" stroke="#e5e7eb" stroke-width="1"/>
        </pattern>
      </defs>
    </svg>
  `;

  // Send the SVG as the response
  res.status(200).send(svg);
}
