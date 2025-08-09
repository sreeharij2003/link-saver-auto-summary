# Link Saver - AI-Powered Bookmark Manager

A full-stack web application that allows users to save URLs with automatic AI-powered summaries using Jina AI.

## Features

- **User Authentication**: Secure email/password registration and login
- **Bookmark Management**: Save, view, and delete bookmarks
- **AI Summaries**: Automatic content summarization using Jina AI
- **Metadata Extraction**: Automatic title and favicon extraction
- **Tag System**: Organize bookmarks with custom tags
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT-based authentication with bcrypt
- **AI Integration**: Jina AI for content summarization
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start

1. Clone the repository:

```bash
git clone <your-repo-url>
cd link-saver
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Instructions

1. **Create Account**: Click "Sign Up" and register with any email/password
2. **Add Bookmarks**: Try these sample URLs:
   - https://www.bbc.com/news
   - https://techcrunch.com
   - https://medium.com
3. **View AI Summaries**: Watch as summaries are generated automatically
4. **Organize**: Add tags like "news", "tech", "blog" to categorize your bookmarks

## Usage

1. **Register/Login**: Create an account or sign in
2. **Add Bookmarks**: Click "Add Link" and paste any URL
3. **View Summaries**: AI-generated summaries appear automatically
4. **Organize**: Add tags to categorize your bookmarks
5. **Manage**: View, search, and delete bookmarks from your dashboard

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Create new bookmark
- `DELETE /api/bookmarks/[id]` - Delete bookmark
- `PUT /api/bookmarks/[id]` - Update bookmark

## Deployment

This app is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## License

MIT License
