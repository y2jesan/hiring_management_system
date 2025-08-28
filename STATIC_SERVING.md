# Static File Serving Setup

The Hiring Management System is now configured to serve the React client application statically from the server on port 4000.

## How it works

1. **Server Configuration**: The Express server in `server/app.js` is configured to:
   - Serve API routes under `/api/*`
   - Serve static files from `client/dist/` directory
   - Provide SPA fallback for client-side routing

2. **Route Order**: The routes are ordered correctly to ensure:
   - API routes are handled first
   - Static files are served for non-API routes
   - SPA fallback handles client-side routing

## Quick Start

### Option 1: Using the provided script
```bash
./start-server.sh
```

### Option 2: Manual start
```bash
# Build the client (if not already built)
cd client
npm install
npm run build

# Start the server
cd ../server
npm install
npm start
```

## Access Points

- **Frontend Application**: http://localhost:4000
- **API Endpoints**: http://localhost:4000/api/*
- **Static Assets**: http://localhost:4000/assets/*

## Features

✅ **Static File Serving**: All files from `client/dist/` are served statically
✅ **API Integration**: All API endpoints work correctly under `/api/`
✅ **SPA Routing**: Client-side routing works with proper fallback
✅ **Asset Serving**: CSS, JS, images, and other assets are served correctly
✅ **Security**: Helmet.js security headers are applied
✅ **CORS**: Cross-origin requests are properly handled

## File Structure

```
hiring_management_system/
├── client/
│   ├── dist/           # Built React application
│   └── src/            # React source code
├── server/
│   ├── app.js          # Express app with static serving
│   ├── server.js       # Server entry point
│   └── routes/         # API routes
└── start-server.sh     # Quick start script
```

## Configuration

The server automatically serves the client application when:
- The `client/dist/` directory exists
- The server is running on port 4000
- No environment-specific conditions are required

## Troubleshooting

1. **404 errors**: Make sure the client is built (`npm run build` in client directory)
2. **API not working**: Check that routes are properly defined in server/routes/
3. **Assets not loading**: Verify the dist folder contains all built assets
4. **Port conflicts**: Ensure port 4000 is available

## Development vs Production

- **Development**: Use `npm run dev` in the client directory for hot reloading
- **Production**: Use the static serving setup for deployment
