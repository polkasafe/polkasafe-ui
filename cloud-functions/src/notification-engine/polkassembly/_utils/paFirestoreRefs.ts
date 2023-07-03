import { EPAProposalType } from './types';

export const paPostsRef = (firestore_db: FirebaseFirestore.Firestore, networkName:string, proposalType: EPAProposalType ) => firestore_db.collection('networks').doc(networkName).collection('post_types').doc(String(proposalType)).collection('posts');
export const paUserRef = (firestore_db: FirebaseFirestore.Firestore, userId: string | number ) => firestore_db.collection('users').doc(String(userId));

