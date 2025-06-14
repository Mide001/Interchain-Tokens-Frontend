export default function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Title Skeleton */}
          <div className="h-7 bg-gray-200 rounded-lg w-3/4 mx-auto animate-pulse" />

          {/* Mobile Layout Skeleton */}
          <div className="block sm:hidden space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-400">OR</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Desktop Layout Skeleton */}
          <div className="hidden sm:flex gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-48 h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          <div className="hidden sm:block relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400">OR</span>
            </div>
          </div>

          <div className="hidden sm:block h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
} 