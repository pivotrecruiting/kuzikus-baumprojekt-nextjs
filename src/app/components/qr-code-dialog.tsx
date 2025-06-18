import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface QRCodeDialogProps {
  qrCodeUrl: string;
  linkUrl: string;
}

export function QRCodeDialog({ qrCodeUrl, linkUrl }: QRCodeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={40}
            height={40}
            className="rounded"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={200}
            height={200}
            className="rounded"
          />
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {linkUrl}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
