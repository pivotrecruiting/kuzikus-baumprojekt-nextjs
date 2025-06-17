import FadeAnimation from "@/app/components/animations/fade-animation";
import { CompanyLogo } from "@/app/components/logos/company-logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted inset-0 z-50 min-h-screen py-12 backdrop-blur-sm">
      <FadeAnimation isVisible={true}>
        <div className="flex overflow-y-auto">
          <div className="flex w-full flex-col items-center justify-start px-4 py-4 sm:justify-center sm:px-6 sm:py-12 lg:px-8">
            <div className="mt-2 mb-4 flex-shrink-0 sm:mt-0">
              <Link href={`${process.env.NEXT_PUBLIC_APP_BASE_URL}`}>
                <CompanyLogo className="w-52 sm:w-56 md:w-60" />
              </Link>
            </div>

            <div className="flex w-full flex-1 items-start justify-center sm:items-center">
              <div className="bg-card relative mb-6 w-full max-w-md rounded-lg p-6 shadow-xl sm:mb-8 sm:p-6 md:p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </FadeAnimation>
    </div>
  );
}
