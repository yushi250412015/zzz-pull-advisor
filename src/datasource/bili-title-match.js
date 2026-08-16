// B站视频标题 → 角色匹配（纯函数）：用于自动发现博主视频并归类
// 匹配中文名或英文名（含连写变体，如「蕾米埃尔丹」命中 remielle 的 enName 'Remielle Dan'）

export function matchCharactersInTitle(title, characters) {
  const t = String(title ?? '');
  return Object.values(characters)
    .filter((c) => {
      if (t.includes(c.name)) return true;
      if (c.enName && t.includes(c.enName.replace(/\s+/g, ''))) return true; // 中文语境常省空格：「蕾米埃尔丹」
      return false;
    })
    .map((c) => c.id);
}
