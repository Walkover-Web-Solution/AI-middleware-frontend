import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Custom hook for managing history page navigation and URL parameters
 * Centralizes navigation logic and URL parameter management
 */
export const useHistoryNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoized current parameters
  const currentParams = useMemo(() => ({
    version: searchParams.get('version'),
    threadId: searchParams.get('thread_id'),
    subThreadId: searchParams.get('subThread_id'),
    messageId: searchParams.get('message_id'),
    start: searchParams.get('start'),
    end: searchParams.get('end'),
    error: searchParams.get('error') === 'true'
  }), [searchParams]);

  // URL encoding helper
  const encodeParam = useCallback((param) => {
    if (!param) return '';
    return encodeURIComponent(param.replace(/&/g, '%26'));
  }, []);

  // Build URL with parameters
  const buildUrl = useCallback((params = {}) => {
    const urlParams = new URLSearchParams();
    
    // Add parameters if they exist
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.set(key, value);
      }
    });

    return `${pathname}?${urlParams.toString()}`;
  }, [pathname]);

  // Navigate to thread
  const navigateToThread = useCallback((threadId, options = {}) => {
    const {
      subThreadId = threadId,
      version = currentParams.version,
      messageId = null,
      start = currentParams.start,
      end = currentParams.end,
      error = currentParams.error,
      shallow = true
    } = options;

    const url = buildUrl({
      version,
      thread_id: encodeParam(threadId),
      subThread_id: encodeParam(subThreadId),
      ...(messageId && { message_id: messageId }),
      ...(start && { start }),
      ...(end && { end }),
      ...(error && { error: 'true' })
    });

    router.push(url, { shallow });
  }, [router, buildUrl, encodeParam, currentParams]);

  // Navigate to sub thread
  const navigateToSubThread = useCallback((subThreadId, threadId, options = {}) => {
    const {
      version = currentParams.version,
      messageId = currentParams.messageId,
      start = currentParams.start,
      end = currentParams.end,
      shallow = true
    } = options;

    const url = buildUrl({
      version,
      thread_id: encodeParam(threadId || currentParams.threadId),
      subThread_id: encodeParam(subThreadId),
      ...(messageId && { message_id: messageId }),
      ...(start && { start }),
      ...(end && { end })
    });

    router.push(url, { shallow });
  }, [router, buildUrl, encodeParam, currentParams]);

  // Navigate with search
  const navigateWithSearch = useCallback((searchQuery, options = {}) => {
    const {
      version = currentParams.version,
      messageId = null
    } = options;

    const url = buildUrl({
      version,
      ...(messageId && { message_id: messageId })
    });

    router.push(url, { shallow: true });
  }, [router, buildUrl, currentParams]);

  // Navigate to first available thread
  const navigateToFirstThread = useCallback((historyData, options = {}) => {
    if (!Array.isArray(historyData) || historyData.length === 0) return;

    const firstThread = historyData[0];
    if (firstThread?.thread_id) {
      navigateToThread(firstThread.thread_id, options);
    }
  }, [navigateToThread]);

  // Update URL parameters without navigation
  const updateUrlParams = useCallback((params) => {
    const url = buildUrl({ ...currentParams, ...params });
    window.history.replaceState(null, '', url);
  }, [buildUrl, currentParams]);

  // Clean URL (remove all params except version)
  const cleanUrl = useCallback(() => {
    const url = buildUrl({ 
      ...(currentParams.version && { version: currentParams.version })
    });
    window.history.replaceState({}, '', url);
  }, [buildUrl, currentParams.version]);

  return {
    // Current state
    currentParams,
    pathname,
    
    // Navigation functions
    navigateToThread,
    navigateToSubThread,
    navigateWithSearch,
    navigateToFirstThread,
    updateUrlParams,
    cleanUrl,
    buildUrl,
    encodeParam,
    
    // Router instance for direct access
    router
  };
};

export default useHistoryNavigation;
