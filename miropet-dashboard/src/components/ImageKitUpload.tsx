import { CloudUpload, Delete, Image as ImageIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { IKContext, IKUpload } from "imagekitio-react";
import React, { useState } from "react";

interface ImageKitUploadProps {
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError?: (error: any) => void;
  existingImageUrl?: string;
  onRemove?: () => void;
  disabled?: boolean;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

const ImageKitUpload: React.FC<ImageKitUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  existingImageUrl,
  onRemove,
  disabled = false,
  maxSize = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl || "");

  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  const authenticationEndpoint =
    import.meta.env.VITE_API_URL + "/imagekit/auth";

  // Authenticator function that calls backend endpoint
  const authenticator = async () => {
    try {
      const response = await fetch(authenticationEndpoint, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with ImageKit");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("ImageKit authentication error:", error);
      throw error;
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      setUploadError(
        `فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: ${acceptedFormats.join(
          ", "
        )}`
      );
      return false;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      setUploadError(`حجم فایل نباید بیشتر از ${maxSize} مگابایت باشد`);
      return false;
    }

    return true;
  };

  const onError = (err: any) => {
    console.error("ImageKit upload error:", err);
    const errorMessage = err?.message || "خطا در آپلود تصویر";
    setUploadError(errorMessage);
    setUploading(false);
    if (onUploadError) {
      onUploadError(err);
    }
  };

  const onSuccess = (res: any) => {
    console.log("ImageKit upload success:", res);
    setPreviewUrl(res.url);
    setUploading(false);
    setUploadError("");
    onUploadSuccess(res.url);
  };

  const onUploadStart = (evt: any) => {
    console.log("Upload started:", evt);
    setUploading(true);
    setUploadError("");
  };

  const onUploadProgress = (progress: any) => {
    console.log("Upload progress:", progress);
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    if (onRemove) {
      onRemove();
    }
  };

  if (!publicKey || !urlEndpoint || !authenticationEndpoint) {
    return (
      <Alert severity="error">
        تنظیمات ImageKit در متغیرهای محیطی یافت نشد
      </Alert>
    );
  }

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      transformationPosition="path"
      authenticator={authenticator}
    >
      <Box sx={{ width: "100%" }}>
        {previewUrl ? (
          <Card sx={{ maxWidth: 300, mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={previewUrl}
              alt="Uploaded image"
              sx={{ objectFit: "cover" }}
            />
            <Box
              sx={{ p: 1, display: "flex", justifyContent: "space-between" }}
            >
              <Typography variant="caption" color="textSecondary">
                تصویر آپلود شده
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        ) : (
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              backgroundColor: "#fafafa",
              position: "relative",
              "&:hover": {
                borderColor: disabled || uploading ? "#ccc" : "#999",
                backgroundColor: disabled || uploading ? "#fafafa" : "#f5f5f5",
              },
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
            <Typography variant="body2" color="textSecondary" gutterBottom>
              تصویر خود را انتخاب کنید
            </Typography>
            <Typography variant="caption" color="textSecondary">
              حداکثر {maxSize}MB - فرمت‌های مجاز: JPG, PNG, GIF, WebP
            </Typography>

            <IKUpload
              fileName={`product-image-${Date.now()}`}
              folder="/products"
              onError={onError}
              onSuccess={onSuccess}
              onUploadStart={onUploadStart}
              onUploadProgress={onUploadProgress}
              validateFile={validateFile}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: disabled || uploading ? "default" : "pointer",
              }}
              disabled={disabled || uploading}
            />
          </Box>
        )}

        {uploadError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {uploadError}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">
              در حال آپلود...
            </Typography>
          </Box>
        )}

        {previewUrl && !uploading && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              disabled={disabled}
              size="small"
              onClick={handleRemoveImage}
            >
              تغییر تصویر
            </Button>
          </Box>
        )}
      </Box>
    </IKContext>
  );
};

export default ImageKitUpload;
