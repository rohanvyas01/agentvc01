// Responsive utility functions

export const getResponsiveValue = <T>(
  mobile: T,
  tablet: T,
  desktop: T,
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop'
): T => {
  switch (currentBreakpoint) {
    case 'mobile':
      return mobile;
    case 'tablet':
      return tablet;
    case 'desktop':
      return desktop;
    default:
      return desktop;
  }
};

export const getResponsiveClasses = (
  mobile: string,
  tablet: string,
  desktop: string
): string => {
  return `${mobile} md:${tablet} lg:${desktop}`;
};

export const getResponsiveSpacing = (
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string => {
  const spacingMap = {
    mobile: {
      xs: 'space-y-2',
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8'
    },
    tablet: {
      xs: 'space-y-3',
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
      xl: 'space-y-12'
    },
    desktop: {
      xs: 'space-y-4',
      sm: 'space-y-6',
      md: 'space-y-8',
      lg: 'space-y-12',
      xl: 'space-y-16'
    }
  };

  return spacingMap[breakpoint][size];
};

export const getResponsiveTextSize = (
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl',
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string => {
  const textSizeMap = {
    mobile: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
      '2xl': 'text-xl',
      '3xl': 'text-2xl',
      '4xl': 'text-3xl'
    },
    tablet: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl'
    },
    desktop: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl'
    }
  };

  return textSizeMap[breakpoint][size];
};

export const getResponsivePadding = (
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string => {
  const paddingMap = {
    mobile: {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
      xl: 'p-6'
    },
    tablet: {
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8'
    },
    desktop: {
      xs: 'p-4',
      sm: 'p-5',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }
  };

  return paddingMap[breakpoint][size];
};

// Utility to check if device supports hover
export const supportsHover = (): boolean => {
  return window.matchMedia('(hover: hover)').matches;
};

// Utility to check if device has a coarse pointer (touch)
export const hasCoarsePointer = (): boolean => {
  return window.matchMedia('(pointer: coarse)').matches;
};

// Utility to get optimal image sizes for different breakpoints
export const getResponsiveImageSizes = (
  baseWidth: number
): { mobile: number; tablet: number; desktop: number } => {
  return {
    mobile: Math.round(baseWidth * 0.5),
    tablet: Math.round(baseWidth * 0.75),
    desktop: baseWidth
  };
};

// Utility to determine if animations should be reduced
export const shouldReduceMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};