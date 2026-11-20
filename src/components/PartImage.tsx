import { useState } from 'react';
import { Wrench } from 'lucide-react';

interface PartImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function PartImage({ src, alt, title, className = '' }: PartImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EBEBE7] text-[#52565E] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Wrench className="w-8 h-8 mb-2 stroke-[1.5] text-[#7A7F87]" />
        <span className="text-xs font-medium tracking-tight text-[#45484F] line-clamp-2 max-w-[180px]">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
