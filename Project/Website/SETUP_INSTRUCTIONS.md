# ScrapWale Website - Complete Setup Instructions

## 📋 Overview

This is a React-based website for ScrapWale that displays non-login pages:
- **Home** - Landing page with services and live rates
- **Rates & Calculator** - Interactive scrap value calculator
- **Request Form** - Scrap collection booking form

**Note**: Login functionality is removed as per requirements.

## 🎯 Features

✅ Fully responsive design (Desktop, Tablet, Mobile)
✅ Modern UI matching the app design
✅ Interactive scrap calculator
✅ Real-time form validation
✅ Offline fallback support
✅ Browser-optimized layout
✅ No authentication required

## 📁 Project Structure

```
Website/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── pages/
│   │   ├── Home.js            # Home page component
│   │   ├── Home.css           # Home page styles
│   │   ├── Rates.js           # Rates & calculator page
│   │   ├── Rates.css          # Rates page styles
│   │   ├── Request.js         # Request form page
│   │   └── Request.css        # Request form styles
│   ├── services/
│   │   └── dataService.js     # API service layer
│   ├── App.js                 # Main app component with routing
│   ├── App.css                # App styles
│   ├── index.js               # Entry point
│   └── index.css              # Global styles
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── README.md                  # Detailed documentation
├── QUICK_START.md             # Quick start guide
└── SETUP_INSTRUCTIONS.md      # This file
```

## 🚀 Installation Steps

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Navigate to Website Directory
```bash
cd "a:\BE Project\Project\Website"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- react (^18.2.0)
- react-dom (^18.2.0)
- react-router-dom (^6.20.0)
- axios (^1.6.2)
- react-scripts (5.0.1)

### Step 3: Configure Environment (Optional)
```bash
# Copy the example env file
copy .env.example .env

# Edit .env and set your backend API URL
# REACT_APP_API_URL=http://localhost:3000/api
```

### Step 4: Start Development Server
```bash
npm start
```

The website will automatically open at `http://localhost:3000`

## 🌐 Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, rates, and services |
| `/rates` | Rates & Calculator | Interactive calculator and rate listing |
| `/request` | Request Form | Scrap collection booking form |

## 🎨 Design System

### Color Palette
- **Primary Green**: `#1e9d47` - Main brand color
- **Dark Green**: `#178a3c` - Hover states
- **Light Green**: `#f0f9f4` - Backgrounds
- **Success Green**: `#e8f5e8` - Success states
- **Text Dark**: `#333` - Primary text
- **Text Medium**: `#666` - Secondary text
- **Error Red**: `#ff6b6b` - Error states

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto')
- **Headings**: Bold, 1.75rem - 2.75rem
- **Body**: Regular, 1rem - 1.25rem
- **Small**: 0.85rem - 0.95rem

### Spacing
- **Container Padding**: 5% (Desktop), 4% (Mobile)
- **Section Padding**: 3rem - 5rem (Desktop), 2rem - 3rem (Mobile)
- **Element Gap**: 1rem - 2rem

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 769px) { ... }

/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }
```

## 🔧 Configuration

### Backend API Integration

The website connects to your backend API. Configure in `.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

### API Endpoints Used

1. **GET** `/scrapDetails/get` - Fetch scrap rates
2. **GET** `/timeSlots?date=YYYY-MM-DD` - Get available time slots
3. **POST** `/userRequests/add` - Submit pickup request

### Fallback Data

If backend is unavailable, the website uses fallback data:
- Default scrap rates (Paper, Metal, Plastic)
- Standard time slots (8 AM - 6 PM)
- Offline request saving (localStorage)

## 🧪 Testing

### Manual Testing Checklist

#### Home Page
- [ ] Hero section displays correctly
- [ ] Rates slider is scrollable
- [ ] Service cards are visible
- [ ] Navigation works
- [ ] Footer displays contact info

#### Rates Page
- [ ] Calculator toggle works
- [ ] Category dropdown populates
- [ ] Type dropdown filters by category
- [ ] Quantity input calculates total
- [ ] Rate cards are clickable
- [ ] Category filter works

#### Request Form
- [ ] All form fields validate
- [ ] Quick date buttons work
- [ ] Date picker allows future dates only
- [ ] Time slots display correctly
- [ ] Form submission works
- [ ] Success modal appears

### Browser Testing
Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Device Testing
Test on:
- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667, 414x896)

## 📦 Building for Production

### Create Production Build
```bash
npm run build
```

This creates an optimized build in the `build/` folder with:
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Service worker (optional)

### Build Output
```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
└── asset-manifest.json
```

## 🚀 Deployment Options

### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/scrapwale"

# Install gh-pages
npm install --save-dev gh-pages

# Add deploy scripts
"predeploy": "npm run build"
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

### Option 4: Traditional Hosting
1. Build the project: `npm run build`
2. Upload `build/` folder contents to your web server
3. Configure server to serve `index.html` for all routes

## 🔍 Troubleshooting

### Issue: npm install fails
**Solution**: 
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use
**Solution**:
```bash
# Use different port
set PORT=3001 && npm start
```

### Issue: API connection fails
**Solution**:
- Check backend is running
- Verify API URL in `.env`
- Check browser console for CORS errors
- Website will use fallback data automatically

### Issue: Build fails
**Solution**:
```bash
# Check for syntax errors
npm run build

# Clear build cache
rmdir /s /q build
npm run build
```

## 📊 Performance Optimization

### Already Implemented
✅ Code splitting with React Router
✅ Lazy loading of routes
✅ Optimized images (emoji icons)
✅ Minimal dependencies
✅ CSS optimization
✅ Production build minification

### Additional Optimizations (Optional)
- Add image compression
- Implement service worker for offline support
- Add CDN for static assets
- Enable gzip compression on server

## 🔒 Security Considerations

✅ No sensitive data in frontend
✅ Environment variables for API URLs
✅ Input validation on all forms
✅ XSS protection (React default)
✅ HTTPS recommended for production

## 📈 Analytics (Optional)

To add Google Analytics:

1. Add to `public/index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 📞 Support

For technical support:
- **Email**: support@scrapwale.in
- **Phone**: +91 98765 43210
- **Location**: Pune, Maharashtra

## ✅ Final Checklist

Before going live:
- [ ] All pages load correctly
- [ ] Forms validate properly
- [ ] API integration works
- [ ] Responsive on all devices
- [ ] Tested in all browsers
- [ ] Production build created
- [ ] Environment variables set
- [ ] Analytics configured (optional)
- [ ] Domain configured
- [ ] SSL certificate installed

## 🎉 You're All Set!

Your ScrapWale website is ready to help users:
1. View current scrap rates
2. Calculate scrap value
3. Book pickup requests

**Happy Recycling! ♻️**
