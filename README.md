# AI-Powered Radio Ad Generation Tool

## Overview
This project is an AI-powered tool for generating professional radio ads. Users can generate an ad script, accompanying art direction, and audio output—all in one place. The tool leverages a FastAPI backend, integrates with a crew AI system for generating and refining ad scripts, and uses a fine-tuned TTS service (Parler TTS) for audio generation.

## Backend Setup

### Prerequisites
- Python 3.7+
- Virtual environment tool (e.g., `venv`)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn
   ```

### Running the Backend
Start the FastAPI server using Uvicorn:
```bash
uvicorn main:app --reload
```

## Frontend Setup

### Prerequisites
- Node.js and npm

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Frontend
Start the development server:
```bash
npm start
```

## Usage Guide

### Navigating the Tool
- **Landing Page:** Attracts users with an overview, sample ad output, a demo, and testimonials.
- **Script Generation Page:** Collects user inputs such as product name, target audience, key selling points, tone, ad length, and speaker voice.
- **Script & Art Direction Results Page:** Displays the generated script, allows inline editing, and provides "Refine with AI" functionality.
- **TTS Generation & Export Page:** Generates and previews audio, with options to adjust speed/pitch and download.

### API Documentation
- **`/generate_script` Endpoint:**
  - **Method:** POST
  - **Request Body:** `ScriptRequest`
  - **Response:** List of tuples (script line, art direction)

- **`/refine_script` Endpoint:**
  - **Method:** POST
  - **Request Body:** `RefineRequest`
  - **Response:** List of tuples (refined script line, art direction)

- **`/generate_audio` Endpoint:**
  - **Method:** POST
  - **Request Body:** `AudioRequest`
  - **Response:** Audio URL (placeholder)

## Future Work
- Implement the actual crew calls in the backend.
- Integrate the Parler TTS API for audio generation.
- Complete the frontend implementation with a modern UI framework.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.