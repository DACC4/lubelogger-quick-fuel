# LubeLogger Quick Fuel
A Progressive Web Application for tracking vehicle fuel consumption. This application integrates with LubeLogger's API to provide offline-capable fuel logging functionality.

## Features
- 🚗 Vehicle selection and management
- ⛽ Fuel log entry with detailed tracking
- 📱 Progressive Web App (installable)
- 🔄 Offline functionality with automatic sync
- 🔒 Secure authentication
- 📊 Support for multiple fuel types
- 💾 Automatic form data saving

## Prerequisites
- Node.js (v23 or higher)
- npm or yarn
- A LubeLogger instance with API access

## Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/fuel-logger-pwa.git
cd fuel-logger-pwa
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a .env file in the root directory:
```env
REACT_APP_API_URL=https://your-lubelogger-instance.com
```

## Development
To run the application in development mode:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`

## Building for Production
To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be created in the `build/` directory.

## LubeLogger behind reverse proxy
Add this config to your NGINX Proxy Manager to allow CORS requests for /api route :
```
location /api {
   # CORS headers
   add_header 'Access-Control-Allow-Origin' '*' always;
   add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
   add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

   # Handle preflight requests (OPTIONS)
   if ($request_method = 'OPTIONS') {
      add_header 'Access-Control-Allow-Origin' '*' always;
      add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
      add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
      add_header 'Access-Control-Max-Age' 1728000;
      add_header 'Content-Type' 'text/plain charset=UTF-8';
      add_header 'Content-Length' 0;
      return 204;
   }

   proxy_pass $forward_scheme://$server:$port;
   proxy_set_header Host $host;
   proxy_cache_bypass $http_upgrade;
}
```

## Configuration
The application can be configured through environment variables:

- `REACT_APP_API_URL`: The URL of your LubeLogger instance
- `REACT_APP_CACHE_VERSION`: Version string for cache management
- `REACT_APP_SYNC_INTERVAL`: Interval for background sync (in milliseconds)

## Testing
Run the test suite:

```bash
npm test
# or
yarn test
```

## PWA Features
The application supports:
- Offline operation
- Background sync
- Add to home screen
- Push notifications (where supported)
- Automatic updates

## Project Structure
```
src/
├── api/              # API integration
├── components/       # React components
├── context/         # Context providers
├── hooks/           # Custom hooks
├── services/        # Business logic
├── utils/           # Utilities
└── ...
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Troubleshooting
### Common Issues
1. **App not working offline**
   - Check that the service worker is registered
   - Verify the cache configuration
   - Ensure all required assets are precached

2. **Authentication issues**
   - Verify your LubeLogger API URL
   - Check your credentials
   - Ensure cookies are enabled

3. **Sync not working**
   - Check your internet connection
   - Verify background sync is supported in your browser
   - Check the browser's task manager for background sync tasks

## License
MIT License - see LICENSE file for details

## Support
For support, please create an issue in the GitHub repository or contact the development team.