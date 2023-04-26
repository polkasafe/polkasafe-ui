import * as admin from 'firebase-admin';
import { NOTIFICATION_SOURCE, NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG } from '../../constants/notification_engine_constants';

export default function getSourceFirebaseAdmin(source: NOTIFICATION_SOURCE) {
	if (!NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG[source]) throw new Error(`No firebase admin config found in env for source: ${source}`);

	return admin.initializeApp({
		credential: admin.credential.cert(NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG[source])
	}, source);
}
