const { spawn } = require('child_process');
const net = require('net');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    // Bind to localhost specifically to catch conflicts
    server.listen(port, 'localhost');
  });
}

// Function to find an available port
async function findAvailablePort(startPort = 3000, maxPort = 3100) {
  for (let port = startPort; port <= maxPort; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    } else {
      console.log(`Port ${port} is in use, trying next...`);
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
}

// Main function
async function startDevServer() {
  try {
    const port = await findAvailablePort();
    console.log(`Starting development server on port ${port}...`);
    
    // Start Next.js dev server
    const child = spawn('npx', ['next', 'dev', '--turbopack', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: port.toString() }
    });

    child.on('error', (error) => {
      console.error('Failed to start dev server:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

startDevServer();