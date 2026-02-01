export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="animate-pulse">
        <img
          src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
          alt="Gradex Logo"
          width={64}
          height={64}
          className="h-16 w-16"
        />
      </div>
      <div className="mt-6 flex items-center gap-1.5">
        <div
          className="h-2 w-2 rounded-full bg-violet-600 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="h-2 w-2 rounded-full bg-violet-600 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-2 w-2 rounded-full bg-violet-600 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
