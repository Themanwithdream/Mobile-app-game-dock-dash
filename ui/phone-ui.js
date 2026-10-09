/* Native, reflowing menus. Existing game buttons keep their IDs and handlers. */
(function (root) {
  'use strict';
  class DockDashPhoneUI {
    constructor() {
      this.get = id => document.getElementById(id);
      this.lastPaint = new WeakMap();
      const node = (tag, className, text) => {
        const el = document.createElement(tag); el.className = className || '';
        if (text !== undefined) el.textContent = text;
        return el;
      };
      this.node = node;
      const append = (parent, ...ids) => ids.forEach(id => parent.appendChild(this.get(id)));
      const wrap = (parent, className) => { const el = node('div', className); parent.appendChild(el); return el; };
      const canvas = (parent, className, width, height) => {
        const el = node('canvas', className); el.width = width; el.height = height; el.setAttribute('aria-hidden', 'true'); parent.appendChild(el); return el;
      };
      const screen = id => { const el = this.get(id); el.classList.add('ui-screen'); return el; };
      const heading = (parent, title, copy) => {
        const header = node('header', 'ui-heading'); header.append(node('h2', '', title));
        const sub = node('p', 'ui-subtitle', copy); header.append(sub); parent.append(header); return sub;
      };
      const title = screen('title-menu');
      const home = wrap(title, 'home-intro');
      const bar = wrap(home, 'home-bar'); bar.append(node('span', 'ui-brand', 'OPEN ROADS'));
      this.balance = node('span', 'coin-pill'); bar.append(this.balance);
      const headline = node('h2', 'home-title'); headline.innerHTML = 'DOCK <span>BOSS</span>'; home.append(headline);
      this.homeSubtitle = node('p', 'home-subtitle'); home.append(this.homeSubtitle);
      const hero = wrap(home, 'home-hero'); this.homeCanvas = canvas(hero, '', 632, 280); this.homeImage = node('img', 'home-art');
      this.homeImage.alt = ''; this.homeImage.setAttribute('aria-hidden', 'true');
      this.homeImage.decoding = 'async'; this.homeImage.fetchPriority = 'high'; hero.append(this.homeImage);
      this.homePlace = node('strong', 'home-place'); hero.append(this.homePlace);
      home.append(node('p', 'home-rule', 'Wait for green. Match the sticker. Tap.'));
      const actions = wrap(title, 'home-actions'); append(actions, 'start', 'missions');
      const row1 = wrap(actions, 'ui-two'); row1.append(title.querySelector('.fleet-button'), title.querySelector('.catalog-button'));
      const row2 = wrap(actions, 'ui-two'); row2.append(title.querySelector('.settings-button'), title.querySelector('.sound'));
      append(actions, 'learn');

      const missions = screen('missions-menu');
      this.mapSubtitle = heading(missions, 'Explore the places', '');
      const tools = wrap(missions, 'browse-tools'); append(tools, 'mission-chapter', 'mission-search');
      const worldScroll = wrap(missions, 'ui-scroll browse-scroll');
      const worldGrid = wrap(worldScroll, 'ui-cards world-cards');
      this.worlds = [...missions.querySelectorAll('.mission-card')].map(button => {
        worldGrid.append(button); button.classList.add('ui-card');
        const image = canvas(button, 'card-art', 284, 132);
        const body = wrap(button, 'card-copy'); const name = node('strong', 'card-name'), tag = node('span', 'card-description'), stars = node('span', 'card-meta');
        const track = node('span', 'star-track'), fill = node('span'); track.append(fill); body.append(name, tag, stars, track);
        return {button, image, name, tag, stars, fill};
      });
      this.mapEmpty = node('p', 'ui-empty', 'No places match. Try a different name or chapter.'); worldScroll.append(this.mapEmpty); append(worldScroll, 'mission-clear');
      this.mapPage = node('p', 'ui-page'); missions.append(this.mapPage);
      const mapFooter = wrap(missions, 'ui-footer ui-three'); append(mapFooter, 'missions-prev', 'missions-continue', 'missions-next');

      const garage = screen('garage-menu'); this.shopSubtitle = heading(garage, 'Make it yours', '');
      const shopTools = wrap(garage, 'browse-tools');
      const tabs = wrap(shopTools, 'ui-tabs'); [...garage.querySelectorAll('.shop-tab')].forEach(el => tabs.append(el)); append(shopTools, 'shop-search');
      const shopScroll = wrap(garage, 'ui-scroll browse-scroll'), shopGrid = wrap(shopScroll, 'ui-cards shop-cards');
      this.items = [...garage.querySelectorAll('.skin-choice')].map(button => {
        shopGrid.append(button); button.classList.add('ui-card');
        const image = canvas(button, 'card-art', 284, 132), body = wrap(button, 'card-copy');
        const name = node('strong', 'card-name'), copy = node('span', 'card-description'), status = node('span', 'card-meta'); body.append(name, copy, status);
        return {button, image, name, copy, status};
      });
      this.shopEmpty = node('p', 'ui-empty', 'No items match. Try another category or turn off Owned.'); shopScroll.append(this.shopEmpty); append(shopScroll, 'shop-clear');
      append(garage, 'shop-message'); this.shopPage = node('p', 'ui-page'); garage.append(this.shopPage);
      const shopFooter = wrap(garage, 'ui-footer ui-three'); append(shopFooter, 'shop-prev', 'shop-play', 'shop-next');

      const catalog = screen('catalog-menu'); this.cargoSubtitle = heading(catalog, 'Your cargo collection', ''); append(catalog, 'catalog-filter');
      const cargoScroll = wrap(catalog, 'ui-scroll cargo-scroll'); append(cargoScroll, 'cargo-cards');
      this.cargoDetail = node('p', 'cargo-detail'); catalog.append(this.cargoDetail);
      this.cargoPage = node('p', 'ui-page'); catalog.append(this.cargoPage);
      const cargoFooter = wrap(catalog, 'ui-footer ui-three'); append(cargoFooter, 'catalog-prev', 'catalog-back', 'catalog-next');
      this.cargo = [];

      const pause = screen('pause-menu'), pauseSummary = wrap(pause, 'ui-scroll result-summary');
      heading(pauseSummary, 'Take a breather', 'Your parcels and timer are safely paused.');
      this.pauseReason = node('p', 'pause-reason'); pauseSummary.append(this.pauseReason);
      const pauseActions = wrap(pause, 'result-actions'); append(pauseActions, 'resume');
      pauseActions.append(pause.querySelector('.sound'));
      const pauseRow = wrap(pauseActions, 'ui-two'); pauseRow.append(pause.querySelector('.settings-button'), pause.querySelector('.catalog-button'));
      append(pauseActions, 'exit-run'); append(pause, 'pause-hint');

      const end = screen('end-menu'), endSummary = wrap(end, 'ui-scroll result-summary');
      this.endHeadline = heading(endSummary, 'Good shift!', ''); this.endScore = node('strong', 'result-score'); endSummary.append(this.endScore);
      this.endStats = node('p', 'result-detail'); this.endCoins = node('p', 'coin-pill'); endSummary.append(this.endStats, this.endCoins);
      const endActions = wrap(end, 'result-actions'); append(endActions, 'replay');
      const endRow = wrap(endActions, 'ui-two'); endRow.append(end.querySelector('.fleet-button'), end.querySelector('.sound'));
      const endRow2 = wrap(endActions, 'ui-two'); endRow2.append(end.querySelector('.settings-button'), end.querySelector('.catalog-button')); append(endActions, 'arcade-home');

      const result = screen('mission-result-menu'), resultSummary = wrap(result, 'ui-scroll result-summary');
      this.resultPlace = heading(resultSummary, 'Delivery complete', '');
      this.resultStars = node('p', 'result-stars'); this.resultTitle = node('h3', 'result-mission'); this.resultStats = node('p', 'result-detail'); this.resultCoins = node('p', 'coin-pill'); this.resultHint = node('p', 'result-detail');
      resultSummary.append(this.resultStars, this.resultTitle, this.resultStats, this.resultCoins, this.resultHint);
      const resultActions = wrap(result, 'result-actions'); append(resultActions, 'mission-next');
      const resultRow = wrap(resultActions, 'ui-two'); append(resultRow, 'mission-retry', 'mission-map'); append(resultActions, 'mission-shop');

      this.docks = [...document.querySelectorAll('.lane-input')].map(button => {
        const image = canvas(button, 'dock-truck', 90, 141), body = wrap(button, 'dock-copy');
        const name = node('strong'), count = node('span'); body.append(name, count); return {button, image, name, count};
      });
    }
    sync(model) {
      const {state, format, wallet, worlds, items, catalog, game, result} = model;
      this.get('stage').dataset.state = state;
      this.balance.textContent = `${format(wallet.coins)} coins`; this.homePlace.textContent = model.homeName;
      this.homeSubtitle.textContent = `One parcel. ${model.worldCount} places. A world of stories.`;
      this.homeImage.hidden = !model.homeArt; this.homeCanvas.hidden = !!model.homeArt;
      if (state === 'title') {
        if (model.homeArt && this.homeImage.getAttribute('src') !== model.homeArt) this.homeImage.src = model.homeArt;
        this.homeImage.classList.toggle('home-art-wide', model.homeArtWide);
      } else this.homeImage.removeAttribute('src');
      this.mapSubtitle.textContent = `${model.worldCount} places · ${format(model.totalStars)} / ${format(model.maximumStars)} stars`;
      this.mapPage.textContent = model.mapPage; this.mapEmpty.hidden = worlds.length > 0;
      this.worlds.forEach((card, i) => {
        const world = worlds[i]; if (!world) return;
        card.name.textContent = world.name; card.tag.textContent = world.tag; card.stars.textContent = `★ ${world.stars} / ${model.levelCount * 3} stars`;
        card.button.style.setProperty('--card-accent', world.accent); card.fill.style.width = `${world.stars / (model.levelCount * 3) * 100}%`;
      });
      this.shopSubtitle.textContent = `${format(wallet.coins)} coins · Earn on every delivery`;
      this.shopPage.textContent = model.shopPage; this.shopEmpty.hidden = items.length > 0;
      this.items.forEach((card, i) => {
        const item = items[i]; if (!item) return;
        card.name.textContent = item.name; card.copy.textContent = item.type === 'venue' ? 'Arcade scenery, cargo & music' : item.type === 'truck' ? 'Permanent truck fleet' : item.style === 'wrap' ? 'Parcel wrap' : 'Loading-zone style';
        card.status.textContent = item.selected ? 'Equipped ✓' : item.owned ? 'Owned · tap to equip' : item.price ? `${format(item.price)} coins${item.missing ? ` · ${format(item.missing)} more needed` : ' · tap to buy'}` : `${item.deliveries} deliveries to unlock`;
        card.button.style.setProperty('--card-accent', item.accent);
      });
      this.cargoSubtitle.textContent = `${format(model.discovered)} / ${format(model.productCount)} cargo types delivered`;
      this.cargoDetail.textContent = model.cargoDetail; this.cargoPage.textContent = model.cargoPage;
      [...document.querySelectorAll('.cargo-choice')].forEach((button, i) => {
        let card = this.cargo[i];
        if (!card) {
          const image = this.node('canvas'); image.width = image.height = 64; image.setAttribute('aria-hidden', 'true');
          const name = this.node('span', 'cargo-name'), badge = this.node('span', 'cargo-badge'); button.append(image, name, badge);
          card = this.cargo[i] = {button, image, name, badge};
        }
        const product = catalog[i]; if (!product) return;
        card.name.textContent = product.name; card.badge.textContent = product.seen ? 'Delivered ✓' : 'Discover';
        button.setAttribute('aria-pressed', String(product.selected)); button.classList.toggle('cargo-seen', product.seen);
      });
      this.pauseReason.textContent = model.pauseReason || 'Resume when you’re ready.';
      if (state === 'over' && game) {
        this.endHeadline.textContent = model.newBest ? `New best! Previous best beaten.` : `Best score · ${format(model.best)}`;
        this.endScore.textContent = format(game.score);
        this.endStats.textContent = `${game.delivered} parcels · ${game.perfects} perfect loads · Shift ${game.shift}`;
        this.endCoins.textContent = `+${format(game.coinsEarned)} coins earned`;
      }
      if (state === 'missionResult' && result) {
        this.resultPlace.textContent = result.mission.world.name;
        this.resultPlace.previousElementSibling.textContent = result.won ? 'Delivery complete!' : 'Give it another go';
        this.resultStars.textContent = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars); this.resultStars.setAttribute('aria-label', `${result.stars} of 3 stars`);
        this.resultTitle.textContent = result.mission.title;
        this.resultStats.textContent = `${result.delivered} / ${result.mission.loads} packages · ${result.priorityLoaded} / ${result.mission.priority} priority supplies · ${result.perfects} perfect loads`;
        this.resultCoins.textContent = `+${format(result.coinsEarned)} coins · Score ${format(result.score)}`;
        this.resultHint.textContent = result.won ? result.stars === 3 ? 'Perfect work. The next road is waiting.' : result.lives < 2 ? 'Next star: finish with at least two lives.' : `Next star: keep all three lives and make ${result.mission.perfects} perfect loads.` : `${result.reason}. Watch the sticker. Early taps are safe.`;
      }
    }
    paint(canvas, key, draw) {
      if (this.lastPaint.get(canvas) === key) return;
      const ctx = canvas.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); draw(ctx); this.lastPaint.set(canvas, key);
    }
    dock(index, truck, locked, skin, image, mission) {
      const card = this.docks[index]; card.name.textContent = locked ? `Dock ${index + 1} · closed` : `Dock ${index + 1} · ${truck.name}`;
      card.count.textContent = locked ? mission ? 'Closed for this mission' : 'Opens at shift 2' : `${truck.fill} / 5 parcels`;
      card.button.style.setProperty('--dock-accent', truck.accent);
      this.paint(card.image, `${skin}:${truck.type}:${locked}`, ctx => ctx.drawImage(image, 0, 0, 90, 141));
    }
  }
  root.DockDashPhoneUI = DockDashPhoneUI;
})(window);
