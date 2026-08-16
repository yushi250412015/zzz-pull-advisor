// 组装根（Composition Root）：只负责装配依赖与启动；各职责见模块头注释。
// 依赖方向（单向无环）：main → ui/render、ui/controller → ui/state、datasource → core/advisor → core/*、data/*
import { banners } from './data/banners.js';
import { characters } from './data/characters.js';
import { systems } from './models/systems.js';
import { observations } from './data/observations.js';
import { weapons, bangboos } from './data/equipment.js';
import { officialFacts } from './data/official-facts.js';
import { createAdvisor } from './core/advisor.js';
import { buildWikiUrl } from './datasource/announcement.js';
import { createState } from './ui/state.js';
import { renderResources, renderBox, renderPools, renderSyncPanel } from './ui/render/account.js';
import { renderResults, renderEquipmentResults } from './ui/render/results.js';
import { renderOfficialFacts, renderMetaConfidence, renderWeights, renderMctsScenarios } from './ui/render/info.js';
import { bindEvents } from './ui/controller.js';

const advisor = createAdvisor({ characters, banners, systems, observations, equipment: { weapons, bangboos } });
const state = createState();

renderResources({ state });
renderBox({ characters });
renderPools({ state });
renderResults({ state, advisor, characters });
renderEquipmentResults({ state, advisor, characters });
renderOfficialFacts({ data: officialFacts, buildWikiUrl });
renderSyncPanel();
renderMetaConfidence({ advisor });
renderWeights({ state });
renderMctsScenarios({ state, advisor });
bindEvents({
  state,
  advisor,
  characters,
  onRecompute: () => renderResults({ state, advisor, characters }),
  onWeightsChanged: () => renderWeights({ state }),
  onSyncSuccess: () => {
    renderResources({ state });
    renderPools({ state });
    renderWeights({ state });
    renderResults({ state, advisor, characters });
    renderEquipmentResults({ state, advisor, characters });
  },
});
