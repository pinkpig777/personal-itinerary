import AuthControls from './AuthControls';

export default function AccessGate({
  isUnauthorized = false,
  title = 'Private Itineraries',
  message = ''
}) {
  const resolvedMessage = message || (
    isUnauthorized
      ? 'This Google account does not have access to this trip.'
      : 'Sign in with Google to see the trips assigned to your account.'
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-4xl justify-end">
        <AuthControls />
      </div>

      <div className="mx-auto mt-16 max-w-2xl border border-white p-8 text-center">
        <div className="mb-6 inline-flex items-center gap-2 border border-[#333333] px-6 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-gray-400">
          Restricted Access
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          {resolvedMessage}
        </p>
      </div>
    </div>
  );
}
