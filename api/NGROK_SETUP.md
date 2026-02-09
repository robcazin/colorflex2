# ngrok Setup for Testing

## Step 1: Sign Up for ngrok (Free)

1. Go to https://dashboard.ngrok.com/signup
2. Sign up with email or GitHub
3. Complete the signup process

## Step 2: Get Your Authtoken

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (it looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

## Step 3: Configure ngrok

Run this command (replace YOUR_AUTHTOKEN with your actual token):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

## Step 4: Start ngrok

```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

Copy the HTTPS URL!

## Step 5: Update theme.liquid

Update `src/layout/theme.liquid` with your ngrok URL, then deploy.
