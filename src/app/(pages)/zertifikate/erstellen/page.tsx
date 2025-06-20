"use client";

import { useState, useEffect, useRef } from "react";
import Container from "@/app/components/container";
import { InputWithLabel } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ErrorMessage } from "@/app/(pages)/(auth)/components/error-message";
import { Upload, X, MapPin, ExternalLink } from "lucide-react";
import exifr from "exifr";
import Image from "next/image";
import QRCode from "qrcode";
import { convertImageToBase64 } from "@/app/utils/helpers/convert-image-to-base-64";

// TypeScript interface for EXIF image metadata
interface ImageMetadata {
  // Basic camera information
  Make?: string;
  Model?: string;
  Software?: string;
  HostComputer?: string;

  // Image properties
  Orientation?: string;
  XResolution?: number;
  YResolution?: number;
  ResolutionUnit?: string;
  ExifImageWidth?: number;
  ExifImageHeight?: number;

  // Date and time
  ModifyDate?: string;
  DateTimeOriginal?: string;
  CreateDate?: string;
  OffsetTime?: string;
  OffsetTimeOriginal?: string;
  OffsetTimeDigitized?: string;

  // Exposure settings
  ExposureTime?: number;
  FNumber?: number;
  ExposureProgram?: string;
  ISO?: number;
  ExifVersion?: string;
  ShutterSpeedValue?: number;
  ApertureValue?: number;
  BrightnessValue?: number;
  ExposureCompensation?: number;
  MeteringMode?: string;
  Flash?: string;
  ExposureMode?: string;
  WhiteBalance?: string;

  // Lens information
  FocalLength?: number;
  FocalLengthIn35mmFormat?: number;
  LensInfo?: number[];
  LensMake?: string;
  LensModel?: string;

  // Image processing
  ComponentsConfiguration?: Record<string, number>;
  SubSecTimeOriginal?: string;
  SubSecTimeDigitized?: string;
  FlashpixVersion?: string;
  ColorSpace?: number;
  SensingMethod?: string;
  SceneType?: string;
  DigitalZoomRatio?: number;
  SceneCaptureType?: string;
  CompositeImage?: string;

  // Subject area
  SubjectArea?: Record<string, number>;

  // GPS information
  GPSLatitudeRef?: string;
  GPSLatitude?: number[];
  GPSLongitudeRef?: string;
  GPSLongitude?: number[];
  GPSAltitudeRef?: Record<string, number>;
  GPSAltitude?: number;
  GPSTimeStamp?: string;
  GPSSpeedRef?: string;
  GPSSpeed?: number;
  GPSImgDirectionRef?: string;
  GPSImgDirection?: number;
  GPSDestBearingRef?: string;
  GPSDestBearing?: number;
  GPSDateStamp?: string;
  GPSHPositioningError?: number;
  latitude?: number;
  longitude?: number;
}

export default function Page() {
  const [formData, setFormData] = useState({
    owner: "",
    occasion: "",
    expiryDate: "",
    treeId: "",
    photographer: "",
  });

  const [errors, setErrors] = useState<{
    owner?: string;
    occasion?: string;
    expiryDate?: string;
    treeId?: string;
    photographer?: string;
    treeImage?: string;
    latitude?: string;
    longitude?: string;
    mapsUrl?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [treeImage, setTreeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(
    null
  );
  const [googleMapsLink, setGoogleMapsLink] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
    mapsUrl: "",
    mapsParsed: false,
  });
  const [mapsParseError, setMapsParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prepare form data for R Markdown backend
  const prepareFormDataForRMarkdown = () => {
    // GPS-Quelle bestimmen
    let gpsLatitude = imageMetadata?.GPSLatitude || null;
    let gpsLongitude = imageMetadata?.GPSLongitude || null;
    let gpsLatitudeRef = imageMetadata?.GPSLatitudeRef || null;
    let gpsLongitudeRef = imageMetadata?.GPSLongitudeRef || null;

    // Falls keine EXIF-Koordinaten, nutze manuelle Eingabe
    if (!gpsLatitude && manualLocation.latitude && manualLocation.longitude) {
      const lat = parseFloat(manualLocation.latitude);
      const lon = parseFloat(manualLocation.longitude);
      gpsLatitude = [Math.abs(lat), 0, 0];
      gpsLongitude = [Math.abs(lon), 0, 0];
      gpsLatitudeRef = getLatRef(lat);
      gpsLongitudeRef = getLonRef(lon);
    }

    // Google Maps Link ggf. aus manuellen Koordinaten
    let mapsUrl = googleMapsLink;
    if (!mapsUrl && gpsLatitude && gpsLongitude) {
      const latDecimal =
        gpsLatitude[0] +
        (gpsLatitude[1] || 0) / 60 +
        (gpsLatitude[2] || 0) / 3600;
      const lonDecimal =
        gpsLongitude[0] +
        (gpsLongitude[1] || 0) / 60 +
        (gpsLongitude[2] || 0) / 3600;
      mapsUrl = `https://www.google.com/maps?q=${gpsLatitudeRef === "S" ? -latDecimal : latDecimal},${gpsLongitudeRef === "W" ? -lonDecimal : lonDecimal}`;
    }

    return {
      certificate: {
        ...formData,
        createdAt: new Date().toISOString(),
      },
      image: {
        fileName: treeImage?.name || null,
        fileSize: treeImage?.size || null,
        fileType: treeImage?.type || null,
        hasMetadata: !!imageMetadata,
        base64Data: null as string | null, // Wird später gesetzt
      },
      location: mapsUrl
        ? {
            googleMapsUrl: mapsUrl,
            hasQrCode: !!qrCodeDataUrl,
            qrCodeDataUrl: qrCodeDataUrl,
          }
        : null,
      metadata: {
        dateTime: imageMetadata?.DateTimeOriginal || null,
        make: imageMetadata?.Make || null,
        model: imageMetadata?.Model || null,
        imageWidth: imageMetadata?.ExifImageWidth || null,
        imageHeight: imageMetadata?.ExifImageHeight || null,
        gpsLatitude,
        gpsLatitudeRef,
        gpsLongitude,
        gpsLongitudeRef,
        software: imageMetadata?.Software || null,
        copyright: null,
      },
      generation: {
        format: "pdf",
        template: "tree-certificate",
        includeQrCode: !!qrCodeDataUrl,
        includeMetadata: !!imageMetadata,
        includeLocation: !!mapsUrl,
      },
    };
  };

  // Set default expiry date to 1 year from now
  const getDefaultExpiryDate = () => {
    const today = new Date();
    const oneYearFromNow = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate()
    );
    return oneYearFromNow.toISOString().split("T")[0];
  };

  // Initialize expiry date on component mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      expiryDate: getDefaultExpiryDate(),
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateImageFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Nur PNG, JPG und WEBP Dateien sind erlaubt";
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return "Datei darf maximal 10MB groß sein";
    }

    return null;
  };

  // Convert GPS coordinates from DMS (Degrees, Minutes, Seconds) to decimal
  const convertDMSToDecimal = (dms: number[]): number => {
    const [degrees, minutes, seconds] = dms;
    return degrees + minutes / 60 + seconds / 3600;
  };

  // Create Google Maps link from GPS coordinates
  const createGoogleMapsLink = (
    latitude: number[],
    longitude: number[]
  ): string => {
    const latDecimal = convertDMSToDecimal(latitude);
    const lngDecimal = convertDMSToDecimal(longitude);
    return `https://www.google.com/maps?q=${latDecimal},${lngDecimal}`;
  };

  // Generate QR code for Google Maps link
  const generateQRCode = async (url: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return qrDataUrl;
    } catch (error) {
      console.error("Fehler beim Generieren des QR-Codes:", error);
      throw error;
    }
  };

  const extractImageMetadata = async (file: File) => {
    try {
      // Extract all EXIF data
      const exifData = await exifr.parse(file);

      if (exifData) {
        console.log("EXIF Metadata:", exifData);
        setImageMetadata(exifData);

        // Log specific useful metadata
        if (exifData.DateTime) {
          console.log("Aufnahmedatum:", exifData.DateTime);
        }
        if (exifData.GPSLatitude && exifData.GPSLongitude) {
          console.log("GPS Koordinaten:", {
            latitude: exifData.GPSLatitude,
            longitude: exifData.GPSLongitude,
          });

          // Create Google Maps link from GPS coordinates
          const mapsLink = createGoogleMapsLink(
            exifData.GPSLatitude,
            exifData.GPSLongitude
          );
          setGoogleMapsLink(mapsLink);
          console.log("Google Maps Link:", mapsLink);

          // Generate QR code for the Google Maps link
          try {
            const qrCode = await generateQRCode(mapsLink);
            setQrCodeDataUrl(qrCode);
            console.log("QR Code generated successfully");
          } catch (qrError) {
            console.error("Fehler beim Generieren des QR-Codes:", qrError);
          }
        } else {
          // Clear GPS-related data if no coordinates found
          setGoogleMapsLink(null);
          setQrCodeDataUrl(null);
        }
        if (exifData.Make && exifData.Model) {
          console.log("Kamera:", `${exifData.Make} ${exifData.Model}`);
        }
        if (exifData.ImageWidth && exifData.ImageHeight) {
          console.log(
            "Bildgröße:",
            `${exifData.ImageWidth}x${exifData.ImageHeight}`
          );
        }
      } else {
        console.log("Keine EXIF-Metadaten gefunden");
        setImageMetadata(null);
        setGoogleMapsLink(null);
        setQrCodeDataUrl(null);
      }
    } catch (error) {
      console.error("Fehler beim Extrahieren der EXIF-Metadaten:", error);
      setImageMetadata(null);
      setGoogleMapsLink(null);
      setQrCodeDataUrl(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        treeImage: validationError,
      }));
      return;
    }

    // Clear any previous errors
    setErrors((prev) => ({
      ...prev,
      treeImage: undefined,
    }));

    // Set the file in state
    setTreeImage(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Extract image metadata
    extractImageMetadata(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        treeImage: validationError,
      }));
      return;
    }

    // Clear any previous errors
    setErrors((prev) => ({
      ...prev,
      treeImage: undefined,
    }));

    // Set the file in state
    setTreeImage(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Extract image metadata
    extractImageMetadata(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setTreeImage(null);
    setImageMetadata(null);
    setGoogleMapsLink(null);
    setQrCodeDataUrl(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => ({
      ...prev,
      treeImage: undefined,
    }));
  };

  const getLatRef = (lat: number) => (lat >= 0 ? "N" : "S");
  const getLonRef = (lon: number) => (lon >= 0 ? "E" : "W");

  // Funktion zum Parsen eines Google Maps Links
  const parseGoogleMapsUrl = (url: string) => {
    // 1. ?q=LAT,LNG
    const regexQ = /[?&]q=([\-\d.]+),([\-\d.]+)/;
    const matchQ = url.match(regexQ);
    if (matchQ) {
      const lat = matchQ[1];
      const lng = matchQ[2];
      setManualLocation((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        mapsParsed: true,
      }));
      setMapsParseError(null);
      return true;
    }
    // 2. /@LAT,LNG,
    const regexAt = /\/[@]([\-\d.]+),([\-\d.]+),/;
    const matchAt = url.match(regexAt);
    if (matchAt) {
      const lat = matchAt[1];
      const lng = matchAt[2];
      setManualLocation((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        mapsParsed: true,
      }));
      setMapsParseError(null);
      return true;
    }
    setMapsParseError("Konnte keine Koordinaten aus dem Link extrahieren.");
    setManualLocation((prev) => ({ ...prev, mapsParsed: false }));
    return false;
  };

  const handleManualLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setManualLocation((prev) => ({
      ...prev,
      [name]: value,
      mapsParsed: false,
    }));
    if (name === "mapsUrl") {
      if (value.length > 10) {
        parseGoogleMapsUrl(value);
      } else {
        setMapsParseError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: typeof errors & {
      latitude?: string;
      longitude?: string;
      mapsUrl?: string;
    } = {};

    if (!formData.owner.trim()) newErrors.owner = "Inhaber*in ist erforderlich";
    if (!formData.occasion.trim())
      newErrors.occasion = "Anlass ist erforderlich";
    if (!formData.expiryDate)
      newErrors.expiryDate = "Ablaufdatum ist erforderlich";
    if (!formData.treeId.trim()) newErrors.treeId = "Baum-ID ist erforderlich";
    if (!formData.photographer.trim())
      newErrors.photographer = "Fotograf*in ist erforderlich";
    if (!treeImage) newErrors.treeImage = "Baumbild ist erforderlich";

    // Wenn keine EXIF-Koordinaten, dann entweder Lat+Lng oder ein gültiger Maps-Link
    if (!imageMetadata?.GPSLatitude) {
      const latOk = manualLocation.latitude && manualLocation.longitude;
      const mapsOk = manualLocation.mapsUrl && manualLocation.mapsParsed;
      if (!latOk && !mapsOk) {
        newErrors.latitude = "Breitengrad oder Google Maps Link erforderlich";
        newErrors.longitude = "Längengrad oder Google Maps Link erforderlich";
        newErrors.mapsUrl =
          "Bitte Koordinaten eingeben oder einen gültigen Google Maps Link";
      }
      if (manualLocation.mapsUrl && !manualLocation.mapsParsed) {
        newErrors.mapsUrl = mapsParseError || "Ungültiger Google Maps Link";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const certificateData = prepareFormDataForRMarkdown();
        console.log("Prepared Certificate Data:", certificateData);
        if (treeImage) {
          const base64Data = await convertImageToBase64(
            treeImage,
            imageMetadata?.Orientation
          );
          certificateData.image.base64Data = base64Data;
        }
        const response = await fetch("/api/generate-certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(certificateData),
        });
        if (response.ok) {
          const result = await response.json();
          // TODO:  Add Success & error handling
          console.log("result: ", result);
        } else {
          console.error("Something went wrong");
        }
      } catch (error) {
        // Error handling
        console.error(error);
        return;
      }
    }
    setIsSubmitting(false);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Zertifikat erstellen
          </h1>
          <p className="text-muted-foreground mt-2">
            Erstelle ein neues Baumzertifikat mit allen erforderlichen
            Informationen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner */}
          <div className="relative">
            <InputWithLabel
              name="owner"
              label="Inhaber*in"
              type="text"
              id="owner"
              value={formData.owner}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.owner}
            />
            <ErrorMessage message={errors.owner || ""} />
          </div>

          {/* Occasion */}
          <div className="relative">
            <InputWithLabel
              name="occasion"
              label="Anlass"
              type="text"
              id="occasion"
              value={formData.occasion}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.occasion}
            />
            <ErrorMessage message={errors.occasion || ""} />
          </div>

          {/* Expiry Date */}
          <div className="relative">
            <div className="flex flex-col gap-1">
              <label htmlFor="expiryDate" className="pl-1 text-sm">
                Ablaufdatum
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                  className="bg-input w-full rounded-md border-transparent px-4 py-3 text-[16px] outline-none focus:border-transparent focus:ring-0 focus:outline focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-invalid={!!errors.expiryDate}
                />{" "}
              </div>
            </div>
            <ErrorMessage message={errors.expiryDate || ""} />
          </div>

          {/* Tree Image Upload */}
          <div className="relative">
            <div className="flex flex-col gap-1">
              <label className="pl-1 text-sm">Baumbild</label>
              {!imagePreview ? (
                <div
                  className="border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleImageDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-2 text-sm">
                    Klicke hier oder ziehe ein Bild hierher
                  </p>
                  <p className="text-muted-foreground text-xs">
                    PNG, JPG, WEBP bis 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="treeImage"
                    name="treeImage"
                    onChange={handleImageUpload}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="border-muted-foreground/25 rounded-md border-2 p-4">
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Baumbild Vorschau"
                        width={400}
                        height={320}
                        className="max-h-80 w-full rounded-md object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/80 absolute -top-2 -right-2 cursor-pointer rounded-full p-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {treeImage?.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <ErrorMessage message={errors.treeImage || ""} />
          </div>

          {/* Google Maps Link and QR Code */}
          {googleMapsLink && qrCodeDataUrl && (
            <div className="relative">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 pl-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  Standort
                </label>
                <div className="border-muted-foreground/25 rounded-md border-2 p-4">
                  <div className="flex flex-col items-center gap-4">
                    {/* QR Code */}
                    <div className="text-center">
                      <Image
                        src={qrCodeDataUrl}
                        alt="QR Code für Google Maps"
                        width={200}
                        height={200}
                        className="border-muted-foreground/25 mx-auto rounded-md border"
                      />
                      <p className="text-muted-foreground mt-2 text-xs">
                        QR-Code für Standort
                      </p>
                    </div>

                    {/* Google Maps Link */}
                    <div className="text-center">
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        In Google Maps öffnen
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tree ID */}
          <div className="relative">
            <InputWithLabel
              name="treeId"
              label="Baum-ID"
              type="text"
              id="treeId"
              value={formData.treeId}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.treeId}
            />
            <ErrorMessage message={errors.treeId || ""} />
          </div>

          {/* Photographer */}
          <div className="relative">
            <InputWithLabel
              name="photographer"
              label="Fotograf*in"
              type="text"
              id="photographer"
              value={formData.photographer}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.photographer}
            />
            <ErrorMessage message={errors.photographer || ""} />
          </div>

          {/* Manuelle Koordinaten-Eingabe */}
          {!imageMetadata?.GPSLatitude && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <InputWithLabel
                    name="latitude"
                    label="Breitengrad (Latitude)"
                    type="number"
                    step="any"
                    value={manualLocation.latitude}
                    onChange={handleManualLocationChange}
                    required={!manualLocation.mapsUrl}
                    error={errors.latitude}
                    readOnly={manualLocation.mapsParsed}
                  />
                </div>
                <div className="flex-1">
                  <InputWithLabel
                    name="longitude"
                    label="Längengrad (Longitude)"
                    type="number"
                    step="any"
                    value={manualLocation.longitude}
                    onChange={handleManualLocationChange}
                    required={!manualLocation.mapsUrl}
                    error={errors.longitude}
                    readOnly={manualLocation.mapsParsed}
                  />
                </div>
              </div>
              <div>
                <InputWithLabel
                  name="mapsUrl"
                  label="Google Maps Link (optional)"
                  type="text"
                  value={manualLocation.mapsUrl}
                  onChange={handleManualLocationChange}
                  error={errors.mapsUrl}
                  placeholder="https://www.google.com/maps?q=..."
                />
                {mapsParseError && (
                  <p className="text-destructive mt-1 text-sm">
                    {mapsParseError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Wird erstellt..." : "Zertifikat erstellen"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-muted"
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
