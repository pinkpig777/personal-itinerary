import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const FIREBASE_CLI_CONFIG = path.join(
  os.homedir(),
  '.config',
  'configstore',
  'firebase-tools.json'
);
const FIREBASE_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';
const FIREBASE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token';

const saveFirebaseCliConfig = async (config) => {
  await fs.writeFile(FIREBASE_CLI_CONFIG, JSON.stringify(config, null, 2));
};

const refreshAccessToken = async (config) => {
  const refreshToken = config?.tokens?.refresh_token;

  if (!refreshToken) {
    throw new Error(
      'Firebase CLI refresh token is missing. Run `npx -y firebase-tools@latest login` and try again.'
    );
  }

  const response = await fetch(FIREBASE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: FIREBASE_CLIENT_ID,
      client_secret: FIREBASE_CLIENT_SECRET,
      grant_type: 'refresh_token'
    })
  });
  const responseBody = await response.json();

  if (!response.ok || !responseBody.access_token) {
    throw new Error(
      'Firebase CLI access token refresh failed. Run `npx -y firebase-tools@latest login --reauth` and try again.'
    );
  }

  const nextTokens = {
    ...config.tokens,
    ...responseBody,
    refresh_token: refreshToken,
    expires_at: Date.now() + (Number(responseBody.expires_in || 3600) * 1000)
  };
  const nextConfig = {
    ...config,
    tokens: nextTokens
  };

  await saveFirebaseCliConfig(nextConfig);

  return nextTokens.access_token;
};

const assertFreshAccessToken = async (config) => {
  const accessToken = config?.tokens?.access_token;
  const expiresAt = config?.tokens?.expires_at ?? 0;

  if (!accessToken || Date.now() >= expiresAt - 60_000) {
    return refreshAccessToken(config);
  }

  return accessToken;
};

export const loadFirebaseCliConfig = async () => {
  const rawConfig = await fs.readFile(FIREBASE_CLI_CONFIG, 'utf8');
  return JSON.parse(rawConfig);
};

export const getActiveProjectId = async () => {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID;
  }

  const config = await loadFirebaseCliConfig();
  const projectId = config?.activeProjects?.[process.cwd()];

  if (!projectId) {
    throw new Error(
      'Unable to determine the active Firebase project for this repo. Set FIREBASE_PROJECT_ID or run `npx -y firebase-tools@latest use <project-id>`.'
    );
  }

  return projectId;
};

const getAccessToken = async () => {
  const config = await loadFirebaseCliConfig();
  return assertFreshAccessToken(config);
};

const requestFirestore = async (url, init = {}) => {
  const accessToken = await getAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
  }

  return response.json();
};

export const getDocumentName = async (documentPath) => {
  const projectId = await getActiveProjectId();
  return `projects/${projectId}/databases/(default)/documents/${documentPath}`;
};

export const getDocument = async (documentPath) => {
  const documentName = await getDocumentName(documentPath);
  const url = `https://firestore.googleapis.com/v1/${documentName}`;

  try {
    return await requestFirestore(url);
  } catch (error) {
    if (String(error.message).includes('404')) {
      return null;
    }

    throw error;
  }
};

export const listDocuments = async (collectionPath) => {
  const projectId = await getActiveProjectId();
  const documents = [];
  let pageToken = '';

  while (true) {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`
    );
    url.searchParams.set('pageSize', '100');

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await requestFirestore(url.toString());
    documents.push(...(response.documents || []));

    if (!response.nextPageToken) {
      return documents;
    }

    pageToken = response.nextPageToken;
  }
};

export const patchDocument = async (
  documentPathOrName,
  fields,
  updateMaskPaths = Object.keys(fields)
) => {
  const documentName = documentPathOrName.startsWith('projects/')
    ? documentPathOrName
    : await getDocumentName(documentPathOrName);
  const url = new URL(`https://firestore.googleapis.com/v1/${documentName}`);

  updateMaskPaths.forEach((fieldPath) => {
    url.searchParams.append('updateMask.fieldPaths', fieldPath);
  });

  return requestFirestore(url.toString(), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
};

export const deleteDocument = async (documentPathOrName) => {
  const documentName = documentPathOrName.startsWith('projects/')
    ? documentPathOrName
    : await getDocumentName(documentPathOrName);
  const url = `https://firestore.googleapis.com/v1/${documentName}`;

  await requestFirestore(url, {
    method: 'DELETE'
  });
};

export const readFields = (document) => document?.fields || {};

export const readStringField = (fields, fieldName) => {
  return fields[fieldName]?.stringValue ?? null;
};

export const readTimestampField = (fields, fieldName) => {
  return fields[fieldName]?.timestampValue ?? null;
};

export const readStringArrayField = (fields, fieldName) => {
  const values = fields[fieldName]?.arrayValue?.values || [];

  return values
    .map((value) => value.stringValue)
    .filter(Boolean);
};

export const asString = (value) => ({ stringValue: value });

export const asNullableString = (value) => {
  if (value == null) {
    return { nullValue: null };
  }

  return asString(value);
};

export const asTimestamp = (value) => ({ timestampValue: value });

export const asStringArray = (values) => {
  if (!values.length) {
    return { arrayValue: {} };
  }

  return {
    arrayValue: {
      values: values.map((value) => asString(value))
    }
  };
};
