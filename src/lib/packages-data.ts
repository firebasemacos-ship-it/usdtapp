
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, where, getDoc } from 'firebase/firestore';

export type PackageVariation = {
  id: string;
  name: string;
  reach: number;
  days: number;
  budget: number;
  costUSD: number; // Cost in USD
};

export type PackageGroup = {
  id: string; // Firestore document ID
  name: string;
  variations: PackageVariation[];
};


const packageGroupsCollection = collection(db, 'packageGroups');

const groupFromDoc = (doc: any): PackageGroup => ({ id: doc.id, ...doc.data() } as PackageGroup);

export const getPackageGroups = async (): Promise<PackageGroup[]> => {
    const snapshot = await getDocs(packageGroupsCollection);
    return snapshot.docs.map(groupFromDoc);
}

export const addPackageGroup = async (group: Omit<PackageGroup, 'id'>) => {
  const docRef = await addDoc(packageGroupsCollection, group);
  return { id: docRef.id, ...group } as PackageGroup;
};

export const updatePackageGroup = async (groupId: string, groupData: Partial<Omit<PackageGroup, 'id'>>) => {
    const groupRef = doc(db, 'packageGroups', groupId);
    await updateDoc(groupRef, groupData);
};

export const deletePackageGroup = async (id: string) => {
  const groupRef = doc(db, 'packageGroups', id);
  await deleteDoc(groupRef);
};


export const usePackageGroups = () => {
    const [packageGroups, setPackageGroups] = useState<PackageGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const groups = await getPackageGroups();
            setPackageGroups(groups);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = () => fetchData();

    return { packageGroups, loading, refresh, addPackageGroup, updatePackageGroup, deletePackageGroup };
};


// This hook is now deprecated and should be replaced with usePackageGroups
// It's kept for backward compatibility if other components still use it.
export const usePackages = () => {
    const { packageGroups, loading, refresh } = usePackageGroups();
    
    // This flattens the new structure to the old one.
    const packages = packageGroups.flatMap(group => 
        group.variations.map(variation => ({
            ...variation,
            id: `${group.id}_${variation.id}`,
            name: `${group.name} - ${variation.name}`,
            groupName: group.name,
            variationName: variation.name,
        }))
    );

    return { packages, loading, refresh };
};
