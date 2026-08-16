// 领域常量：稀有度 / 属性 / 定位 / 结论枚举

export const RARITIES = ['S', 'A'];
// 7 种属性：物理/火/冰/电/以太（1.0）+ 风 wind（3.0 新增，维琳娜）+ 流明 Lumiflux（3.1 新增，蕾米埃尔）
export const ELEMENTS = ['fire', 'ice', 'electric', 'physical', 'ether', 'wind', 'lumiflux'];
// 6 种定位：强攻/异常/击破/支援/防护（1.0）+ 命破 rupture（2.3 新增；
// 官方简中「命破」，英文社区通用名 Rupture，待官方英文公告最终确认）
export const ROLES = ['attack', 'anomaly', 'stun', 'support', 'defense', 'rupture'];
export const VERDICTS = ['pull', 'consider', 'skip'];
