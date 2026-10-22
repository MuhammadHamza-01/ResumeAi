import multer from "multer";
import crypto from "crypto";
import { ApiError } from "../utils/apiError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new ApiError("Only PDF, DOC, and DOCX files are allowed", 400));
    return;
  }

  cb(null, true);
};

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError("Cloudinary is not configured on the server", 500);
  }

  return { cloudName, apiKey, apiSecret };
};

const signParameters = (parameters, apiSecret) => {
  const serialized = Object.entries(parameters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
};

const sanitizeFileName = (fileName) =>
  fileName
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "resume";

export const uploadResumeToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      next(new ApiError("Resume file is required", 400));
      return;
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `resume-ai/resumes/${Date.now()}-${sanitizeFileName(
      req.file.originalname
    )}`;
    const parameters = {
      folder: "resume-ai/resumes",
      public_id: publicId.replace("resume-ai/resumes/", ""),
      timestamp,
    };

    const formData = new FormData();
    formData.append("file", new Blob([req.file.buffer]), req.file.originalname);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", parameters.folder);
    formData.append("public_id", parameters.public_id);
    formData.append("signature", signParameters(parameters, apiSecret));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      { method: "POST", body: formData }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error?.message || "Cloudinary upload failed");
    }

    req.file.cloudinary = {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      resourceType: result.resource_type,
      format: result.format,
    };

    delete req.file.buffer;
    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Failed to upload resume to Cloudinary", 502)
    );
  }
};

export const deleteResumeFromCloudinary = async (publicId) => {
  if (!publicId) return;

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = { public_id: publicId, timestamp };
  const formData = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature: signParameters(parameters, apiSecret),
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Cloudinary file deletion failed");
  }
};
