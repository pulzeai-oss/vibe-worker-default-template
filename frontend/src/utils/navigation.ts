/**
 * Navigation utility for proxy-aware routing
 * Handles navigation within the preview context when running through vibe-worker proxy
 */

import { useRouter } from 'next/navigation';

// Check if we're running through the vibe-worker proxy
const isProxyMode = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/preview/');
};

// Get the base path for navigation
const getBasePath = () => {
  return isProxyMode() ? '/preview' : '';
};

/**
 * Custom navigation hook that handles proxy-aware routing
 */
export const useProxyAwareRouter = () => {
  const router = useRouter();
  
  const push = (path: string) => {
    const basePath = getBasePath();
    const fullPath = `${basePath}${path}`;
    router.push(fullPath);
  };
  
  const replace = (path: string) => {
    const basePath = getBasePath();
    const fullPath = `${basePath}${path}`;
    router.replace(fullPath);
  };
  
  return {
    ...router,
    push,
    replace
  };
};