// UI 基础工具与常量（跨面板共享；各面板渲染器只依赖本模块，不互相依赖）
export const $ = (id) => document.getElementById(id);
export const VERDICT_LABEL = { pull: '抽', consider: '观望', skip: '跳过' };
export const DEFAULT_FAVOR = 50;
export const ELEMENT_LABEL = { fire: '火', ice: '冰', electric: '电', physical: '物理', ether: '以太', wind: '风', lumiflux: '流明' };
export const ROLE_LABEL = { attack: '强攻', anomaly: '异常', stun: '击破', support: '支援', defense: '防护', rupture: '命破' };
