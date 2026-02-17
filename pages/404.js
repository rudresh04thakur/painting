import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Custom404() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-9xl font-serif text-brand-dark opacity-10">404</h1>
        <div className="absolute">
          <h2 className="text-3xl font-bold text-brand-dark mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The masterpiece you are looking for seems to have been moved or doesn't exist.
          </p>
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-brand-dark text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
