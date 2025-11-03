# Cloudinary Setup Guide for Gradex

## What is Cloudinary?
Cloudinary is a cloud-based service that allows you to upload, store, and view files (images, PDFs, documents) directly in the browser. It's free for up to 25GB storage and 25GB bandwidth per month.

## Setup Instructions

### 1. Create a Free Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email or Google account
3. Verify your email address

### 2. Get Your Cloudinary Credentials

1. After logging in, go to the [Dashboard](https://console.cloudinary.com/)
2. You'll see your credentials:
   - **Cloud Name** (e.g., `dxyz1234`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 3. Update Your .env File

Open your `.env` file and replace the placeholder values:

```env
# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

Example (with fake credentials):
```env
CLOUDINARY_CLOUD_NAME=dxyz1234
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### 4. Restart Your Development Server

After updating the `.env` file:

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

## How It Works

### File Upload
When students submit assignments with files:
- Files are uploaded to Cloudinary (not your local server)
- Files are stored in the `gradex/submissions` folder in your Cloudinary account
- A secure URL is returned and stored in the database

### File Viewing
When teachers view submissions:
- **Images** (JPG, PNG, GIF, WEBP): Displayed directly in the modal
- **PDFs**: Displayed in an iframe viewer in the modal
- **Other files**: Show file icon with view/download buttons

### Benefits
✅ Files are viewable directly in browser (no download needed)
✅ PDFs open in browser PDF viewer
✅ Images are displayed with proper formatting
✅ Secure URLs with HTTPS
✅ No server storage needed
✅ Free tier: 25GB storage + 25GB bandwidth/month
✅ Automatic image optimization

## Troubleshooting

### "Failed to upload file" Error
- Check that your Cloudinary credentials are correct
- Make sure you've restarted the server after updating `.env`
- Verify your Cloudinary account is active

### Files Not Showing
- Check browser console for errors
- Verify the file URL starts with `https://res.cloudinary.com/`
- Make sure your Cloudinary account hasn't exceeded free tier limits

## File Size Limits

- Free tier: 10MB per file upload
- Paid plans: Up to 100MB per file

Current app limit: 5MB per file (set in frontend)

## Security

- Files are uploaded to your private Cloudinary account
- Only people with the secure URL can access files
- URLs are stored in your database and shown only to authorized teachers

## Support

For Cloudinary support: [https://support.cloudinary.com/](https://support.cloudinary.com/)
