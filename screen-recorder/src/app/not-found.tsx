import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-6">Video not found</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Go Home
      </Link>
    </main>
  );
}
