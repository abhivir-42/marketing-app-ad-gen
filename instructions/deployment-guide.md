# Deployment Guide for Marketing App Ad Generation Tool

This guide provides detailed instructions for deploying the Marketing App Ad Generation Tool with the frontend on Vercel and the backend on a virtual machine.

## Table of Contents
1. [Overview](#overview)
2. [Preparing for Deployment](#preparing-for-deployment)
3. [Backend Deployment (Virtual Machine)](#backend-deployment-virtual-machine)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Connecting Frontend and Backend](#connecting-frontend-and-backend)
6. [Testing the Deployed Application](#testing-the-deployed-application)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Overview

Our application consists of two main components:
- **Frontend**: A Next.js application (in the `ad-generation-tool` directory)
- **Backend**: A FastAPI application (in the `backend` directory)

In local development, these components communicate directly with each other on localhost. For production deployment, we'll host them separately:
- Frontend → Deployed on Vercel
- Backend → Deployed on a virtual machine (e.g., AWS EC2, Google Compute Engine, DigitalOcean Droplet)

## Preparing for Deployment

### 1. Backend Preparation

1. **Create a production-ready backend configuration**:
   - In the `backend` directory, create or modify a `.env.production` file with appropriate configuration
   - Ensure there are no hardcoded localhost URLs
   - Set up proper logging configuration for production

2. **Add a proper CORS configuration**:
   - Update the CORS middleware in `main.py` to only allow specific origins
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-vercel-app-url.vercel.app"],  # Replace with your actual Vercel URL
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Create a `Procfile` or service configuration file**:
   - For example, a simple `Procfile` might contain:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### 2. Frontend Preparation

1. **Create production environment files**:
   - Create `ad-generation-tool/.env.production` with:
   ```
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_API_URL=/api
   BACKEND_URL=https://your-vm-ip-or-domain.com  # This will be your VM's public IP or domain
   VERCEL=1
   ```

2. **Update API service logic**:
   - Ensure `src/services/api.ts` correctly handles the production environment
   - Verify conditional logic for API endpoints works in both development and production

## Backend Deployment (Virtual Machine)

### 1. Choose and Set Up a Virtual Machine

1. **Select a provider**:
   - AWS EC2, Google Cloud Compute Engine, DigitalOcean, Linode, or Azure VM
   - Recommendation: Start with a small instance (2GB RAM, 1 vCPU) and scale as needed

2. **Set up the VM**:
   - Create a VM with Ubuntu LTS (e.g., Ubuntu 22.04)
   - Configure security groups/firewall:
     - Allow SSH (port 22)
     - Allow HTTP/HTTPS (ports 80/443)
     - Allow your application port (e.g., 8000)

3. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   sudo apt install -y python3-pip python3-dev nginx certbot python3-certbot-nginx
   sudo apt install -y python3-venv
   ```

### 2. Deploy the Backend Code

1. **Create a deployment user (optional but recommended)**:
   ```bash
   sudo adduser deploy
   sudo usermod -aG sudo deploy
   # Switch to this user for deployment tasks
   su - deploy
   ```

2. **Clone the repository**:
   ```bash
   git clone https://your-repository-url.git
   cd marketing-app-ad-gen
   ```

3. **Set up Python environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   pip install gunicorn uvicorn
   ```

### 3. Set Up a Production Server

1. **Create a systemd service**:
   Create a file at `/etc/systemd/system/adgen-backend.service`:
   ```
   [Unit]
   Description=Ad Generation Backend
   After=network.target

   [Service]
   User=deploy
   Group=deploy
   WorkingDirectory=/home/deploy/marketing-app-ad-gen/backend
   Environment="PATH=/home/deploy/marketing-app-ad-gen/venv/bin"
   ExecStart=/home/deploy/marketing-app-ad-gen/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```

2. **Set up Nginx as a reverse proxy**:
   Create a file at `/etc/nginx/sites-available/adgen-backend`:
   ```
   server {
       listen 80;
       server_name your-vm-ip-or-domain.com;  # Replace with your VM's public IP or domain

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the Nginx configuration**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/adgen-backend /etc/nginx/sites-enabled/
   sudo nginx -t  # Test the configuration
   sudo systemctl restart nginx
   ```

4. **Start the backend service**:
   ```bash
   sudo systemctl start adgen-backend
   sudo systemctl enable adgen-backend
   ```

### 4. Set Up SSL (HTTPS)

1. **Use Certbot to obtain an SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-vm-ip-or-domain.com
   ```
   - Follow the prompts to complete the setup

2. **Verify HTTPS is working**:
   - Visit `https://your-vm-ip-or-domain.com` in your browser

## Frontend Deployment (Vercel)

### 1. Prepare Your Project for Vercel

1. **Create a `vercel.json` file** in the project root:
   ```json
   {
     "buildCommand": "cd ad-generation-tool && npm install --include=dev && npm run build",
     "outputDirectory": "ad-generation-tool/.next",
     "framework": "nextjs",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-vm-ip-or-domain.com/:path*"
       }
     ],
     "env": {
       "NODE_ENV": "production",
       "NEXT_TELEMETRY_DISABLED": "1"
     }
   }
   ```

2. **Ensure your package.json has the correct scripts**:
   Verify your `ad-generation-tool/package.json` has:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start"
   }
   ```

### 2. Deploy to Vercel

1. **Install Vercel CLI** (optional but helpful):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Create an account on Vercel if you don't have one
   - Import your GitHub repository
   - Configure the project:
     - Root Directory: `ad-generation-tool`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Set Environment Variables**:
   In the Vercel dashboard, add these environment variables:
   - `NEXT_PUBLIC_APP_ENV`: `production`
   - `NEXT_PUBLIC_API_URL`: `/api`
   - `BACKEND_URL`: `https://your-vm-ip-or-domain.com`
   - `VERCEL`: `1`

4. **Deploy the Project**:
   - Click "Deploy" in the Vercel dashboard
   - Vercel will automatically build and deploy your frontend

## Connecting Frontend and Backend

### 1. Configure API Routing

1. **Verify the API service setup**:
   Ensure your API service in `ad-generation-tool/src/services/api.ts` properly handles production vs. development environments:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
   // For Next.js API routes when in production (Vercel)
   const NEXTJS_API_BASE_URL = '/api';

   // Determine if we're running on Vercel or locally
   const isVercel = process.env.VERCEL === '1';
   const BASE_URL = isVercel ? NEXTJS_API_BASE_URL : API_BASE_URL;
   ```

2. **Update rewrites in Next.js**:
   Ensure your `next.config.js` correctly handles the production environment:
   ```javascript
   async rewrites() {
     // Only apply rewrites in production mode
     if (process.env.NODE_ENV === 'production') {
       return [
         {
           source: '/api/:path*',
           destination: process.env.BACKEND_URL + '/:path*'
         }
       ];
     }
     return [];
   }
   ```

### 2. Update CORS on Backend

1. **Add your deployed Vercel URL to the allowed origins**:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-vercel-app-url.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Restart your backend service**:
   ```bash
   sudo systemctl restart adgen-backend
   ```

## Testing the Deployed Application

### 1. Frontend Testing

1. **Basic functionality**:
   - Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Verify the landing page loads correctly
   - Check that all components render properly

2. **API integration**:
   - Try generating a script
   - Verify the request is correctly sent to the backend
   - Check that responses are properly handled

### 2. Backend Testing

1. **Direct API testing**:
   - Use tools like Postman or curl to test your backend endpoints directly
   - Example: `curl https://your-vm-ip-or-domain.com/generate_script -X POST -H "Content-Type: application/json" -d '{"product_name":"Test Product",...}'`

2. **Verify logs**:
   ```bash
   sudo journalctl -u adgen-backend -f
   ```

### 3. End-to-End Testing

1. **Complete a full script generation flow**:
   - Start from the landing page
   - Fill out the form
   - Submit and generate a script
   - Refine the generated script

2. **Error handling**:
   - Test with invalid inputs
   - Verify error messages are displayed correctly

## Monitoring and Maintenance

### 1. Backend Monitoring

1. **Set up basic monitoring**:
   ```bash
   sudo apt install -y prometheus node-exporter
   ```

2. **Configure log rotation**:
   Add a configuration for your service logs in `/etc/logrotate.d/adgen-backend`

3. **Regular updates**:
   ```bash
   # Regular system updates
   sudo apt update && sudo apt upgrade -y
   
   # Application updates
   cd /home/deploy/marketing-app-ad-gen
   git pull
   source venv/bin/activate
   pip install -r backend/requirements.txt
   sudo systemctl restart adgen-backend
   ```

### 2. Frontend Monitoring

1. **Use Vercel Analytics** or integrate a service like Google Analytics

2. **Set up error reporting**:
   - Consider adding Sentry.io integration
   - Add to your Next.js app:
   ```javascript
   // pages/_app.js
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     tracesSampleRate: 1.0,
   });
   ```

## Troubleshooting

### Backend Issues

1. **Service not starting**:
   ```bash
   sudo systemctl status adgen-backend
   sudo journalctl -u adgen-backend -n 50
   ```

2. **Cannot connect to backend**:
   - Check firewall settings: `sudo ufw status`
   - Verify Nginx configuration: `sudo nginx -t`
   - Check Nginx error logs: `sudo cat /var/log/nginx/error.log`

### Frontend Issues

1. **Build failures**:
   - Check Vercel build logs in the dashboard
   - Verify environment variables are set correctly

2. **API connection issues**:
   - Use browser developer tools to check network requests
   - Verify the API URL is correct in your environment settings

### CORS Issues

1. **CORS errors in browser console**:
   - Verify the CORS configuration in your backend
   - Check that the origin URL matches exactly (including protocol and www subdomain if used)

## Conclusion

Deploying a split architecture application (frontend on Vercel, backend on VM) requires careful planning and configuration. This guide provides a framework for deployment, but you may need to adapt specific steps based on your exact requirements and infrastructure choices.

After initial deployment, consider implementing:
- CI/CD pipelines for automated deployment
- More robust monitoring and alerting
- Regular backup procedures for your backend data
- Load testing to ensure your application can handle expected traffic

Remember to regularly update both your application code and the underlying infrastructure to maintain security and performance. 