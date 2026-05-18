# Quick Start Guide - ScrapWale Website

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd "a:\BE Project\Project\Website"
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

The website will automatically open at `http://localhost:3000`

### Step 3: Explore the Website
- **Home Page** (`/`) - View services and current rates
- **Rates & Calculator** (`/rates`) - Calculate scrap value
- **Request Form** (`/request`) - Book a pickup

## 🎨 Design Features

### No Login Required
This website shows only public pages - no authentication needed!

### Responsive Design
- ✅ Desktop optimized
- ✅ Tablet friendly
- ✅ Mobile responsive

### Browser Compatibility
Works perfectly in all modern browsers (Chrome, Firefox, Safari, Edge)

## 🔧 Configuration

### Backend API (Optional)
If you want to connect to the backend API:

1. Copy `.env.example` to `.env`
2. Update the API URL:
```
REACT_APP_API_URL=http://localhost:3000/api
```

### Fallback Mode
If backend is not available, the website automatically uses fallback data.

## 📱 Pages Overview

### 1. Home Page
- Hero section with tagline
- Live market rates slider
- Services showcase (Paper, Metal, Plastic)
- Footer with contact info

### 2. Rates & Calculator
- Interactive calculator
- Category filtering (All, Paper, Metal, Plastic)
- Click any rate to auto-fill calculator
- Toggle calculator visibility

### 3. Request Form
- Quick date selection (next 3 days)
- Calendar date picker
- Time slot selection
- Form validation
- Success modal

## 🎯 Key Features

### Smart Calculator
1. Select category (Paper/Metal/Plastic)
2. Choose specific type
3. Enter quantity in kg
4. See instant total amount

### Easy Booking
1. Fill in your details
2. Pick a date (tomorrow to 30 days ahead)
3. Select time slot
4. Describe your scrap
5. Submit and get confirmation

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 📦 Production Build

To create a production-ready build:

```bash
npm run build
```

This creates an optimized build in the `build/` folder ready for deployment.

## 🌐 Deployment

The built website can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 💡 Tips

1. **Quick Navigation**: Use the logo or back buttons to navigate
2. **Calculator Shortcut**: Click any rate card to auto-fill the calculator
3. **Date Selection**: Use quick buttons for next 3 days or pick custom date
4. **Form Validation**: All fields are validated in real-time

## 🎨 Customization

### Colors
Main colors are defined in CSS files:
- Primary: `#1e9d47` (Green)
- Background: `#f0f9f4` (Light Green)
- Text: `#333` (Dark Gray)

### Content
Update content in respective page files:
- `src/pages/Home.js` - Home page content
- `src/pages/Rates.js` - Rates page content
- `src/pages/Request.js` - Request form

## 📞 Support

For issues or questions:
- Email: support@scrapwale.in
- Phone: +91 98765 43210

## ✨ Enjoy using ScrapWale Website!
