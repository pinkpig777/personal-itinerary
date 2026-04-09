import {
  asStringArray,
  listDocuments,
  patchDocument,
  readFields,
  readStringArrayField
} from './firestoreAdminClient.mjs';

const normalizeUidList = (uids = []) => [...new Set(uids.filter(Boolean))].sort();

const itineraryDocuments = await listDocuments('itineraries');

if (itineraryDocuments.length === 0) {
  console.log('No itinerary documents found.');
}

for (const itineraryDocument of itineraryDocuments) {
  const fields = readFields(itineraryDocument);
  const readerUids = normalizeUidList(readStringArrayField(fields, 'readerUids'));
  const writerUids = normalizeUidList(readStringArrayField(fields, 'writerUids'));
  const memberUids = normalizeUidList([
    ...readStringArrayField(fields, 'memberUids'),
    ...readerUids,
    ...writerUids
  ]);

  await patchDocument(itineraryDocument.name, {
    readerUids: asStringArray(readerUids),
    writerUids: asStringArray(writerUids),
    memberUids: asStringArray(memberUids)
  });

  console.log(`Normalized trip ACLs for ${itineraryDocument.name.split('/').at(-1)}`);
}
