import "../configs/env.js";
import pkg from "google-auth-library";
const { OAuth2Client } = pkg;

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

export const verifyGoogleToken = async (token) => {
  if (!googleClientId) {
    throw new Error("Google client id is missing.");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: googleClientId
  });

  return ticket.getPayload();
};
