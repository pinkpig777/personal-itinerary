import {
  asStringArray,
  asTimestamp,
  deleteDocument,
  listDocuments,
  patchDocument,
  readFields,
  readStringArrayField
} from './firestoreAdminClient.mjs';

const normalizeList = (values = []) => [...new Set(values.filter(Boolean))].sort();

const userAccessMap = new Map();
const itineraryDocuments = await listDocuments('itineraries');

itineraryDocuments.forEach((document) => {
  const tripId = document.name.split('/').at(-1);
  const fields = readFields(document);
  const readerUids = normalizeList(readStringArrayField(fields, 'readerUids'));
  const writerUids = normalizeList(readStringArrayField(fields, 'writerUids'));
  const memberUids = normalizeList([
    ...readStringArrayField(fields, 'memberUids'),
    ...readerUids,
    ...writerUids
  ]);

  memberUids.forEach((userId) => {
    const current = userAccessMap.get(userId) || { tripIds: [], writeTripIds: [] };
    current.tripIds.push(tripId);

    if (writerUids.includes(userId)) {
      current.writeTripIds.push(tripId);
    }

    userAccessMap.set(userId, current);
  });
});

const existingAccessDocs = await listDocuments('user_trip_access');
const existingUserIds = new Set(existingAccessDocs.map((document) => document.name.split('/').at(-1)));
const nextUserIds = new Set(userAccessMap.keys());

for (const [userId, access] of userAccessMap.entries()) {
  await patchDocument(`user_trip_access/${userId}`, {
    tripIds: asStringArray(normalizeList(access.tripIds)),
    writeTripIds: asStringArray(normalizeList(access.writeTripIds)),
    updatedAt: asTimestamp(new Date().toISOString())
  });

  console.log(`Backfilled user trip access for ${userId}`);
}

for (const userId of existingUserIds) {
  if (nextUserIds.has(userId)) {
    continue;
  }

  await deleteDocument(`user_trip_access/${userId}`);
  console.log(`Deleted stale user trip access for ${userId}`);
}
