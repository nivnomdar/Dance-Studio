interface AdminLoadingStateProps {
  message?: string;
}

export default function AdminLoadingState({ message = "טוען..." }: AdminLoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-lg text-[#4B2E83]/70">{message}</p>
        </div>
      </div>
    </div>
  );
} 