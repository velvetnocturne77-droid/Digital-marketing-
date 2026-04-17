# AI SDK Integration Guide

This project integrates the AI SDK with support for Grok models via XAI.

## Setup Steps

### 1. **Connect to Your Vercel Project**

```bash
npx vercel link
```

This connects your local project to your Vercel deployment.

### 2. **Pull Environment Variables**

```bash
npx vercel env pull
```

This creates a `.env.local` file with your production environment variables from Vercel.

### 3. **Add XAI API Key**

Get your XAI API key from [https://console.x.ai](https://console.x.ai) and add it:

```bash
# Add to .env.local
XAI_API_KEY=your_xai_api_key_here
```

### 4. **Verify Installation**

Check that all dependencies are installed:

```bash
npm list @ai-sdk/xai ai
```

## Usage

### API Endpoints

#### Generate AI Response (Complete)
```bash
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Invent a new holiday...",
  "model": "grok-4"  # optional, defaults to grok-4
}
```

Response:
```json
{
  "success": true,
  "text": "Generated text here...",
  "model": "grok-4"
}
```

#### Stream AI Response (Server-Sent Events)
```bash
POST /api/ai/stream
Content-Type: application/json

{
  "prompt": "Invent a new holiday...",
  "model": "grok-4"  # optional
}
```

Streams response in real-time using SSE (Server-Sent Events).

### Demo Script

Run the example from the setup instructions:

```bash
npm run ai:demo
```

This generates a creative holiday description using Grok-4.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `XAI_API_KEY` | Your xAI API key | Yes |
| `MONGODB_URI` | MongoDB connection string | For data persistence |
| `JWT_SECRET` | Secret for JWT tokens | For admin auth |

## Available Models

- `grok-4` (recommended)
- `grok-3` 
- `grok-2`

## Testing

### Local Testing

1. Start the server:
```bash
npm run dev
```

2. In another terminal, run the demo:
```bash
npm run ai:demo
```

### cURL Example

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a haiku about coding"}'
```

## Deployment on Vercel

1. Set `XAI_API_KEY` in Vercel environment variables:
```bash
vercel env add XAI_API_KEY
```

2. Deploy:
```bash
vercel deploy
```

The API endpoints will be available at:
- `https://your-project.vercel.app/api/ai/generate`
- `https://your-project.vercel.app/api/ai/stream`

## Troubleshooting

### "AI service not configured"
- Ensure `XAI_API_KEY` is set in `.env.local`
- Run `vercel env pull` to sync environment variables

### Module not found errors
```bash
npm install @ai-sdk/xai ai openai dotenv
```

### Streaming not working
- Check that your client supports Server-Sent Events (SSE)
- Use `text/event-stream` content type

## Security Notes

- Never commit `.env.local` to git (already in `.gitignore`)
- Keep `XAI_API_KEY` private and rotate regularly
- The `/api/ai/generate` endpoint is public; implement rate limiting if needed
