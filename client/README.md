# Imagify

Imagify is a full-stack starter for turning text prompts into images. It includes a React + TypeScript + Vite client and an Express + Node API. MongoDB stores accounts and each user's image history. Cloudflare Workers AI's FLUX.1 Schnell model generates the images.

## What is included

- Public dashboard with an introduction, example artwork, how-it-works section, testimonials, and footer.
- Register and login pages. Passwords are hashed on the server and sessions use signed tokens.
- Signed-in image studio, image generation and download, saved creations gallery, theme switch, and profile/logout.
- Express routes and MongoDB models for users and generated images.

## What you need

Install **Node.js LTS** (which includes npm) and use VS Code's built-in terminal. You do not need to install MongoDB on your laptop: MongoDB Atlas offers a hosted database with a free tier. A Cloudflare Account ID and Workers AI API token are needed to generate images.

## 1. Install project packages

From the Imagify Test project folder, install the client and server packages:

```bash
npm install --prefix client
npm install --prefix server
```

## 2. Create a hosted MongoDB database

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. In Atlas, create a database user and password. This is separate from your Atlas website login.
3. In **Network Access**, allow your current IP address. For a local learning project, Atlas also offers an allow-from-anywhere entry (`0.0.0.0/0`); use a strong database-user password and remove that entry when you no longer need it.
4. In **Connect → Drivers**, copy the connection string. Replace `<password>` with the database user's password, and add the database name `imagify` in the path before the `?` if it isn't there already.
5. Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI` to that connection string and replace `JWT_SECRET` with a long random value. Keep `.env` private; it is ignored by Git.

Example shape (use your own Atlas host and credentials):

```env
MONGODB_URI=mongodb+srv://dbuser:your-url-encoded-password@cluster.example.mongodb.net/imagify?retryWrites=true&w=majority
JWT_SECRET=use-a-long-random-secret-here
```

If your database password contains reserved URL characters, URL-encode them before putting it in the connection string.

## 3. Connect Cloudflare Workers AI

In your Cloudflare dashboard, open **AI → Workers AI → Use REST API**, create a Workers AI API token, and copy your Account ID. Use the free model `@cf/black-forest-labs/flux-1-schnell`; avoid paid third-party models such as FLUX1.1 Pro if you want to stay within the free Workers AI allocation. Cloudflare currently includes 10,000 Neurons per day on the Free plan; the allocation is shared and requests may fail after it is exhausted.

Put these values in `server/.env`:

```env
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-workers-ai-token
```

Keep the token in the server `.env` file; never put it in a `VITE_` variable or frontend code. The API endpoint calls Cloudflare's `@cf/black-forest-labs/flux-1-schnell` model and saves the returned image to MongoDB. Large image histories can use Atlas storage quickly.

## 4. Start Imagify

Start the backend in one terminal:

```bash
cd server
npm install
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite address shown in the terminal (usually [http://localhost:5173](http://localhost:5173)). The frontend runs at port 5173 and the Express API at port 5000. Confirm the API is running at [http://localhost:5000/api/health](http://localhost:5000/api/health). Its `database` field should say `connected` after Atlas connects.

## Project layout

```text
client/src/          React pages, API helper, and styling
client/public/       Frontend public assets
client/              Vite and TypeScript configuration
server/src/          Express API, models, and payment routes
server/.env.example  Server and Razorpay configuration template
```

New accounts receive 5 credits. Each successfully generated image costs 1 credit; failed generations restore the reserved credit. Prices and charges are shown in Indian rupees (₹, INR); the USD plan amounts are reference equivalents. MongoDB stores transaction `amount` as whole rupees (for example, `925`) with `currency: "INR"`; the server converts that value to paise only when creating and verifying Razorpay orders. To enable test purchases, put your Razorpay test key ID and secret in `server/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Set `USD_TO_INR_RATE` there to choose the USD-to-INR conversion used for plan prices. Keep the key secret on the server and never add it to the client.

Cloudflare references: [Workers AI REST API setup](https://developers.cloudflare.com/workers-ai/get-started/rest-api/), [FLUX.1 Schnell model](https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/), and [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

The API includes `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/images/generate`, and `GET /api/images`. Image records currently store the returned base64 image data directly in MongoDB for simplicity. For a public production service, move image files to object storage and add appropriate rate limits, quotas, validation, and privacy controls.
