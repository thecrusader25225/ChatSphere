import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  const body = req.body;

  // Check the token in request headers
  const token = req.headers['authorization']?.split(' ')[1];

  if (token !== process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          tokenPayload: JSON.stringify({
            // Additional payload if needed
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob, tokenPayload);
        // Handle post-upload logic (e.g., save the URL to the database)
      },
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(400).json({ error: error.message });
  }
}
