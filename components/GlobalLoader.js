import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Logo from './Logo';

export default function GlobalLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => (url !== router.asPath) && setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="animate-pulse">
        <Logo className="w-64 h-20" />
      </div>
      <div className="mt-8 flex gap-2">
        <div className="w-3 h-3 bg-brand-pink rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="mt-4 text-brand-dark font-serif italic text-sm tracking-widest">Curating Masterpieces...</p>
    </div>
  );
}
