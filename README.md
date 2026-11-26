# Imagify – AI Image Generator 🎨

**Imagify** is an AI-powered image generation web application that transforms text prompts into images using **Cloudflare Workers AI (FLUX.1 Schnell)**. Users can create an account, generate images from their ideas, manage generation credits, and access their previously generated creations.

🌐 **Live Demo:** [Imagify](https://imagifyclient.netlify.app)

🚀 **Backend Health:** [API Health Check](https://imagify-server-lqos.onrender.com/api/health)

---

## ✨ Features

- **User Authentication:** Secure user registration and login using JWT-based authentication.
- **AI Image Generation:** Generate images from text descriptions using Cloudflare Workers AI.
- **Image History:** Browse previously generated images associated with your account.
- **Download Creations:** Download generated images directly to your device.
- **Credit Management:** Manage credits used for image generation.
- **Credit Plans:** Explore available plans to purchase additional generation credits.
- **Payment Integration:** Razorpay integration for handling credit purchases.
- **Theme Customization:** Switch between light and dark themes.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Token (JWT) |
| AI Image Generation | Cloudflare Workers AI, FLUX.1 Schnell |
| Payment Gateway | Razorpay |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

## 🏗️ Project Architecture

Imagify follows a client-server architecture where the React frontend communicates with the Express backend through REST APIs.

```text
             USER
               |
               v
       REACT FRONTEND
        (Netlify)
               |
               | REST API Requests
               v
       NODE.JS + EXPRESS
          (Render)
               |
       +-------+--------+
       |       |        |
       v       v        v
    MongoDB  Cloudflare  Razorpay
     Atlas   Workers AI  Payments
       |       |        |
       v       v        v
    User &   Generated  Credit
    Image     Images   Purchases
    Data
```

---

## 📁 Project Structure

```text
Imagify/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.ts
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## ⚙️ Getting Started

Follow these instructions to run Imagify locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- MongoDB Atlas account
- Cloudflare account with Workers AI access

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Imagify
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
npm install --prefix client
```

Install backend dependencies:

```bash
npm install --prefix server
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your-mongodb-atlas-connection-string

JWT_SECRET=your-long-random-secret

CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token

CLIENT_ORIGIN=http://localhost:5173

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

USD_TO_INR_RATE=92.5
```

### 4. Run the Backend

Open a terminal and execute:

```bash
cd server
npm run dev
```

The backend will run at:

`http://localhost:5000`

Backend health check:

`http://localhost:5000/api/health`

### 5. Run the Frontend

Open another terminal and execute:

```bash
cd client
npm run dev
```

The frontend will usually be available at:

`http://localhost:5173`

---

## 💳 Payment Integration

Imagify uses **Razorpay** to handle credit purchases.

The payment workflow involves:

1. The user selects a credit plan.
2. The frontend requests a payment order from the backend.
3. The backend creates a Razorpay order.
4. The Razorpay checkout interface opens for the user.
5. The user completes the payment.
6. The backend verifies the payment details.
7. The user's available credits are updated after successful verification.

Razorpay test credentials can be configured to test the payment workflow without processing real payments.

---

## 🖼️ Image Storage

Generated images are currently stored in **MongoDB Atlas** along with the corresponding user's image history.

Each user can access and browse their previously generated creations through the application.

---

## 🔒 Security Considerations

- JWT-based authentication for protected API access.
- Backend-side handling of sensitive API credentials.
- Environment variables for database and third-party service configuration.
- Payment verification handled by the backend.
- User-specific image history and credit management.

---

## 🚀 Future Improvements

- Cloud-based image storage using Cloudinary or Amazon S3.
- More AI image generation models.
- Advanced image customization options.
- Improved image generation history and search.
- Additional payment and subscription plans.
- Image sharing functionality.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [Your GitHub Profile](https://github.com/Aafreen18/imagify)

---

⭐ If you find this project interesting, consider giving the repository a star!
