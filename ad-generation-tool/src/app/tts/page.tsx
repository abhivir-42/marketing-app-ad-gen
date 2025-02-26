'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TTS() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the results page since we've merged the functionality
    router.push('/results');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <LoadingSpinner text="Redirecting to Results page..." />
    </div>
  );
} 