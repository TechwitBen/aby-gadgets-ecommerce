import { Truck } from "lucide-react";

interface AnnouncementBarProps {
  primary?: string;
  secondary?: string;
}

const AnnouncementBar = ({
  primary = "Free express shipping on all orders over ₦50,000",
  secondary = "New pre-owned phones added daily",
}: AnnouncementBarProps) => (
  <div
    role="region"
    aria-label="Announcement"
    className="w-full bg-[#FBF0A5] text-gray-800"
  >
    <div className="container mx-auto px-4 sm:px-6">
      <div className="flex h-9 sm:h-10 items-center justify-center gap-2 text-[11px] sm:text-[13px] font-medium uppercase tracking-wide">
        <Truck className="h-4 w-4 sm:h-[18px] sm:w-[18px] flex-shrink-0" aria-hidden />
        <p className="truncate">
          {primary}
          {secondary && (
            <>
              <span className="hidden sm:inline mx-2.5">|</span>
              <span className="hidden sm:inline">{secondary}</span>
            </>
          )}
        </p>
      </div>
    </div>
  </div>
);

export default AnnouncementBar;