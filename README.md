# Text Analyzer

A full-stack application for analyzing text content with features for counting words, characters, sentences, paragraphs, and finding the longest words in paragraphs. The application includes OAuth2 authentication, API rate limiting, caching, and a custom log visualization dashboard.

## Features

- **Text Analysis**: Count words, characters, sentences, paragraphs, and find longest words
- **User Authentication**: OAuth2 with Google for secure access
- **API Rate Limiting**: Prevents abuse of API endpoints
- **Caching**: Redis-based caching to prevent redundant operations
- **Log Visualization**: Custom Winston dashboard for monitoring application logs
- **Responsive UI**: Modern interface built with Bootstrap
- **History Tracking**: View analysis history for authenticated users
- **Role-based Access Control**: Admin-specific features like log dashboard

## Technology Stack

- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB for data storage
- **Caching**: Redis for performance optimization
- **Authentication**: Passport.js with OAuth2 (Google)
- **View Engine**: EJS with express-ejs-layouts
- **Testing**: Jest with supertest for TDD approach
- **Logging**: Winston with custom dashboard
- **Deployment**: Clustered application for better performance

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Atlas which is already added in .env.example)
- Redis (cloud url is already added in .env.example)
- Google OAuth credentials (already added in auth.config.ts)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/riandev/text_analyzer.git
cd text_analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Rename the `.env.example` file to `.env` in the root directory:

```bash
cp .env.example .env
# or
mv .env.example .env
```

The example file already contains all the necessary configuration including MongoDB and Redis connection strings.

### 4. Build the application

```bash
npm run build
```

### 5. Start the application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```


## Testing

The application follows a Test-Driven Development (TDD) approach with Jest.

```bash
# Run tests
npm run test

# Generate test coverage report
npm run coverage
```

## API Endpoints

### Authentication Protected Endpoints

These endpoints require authentication with JWT token:

- **POST /api/analyzer/add** - Create a new text entry

  - Protected by: JWT verification and user role check
  - Request Body: `{ "content": "Your text here" }`

- **GET /api/analyzer/all** - Get all text analyses for the authenticated user

  - Protected by: JWT verification and user role check

- **GET /api/analyzer/one/:id** - Get a specific text analysis by ID

  - Protected by: JWT verification and user role check

- **DELETE /api/analyzer/delete/:id** - Delete a text analysis by ID
  - Protected by: JWT verification and user role check

### Public Analysis Endpoints (with Rate Limiting and Caching)

These endpoints are public but protected by rate limiting and use Redis caching:

- **POST /api/analyzer/word-count** - Get word count for provided text

  - Request Body: `{ "content": "Your text here" }`

- **POST /api/analyzer/character-count** - Get character count for provided text

  - Request Body: `{ "content": "Your text here" }`

- **POST /api/analyzer/sentence-count** - Get sentence count for provided text

  - Request Body: `{ "content": "Your text here" }`

- **POST /api/analyzer/paragraph-count** - Get paragraph count for provided text

  - Request Body: `{ "content": "Your text here" }`

- **POST /api/analyzer/longest-words** - Get longest words in paragraphs for provided text

  - Request Body: `{ "content": "Your text here" }`

- **POST /api/analyzer/complete** - Get complete analysis for provided text
  - Request Body: `{ "content": "Your text here" }`

### Authentication Endpoints

- **Various /api/auth/** endpoints for user authentication and management

## Frontend Routes

- **/** - Home page with text input form (public)
- **/analyzer** - Text analysis page (requires authentication)
- **/history** - User's text history (requires authentication)
- **/analyze** - POST endpoint to process text analysis (requires authentication)
- **/auth/callback** - OAuth callback URL
- **/logs** - Log visualization dashboard (requires admin role)

## Log Visualization

The application includes a custom Winston Dashboard for log visualization, accessible at `/logs` (admin access required). Features include:

- Real-time log viewing with configurable refresh rates
- Log filtering by level and message content
- Responsive Bootstrap UI with color-coded log levels
- Combined in-memory and file-based logs

## Security Features

- OAuth2 authentication with Google
- JWT for API authentication
- Rate limiting to prevent API abuse
- Secure session management with MongoDB store
- Helmet for HTTP security headers

## Caching

The application uses Redis for caching analysis results to improve performance. The cache middleware automatically handles caching for API responses.

## Project Structure

```
├── public/               # Static assets
│   ├── css/              # CSS files
│   └── js/               # Client-side JavaScript
├── src/
│   ├── config/           # Configuration files
│   ├── database/         # Database initialization
│   ├── helpers/          # Helper functions
│   ├── middlewares/      # Express middlewares
│   ├── modules/          # Feature modules
│   │   ├── frontend/     # Frontend controllers
│   │   ├── text/         # Text analysis module
│   │   └── users/        # User management module
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── tests/            # Test files
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── views/            # EJS templates
│   └── app.ts            # Application entry point
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── jest.config.js        # Jest configuration
├── nodemon.json          # Nodemon configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## License

ISC
