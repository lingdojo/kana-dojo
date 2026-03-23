export default function OfflinePage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4 text-center'>
      <h1 className='mb-4 text-2xl font-bold'>You&apos;re offline</h1>
      <p className='mb-4 text-gray-600'>
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className='rounded-lg bg-indigo-500 px-4 py-2 text-white transition-colors hover:bg-indigo-600'
      >
        Retry
      </button>
    </div>
  );
}
