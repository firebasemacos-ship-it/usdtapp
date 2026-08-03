
'use client';

import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getSettings } from './data';

type PostStatus = 'قيد التعديل' | 'نشط' | 'منتهي';

export type SponsoredPost = {
  id: string; // Firestore document ID
  pageName: string;
  postUrl: string;
  platform: string;
  budget: number; // This is the selling price in LYD
  costUSD: number;   // This is the cost in USD
  targetReach: number;
  paid: boolean;
  status: PostStatus;
  days: number;
  packageName?: string;
  createdAt: Timestamp; // Added creation date
  phone?: string;
};

const postsCollection = collection(db, 'sponsoredPosts');

const postFromDoc = (doc: any): SponsoredPost => {
    const data = doc.data();
    return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt,
    } as SponsoredPost
};


export const getSponsoredPosts = async (): Promise<SponsoredPost[]> => {
    const snapshot = await getDocs(postsCollection);
    return snapshot.docs.map(postFromDoc);
}

type AddPostPayload = Omit<SponsoredPost, 'id' | 'platform' | 'paid' | 'status' | 'createdAt'>;

export const addSponsoredPost = async (post: AddPostPayload) => {
    const getPlatformFromUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname;
            if (hostname.includes('facebook')) return 'Facebook';
            if (hostname.includes('instagram')) return 'Instagram';
            if (hostname.includes('twitter')) return 'Twitter';
            if (hostname.includes('linkedin')) return 'LinkedIn';
            return 'Website';
        } catch (e) {
            return 'Unknown';
        }
    }
    
    const newPostData = {
        ...post,
        platform: getPlatformFromUrl(post.postUrl),
        paid: false,
        status: 'قيد التعديل' as PostStatus,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(postsCollection, newPostData);
    // Note: serverTimestamp() is not available on the client immediately.
    // We'll return a client-side timestamp for immediate UI updates, 
    // but the server value will be the source of truth.
    return { id: docRef.id, ...post, platform: newPostData.platform, paid: false, status: 'قيد التعديل', createdAt: Timestamp.now() } as SponsoredPost;
};

export const updatePostStatus = async (postId: string, newStatus: PostStatus) => {
  const postRef = doc(db, 'sponsoredPosts', postId);
  await updateDoc(postRef, { status: newStatus });
};

export const updatePaidStatus = async (postId: string, isPaid: boolean) => {
  const postRef = doc(db, 'sponsoredPosts', postId);
  await updateDoc(postRef, { paid: isPaid });
};

export const deleteSponsoredPost = async (postId: string) => {
    const postRef = doc(db, 'sponsoredPosts', postId);
    await deleteDoc(postRef);
};


export const useSponsoredPosts = () => {
    const [posts, setPosts] = useState<SponsoredPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const posts = await getSponsoredPosts();
        setPosts(posts);
        setLoading(false);
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const refresh = () => fetchData();

    return {posts, loading, refresh, addSponsoredPost, updatePostStatus, updatePaidStatus, deleteSponsoredPost};
}


// Functions for dashboard
export const getTotalPostRevenue = async () => {
    const q = query(postsCollection, where('paid', '==', true));
    const snapshot = await getDocs(q);
    const paidPosts = snapshot.docs.map(postFromDoc);
    return paidPosts.reduce((acc, post) => acc + post.budget, 0);
}

export const getPostProfit = async (): Promise<number> => {
    const settings = await getSettings();
    const exchangeRate = settings.exchangeRateUSD;

    const q = query(postsCollection, where('paid', '==', true));
    const snapshot = await getDocs(q);
    const paidPosts = snapshot.docs.map(postFromDoc);
    
    // Profit = Selling Price (budget in LYD) - Cost (costUSD * exchangeRate)
    return paidPosts.reduce((acc, post) => {
        const costInLyd = post.costUSD * exchangeRate;
        const profit = post.budget - costInLyd;
        return acc + profit;
    }, 0);
}

export const getTotalPostDebt = async () => {
    const q = query(postsCollection, where('paid', '==', false));
    const snapshot = await getDocs(q);
    const unpaidPosts = snapshot.docs.map(postFromDoc);
    return unpaidPosts.reduce((acc, post) => acc + post.budget, 0);
}

export const getPaidPostsCount = async () => {
    const q = query(postsCollection, where('paid', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.size;
}

export const getUnpaidPostsCount = async () => {
    const q = query(postsCollection, where('paid', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.size;
}
