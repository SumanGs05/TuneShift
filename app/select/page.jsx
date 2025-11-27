'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SelectionCards } from '@/components/SelectionCards';
import { AuthModal } from '@/components/AuthModal';
import { useAppStore } from '@/lib/store';
import { getServiceName } from '@/lib/utils';

export default function SelectPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    sourceService,
    destService,
    setSourceService,
    setDestService,
  } = useAppStore();

  const handleMigrate = () => {
    if (!sourceService || !destService) {
      toast.error('Please select both source and destination services');
      return;
    }

    if (sourceService === destService) {
      toast.error('Source and destination must be different');
      return;
    }

    setShowAuthModal(true);
  };

  const handleAuthComplete = () => {
    setShowAuthModal(false);
    setIsLoading(true);
    toast.success('Connected! Redirecting to migration...');
    setTimeout(() => {
      router.push('/migrate');
    }, 500);
  };

  const handleAuthError = (error) => {
    toast.error(error || 'Authentication failed. Please try again.');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
            Transfer Your Playlists
          </h1>
          <p className="text-[#6C757D] max-w-md mx-auto">
            Select your source and destination music services to migrate your playlists seamlessly.
          </p>
        </div>

        {/* Selection Form */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Source Selection */}
          <Card className="bg-white border-[#E9ECEF]">
            <CardHeader>
              <CardTitle className="text-lg">Source Service</CardTitle>
              <CardDescription>
                Where your playlists currently live
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelectionCards
                type="source"
                selected={sourceService}
                onSelect={setSourceService}
                disabled={null}
                loading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Destination Selection */}
          <Card className="bg-white border-[#E9ECEF]">
            <CardHeader>
              <CardTitle className="text-lg">Destination Service</CardTitle>
              <CardDescription>
                Where you want to transfer them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelectionCards
                type="destination"
                selected={destService}
                onSelect={setDestService}
                disabled={sourceService}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Summary */}
        {(sourceService || destService) && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-[#F8F9FA] border border-[#E9ECEF]">
              <span className={sourceService ? 'text-[#212529]' : 'text-[#6C757D]'}>
                {sourceService ? getServiceName(sourceService) : 'Select source'}
              </span>
              <ArrowRight className="h-4 w-4 text-[#6C757D]" />
              <span className={destService ? 'text-[#212529]' : 'text-[#6C757D]'}>
                {destService ? getServiceName(destService) : 'Select destination'}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleMigrate}
            disabled={!sourceService || !destService || sourceService === destService || isLoading}
            className="px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect & Migrate
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Auth Modal */}
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          sourceService={sourceService}
          destService={destService}
          onComplete={handleAuthComplete}
          onError={handleAuthError}
        />
      </div>
    </div>
  );
}


