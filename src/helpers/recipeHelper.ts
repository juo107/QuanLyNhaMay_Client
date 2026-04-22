import dayjs from 'dayjs';
import type { IRecipe } from '../types/recipeTypes';

// Gộp nhóm các phiên bản công thức theo mã công thức
export const groupRecipesByCode = (rawItems: any[]): IRecipe[] => {
  if (!rawItems || !Array.isArray(rawItems)) return [];

  const groupsMap = new Map<string, any[]>();
  rawItems.forEach((r: any) => {
    const code = r.recipeCode || '__EMPTY__';
    if (!groupsMap.has(code)) groupsMap.set(code, []);
    groupsMap.get(code)?.push(r);
  });

  return Array.from(groupsMap.entries()).map(([_, items]) => {
    if (items.length === 1) return items[0];

    // Sắp xếp để lấy phiên bản mới nhất dựa trên số phiên bản và thời gian
    const sorted = [...items].sort((a, b) => {
      const va = parseFloat(a.version) || 0;
      const vb = parseFloat(b.version) || 0;
      if (va !== vb) return vb - va;
      const ta = a.timestamp || '';
      const tb = b.timestamp || '';
      return dayjs(tb).unix() - dayjs(ta).unix();
    });

    const latest = sorted[0];
    return {
      ...latest,
      isGroup: true,
      versionsCount: items.length,
      allVersions: items
    };
  });
};

// Định dạng hiển thị tên phiên bản (thêm tiền tố 'v')
export const formatVersionDisplay = (version: string): string => {
  return version ? `v${version}` : '-';
};
