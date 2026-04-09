import { useEffect, useMemo, useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'none', label: 'No Access' },
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' }
];

const getRoleForUser = (trip, userId) => {
  if (trip?.writerUids?.includes(userId)) {
    return 'write';
  }

  if (trip?.readerUids?.includes(userId) || trip?.memberUids?.includes(userId)) {
    return 'read';
  }

  return 'none';
};

export default function AccessManagementModal({
  isOpen,
  trip,
  knownUsers,
  onClose,
  onSave
}) {
  const [rolesByUserId, setRolesByUserId] = useState({});
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const managedUsers = useMemo(() => {
    const usersById = new Map(knownUsers.map((user) => [user.uid, user]));
    const assignedUids = [...new Set([...(trip?.memberUids || []), ...(trip?.writerUids || []), ...(trip?.readerUids || [])])];

    assignedUids.forEach((uid) => {
      if (!usersById.has(uid)) {
        usersById.set(uid, {
          uid,
          displayName: 'Unknown User',
          emailLower: uid,
          isUnknown: true
        });
      }
    });

    return Array.from(usersById.values()).sort((left, right) => {
      const leftLabel = (left.displayName || left.emailLower || left.uid).toLowerCase();
      const rightLabel = (right.displayName || right.emailLower || right.uid).toLowerCase();

      return leftLabel.localeCompare(rightLabel);
    });
  }, [knownUsers, trip]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextRoles = {};
    managedUsers.forEach((user) => {
      nextRoles[user.uid] = getRoleForUser(trip, user.uid);
    });

    setRolesByUserId(nextRoles);
    setError('');
    setIsSaving(false);
  }, [isOpen, managedUsers, trip]);

  const readers = useMemo(() => {
    return managedUsers.filter((user) => rolesByUserId[user.uid] === 'read');
  }, [managedUsers, rolesByUserId]);

  const writers = useMemo(() => {
    return managedUsers.filter((user) => rolesByUserId[user.uid] === 'write');
  }, [managedUsers, rolesByUserId]);

  if (!isOpen || !trip) {
    return null;
  }

  const handleRoleChange = (userId, role) => {
    setRolesByUserId((current) => ({
      ...current,
      [userId]: role
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    const readerUids = [];
    const writerUids = [];

    Object.entries(rolesByUserId).forEach(([userId, role]) => {
      if (role === 'write') {
        writerUids.push(userId);
      } else if (role === 'read') {
        readerUids.push(userId);
      }
    });

    try {
      await onSave({
        tripId: trip.id,
        readerUids,
        writerUids
      });
      onClose();
    } catch (saveError) {
      console.error('Error updating trip access:', saveError);
      setError(saveError.message || 'Unable to update trip access right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatUserLabel = (user) => user.displayName || user.emailLower || user.uid;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center">
        <div className="access-modal-scrollbar w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#1E1E1E] p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                Manage Access
              </h2>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                {trip.name || trip.id}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="border border-[#333333] bg-[#121212] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                Current Readers
              </p>
              <p className="mt-3 text-sm text-white">
                {readers.length > 0
                  ? readers.map((user) => formatUserLabel(user)).join(', ')
                  : 'No read-only members yet.'}
              </p>
            </div>
            <div className="border border-[#333333] bg-[#121212] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                Current Writers
              </p>
              <p className="mt-3 text-sm text-white">
                {writers.length > 0
                  ? writers.map((user) => formatUserLabel(user)).join(', ')
                  : 'No writers assigned yet.'}
              </p>
            </div>
          </div>

          <p className="mb-4 border border-[#333333] bg-[#121212] p-4 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
            Users must sign in with Google once before they appear here.
          </p>

          {managedUsers.length === 0 ? (
            <div className="border border-[#333333] bg-[#121212] p-6 text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
              No signed-in users found yet.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="access-modal-scrollbar max-h-[420px] space-y-3 overflow-y-auto pr-2">
                {managedUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="grid gap-3 border border-[#333333] bg-[#121212] p-4 md:grid-cols-[minmax(0,1fr),180px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase tracking-[0.16em] text-white">
                        {formatUserLabel(user)}
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
                        {user.isUnknown ? `Registry missing for ${user.uid}` : user.emailLower || user.uid}
                      </p>
                    </div>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Role
                      </span>
                      <select
                        value={rolesByUserId[user.uid] || 'none'}
                        onChange={(event) => handleRoleChange(user.uid, event.target.value)}
                        className="border border-[#333333] bg-[#0A0A0A] px-3 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white focus:border-white focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>

              {error && (
                <p className="border border-red-500/50 bg-red-900/20 p-3 text-sm font-semibold text-red-400">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="border border-white bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-[#333333] disabled:bg-[#121212] disabled:text-gray-500"
                >
                  {isSaving ? 'Saving' : 'Save Access'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
