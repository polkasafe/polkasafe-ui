export const thPostRef = (firestore_db: FirebaseFirestore.Firestore, postId: string) =>
	firestore_db.collection('posts').doc(String(postId));

export const thUserRef = (firestore_db: FirebaseFirestore.Firestore, userId: string) =>
	firestore_db.collection('users').doc(String(userId));

export const thHouseRef = (firestore_db: FirebaseFirestore.Firestore, postId: string) =>
	firestore_db.collection('houses').doc(String(postId));
