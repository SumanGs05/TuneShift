'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Music, Youtube, Waves, Cloud } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { getServiceName } from '@/lib/utils';

const serviceIcons = {
  spotify: Music,
  youtube: Youtube,
  soundcloud: Cloud,
  tidal: Waves,
};

export function AuthModal({
  open,
  onOpenChange,
  sourceService,
  destService,
  onComplete,
  onError,
}) {
  const [step, setStep] = useState('source'); // source, dest, complete
  const [sourceStatus, setSourceStatus] = useState('pending'); // pending, loading, success, error
  const [destStatus, setDestStatus] = useState('pending');

  useEffect(() => {
    if (open) {
      setStep('source');
      setSourceStatus('pending');
      setDestStatus('pending');
    }
  }, [open]);

  const handleSourceAuth = async () => {
    setSourceStatus('loading');
    try {
      const result = await signIn(sourceService, {
        redirect: false,
        callbackUrl: window.location.href,
      });

      if (result?.error) {
        setSourceStatus('error');
        onError?.(`Failed to authenticate with ${getServiceName(sourceService)}`);
        return;
      }

      setSourceStatus('success');
      setStep('dest');
    } catch (error) {
      setSourceStatus('error');
      onError?.(error.message);
    }
  };

  const handleDestAuth = async () => {
    setDestStatus('loading');
    try {
      const result = await signIn(destService, {
        redirect: false,
        callbackUrl: window.location.href,
      });

      if (result?.error) {
        setDestStatus('error');
        onError?.(`Failed to authenticate with ${getServiceName(destService)}`);
        return;
      }

      setDestStatus('success');
      setStep('complete');
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    } catch (error) {
      setDestStatus('error');
      onError?.(error.message);
    }
  };

  const SourceIcon = serviceIcons[sourceService] || Music;
  const DestIcon = serviceIcons[destService] || Music;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-[#4A90E2]" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-[#E9ECEF]" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Services</DialogTitle>
          <DialogDescription>
            Authorize access to transfer your playlists
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Service */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8F9FA]">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-white">
                <SourceIcon className="h-5 w-5 text-[#6C757D]" />
              </div>
              <div>
                <p className="font-medium text-[#212529]">
                  {getServiceName(sourceService)}
                </p>
                <p className="text-xs text-[#6C757D]">Source</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(sourceStatus)}
              {step === 'source' && sourceStatus === 'pending' && (
                <Button size="sm" onClick={handleSourceAuth}>
                  Connect
                </Button>
              )}
              {sourceStatus === 'error' && (
                <Button size="sm" variant="outline" onClick={handleSourceAuth}>
                  Retry
                </Button>
              )}
            </div>
          </div>

          {/* Destination Service */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8F9FA]">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-white">
                <DestIcon className="h-5 w-5 text-[#6C757D]" />
              </div>
              <div>
                <p className="font-medium text-[#212529]">
                  {getServiceName(destService)}
                </p>
                <p className="text-xs text-[#6C757D]">Destination</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(destStatus)}
              {step === 'dest' && destStatus === 'pending' && (
                <Button size="sm" onClick={handleDestAuth}>
                  Connect
                </Button>
              )}
              {destStatus === 'error' && (
                <Button size="sm" variant="outline" onClick={handleDestAuth}>
                  Retry
                </Button>
              )}
            </div>
          </div>

          {/* Complete State */}
          {step === 'complete' && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-medium text-[#212529]">All Connected!</p>
              <p className="text-sm text-[#6C757D]">Redirecting to migration...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
