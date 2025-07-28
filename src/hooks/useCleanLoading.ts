"use client";

import { useState } from 'react';

// Hook super simples - apenas useState normal
export function useCleanLoading(initialLoading = true) {
  const [loading, setLoading] = useState(initialLoading);

  return {
    loading,
    setLoading
  };
}
