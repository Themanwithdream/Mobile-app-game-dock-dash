/* Screen geometry shared by the phone UI and its layout regressions. */
(function (root) {
  'use strict';
  function number(value, fallback) { return Number.isFinite(value) && value > 0 ? value : fallback; }
  function measure(width, height) {
    const availableWidth = number(width, 360), availableHeight = number(height, 640);
    const wide = availableWidth >= 560 && availableHeight <= 540 && availableWidth / availableHeight >= 1.35;
    const stageWidth = Math.min(availableWidth, wide ? 1000 : 480);
    const stageHeight = Math.min(availableHeight, wide ? 520 : 940);
    const scale = Math.max(.1, Math.min((wide ? stageWidth - 272 : stageWidth) / 360, stageHeight / 640));
    return {width: stageWidth, height: stageHeight, scale, wide,
      fieldWidth: 360 * scale, fieldHeight: 640 * scale,
      fieldLeft: Math.max(0, (stageWidth - 360 * scale) / 2), fieldTop: Math.max(0, (stageHeight - 640 * scale) / 2)};
  }
  function visibleViewport(width, height, visual) {
    const layoutWidth = number(width, 360), layoutHeight = number(height, 640);
    // Pinch zoom magnifies the page. A keyboard reflows it without zooming.
    const useVisual = visual && number(visual.scale, 1) <= 1.05;
    return {width: useVisual ? Math.min(layoutWidth, number(visual.width, layoutWidth)) : layoutWidth,
      height: useVisual ? Math.min(layoutHeight, number(visual.height, layoutHeight)) : layoutHeight,
      left: useVisual && Number.isFinite(visual.offsetLeft) ? Math.max(0, visual.offsetLeft) : 0,
      top: useVisual && Number.isFinite(visual.offsetTop) ? Math.max(0, visual.offsetTop) : 0};
  }
  const api = {measure, visibleViewport};
  root.DockDashPhoneLayout = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
