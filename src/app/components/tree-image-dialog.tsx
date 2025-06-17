import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface TreeImageDialogProps {
  imageUrl: string;
  treeName: string;
  treeId: string;
}

export function TreeImageDialog({
  imageUrl,
  treeName,
  treeId,
}: TreeImageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Image
            src={imageUrl}
            alt={`Baum ${treeName}`}
            width={80}
            height={40}
            className="rounded-md object-cover"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            Baum {treeName} ({treeId})
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Image
            src={imageUrl}
            alt={`Baum ${treeName}`}
            width={600}
            height={400}
            className="rounded-lg object-cover"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
