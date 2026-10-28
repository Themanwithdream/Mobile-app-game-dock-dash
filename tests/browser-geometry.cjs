/* Browser-only measurements: scrollable cards may be partially clipped. */
function visibleBounds(elements) {
  return elements.map(element => {
    const rect = element.getBoundingClientRect();
    let {left, top, right, bottom} = rect;
    for (let parent = element.parentElement; parent && parent.id !== 'stage'; parent = parent.parentElement) {
      if (!parent.matches('.ui-scroll,.briefing-scroll')) continue;
      const clip = parent.getBoundingClientRect();
      left = Math.max(left, clip.left); top = Math.max(top, clip.top);
      right = Math.min(right, clip.right); bottom = Math.min(bottom, clip.bottom);
    }
    return {id: element.id || element.dataset.world || element.dataset.item || element.dataset.shop || element.dataset.missionStage || element.className,
      x: left, y: top, right, bottom, width: right - left, height: bottom - top, w: right - left, h: bottom - top,
      textFits: element.scrollWidth <= element.clientWidth + 1};
  }).filter(rect => rect.width > 0 && rect.height > 0);
}
async function settledViewport(page) {
  await page.waitForFunction(() => {
    const viewport = document.getElementById('viewport'), box = viewport.getBoundingClientRect(), css = getComputedStyle(viewport);
    const expected = DockDashPhoneLayout.measure(box.width - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight), box.height - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom));
    const stage = document.getElementById('stage').getBoundingClientRect();
    return Math.abs(stage.width - expected.width) < 1 && Math.abs(stage.height - expected.height) < 1;
  });
}
module.exports = {visibleBounds, settledViewport};
