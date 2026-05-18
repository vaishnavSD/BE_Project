# ScrapWale Website - Features Guide

## 🏠 Page 1: Home Page (`/`)

### Header Section
```
┌─────────────────────────────────────────────────────┐
│  ♻ ScrapWale              [Book Pickup Button]     │
└─────────────────────────────────────────────────────┘
```
- **Logo**: Green recycling symbol with "ScrapWale" text
- **Navigation**: Single "Book Pickup" button (no login)
- **Sticky**: Stays at top when scrolling

### Hero Section
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     Turn Scrap into Cash Instantly!                │
│                                                     │
│  ScrapWale helps you recycle paper, plastic,       │
│  and metal — and get paid at your doorstep.        │
│                                                     │
│         [Schedule a Pickup Button]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Background**: Light green gradient
- **Typography**: Large, bold headline
- **CTA**: Prominent green button

### Current Market Rates
```
┌─────────────────────────────────────────────────────┐
│  📈 Current Market Rates          [🔴 LIVE]        │
│  Updated daily                                      │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 📄   │  │ ⚙️   │  │ 🧴   │  │ 📄   │  →       │
│  │News  │  │Iron  │  │Plastic│  │Books │          │
│  │₹12/kg│  │₹25/kg│  │₹8/kg │  │₹11/kg│          │
│  └──────┘  └──────┘  └──────┘  └──────┘          │
│                                                     │
│      [📊 View Calculator & All Rates]              │
└─────────────────────────────────────────────────────┘
```
- **Live Indicator**: Red dot with "LIVE" badge
- **Horizontal Scroll**: Swipe to see more rates
- **Cards**: White cards with green accent
- **Icons**: Category-specific emojis

### Services Section
```
┌─────────────────────────────────────────────────────┐
│              Our Services                           │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    📄    │  │    ⚙️    │  │    🧴    │        │
│  │  Paper   │  │  Metal   │  │  Plastic │        │
│  │  Scrap   │  │  Scrap   │  │  Scrap   │        │
│  │          │  │          │  │          │        │
│  │ Recycle  │  │ Sell for │  │ Collect  │        │
│  │newspapers│  │fair rates│  │responsibly│       │
│  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────┘
```
- **Grid Layout**: 3 cards on desktop, 1 on mobile
- **Hover Effect**: Cards lift up on hover
- **Icons**: Large emoji icons

### Footer
```
┌─────────────────────────────────────────────────────┐
│              ScrapWale                              │
│         📍 Pune, Maharashtra                        │
│  📞 +91 98765 43210 | ✉ support@scrapwale.in      │
│     © 2026 ScrapWale. All rights reserved.         │
└─────────────────────────────────────────────────────┘
```
- **Background**: Green (#1e9d47)
- **Text**: White, centered
- **Contact Info**: Icons with details

---

## 📊 Page 2: Rates & Calculator (`/rates`)

### Header
```
┌─────────────────────────────────────────────────────┐
│  ♻ ScrapWale              [← Back to Home]         │
└─────────────────────────────────────────────────────┘
```

### Title Section
```
┌─────────────────────────────────────────────────────┐
│         Scrap Value Calculator                      │
│  Calculate the value of your scrap materials        │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  📱 Hide Calculator              ▲        │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```
- **Toggle Button**: Show/hide calculator
- **Green Background**: Matches brand

### Calculator (Expanded)
```
┌─────────────────────────────────────────────────────┐
│  🧮 Scrap Calculator                                │
│  Select your scrap category and type                │
│                                                     │
│  Category:  [Select Category ▼]                    │
│  Type:      [Select Type ▼]                        │
│  Rate:      ₹0                                      │
│  Quantity:  [Enter quantity] kg                     │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │         Total Amount                       │    │
│  │            ₹0.00                          │    │
│  │         0 kg × ₹0/kg                      │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│         [Reset Calculator]                          │
└─────────────────────────────────────────────────────┘
```
- **Dropdowns**: Category → Type (cascading)
- **Auto-calculate**: Updates on quantity change
- **Total Display**: Large, prominent green text
- **Reset Button**: Red, clears all fields

### Category Filter
```
┌─────────────────────────────────────────────────────┐
│  [All] [Paper] [Metal] [Plastic]                   │
└─────────────────────────────────────────────────────┘
```
- **Pills**: Rounded buttons
- **Active State**: Green background
- **Horizontal Scroll**: On mobile

### Rates Grid
```
┌─────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐               │
│  │ 📄 Newspaper │  │ ⚙️ Iron      │               │
│  │ paper        │  │ metal        │               │
│  │        ₹12   │  │        ₹25   │               │
│  │     per kg   │  │     per kg   │               │
│  └──────────────┘  └──────────────┘               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ 🧴 Plastic   │  │ 📄 Cardboard │               │
│  │ plastic      │  │ paper        │               │
│  │        ₹8    │  │        ₹10   │               │
│  │     per kg   │  │     per kg   │               │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘
```
- **Grid**: 2-4 columns (responsive)
- **Clickable**: Auto-fills calculator
- **Hover**: Lifts up with shadow

---

## 📝 Page 3: Request Form (`/request`)

### Header
```
┌─────────────────────────────────────────────────────┐
│  ♻ ScrapWale              [← Back to Home]         │
└─────────────────────────────────────────────────────┘
```

### Form Header
```
┌─────────────────────────────────────────────────────┐
│                    🗑️                               │
│                                                     │
│        Scrap Collection Booking                     │
│  Schedule a pickup for your recyclable materials    │
└─────────────────────────────────────────────────────┘
```

### Form Fields
```
┌─────────────────────────────────────────────────────┐
│  Name *                                             │
│  [Enter your full name...........................]  │
│                                                     │
│  Mobile No *              Email *                   │
│  [Enter mobile....]    [Enter email...........]    │
│                                                     │
│  Address *                                          │
│  [Enter your complete address with landmarks...]   │
│  [                                              ]   │
│                                                     │
│  Pickup Date *                                      │
│  [Mon, May 19] [Tue, May 20] [Wed, May 21]        │
│  [📅 2026-05-19]                                   │
│  📅 Select a date from tomorrow up to 30 days      │
│                                                     │
│  Time Slot *                                        │
│  ┌─────────────────────────────────────────┐      │
│  │ 8:00 AM - 10:00 AM                      │      │
│  ├─────────────────────────────────────────┤      │
│  │ 10:00 AM - 12:00 PM                     │      │
│  ├─────────────────────────────────────────┤      │
│  │ 12:00 PM - 2:00 PM                      │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  Description *                                      │
│  [Describe the type and quantity of scrap...]      │
│  [                                              ]   │
│  [                                              ]   │
│                                                     │
│         [📅 Book Pickup]                           │
└─────────────────────────────────────────────────────┘
```

### Form Features
- **Quick Dates**: Next 3 days as buttons
- **Date Picker**: HTML5 date input
- **Time Slots**: Visual selection buttons
- **Validation**: Real-time error messages
- **Required Fields**: Marked with *

### Success Modal
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    ✅                               │
│                                                     │
│                 Success!                            │
│                                                     │
│  Your scrap collection has been booked             │
│  successfully! We'll contact you within            │
│  24 hours to confirm the details.                  │
│                                                     │
│  [Go to Home]  [Book Another]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Overlay**: Semi-transparent dark background
- **Animation**: Slides in from top
- **Actions**: Two clear options

---

## 🎨 Design Elements

### Color Usage
```
Primary Green (#1e9d47)
├── Buttons
├── Headers
├── Active states
└── Footer background

Light Green (#f0f9f4)
├── Hero background
├── Section backgrounds
└── Hover states

White (#ffffff)
├── Cards
├── Form inputs
└── Main background

Dark Text (#333)
├── Headings
└── Body text

Medium Text (#666)
├── Subtitles
└── Helper text
```

### Typography Scale
```
Hero Title:     2.75rem (44px)
Page Title:     2.5rem (40px)
Section Title:  2rem (32px)
Card Title:     1.5rem (24px)
Body Text:      1rem (16px)
Small Text:     0.9rem (14px)
```

### Spacing System
```
Section Padding:  3-5rem
Card Padding:     2rem
Input Padding:    1rem
Button Padding:   1rem 2rem
Gap:              1-2rem
```

### Border Radius
```
Buttons:    6-10px
Cards:      12px
Containers: 16-20px
Pills:      20px
```

---

## 📱 Responsive Behavior

### Desktop (1400px+)
- Full-width layout
- Multi-column grids
- Horizontal rate slider
- Side-by-side form fields

### Tablet (768px - 1399px)
- Adapted grid columns
- Stacked navigation
- Adjusted spacing
- Touch-friendly buttons

### Mobile (< 768px)
- Single column layout
- Stacked form fields
- Full-width buttons
- Vertical scrolling
- Touch-optimized

---

## ⚡ Interactive Features

### Hover Effects
- **Buttons**: Lift up, darker color
- **Cards**: Shadow increase, slight lift
- **Links**: Color change
- **Inputs**: Border color change

### Click Actions
- **Rate Cards**: Auto-fill calculator
- **Quick Dates**: Select date
- **Time Slots**: Select slot
- **Toggle**: Show/hide calculator

### Animations
- **Page Load**: Fade in
- **Modal**: Slide in from top
- **Hover**: Smooth transitions
- **Loading**: Spinner rotation

### Validation
- **Real-time**: As user types
- **Visual**: Red border + message
- **Helpful**: Clear error messages
- **Preventive**: Disable past dates

---

## 🎯 User Flows

### Flow 1: View Rates
```
Home → Click "View Calculator & All Rates"
     → Rates Page → View all rates
     → Filter by category
     → Click rate to calculate
```

### Flow 2: Calculate Value
```
Rates Page → Select category
          → Select type
          → Enter quantity
          → See total amount
          → Reset if needed
```

### Flow 3: Book Pickup
```
Home → Click "Book Pickup"
     → Request Page → Fill form
     → Select date (quick or calendar)
     → Choose time slot
     → Submit → Success modal
     → Go home or book another
```

---

## ✨ Special Features

### 1. Smart Calculator
- Cascading dropdowns (category → type)
- Auto-calculation on quantity change
- Click any rate card to auto-fill
- Visual total display with breakdown

### 2. Date Selection
- Quick buttons for next 3 days
- HTML5 date picker
- Prevents past dates
- Max 30 days ahead

### 3. Time Slot Picker
- Visual button selection
- Shows availability
- Disabled slots marked
- Single selection

### 4. Form Validation
- Real-time validation
- Field-specific messages
- Prevents invalid submission
- Helper text for guidance

### 5. Offline Support
- Fallback data if API fails
- Graceful error handling
- User-friendly messages
- Continues to function

---

## 🎊 Summary

**3 Pages** | **Fully Responsive** | **No Login Required**

✅ Modern design matching app
✅ Interactive calculator
✅ Easy booking form
✅ Real-time validation
✅ Success feedback
✅ Offline support
✅ Browser optimized

**Ready to deploy and use!** 🚀
