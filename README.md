# 🚔 Blaulicht Atlas 24

**Live interactive map of police incidents in Germany**

Blaulicht Atlas 24 is a real-time web application that displays police incidents across Germany on an interactive map. The application fetches data from various sources including police press releases, social media, and public APIs, then presents them in a clean, minimalist interface focused on the map visualization.

![Blaulicht Atlas 24 Screenshot](https://via.placeholder.com/800x400?text=Blaulicht+Atlas+24+Screenshot)

## ✨ Features

- 🗺️ **Interactive Map**: Leaflet.js-powered map of Germany with incident markers
- 🎛️ **Advanced Filtering**: Filter by incident category, severity, time range, and location
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates**: Automatic data refresh every 5 minutes
- 🏷️ **Categorization**: 12 incident categories with color-coded markers
- 📊 **Statistics**: Live statistics and incident summaries
- 🔍 **Detailed Views**: Comprehensive incident details in modal popups
- 🌐 **Production Ready**: Configured for deployment with security, caching, and error handling

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **ES6 Modules** - Modern JavaScript syntax

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Leaflet.js** - Interactive maps
- **CSS3** with **Custom Properties** - Modern styling
- **Responsive Design** - Mobile-first approach

### Infrastructure
- **In-memory Caching** - 5-minute cache for performance
- **Error Handling** - Comprehensive error management
- **Environment Configuration** - dotenv for configuration management
- **Process Management** - PM2 ready with Procfile

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blaulichtatlas24.git
   cd blaulichtatlas24
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
blaulichtatlas24/
├── server/                 # Backend Express.js application
│   ├── index.js           # Main server entry point
│   ├── routes/            # API endpoints
│   │   └── incidents.js   # Incidents API routes
│   ├── services/          # Business logic services
│   │   └── fetchData.js   # Data fetching and normalization
│   └── utils/             # Utility functions
│       └── dateFilter.js  # Date filtering helpers
├── client/                # Frontend static files
│   ├── index.html        # Main HTML page
│   ├── main.js           # Main application logic
│   ├── styles.css        # CSS styles
│   └── components/       # JavaScript components
│       └── filters.js    # Filter management
├── .env.example          # Environment configuration template
├── package.json          # Node.js dependencies and scripts
├── Procfile              # Deployment configuration
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Basic Configuration
NODE_ENV=development          # Environment: development/production
PORT=3000                    # Server port

# Security
SESSION_SECRET=your-secret   # Session secret for security
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS

# External APIs (Future Integration)
TWITTER_API_KEY=             # Twitter API for police feeds
BKA_API_KEY=                 # Federal Crime Office API
```

### API Integration

The application currently uses dummy data for development. To integrate real data sources:

1. **Police APIs**: Update `server/services/fetchData.js`
2. **Social Media**: Configure Twitter API credentials
3. **Web Scraping**: Implement parsing for police websites

## 📡 API Endpoints

### GET `/api/incidents`
Returns filtered incident data.

**Query Parameters:**
- `category` - Filter by incident categories (comma-separated)
- `severity` - Minimum severity level (low, medium, high, critical)
- `last24h` - Show only incidents from last 24 hours (default: true)
- `lat` & `lng` - Center coordinates for radius filtering
- `radius` - Radius in kilometers (default: 50)
- `limit` - Maximum number of results
- `sort` - Sort order (newest, oldest, severity)

**Example:**
```bash
GET /api/incidents?category=theft,burglary&severity=medium&limit=20
```

### GET `/api/incidents/:id`
Returns specific incident details.

### GET `/api/incidents/categories`
Returns available incident categories with metadata.

### GET `/api/incidents/stats/summary`
Returns incident statistics and summaries.

### GET `/health`
Health check endpoint for monitoring.

## 🏗️ Development

### Available Scripts

```bash
# Development server with auto-restart
npm run dev

# Production server
npm start

# Run tests (when implemented)
npm test
```

### Development Workflow

1. **Backend Development**: Modify files in `server/`
2. **Frontend Development**: Modify files in `client/`
3. **API Testing**: Use tools like Postman or curl
4. **Browser Testing**: Open http://localhost:3000

### Adding New Features

1. **New API Endpoints**: Add to `server/routes/`
2. **Data Sources**: Update `server/services/fetchData.js`
3. **Frontend Components**: Add to `client/components/`
4. **Styling**: Update `client/styles.css`

## 🌐 Deployment

### Deployment Platforms

The application is configured for deployment on:

- **Heroku**
- **Railway**
- **Render**
- **Vercel**
- **DigitalOcean App Platform**
- **Custom VPS**

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create blaulichtatlas24
   ```

3. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://blaulichtatlas24.herokuapp.com
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect Repository**: Link GitHub repository in Railway dashboard
2. **Configure Variables**: Set environment variables in Railway dashboard
3. **Auto Deploy**: Railway will automatically deploy on git push

### Custom VPS Deployment

#### Server Setup

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone and Setup**
   ```bash
   git clone https://github.com/yourusername/blaulichtatlas24.git
   cd blaulichtatlas24
   npm install --production
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

5. **Start with PM2**
   ```bash
   pm2 start server/index.js --name "blaulichtatlas24"
   pm2 startup
   pm2 save
   ```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Domain Setup

1. **DNS Configuration**
   - Add A record pointing to your server IP
   - Add CNAME for www subdomain (optional)

2. **Server Configuration**
   - Update `FRONTEND_URL` in environment variables
   - Configure Nginx virtual host
   - Set up SSL certificate

## 🔒 Security Considerations

### Production Security

- **Helmet.js**: Security headers
- **CORS**: Configured for production domain
- **Rate Limiting**: API request limits (planned)
- **Environment Variables**: Sensitive data protection
- **Input Validation**: API parameter validation
- **Error Handling**: No information leakage

### Data Privacy

- **No User Tracking**: No personal data collection
- **Public Data Only**: Only public police reports
- **Anonymization**: Remove sensitive details
- **GDPR Compliance**: EU data protection standards

## 📊 Monitoring and Maintenance

### Health Monitoring

- Health check endpoint: `/health`
- PM2 process monitoring
- Log file rotation (planned)
- Uptime monitoring services (recommended)

### Performance

- **Caching**: 5-minute data cache
- **CDN**: Static asset delivery (recommended)
- **Compression**: Gzip compression enabled
- **Minification**: CSS/JS optimization (planned)

## ⚠️ Disclaimer

**Important Notice:**

This application is for informational purposes only. The data displayed may not be complete, accurate, or up-to-date. In case of emergencies, always contact:

- **Police**: 110
- **Fire Department/Ambulance**: 112

Do not rely solely on this application for emergency information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Issues**: GitHub Issues for bug reports
- **Questions**: Create discussions for questions
- **Documentation**: This README and code comments

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in .env file
   PORT=3001
   ```

2. **Module Not Found**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **API Errors**
   - Check server logs in terminal
   - Check network tab in browser developer tools

4. **Map Not Loading**
   - Check internet connection
   - Verify Leaflet.js CDN availability
   - Check browser console for errors

---

**Made with ❤️ for public safety transparency in Germany** 🇩🇪
