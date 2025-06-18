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
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [treeImage, setTreeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<unknown>(null);
  const [googleMapsLink, setGoogleMapsLink] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    const newErrors: typeof errors = {};

    if (!formData.owner.trim()) {
      newErrors.owner = "Inhaber*in ist erforderlich";
    }

    if (!formData.occasion.trim()) {
      newErrors.occasion = "Anlass ist erforderlich";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Ablaufdatum ist erforderlich";
    }

    if (!formData.treeId.trim()) {
      newErrors.treeId = "Baum-ID ist erforderlich";
    }

    if (!formData.photographer.trim()) {
      newErrors.photographer = "Fotograf*in ist erforderlich";
    }

    if (!treeImage) {
      newErrors.treeImage = "Baumbild ist erforderlich";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: Implement form submission logic with treeImage
      console.log("Form data:", formData);
      console.log("Tree image:", treeImage);
      console.log("Image metadata:", imageMetadata);
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
