import Image from "next/image";

type CompanyLogoPropsT = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function CompanyLogo({
  className = "w-64 h-auto",
  width = 112,
  height = 30,
  priority = true,
}: CompanyLogoPropsT) {
  return (
    <div className={className}>
      <Image
        src="/company-logo.png"
        alt="Company Logo"
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-full object-contain"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
    </div>
  );
}
