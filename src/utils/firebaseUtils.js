// src/utils/firebaseUtils.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || 'No Name',
      followers: [],
      following: [],
      photoURL: user.photoURL || ''
    });
  }
}
