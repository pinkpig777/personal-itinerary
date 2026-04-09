import {
  asNullableString,
  asString,
  asStringArray,
  asTimestamp,
  getDocument,
  patchDocument,
  readFields,
  readStringArrayField,
  readStringField,
  readTimestampField
} from './firestoreAdminClient.mjs';

const seededTrips = [
  {
    id: 'cstat',
    name: 'Cstat Trip',
    location: 'College Station, Texas',
    description: 'A classic Texas adventure',
    start_date: '2024-04-03',
    end_date: '2024-04-05'
  },
  {
    id: 'la',
    name: 'LA Trip',
    location: 'Los Angeles, California',
    description: 'Coastal vibes and sunny days',
    start_date: null,
    end_date: null
  }
];

const normalizeUidList = (uids = []) => [...new Set(uids.filter(Boolean))].sort();

const now = new Date().toISOString();

for (const trip of seededTrips) {
  const existingDocument = await getDocument(`itineraries/${trip.id}`);
  const existingFields = readFields(existingDocument);
  const readerUids = normalizeUidList(readStringArrayField(existingFields, 'readerUids'));
  const writerUids = normalizeUidList(readStringArrayField(existingFields, 'writerUids'));
  const memberUids = normalizeUidList([
    ...readStringArrayField(existingFields, 'memberUids'),
    ...readerUids,
    ...writerUids
  ]);

  await patchDocument(`itineraries/${trip.id}`, {
    name: asString(readStringField(existingFields, 'name') ?? trip.name),
    location: asString(readStringField(existingFields, 'location') ?? trip.location),
    description: asString(readStringField(existingFields, 'description') ?? trip.description),
    start_date: asNullableString(
      readStringField(existingFields, 'start_date') ?? trip.start_date ?? null
    ),
    end_date: asNullableString(
      readStringField(existingFields, 'end_date') ?? trip.end_date ?? null
    ),
    readerUids: asStringArray(readerUids),
    writerUids: asStringArray(writerUids),
    memberUids: asStringArray(memberUids),
    createdAt: asTimestamp(readTimestampField(existingFields, 'createdAt') ?? now),
    updatedAt: asTimestamp(now)
  });

  console.log(`Backfilled trip ${trip.id}`);
}
