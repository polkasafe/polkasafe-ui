import * as admin from 'firebase-admin';
import { NOTIFICATION_SOURCE, NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG } from '../notification_engine_constants';

export default function getSourceFirebaseAdmin(source: NOTIFICATION_SOURCE) {
	if (!NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG[source]) throw new Error(`No firebase admin config found in env for source: ${source}`);

	const firebase_admin = admin.initializeApp({
		credential: admin.credential.cert(JSON.parse(NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG[source]) as admin.ServiceAccount)
	}, source);

	const firestore_db = firebase_admin.firestore();
	return { firebase_admin, firestore_db };
}
