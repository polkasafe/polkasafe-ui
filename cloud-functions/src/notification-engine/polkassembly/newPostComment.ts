import { NOTIFICATION_SOURCE } from '../../constants/notification_engine_constants';
import getSourceFirebaseAdmin from '../utils/getSourceFirebaseAdmin';

export default async function newPostComment(args: any) {
	console.log('newPostComment', args);
	getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);
}
