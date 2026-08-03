'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseFetch, supabaseInsert, supabaseUpdate, supabaseDelete } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export type PackageVariation = {
  id: string;
  name: string;
  reach: number;
  days: number;
  budget: number;
  costUSD: number;
};

export type PackageGroup = {
  id: string;
  name: string;
  variations: PackageVariation[];
};

export const getPackageGroups = async (): Promise<PackageGroup[]> => {
  const rows = await supabaseFetch('facebook_packages_v4', 'order=created_at.desc');
  if (!rows || !Array.isArray(rows)) return [];
  
  return rows.map((r: any) => ({
    id: r.id,
    name: r.packageName || 'باقة إعلانات فيسبوك',
    variations: [
      {
        id: `var_${r.id}`,
        name: r.packageName || 'افتراضي',
        reach: 5000,
        days: Number(r.durationDays || 7),
        budget: Number(r.priceLYD || 0),
        costUSD: Number(r.priceUSD || 0)
      }
    ]
  }));
};

export const addPackageGroup = async (group: Omit<PackageGroup, 'id'>) => {
  const newId = `pkg_${Date.now()}_${uuidv4().substring(0, 5)}`;
  const firstVar = group.variations?.[0];
  
  const record = {
    id: newId,
    packageName: group.name,
    priceUSD: firstVar?.costUSD || 0,
    priceLYD: firstVar?.budget || 0,
    durationDays: firstVar?.days || 7,
    description: `باقة ممولة ${group.name}`,
    created_at: new Date().toISOString()
  };

  await supabaseInsert('facebook_packages_v4', record);
  return { id: newId, ...group } as PackageGroup;
};

export const updatePackageGroup = async (groupId: string, groupData: Partial<Omit<PackageGroup, 'id'>>) => {
  await supabaseUpdate('facebook_packages_v4', groupId, {
    packageName: groupData.name
  });
};

export const deletePackageGroup = async (id: string) => {
  await supabaseDelete('facebook_packages_v4', id);
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

export const usePackages = () => {
  const { packageGroups, loading, refresh } = usePackageGroups();
  
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
