# Imagify – AI Image Generator 🎨

Imagify is an AI-powered image generation app. It turns text prompts into images with Cloudflare Workers AI and FLUX.1 Schnell. Users can create accounts, generate images with credits, browse their image history, and purchase more credits through Razorpay.

🌐 **Live demo:** [Imagify](https://imagifyclient.netlify.app)  
🚀 **Backend health:** [API health check](https://imagify-server-lqos.onrender.com/api/health)

> The backend runs on Render’s free tier and may take a moment to wake up after inactivity.

## Features

- Register and sign in with JWT-based authentication.
- Generate images from text prompts using Cloudflare Workers AI.
- Browse and download saved images.
- Receive 5 credits when creating an account; each successful image generation uses 1 credit.
- Purchase additional credits with Razorpay.
- Switch between light and dark themes.

## Tech stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Image generation | Cloudflare Workers AI, FLUX.1 Schnell |
| Payments | Razorpay |
| Hosting | Netlify (client), Render (server) |

## Project structure

```text
imagify/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── server/
    ├── src/
    │   ├── middleware/
    │   ├── index.js
    │   └── models.js
    ├── .env.example
    └── package.json
```

## Run locally

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- A MongoDB Atlas connection string
- A Cloudflare account with Workers AI access
- Razorpay test credentials to try credit purchases

### 1. Clone the repository

```bash
git clone https://github.com/Aafreen18/imagify.git
cd imagify
```

### 2. Install dependencies

```bash
npm install --prefix client
npm install --prefix server
```

### 3. Configure the server

Copy `server/.env.example` to `server/.env`, then enter your own credentials:

```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-workers-ai-token
CLIENT_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your-razorpay-test-key-secret
USD_TO_INR_RATE=92.5
```

Keep `server/.env` private. It is ignored by Git; **never commit real credentials or secrets**. The checked-in `.env.example` is a template and should contain placeholder values only.

`USD_TO_INR_RATE` converts the plans’ USD reference prices into INR amounts for Razorpay orders. The default rate used by the server is `92.5`.

### 4. Start the backend

In one terminal:

```bash
cd server
npm run dev
```

The API runs at `http://localhost:5000`. Check its status at [http://localhost:5000/api/health](http://localhost:5000/api/health).

### 5. Start the frontend

In a second terminal:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**API URL note:** The client currently uses the deployed Render API URL in `client/src/api.ts`. It does not currently read the API URL from a `VITE_API_URL` environment variable. To use a local backend while developing, update the client’s API base URL to `http://localhost:5000/api`; the Vite proxy is configured for `/api` requests, but the current absolute URL bypasses that proxy.

## API endpoints

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/health` | Check API and database connection status | No |
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Sign in | No |
| GET | `/api/auth/me` | Get the signed-in user | Yes |
| GET | `/api/credits` | Get the current credit balance | Yes |
| GET | `/api/images` | List the user’s saved images | Yes |
| POST | `/api/images/generate` | Generate and save an image | Yes |
| GET | `/api/plans` | List credit plans and INR prices | No |
| POST | `/api/pay-razor` | Create a Razorpay order | Yes |
| POST | `/api/verify-razor` | Verify a payment and add credits | Yes |

Authenticated endpoints expect a bearer token in the `Authorization` header.

## Payments

Razorpay handles credit purchases. The server creates a payment order, verifies the payment signature and Razorpay order status, and adds credits after successful verification. Use Razorpay test keys from `server/.env` when trying the payment flow.

## Image storage

Generated images and their prompts are stored in MongoDB with the associated user’s history.
```

## Author

**Aafreen Parveen**  
GitHub: [Aafreen18](https://github.com/Aafreen18)
