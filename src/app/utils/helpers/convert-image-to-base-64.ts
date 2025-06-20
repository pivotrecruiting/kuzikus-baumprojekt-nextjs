export const convertImageToBase64 = async (
  file: File,
  orientation?: string
): Promise<string> => {
  // Bild als DataURL laden
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Bild-Objekt erstellen
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  // Canvas vorbereiten
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context konnte nicht erstellt werden");

  // Transformationen
  switch (orientation) {
    case "Rotate 90 CW":
      if (img.height > img.width) {
        // Spezialfall: Bild ist schon im Hochformat, keine Rotation nötig
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      } else {
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.restore();
      }
      break;
    case "Rotate 180":
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.save();
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      ctx.restore();
      break;
    case "Rotate 270 CW":
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-img.width, 0);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      ctx.restore();
      break;
    case "Flip horizontal":
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      ctx.restore();
      break;
    case "Flip vertical":
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.save();
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      ctx.restore();
      break;
    default:
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      break;
  }

  const debugDataUrl = canvas.toDataURL("image/jpeg", 0.92);

  // Als JPEG ohne EXIF exportieren
  return debugDataUrl;
};
