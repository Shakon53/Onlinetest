# Deploy OnlineTest LMS

This guide deploys the platform as a public production website using:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 1. Push project to GitHub

Create a GitHub repository and push the full `Onlinetest` folder.

Render and Vercel will deploy from this repository.

## 2. Create MongoDB Atlas database

1. Open https://www.mongodb.com/atlas
2. Create a free cluster.
3. Create a database user.
4. Allow network access for Render. For simple setup use `0.0.0.0/0`.
5. Copy the connection string.

Example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/onlinetest_lms?retryWrites=true&w=majority
```

## 3. Deploy backend to Render

Recommended method: use `render.yaml` from the repository root.

1. Open https://render.com
2. Create a new Blueprint or Web Service from GitHub.
3. Select this repository.
4. Render will detect `render.yaml`.
5. Add environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/onlinetest_lms?retryWrites=true&w=majority
JWT_SECRET=generate_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-project.vercel.app
CORS_ORIGINS=https://your-project.vercel.app,https://your-domain.com
UPLOAD_DIR=uploads
```

Render provides `PORT` automatically. Do not hardcode it unless Render asks.

After deploy, check:

```text
https://your-api.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "OnlineTest LMS API",
  "database": {
    "connected": true,
    "readyState": 1
  }
}
```

## 4. Deploy frontend to Vercel

1. Open https://vercel.com
2. Import the same GitHub repository.
3. Set Root Directory:

```text
apps/web
```

4. Add environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-api.onrender.com
```

5. Deploy.

After deploy, open:

```text
https://your-project.vercel.app
```

## 5. Update backend CORS after frontend deploy

After Vercel gives the final frontend URL, go back to Render and update:

```env
CLIENT_URL=https://your-project.vercel.app
CORS_ORIGINS=https://your-project.vercel.app
```

If you connect a custom domain, add it too:

```env
CORS_ORIGINS=https://your-project.vercel.app,https://your-domain.com
```

## 6. Custom domain

For a public domain like `onlinetest.kz`:

1. Add the domain in Vercel project settings.
2. Configure DNS records at your domain registrar.
3. Add the same domain to Render `CORS_ORIGINS`.
4. Vercel will issue HTTPS automatically.

## 7. Local production check

Frontend:

```bash
npm run build --workspace apps/web
npm run start --workspace apps/web
```

Backend:

```bash
npm run start --workspace apps/api
```

## 8. Important production notes

- Do not commit `.env` files.
- Use a strong `JWT_SECRET`.
- Render free services can sleep after inactivity.
- For persistent file uploads, replace local uploads with S3, Cloudinary, or another object storage.
- MongoDB Atlas must allow network access from Render.
