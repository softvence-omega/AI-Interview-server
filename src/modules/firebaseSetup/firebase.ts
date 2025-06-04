import admin from 'firebase-admin';
import serviceAccount from './inprep-ai-c0450-firebase-adminsdk-fbsvc-4ed953df39.json';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
  }),
});

export default admin;