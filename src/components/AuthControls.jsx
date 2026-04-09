import { useAuth } from '../context/AuthContext';

export default function AuthControls({ compact = false }) {
  const { authError, isAdmin, isAuthLoading, signInWithGoogle, signOutUser, user } = useAuth();

  const sharedButtonClasses = compact
    ? 'px-3 py-1.5 text-[10px] md:text-xs'
    : 'px-4 py-2 text-xs';

  return (
    <div className="flex flex-col items-end gap-2">
      {isAuthLoading ? (
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
          Checking access
        </div>
      ) : user ? (
        <div className="flex items-center gap-2">
          <div className="border border-[#333333] px-3 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              {isAdmin ? 'Admin' : 'Read Only'}
            </p>
            <p className="max-w-[180px] truncate text-[10px] uppercase tracking-[0.15em] text-gray-500">
              {user.email}
            </p>
          </div>
          <button
            onClick={signOutUser}
            className={`${sharedButtonClasses} border border-[#333333] font-bold uppercase tracking-[0.2em] text-gray-300 transition-colors hover:border-white hover:bg-white hover:text-black`}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className={`${sharedButtonClasses} border border-white font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black`}
        >
          Admin Sign In
        </button>
      )}

      {authError && (
        <p className="max-w-xs text-right text-[10px] font-bold uppercase tracking-[0.15em] text-red-500">
          {authError}
        </p>
      )}
    </div>
  );
}
