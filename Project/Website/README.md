# ScrapWale Website

A modern, responsive React website for ScrapWale - Turn your scrap into cash instantly!

## Features

- **Home Page**: Hero section with current market rates and services overview
- **Rates & Calculator Page**: Interactive scrap value calculator with live rates
- **Request Form Page**: Easy-to-use booking form for scrap collection pickup

## Pages

### 1. Home (`/`)
- Hero section with call-to-action
- Live scrap rates slider
- Services showcase
- Footer with contact information

### 2. Rates & Calculator (`/rates`)
- Interactive calculator to estimate scrap value
- Category-wise filtering
- Real-time rate display
- Click on any rate to auto-fill calculator

### 3. Request Form (`/request`)
- User-friendly booking form
- Quick date selection
- Time slot picker
- Form validation
- Success confirmation modal

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern features

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the Website directory:
```bash
cd "a:\BE Project\Project\Website"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```
REACT_APP_API_URL=http://localhost:3000/api
```

### Running the Development Server

```bash
npm start
```

The website will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
Website/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Rates.js
│   │   ├── Rates.css
│   │   ├── Request.js
│   │   └── Request.css
│   ├── services/
│   │   └── dataService.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## API Integration

The website connects to the backend API for:
- Fetching scrap rates
- Getting available time slots
- Submitting pickup requests

If the backend is unavailable, the website uses fallback data to ensure functionality.

## Responsive Design

The website is fully responsive and works seamlessly on:
- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features Highlights

### Home Page
- Animated live indicator for rate updates
- Horizontal scrollable rate cards
- Hover effects on service cards
- Sticky navigation header

### Rates Page
- Collapsible calculator section
- Category filtering
- Grid layout for rates
- Auto-fill calculator on rate click

### Request Page
- Quick date selection buttons
- Visual time slot picker
- Real-time form validation
- Success modal with animations

## Color Scheme

- Primary Green: `#1e9d47`
- Light Green: `#f0f9f4`
- Dark Green: `#178a3c`
- Text: `#333`
- Secondary Text: `#666`
- Error: `#ff6b6b`

## Contributing

This is a private project for ScrapWale.

## License

© 2024 ScrapWale. All rights reserved.
