'use client';

import { Music, Youtube, Waves, Cloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const services = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: Music,
    color: '#1DB954',
    description: 'Stream millions of songs',
  },
  {
    id: 'youtube',
    name: 'YouTube Music',
    icon: Youtube,
    color: '#FF0000',
    description: 'Music videos & more',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: Cloud,
    color: '#FF5500',
    description: 'Discover new music',
  },
  {
    id: 'tidal',
    name: 'Tidal',
    icon: Waves,
    color: '#000000',
    description: 'High fidelity sound',
  },
];

export function SelectionCards({ 
  type, 
  selected, 
  onSelect, 
  disabled = null,
  loading = false 
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {services.map((service) => {
        const isSelected = selected === service.id;
        const isDisabled = disabled === service.id || loading;
        const Icon = service.icon;

        return (
          <Card
            key={service.id}
            onClick={() => !isDisabled && onSelect(service.id)}
            className={cn(
              'cursor-pointer transition-all duration-300 ease-in-out',
              isSelected && 'border-[#4A90E2] border-2 bg-white',
              isDisabled && 'opacity-50 cursor-not-allowed',
              !isSelected && !isDisabled && 'hover:border-[#4A90E2]/50 hover:scale-[1.02]'
            )}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div 
                className={cn(
                  'mb-3 rounded-full p-3 transition-all duration-300',
                  isSelected ? 'bg-[#4A90E2]/10' : 'bg-[#F8F9FA]'
                )}
              >
                <Icon 
                  className={cn(
                    'h-8 w-8 transition-colors duration-300',
                    isSelected ? 'text-[#4A90E2]' : 'text-[#6C757D]'
                  )}
                />
              </div>
              <h3 className={cn(
                'font-medium transition-colors duration-300',
                isSelected ? 'text-[#212529]' : 'text-[#6C757D]'
              )}>
                {service.name}
              </h3>
              <p className="text-xs text-[#6C757D] mt-1">
                {service.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { services };

