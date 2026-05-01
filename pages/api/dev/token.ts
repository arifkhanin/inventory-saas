import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    process.env.NODE_ENV !==
    "development"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not allowed",
    });
  }

  return res.status(200).json({
    success: true,
    message:
      "Use browser console helper route instead",
    note:
      "Token is stored client-side session. Server route cannot reliably read it in your current setup.",
  });
}