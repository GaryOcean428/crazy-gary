/**
 * Advanced Cache Demo Page
 * Demonstrates all advanced caching features
 */

import React from 'react';
import { AdvancedCacheDemo } from '@/lib/cache/advanced-cache-demo';

const AdvancedCacheDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdvancedCacheDemo />
    </div>
  );
};

export default AdvancedCacheDemoPage;