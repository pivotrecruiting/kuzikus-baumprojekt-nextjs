"use client";

import { useState, useEffect } from "react";
import Container from "@/app/components/container";
import { InputWithLabel } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ErrorMessage } from "@/app/(pages)/(auth)/components/error-message";
import { Upload } from "lucide-react";

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
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: Implement form submission logic
      console.log("Form data:", formData);
    }

    setIsSubmitting(false);
  };

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
              <div className="border-muted-foreground/25 hover:border-muted-foreground/50 rounded-md border-2 border-dashed p-6 text-center transition-colors">
                <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground mb-2 text-sm">
                  Klicke hier oder ziehe ein Bild hierher
                </p>
                <p className="text-muted-foreground text-xs">
                  PNG, JPG, WEBP bis 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="treeImage"
                  name="treeImage"
                />
              </div>
            </div>
          </div>

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
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
