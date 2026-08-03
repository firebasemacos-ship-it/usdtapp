
'use client';

import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import type { User } from './types';

const usersCollection = collection(db, 'users');

const userFromDoc = (doc: any): User => {
    const data = doc.data();
    return {
        id: doc.id,
        username: data.username,
        role: data.role,
    } as User;
}

export const getUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(userFromDoc);
}

export const addUser = async (userData: Omit<User, 'id'>) => {
    // In a real app, you MUST hash the password before saving.
    // For this demo, we're storing it in plaintext which is NOT secure.
    const docRef = await addDoc(usersCollection, userData);
    return { id: docRef.id, ...userData };
}

export const updateUser = async (userId: string, userData: Partial<Omit<User, 'id'>>) => {
    const userRef = doc(db, 'users', userId);
    // Again, hash password if it's being changed.
    await updateDoc(userRef, userData);
}

export const deleteUser = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
}

// IMPORTANT: This function is insecure as it fetches the password.
// It's for demonstration purposes only. In a real application,
// authentication should be handled by a secure backend or Firebase Auth.
export const verifyUser = async (username: string, password_DO_NOT_USE: string): Promise<User | null> => {
    const q = query(usersCollection, where('username', '==', username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null; // User not found
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Insecure password check. DO NOT USE IN PRODUCTION.
    if (userData.password === password_DO_NOT_USE) {
        return userFromDoc(userDoc);
    }

    return null; // Password incorrect
}
