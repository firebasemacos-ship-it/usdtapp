'use client';

import { useState, useEffect } from 'react';
import { supabaseFetch, supabaseInsert, supabaseUpdate, supabaseDelete } from './supabase';
import { getSettings } from './data';

type PostStatus = 'قيد التعديل' | 'نشط' | 'منتهي';

export type SponsoredPost = {
  id: string;
  pageName: string;
  postUrl: string;
  platform: string;
  budget: number;
  costUSD: number;
  targetReach: number;
  paid: boolean;
  status: PostStatus;
  days: number;
  packageName?: string;
  createdAt: any;
  phone?: string;
};

export const getSponsoredPosts = async (): Promise<SponsoredPost[]> => {
  const rows = await supabaseFetch('facebook_packages_v4', 'order=created_at.desc');
  if (!rows || !Array.isArray(rows)) return [];
  
  return rows.map((r: any) => ({
    id: r.id,
    pageName: r.packageName || 'صفحة ترويج',
    postUrl: 'https://facebook.com',
    platform: 'Facebook',
    budget: Number(r.priceLYD || 0),
    costUSD: Number(r.priceUSD || 0),
    targetReach: 10000,
    paid: true,
    status: 'نشط' as PostStatus,
    days: Number(r.durationDays || 7),
    packageName: r.packageName,
    createdAt: r.created_at
  }));
};

type AddPostPayload = Omit<SponsoredPost, 'id' | 'platform' | 'paid' | 'status' | 'createdAt'>;

export const addSponsoredPost = async (post: AddPostPayload) => {
  const newId = `post_${Date.now()}`;
  const record = {
    id: newId,
    packageName: post.pageName,
    priceUSD: post.costUSD,
    priceLYD: post.budget,
    durationDays: post.days,
    description: `ترويج منشور ${post.pageName}`,
    created_at: new Date().toISOString()
  };

  await supabaseInsert('facebook_packages_v4', record);
  return {
    id: newId,
    ...post,
    platform: 'Facebook',
    paid: true,
    status: 'نشط' as PostStatus,
    createdAt: new Date()
  };
};

export const updatePostStatus = async (postId: string, newStatus: PostStatus) => {
  // Update status
};

export const updatePaidStatus = async (postId: string, isPaid: boolean) => {
  // Update paid status
};

export const deleteSponsoredPost = async (postId: string) => {
  await supabaseDelete('facebook_packages_v4', postId);
};

export const useSponsoredPosts = () => {
  const [posts, setPosts] = useState<SponsoredPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getSponsoredPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => fetchData();

  return { posts, loading, refresh, addSponsoredPost, updatePostStatus, updatePaidStatus, deleteSponsoredPost };
};

export const getTotalPostRevenue = async () => {
  const posts = await getSponsoredPosts();
  return posts.reduce((acc, p) => acc + p.budget, 0);
};

export const getPostProfit = async (): Promise<number> => {
  const settings = await getSettings();
  const rate = settings.exchangeRateUSD || 7.0;
  const posts = await getSponsoredPosts();
  return posts.reduce((acc, p) => acc + (p.budget - (p.costUSD * rate)), 0);
};

export const getTotalPostDebt = async () => {
  return 0;
};

export const getPaidPostsCount = async () => {
  const posts = await getSponsoredPosts();
  return posts.length;
};

export const getUnpaidPostsCount = async () => {
  return 0;
};
