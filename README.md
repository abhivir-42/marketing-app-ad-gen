# Marketing App Ad Generator

A web application for generating and refining radio ad scripts using AI, with an iterative workflow for marketing professionals.

## Features

- AI-powered script generation based on product details and audience
- Script refinement with targeted improvements
- Text-to-speech conversion (coming soon)
- Version history tracking
- Comparison of different ad versions

## Project Structure

- `ad-generation-tool/`: Next.js frontend application
- `backend/`: FastAPI backend server
  - `script_generation/`: Script generation module
  - `regenerate_script/`: Script refinement module

## Local Development Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Ensure you have the required environment variables in `.env`:
   ```
   CREW_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ad-generation-tool
   ```

2. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

For full deployment instructions, see [instructions/deployment-guide.md](instructions/deployment-guide.md).

### Quick Deployment Overview

1. Backend is deployed on a Linux VM with GPU support for TTS processing
2. Frontend is deployed on Vercel
3. Next.js API routes proxy requests to the backend
4. Environment variables are configured on both sides

## License

[MIT License](LICENSE)