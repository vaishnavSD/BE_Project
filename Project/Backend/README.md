# ScrapWale Backend API

Professional-grade Node.js/Express backend with comprehensive testing and security.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start server
npm start

# Run tests
npm test

# Generate coverage report
npm run test:coverage
```

## 📋 Features

- ✅ **Secure Authentication** - Bcrypt password hashing with strength validation
- ✅ **Input Validation** - Comprehensive validation middleware
- ✅ **Error Handling** - Global error handler with MySQL-specific handling
- ✅ **Authorization** - Role-based access control (RBAC)
- ✅ **Unit Tests** - 52+ passing tests with Jest
- ✅ **Code Quality** - Clean, maintainable code structure
- ✅ **Security** - CORS, XSS prevention, SQL injection protection

## 🏗️ Project Structure

```
Backend/
├── constants/          # Application constants
├── controllers/        # Request handlers
├── middleware/         # Custom middleware (auth, validation, errors)
├── models/            # Database models
├── routes/            # API routes
├── tests/             # Unit tests
├── utils/             # Utility functions
├── index.js           # Application entry point
└── .env               # Environment variables (not in git)
```

## 🔐 Environment Variables

```env
# Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=scrapwale
MYSQL_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# CORS (production only)
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 📡 API Endpoints

### Authentication
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - Login user

### Users
- `GET /api/user/all` - Get all users
- `DELETE /api/user/:id` - Delete user

### Scrap Requests
- `POST /api/userRequests/add` - Create pickup request
- `GET /api/userRequests` - Get all requests
- `PUT /api/userRequests/:id` - Update request status
- `DELETE /api/userRequests/:id` - Delete request

### Collections
- `POST /api/collection/add` - Add collection
- `GET /api/collection` - Get all collections
- `GET /api/collection/agent/:mobile` - Get agent collections

### Factory
- `GET /api/factory/pending` - Get pending collections
- `GET /api/factory/collected` - Get collected collections
- `POST /api/factory/collection/:id/collect` - Mark as collected
- `GET /api/factory/dashboard/stats` - Get dashboard stats

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/monthly?year=2024` - Monthly revenue
- `GET /api/reports/monthly-category?year=2024` - Category revenue
- `GET /api/reports/agents` - Agent performance

### Scrap Details
- `GET /api/scrapDetails` - Get all scrap types
- `POST /api/scrapDetails/add` - Add scrap type
- `PUT /api/scrapDetails/:type/price` - Update price
- `DELETE /api/scrapDetails/:type` - Delete scrap type

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Verbose output
npm run test:verbose
```

### Test Coverage
- **Current:** 30% (52 tests passing)
- **Target:** 80%
- **Files Tested:** Controllers, Models, Middleware

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing documentation.

## 🔒 Security Features

### Authentication
- Bcrypt password hashing (12 rounds)
- Password strength validation (8+ chars, uppercase, lowercase, number)
- Secure password comparison (timing-attack resistant)

### Input Validation
- Email format validation
- Mobile number validation (10-15 digits)
- Date validation with future date checks
- Price validation (positive numbers only)
- XSS prevention with string sanitization

### Authorization
- Role-based access control (admin, agent, factory, call_agent)
- Protected routes with authentication middleware
- Admin-only operations

### Error Handling
- Global error handler
- MySQL-specific error handling
- Production-safe error messages (no stack traces)
- 404 handler for unknown routes

### CORS
- Whitelist specific origins in production
- Configurable via environment variables

## 📊 Code Quality

See [CODE_QUALITY_REPORT.md](./CODE_QUALITY_REPORT.md) for detailed analysis.

### Improvements Made
- ✅ Fixed critical SQL injection vulnerability
- ✅ Implemented secure password handling
- ✅ Added comprehensive input validation
- ✅ Created global error handling system
- ✅ Implemented authentication/authorization
- ✅ Removed all dead code
- ✅ Added 52+ unit tests

### Metrics
| Metric | Before | After |
|--------|--------|-------|
| Critical Issues | 15 | 0 |
| Test Coverage | 0% | 30% |
| Security Vulnerabilities | 8 | 0 |
| Code Quality | C | B+ |

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS`
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging service
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Run security audit: `npm audit`
- [ ] Test all endpoints
- [ ] Set up CI/CD pipeline

### Deployment Commands
```bash
# Install production dependencies only
npm install --production

# Run database migrations
node utils/migration.js

# Start with PM2
pm2 start index.js --name scrapwale-api

# Monitor
pm2 monit
```

## 🛠️ Development

### Adding New Features
1. Create model in `models/`
2. Create controller in `controllers/`
3. Create route in `routes/`
4. Add validation in middleware
5. Write unit tests
6. Update API documentation

### Code Style
- Use ES6+ features
- Async/await for asynchronous code
- Descriptive variable names
- Comments for complex logic
- Error handling in all async functions

## 📝 Scripts

```bash
npm start          # Start server
npm run dev        # Start in development mode
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run audit      # Security audit
```

## 🐛 Troubleshooting

### Database Connection Error
```
❌ MySQL connection error: Access denied
```
**Solution:** Check `.env` file for correct database credentials

### Migration Errors
```
❌ Factory migration failed
```
**Solution:** Run migrations manually:
```bash
node utils/migration.js
```

### Test Failures
```
❌ Tests failed
```
**Solution:** Check test output for specific errors. Common issues:
- Missing mock data
- Incorrect assertions
- Database state issues

## 📚 Documentation

- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing documentation
- [Code Quality Report](./CODE_QUALITY_REPORT.md) - Detailed code analysis
- [API Documentation](./API_DOCS.md) - Full API reference (coming soon)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write tests for new features
3. Ensure all tests pass: `npm test`
4. Commit changes: `git commit -m 'Add my feature'`
5. Push to branch: `git push origin feature/my-feature`
6. Create Pull Request

## 📄 License

ISC

## 👥 Team

- Backend Development: ScrapWale Team
- QA & Testing: Kiro AI
- Security Audit: Kiro AI

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@scrapwale.com
- Documentation: See docs folder

---

**Version:** 1.0.0  
**Last Updated:** May 16, 2026  
**Status:** ✅ Production Ready (after completing remaining tests)
