import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4A90E2]" />
        <p className="text-[#6C757D] text-sm">Loading...</p>
      </div>
    </div>
  );
}


