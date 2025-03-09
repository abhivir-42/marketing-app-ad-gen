# Deployment Guide for Marketing App Ad Generation Tool

## Overview

This guide provides instructions for deploying the Marketing App Ad Generation Tool with:
- **Frontend**: Deployed on Vercel (https://ad-craft-app.vercel.app)
- **Backend**: Deployed on a Linux VM with T4 GPU (IP: 172.206.3.68)

## Current Status

- The backend is configured to run as a systemd service on the Linux VM
- The frontend is deployed on Vercel
- CORS is configured to allow requests from the Vercel frontend
- Nginx is set up as a reverse proxy for the backend
- Next.js API routes proxy requests from frontend to backend to avoid mixed content issues

## Environment Configuration

### API Keys
Both script generation and refinement modules use the same keys:
- `CREW_API_KEY`: Used for CrewAI operations
- `OPENAI_API_KEY`: Used for OpenAI API operations

These keys are stored in `.env` files in the following locations:
- `/home/azureuser/marketing-app-ad-gen/backend/.env`
- `/home/azureuser/marketing-app-ad-gen/backend/script_generation/.env`
- `/home/azureuser/marketing-app-ad-gen/backend/regenerate_script/.env`

### Frontend-Backend Communication
- Frontend uses Next.js API routes at `/api/generate_script` and `/api/regenerate_script`
- These API routes proxy requests to the backend server
- Environment variables:
  - `NEXT_PUBLIC_API_URL=/api` - Points frontend to the local API routes
  - `BACKEND_URL=http://172.206.3.68` - Used by API routes to forward requests to the backend

## Deployment Steps

### 1. Backend Deployment

#### Set up environment variables

1. Ensure all required environment variables are in the main `.env` file:

```bash
# Create or update the main .env file in the backend directory
cd /home/azureuser/marketing-app-ad-gen/backend
cp script_generation/.env .
```

#### Configure and start the backend server

1. Create a systemd service file for the backend:

```bash
# Create a systemd service file
sudo nano /etc/systemd/system/adgen-backend.service
```

Add the following content:

```
[Unit]
Description=Ad Generation Backend Service
After=network.target

[Service]
User=azureuser
WorkingDirectory=/home/azureuser/marketing-app-ad-gen/backend
Environment="PATH=/home/azureuser/.conda/envs/segp-env/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/azureuser/.conda/envs/segp-env/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable adgen-backend
sudo systemctl start adgen-backend
```

3. Configure CORS in the backend's `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ad-craft-app.vercel.app",  # Vercel production app
        "http://localhost:3000",            # Local frontend development
        "http://127.0.0.1:3000",            # Alternative local address
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

4. Set up Nginx as a reverse proxy:

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/adgen-backend
```

Add this configuration:

```
server {
    listen 80;
    server_name 172.206.3.68;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://ad-craft-app.vercel.app';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
        # CORS headers for regular requests
        add_header 'Access-Control-Allow-Origin' 'https://ad-craft-app.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }
}
```

Enable the configuration:

```bash
sudo ln -sf /etc/nginx/sites-available/adgen-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Frontend Deployment Configuration

1. Set up Next.js API routes to proxy requests to the backend:

Create file: `src/app/api/generate_script/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API route /api/generate_script received request:', body);
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://172.206.3.68';
    const response = await fetch(`${backendUrl}/generate_script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error('Backend returned error status:', response.status);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in generate_script API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
```

Create file: `src/app/api/regenerate_script/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API route /api/regenerate_script received request:', body);
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://172.206.3.68';
    const response = await fetch(`${backendUrl}/regenerate_script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error('Backend returned error status:', response.status);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in regenerate_script API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
```

2. Configure the frontend environment variables:

Create/update `.env.local`:
```
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://172.206.3.68
```

3. Update the Vercel project configuration:

- Go to the Vercel dashboard for your project
- Navigate to Settings → Environment Variables
- Add the following variables:
  - `NEXT_PUBLIC_API_URL=/api`
  - `BACKEND_URL=http://172.206.3.68`

4. Deploy the frontend to Vercel:

- Push your code to GitHub
- Connect your GitHub repository to Vercel
- Deploy the project

### 3. TTS Model Deployment (Future Step)

For the Text-to-Speech model that will be added later:

1. Install the required dependencies:
   - CUDA drivers are already installed on the VM
   - The T4 GPU will be used for inference

2. Update the backend code to use the GPU for TTS inference

3. Ensure the TTS model files are properly stored on the VM

4. Create a corresponding API route in Next.js to proxy TTS requests

### 4. Troubleshooting Connection Issues

If API routes still encounter issues connecting to the backend:

1. Check browser developer tools for network errors:
   - Look for 4xx or 5xx HTTP errors in the Network tab
   - Check for errors in the Console tab

2. Verify the backend API is accessible from the internet:
   - Test with a tool like Postman or curl from another machine
   - Ensure the VM's firewall allows incoming connections on port 80

3. Check the server logs:
   - Frontend logs in Vercel dashboard
   - Backend logs with `sudo journalctl -u adgen-backend -f`

4. Test the API endpoints directly:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"product_name":"Test","target_audience":"Test","key_selling_points":"Test","tone":"Professional","ad_length":30,"speaker_voice":"Male"}' http://172.206.3.68/generate_script
```

## Summary of Environment Variables

### Backend (.env)
- `CREW_API_KEY`: Required for CrewAI functionality
- `OPENAI_API_KEY`: Required for OpenAI API access

### Frontend (.env.local on Vercel)
- `NEXT_PUBLIC_API_URL`: Set to `/api` to use Next.js API routes
- `BACKEND_URL`: Points to the backend server URL

## Starting the Services Manually (if needed)

### Backend
```bash
cd /home/azureuser/marketing-app-ad-gen/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Monitoring Backend Logs
```bash
sudo journalctl -u adgen-backend -f
```

## Conclusion

By following this deployment guide, you should be able to properly deploy the Marketing App Ad Generation Tool with the frontend on Vercel and the backend on your Linux VM with GPU support.

The key elements of this solution:
1. The backend runs on the VM with proper CORS settings
2. Next.js API routes in the frontend proxy requests to the backend
3. This approach avoids mixed content security issues
4. All required environment variables are correctly set on both ends 