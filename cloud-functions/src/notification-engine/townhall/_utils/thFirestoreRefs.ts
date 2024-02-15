export const thPostRef = (firestore_db: FirebaseFirestore.Firestore, postId: string) =>
	firestore_db.collection('posts').doc(String(postId));

export const thCommentRef = (firestore_db: FirebaseFirestore.Firestore, commentId: string) =>
	firestore_db.collection('comments').doc(String(commentId));

export const thUserRef = (firestore_db: FirebaseFirestore.Firestore, userId: string) =>
	firestore_db.collection('users').doc(String(userId));

export const thHouseRef = (firestore_db: FirebaseFirestore.Firestore, houseId: string) =>
	firestore_db.collection('houses').doc(String(houseId));

export const thBountyRef = (firestore_db: FirebaseFirestore.Firestore, bountyId: string) =>
	firestore_db.collection('bounties').doc(String(bountyId));
