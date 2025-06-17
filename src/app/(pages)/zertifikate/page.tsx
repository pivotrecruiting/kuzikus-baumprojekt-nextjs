import Container from "@/app/components/container";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeDialog } from "@/app/components/qr-code-dialog";

// Mockdaten für 5 Zertifikate
const mockCertificates = [
  {
    id: "VE-229",
    owner: "Sonja und Felix B.",
    occasion: "Hochzeit",
    creationDate: "24.04.2024",
    expiryDate: "24.04.2025",
    treeImg: "/tree-1.webp",
    qr: "/qr-code.png",
    qrLink: "https://kuzikus.de/zertifikate/VE-229",
    coordinates: "-23.23373, 18.39033",
    treeName: "Kameldornbaum",
    treeId: "VE-589",
    photographer: "Friedrich Reinhard",
  },
  {
    id: "VE-230",
    owner: "Anna S.",
    occasion: "Geburtstag",
    creationDate: "12.03.2024",
    expiryDate: "12.03.2025",
    treeImg: "/tree-1.webp",
    qr: "/qr-code.png",
    qrLink: "https://kuzikus.de/zertifikate/VE-230",
    coordinates: "-23.23380, 18.39040",
    treeName: "Kameldornbaum",
    treeId: "VE-598",
    photographer: "Friedrich Reinhard",
  },
  {
    id: "VE-231",
    owner: "Max M.",
    occasion: "Geburtstag",
    creationDate: "01.01.2024",
    expiryDate: "01.01.2025",
    treeImg: "/tree-1.webp",
    qr: "/qr-code.png",
    qrLink: "https://kuzikus.de/zertifikate/VE-231",
    coordinates: "-23.23390, 18.39050",
    treeName: "Kameldornbaum",
    treeId: "VE-436",
    photographer: "Friedrich Reinhard",
  },
  {
    id: "VE-232",
    owner: "Lisa K.",
    occasion: "Geburtstag",
    creationDate: "15.02.2024",
    expiryDate: "15.02.2025",
    treeImg: "/tree-1.webp",
    qr: "/qr-code.png",
    qrLink: "https://kuzikus.de/zertifikate/VE-232",
    coordinates: "-23.23400, 18.39060",
    treeName: "Kameldornbaum",
    treeId: "VE-202",
    photographer: "Friedrich Reinhard",
  },
  {
    id: "VE-233",
    owner: "Paul W.",
    occasion: "Geburtstag",
    creationDate: "20.05.2024",
    expiryDate: "20.05.2025",
    treeImg: "/tree-1.webp",
    qr: "/qr-code.png",
    qrLink: "https://kuzikus.de/zertifikate/VE-233",
    coordinates: "-23.23410, 18.39070",
    treeName: "Kameldornbaum",
    treeId: "VE-770",
    photographer: "Friedrich Reinhard",
  },
];

export default function Page() {
  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Zertifikate</h1>
        <Link href="/zertifikate/erstellen" className="ml-4">
          <Button variant="default" size="md" className="gap-2">
            <Plus className="h-5 w-5" />
            Zertifikat erstellen
          </Button>
        </Link>
      </div>
      <ScrollArea className="bg-card border-primary max-h-[70vh] rounded-lg border px-2 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inhaber*in</TableHead>
              <TableHead>Anlass*</TableHead>
              <TableHead>Patenschafts-ID*</TableHead>
              <TableHead>Erstellungsdatum*</TableHead>
              <TableHead>Ablaufdatum*</TableHead>
              <TableHead>Baumbild*</TableHead>
              <TableHead>QR*</TableHead>
              <TableHead>Koordinaten*</TableHead>
              <TableHead>Baumname*</TableHead>
              <TableHead>Baum-ID*</TableHead>
              <TableHead>Fotograf*</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCertificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>{cert.owner}</TableCell>
                <TableCell>{cert.occasion}</TableCell>
                <TableCell>{cert.id}</TableCell>
                {/* Dates */}
                <TableCell>{cert.creationDate}</TableCell>
                <TableCell>{cert.expiryDate}</TableCell>
                <TableCell>
                  <Image
                    src={cert.treeImg}
                    alt="Baum"
                    width={80}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell>
                  <QRCodeDialog qrCodeUrl={cert.qr} linkUrl={cert.qrLink} />
                </TableCell>
                <TableCell>{cert.coordinates}</TableCell>
                <TableCell>{cert.treeName}</TableCell>
                <TableCell>{cert.treeId}</TableCell>
                <TableCell>{cert.photographer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Container>
  );
}
