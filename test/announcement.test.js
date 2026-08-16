import { describe, it, expect } from 'vitest';
import {
  buildAnnListUrl,
  buildAnnContentUrl,
  stripHtml,
  normalizeAnnouncement,
  flattenAnnouncements,
  fetchAnnList,
  fetchAnnContent,
  buildWikiUrl,
  filterAnnouncements,
  findCharacterMentions,
  matchCharacterAnnouncements,
} from '../src/datasource/announcement.js';

// 与官方 API 真实返回同构的样本（2026-08 实测 announcement-static.mihoyo.com）：
// title 外层包 <p> 标签、type_label 在组级、getAnnContent 返回全部内容列表（不过滤）
const realListResponse = {
  retcode: 0,
  message: 'OK',
  data: {
    total: 3,
    list: [
      {
        type_id: 3,
        type_label: '游戏公告',
        list: [
          {
            ann_id: 1263,
            title: '<p style="white-space: pre-wrap;">已知问题及游戏优化说明</p>',
            subtitle: '已知问题及游戏优化说明',
            banner: 'https://sdk-webstatic.mihoyo.com/upload/ann/x.png',
            content: '',
            type_label: '游戏公告',
            tag_label: '重要公告',
            start_time: '2026-07-29 07:00:00',
            end_time: '2026-09-09 07:00:00',
            has_content: true,
          },
          {
            ann_id: 1290,
            title: '<p style="white-space: pre-wrap;">「代理人·蕾米埃尔」上线说明</p>',
            subtitle: '「代理人·蕾米埃尔」上线说明',
            banner: '',
            content: '',
            type_label: '游戏公告',
            tag_label: '版本公告',
            start_time: '2026-07-29 07:00:00',
            end_time: '2026-09-09 07:00:00',
            has_content: true,
          },
        ],
      },
      { type_id: 4, type_label: '活动公告', list: [] },
    ],
  },
};

const realContentResponse = {
  retcode: 0,
  message: 'OK',
  data: {
    total: 2,
    list: [
      {
        ann_id: 1263,
        title: '已知问题及游戏优化说明',
        subtitle: '已知问题及游戏优化说明',
        banner: '',
        content: '<p>修复了若干问题。</p><br>感谢支持&nbsp;&amp;理解。',
        lang: 'zh-cn',
        remind_text: '',
      },
      {
        ann_id: 1290,
        title: '<p style="white-space: pre-wrap;">「代理人·蕾米埃尔」上线说明</p>',
        subtitle: '「代理人·蕾米埃尔」上线说明',
        banner: '',
        content: '<p>全新代理人上线。</p>',
        lang: 'zh-cn',
        remind_text: '',
      },
    ],
  },
};

const mockFetcher = (response) => async () => ({ json: async () => response });

describe('buildAnnListUrl', () => {
  it('拼出 getAnnList 地址与全部默认参数', () => {
    const u = buildAnnListUrl();
    expect(u).toContain('/common/nap_cn/announcement/api/getAnnList?');
    for (const pair of ['game=nap', 'game_biz=nap_cn', 'lang=zh-cn', 'bundle_id=nap_cn', 'platform=pc', 'region=prod_gf_cn', 'level=60', 'channel_id=1']) {
      expect(u).toContain(pair);
    }
  });

  it('可用 params 覆盖默认参数', () => {
    const u = buildAnnListUrl({ lang: 'zh-tw' });
    expect(u).toContain('lang=zh-tw');
    expect(u).not.toContain('lang=zh-cn');
  });
});

describe('buildAnnContentUrl', () => {
  it('包含 ann_id 与默认参数', () => {
    const u = buildAnnContentUrl(1263);
    expect(u).toContain('/getAnnContent?');
    expect(u).toContain('ann_id=1263');
    expect(u).toContain('game_biz=nap_cn');
  });
});

describe('stripHtml', () => {
  it('去掉 <p> 包裹与 <br> 换行，解码实体', () => {
    expect(stripHtml('<p style="white-space: pre-wrap;">标题</p>')).toBe('标题');
    expect(stripHtml('<p>a</p><br>b')).toBe('a\nb');
    expect(stripHtml('感谢支持&nbsp;&amp;理解')).toBe('感谢支持 &理解');
  });

  it('空值安全', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });
});

describe('fetchAnnList', () => {
  it('按真实结构归一化：type_label 在组级、title 去 <p>、has_content 转布尔', async () => {
    const { groups, total } = await fetchAnnList(mockFetcher(realListResponse));
    expect(total).toBe(3);
    expect(groups).toHaveLength(2);
    expect(groups[0].typeId).toBe(3);
    expect(groups[0].typeLabel).toBe('游戏公告');
    expect(groups[1].typeLabel).toBe('活动公告');
    expect(groups[1].list).toEqual([]);
    const [first, second] = groups[0].list;
    expect(first).toMatchObject({ annId: 1263, title: '已知问题及游戏优化说明', hasContent: true, content: '' });
    expect(second.title).toBe('「代理人·蕾米埃尔」上线说明');
    const flat = flattenAnnouncements({ groups });
    expect(flat).toHaveLength(2);
  });

  it('retcode 非 0 时抛错', async () => {
    await expect(fetchAnnList(mockFetcher({ retcode: -1, message: 'boom' }))).rejects.toThrow('公告列表获取失败');
  });
});

describe('fetchAnnContent', () => {
  it('接口返回全部列表不过滤时，按 ann_id 自行筛选出目标条目', async () => {
    const item = await fetchAnnContent(1263, mockFetcher(realContentResponse));
    expect(item.annId).toBe(1263);
    expect(item.title).toBe('已知问题及游戏优化说明');
    expect(item.contentText).toBe('修复了若干问题。\n感谢支持 &理解。');
  });

  it('ann_id 不在返回列表中时返回 null', async () => {
    expect(await fetchAnnContent(9999, mockFetcher(realContentResponse))).toBeNull();
  });

  it('retcode 非 0 时抛错', async () => {
    await expect(fetchAnnContent(1, mockFetcher({ retcode: -1, message: 'boom' }))).rejects.toThrow('公告内容获取失败');
  });
});

describe('buildWikiUrl / filterAnnouncements / matchCharacterAnnouncements', () => {
  it('角色名 → BWIKI 直链（URL 编码中文）', () => {
    expect(buildWikiUrl('蕾米埃尔')).toBe('https://wiki.biligame.com/zzz/%E8%95%BE%E7%B1%B3%E5%9F%83%E5%B0%94');
  });

  it('按关键词过滤公告', () => {
    const flat = flattenAnnouncements({ groups: realListResponse.data.list.map((g) => ({ ...g, list: g.list.map(normalizeAnnouncement) })) });
    expect(filterAnnouncements(flat, '蕾米埃尔')).toHaveLength(1);
    expect(filterAnnouncements(flat, '不存在')).toHaveLength(0);
  });

  it('在正文中检索角色名提及（实测 3.1 更新公告含代理人机制文本）', () => {
    const mentions = findCharacterMentions('3.1 版本新增代理人「蕾米埃尔」与「希格莉德」。', [
      { id: 'remielle', name: '蕾米埃尔' },
      { id: 'sigrid', name: '希格莉德' },
      { id: 'chinatsu', name: '千夏' },
    ]);
    expect(mentions).toEqual(['remielle', 'sigrid']);
  });

  it('把公告映射到角色（关键词匹配，无匹配角色不出现）', () => {
    const flat = flattenAnnouncements({ groups: realListResponse.data.list.map((g) => ({ ...g, list: g.list.map(normalizeAnnouncement) })) });
    const characters = [
      { id: 'remielle', name: '蕾米埃尔' },
      { id: 'chinatsu', name: '千夏' },
    ];
    const mapped = matchCharacterAnnouncements(flat, characters);
    expect(mapped).toHaveLength(1);
    expect(mapped[0]).toMatchObject({ characterId: 'remielle', name: '蕾米埃尔' });
    expect(mapped[0].matches[0].annId).toBe(1290);
  });
});
