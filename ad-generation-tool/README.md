# Ad Generation Tool

This project is an AI-powered tool for generating professional radio ads. Users can generate an ad script, accompanying art direction, and audio output—all in one place.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd ad-generation-tool
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Testing the Application

- Navigate to each page (Landing, Script Generation, Results, TTS) and verify that the components render correctly.
- Test the integration with the backend by submitting forms and checking console logs for API responses.

## API Endpoints

- **`/api/generate_script`**: Generates an ad script and corresponding art direction.
- **`/api/refine_script`**: Refines selected sentences of the generated script.
- **`/api/generate_audio`**: Generates the final audio ad using TTS.

## Deployment

This application can be deployed on Vercel for production use.

## License

This project is licensed under the MIT License.
