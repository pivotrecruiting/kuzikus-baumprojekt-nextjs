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

  // Standardwerte
  let width = img.width;
  let height = img.height;
  let rotate = 0;
  let flipX = false;
  let flipY = false;

  // Orientierung auswerten (EXIF-Standard)
  // https://magnushoff.com/articles/jpeg-orientation/
  switch (orientation) {
    case "Rotate 90 CW":
      width = img.height;
      height = img.width;
      rotate = 90;
      break;
    case "Rotate 180":
      rotate = 180;
      break;
    case "Rotate 270 CW":
      width = img.height;
      height = img.width;
      rotate = 270;
      break;
    case "Flip horizontal":
      flipX = true;
      break;
    case "Flip vertical":
      flipY = true;
      break;
    // Weitere Fälle je nach Bedarf
    default:
      // Keine Rotation
      break;
  }

  canvas.width = width;
  canvas.height = height;

  // Transformation anwenden
  ctx.save();
  if (rotate) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    if (rotate === 90 || rotate === 270) {
      ctx.drawImage(img, -height / 2, -width / 2, height, width);
    } else {
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    }
  } else {
    if (flipX || flipY) {
      ctx.translate(flipX ? width : 0, flipY ? height : 0);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    }
    ctx.drawImage(img, 0, 0, width, height);
  }
  ctx.restore();

  // Als JPEG ohne EXIF exportieren
  return canvas.toDataURL("image/jpeg", 0.92);
};
