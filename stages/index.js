/* Fader's live stages (copied from tommydelarosbil.com's stages/index.js): every `.stg[data-stage]` the page
   renders gets its world; stages that leave the page are torn down. route() calls Stages.attach() after each
   render. */
import { mountStage } from './core.js';

const LOADERS = {
  'fader': () => import('./fader.js'),
};
const live = new Map();
function attach() {
  for (const [h, inst] of live) if (!document.contains(h)) { inst.destroy(); live.delete(h); }
  document.querySelectorAll('.stg[data-stage]').forEach(h => {
    if (live.has(h) || !LOADERS[h.dataset.stage]) return;
    live.set(h, mountStage(h, LOADERS[h.dataset.stage]));
  });
}
window.Stages = { attach };
attach();
