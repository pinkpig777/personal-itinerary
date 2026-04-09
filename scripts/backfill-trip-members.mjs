import {
  asString,
  asTimestamp,
  deleteDocument,
  listDocuments,
  patchDocument,
  readFields,
  readStringArrayField,
  readStringField
} from './firestoreAdminClient.mjs';

const normalizeList = (values = []) => [...new Set(values.filter(Boolean))].sort();

const buildMemberLabel = (userId, userRecord) => {
  return userRecord?.displayName?.trim() || userRecord?.emailLower || userId;
};

const userDocuments = await listDocuments('users_private');
const usersById = new Map(
  userDocuments.map((userDocument) => {
    const userId = userDocument.name.split('/').at(-1);
    const fields = readFields(userDocument);

    return [
      userId,
      {
        displayName: readStringField(fields, 'displayName') || '',
        emailLower: readStringField(fields, 'emailLower') || ''
      }
    ];
  })
);

const itineraryDocuments = await listDocuments('itineraries');
const runTimestamp = new Date().toISOString();

if (itineraryDocuments.length === 0) {
  console.log('No itinerary documents found.');
}

for (const itineraryDocument of itineraryDocuments) {
  const tripId = itineraryDocument.name.split('/').at(-1);
  const fields = readFields(itineraryDocument);
  const readerUids = normalizeList(readStringArrayField(fields, 'readerUids'));
  const writerUids = normalizeList(readStringArrayField(fields, 'writerUids'));
  const memberUids = normalizeList([
    ...readStringArrayField(fields, 'memberUids'),
    ...readerUids,
    ...writerUids
  ]);
  const expectedMembers = new Map();

  memberUids.forEach((userId) => {
    expectedMembers.set(userId, {
      label: buildMemberLabel(userId, usersById.get(userId)),
      role: writerUids.includes(userId) ? 'write' : 'read'
    });
  });

  const existingMemberDocuments = await listDocuments(`itineraries/${tripId}/members`);
  const existingMemberIds = new Set(
    existingMemberDocuments.map((memberDocument) => memberDocument.name.split('/').at(-1))
  );

  for (const [userId, member] of expectedMembers.entries()) {
    await patchDocument(`itineraries/${tripId}/members/${userId}`, {
      label: asString(member.label),
      role: asString(member.role),
      updatedAt: asTimestamp(runTimestamp)
    });

    console.log(`Backfilled trip member ${userId} on ${tripId}`);
  }

  for (const userId of existingMemberIds) {
    if (expectedMembers.has(userId)) {
      continue;
    }

    await deleteDocument(`itineraries/${tripId}/members/${userId}`);
    console.log(`Deleted stale trip member ${userId} from ${tripId}`);
  }
}
