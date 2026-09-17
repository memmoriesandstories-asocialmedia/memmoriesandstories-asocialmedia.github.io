import React from 'react';
import iconSrc from '../assets/images/app_exclusive_icon_1789636435865.jpg';

interface AppIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showRing?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6 rounded-lg',
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-20 h-20 rounded-3xl',
};

export const AppIcon: React.FC<AppIconProps> = ({
  className = '',
  size = 'md',
  showRing = false,
}) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-rose-500/15 ${sizeClasses} ${
        showRing ? 'ring-2 ring-rose-500/30' : ''
      } ${className}`}
    >
      <img
        src={iconSrc}
        alt="Moments & Stories App Icon"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover select-none"
        loading="eager"
      />
    </div>
  );
};
