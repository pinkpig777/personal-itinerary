import { useAuth } from '../context/AuthContext';

export default function AuthControls({
  compact = false,
  showStatus = true,
  showAction = true,
  align = 'end'
}) {
  const { authError, isSuperAdmin, isAuthLoading, signInWithGoogle, signOutUser, user } = useAuth();

  const sharedButtonClasses = compact
    ? 'px-3 py-1.5 text-[10px]'
    : 'px-4 py-2 text-xs';
  const alignmentClasses = align === 'center' ? 'items-center' : 'items-end';

  return (
    <div className={`flex flex-col gap-2 ${alignmentClasses}`}>
      {isAuthLoading ? (
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
          Checking access
        </div>
      ) : user ? (
        <div className="flex items-center gap-2">
          {showStatus && (
            <div className="border border-[#333333] px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
                {isSuperAdmin ? 'Super Admin' : 'Signed In'}
              </p>
              <p className="max-w-[180px] truncate text-[10px] uppercase tracking-[0.15em] text-gray-500">
                {user.email}
              </p>
            </div>
          )}
          {showAction && (
            <button
              onClick={signOutUser}
              className={`${sharedButtonClasses} border border-[#333333] font-bold uppercase tracking-[0.2em] text-gray-300 transition-colors hover:border-white hover:bg-white hover:text-black`}
            >
              Sign Out
            </button>
          )}
        </div>
      ) : showAction ? (
        <button
          onClick={signInWithGoogle}
          className={`${sharedButtonClasses} border border-white font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black`}
        >
          Sign In
        </button>
      ) : null}

      {authError && (
        <p className={`max-w-xs text-[10px] font-bold uppercase tracking-[0.15em] text-red-500 ${align === 'center' ? 'text-center' : 'text-right'}`}>
          {authError}
        </p>
      )}
    </div>
  );
}
