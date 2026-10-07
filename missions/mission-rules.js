/* Dock Dash mission definitions and saved-star rules. No browser dependencies. */
(function (root, factory) {
  const node=typeof module==='object'&&module.exports;
  const rules = factory(node?require('./world-pack.js'):root.DockDashWorldPack,node?require('./world-challenges.js'):root.DockDashChallenges);
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.DockDashMissions = rules;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (pack, challenges) {
  'use strict';
  const worlds = [
    { id: 'matchday', name: 'Matchday', category: 'Soccer supplies', badge: 'SOCCER',
      tag: 'Get the squad ready for kickoff.', location: 3, accent: '#b8e89b', tempo: 112,
      priority: 'TEAM ESSENTIALS', priorityCopy: 'Balls · jerseys · kits',
      stages: ['Warm-up delivery', 'Kickoff rush', 'Cup final'],
      cargo: 'Ball bundle|soccerball;Team jerseys|jersey;Match kit bag|kitbag;Football boots|cleats;Keeper gloves|keepergloves;Training cones|cone;Shin guards|shinguards;Captain armbands|belt;Ball pump|pump;Team water bottles|bottle;Corner flags|flag;Cup trophy|trophy' },
    { id: 'festival', name: 'Festival Rush', category: 'Festival supplies', badge: 'FESTIVAL',
      tag: 'Keep the lights and music going.', location: 4, accent: '#ffbf89', tempo: 104,
      priority: 'SHOW ESSENTIALS', priorityCopy: 'Tickets · speakers · lights',
      stages: ['Gates open', 'Headline act', 'Encore rush'],
      cargo: 'Festival tickets|ticket;Stage speaker|speaker;String lights|festoon;Guitar case|guitar;Drum kit|drum;Popcorn tubs|popcorn;Pizza boxes|pizza;Drink cups|cup;Festival tent|tent;Artist wristbands|belt;Microphone kit|mic;Bunting flags|flag' },
    { id: 'rescue', name: 'Ocean Rescue', category: 'Rescue supplies', badge: 'RESCUE',
      tag: 'Equip the crew. Look after the coast.', location: 5, accent: '#92dfeb', tempo: 108,
      priority: 'CREW ESSENTIALS', priorityCopy: 'First aid · vests · water',
      stages: ['Ready the station', 'Harbour patrol', 'All hands'],
      cargo: 'First-aid case|firstaid;Life jackets|lifevest;Fresh water crate|watercrate;Rescue lifebuoy|lifebuoy;Warm blankets|blanket;Coiled rope|wheel;Rescue paddle|paddle;Signal lantern|lantern;Crew radio|radio;Rescue flares|torch;Dry bag|kitbag;Safety helmet|helmet' },
    { id: 'space', name: 'Space Launch', category: 'Space supplies', badge: 'SPACE',
      tag: 'Supply the next giant little leap.', location: 6, accent: '#c4baff', tempo: 120,
      priority: 'FLIGHT ESSENTIALS', priorityCopy: 'Helmets · oxygen · fuel',
      stages: ['Moonbase supplies', 'Launch window', 'Orbital express'],
      cargo: 'Astronaut helmet|astronaut;Oxygen tanks|oxygen;Rocket fuel cells|fuel;Solar panel|solar;Moon rover|car;Service robot|robot;Space food packs|box;Navigation tablet|tablet;Satellite kit|satellite;Star map|book;Launch rocket|rocket;Repair tools|tools' },
    { id:'beacon', name:'Beacon Bay', category:'Beacon keeper supplies', badge:'BEACON',
      tag:'Bring the coast its guiding light.', location:7, accent:'#ffdf9b', tempo:110,
      priority:'KEEPER ESSENTIALS', priorityCopy:'Lamps · lenses · charts',
      stages:['Keeper arrival','Glass workshop','Shoreline relay','Tower repairs','Tide watch','Coastal signal','Last boat home','A light for all'],
      stories:['An apprentice named Sora inherits a lighthouse with a cracked lens.','The glassmakers can repair the lens if every dock receives its supplies.','Sora finds letters from boats the old keeper guided home.','Repair the tower before the fog returns to the bay.','Tide charts reveal a safe route around the hidden rocks.','Bring signal lamps to the four coastal stations.','One little boat is still at sea. The whole bay keeps watch.','The last boat comes home. Sora lights a beacon that belongs to everyone.'],
      keeper:'Sora',landmark:'lighthouse',lore:{opening:'Sora inherits a lighthouse and a box of letters from the sailors it once guided home.',turn:'The cracked lens can be repaired, but only if the whole bay carries its part of the work.',ending:'The last boat returns through the fog. Sora keeps the letters beside a light that belongs to everyone.'},
      cargo:'Signal lamps|lantern;Lighthouse lenses|lens;Tide charts|map;Glass prisms|lightprism;Keeper coats|parka;Bell fittings|bell;Solar cells|solartile;Navigation compasses|compass;Repair gloves|gloves;Tower tools|tools;Coiled ropes|rope;Keeper letters|mailbundle' },
    { id:'school', name:'School Run', category:'School supplies', badge:'SCHOOL',
      tag:'Little deliveries. Big bright ideas.', location:8, accent:'#ffd783', tempo:106,
      priority:'CLASSROOM ESSENTIALS', priorityCopy:'Books · pencils · backpacks',
      stages:['First bell','Art class rush','Science fair express'],
      stories:['The first bell is close. Fill the classrooms with essentials.', 'Art class needs a fresh supply of colour. Yellow joins the fleet.', 'The science fair opens soon. Handle models and express supplies.'],
      cargo:'Textbook stack|bookstack;Coloured pencils|pencils;School backpacks|backpack;Spiral notebooks|notebook;Geometry rulers|ruler;Lunch boxes|box;Art palettes|palette;Safety scissors|scissors;Glue sticks|bottle;Classroom globe|globe;Science microscope|microscope;School bell|bell' },
    { id:'dino', name:'Dino Park', category:'Dinosaur park supplies', badge:'DINOS',
      tag:'Tiny trucks. Jurassic-sized wonder.', location:9, accent:'#c3e89e', tempo:114,
      priority:'RANGER ESSENTIALS', priorityCopy:'Eggs · feed · ranger kits',
      stages:['Hatchery helpers','Ranger rounds','Jurassic jamboree'],
      stories:['A baby dinosaur is hatching. Deliver eggs and ranger supplies.', 'The park is waking up. Stock four ranger stations.', 'Visitors are arriving. Move fossils, feed and fragile eggs with care.'],
      cargo:'Dinosaur eggs|dinoegg;Dinosaur feed|feed;Ranger kits|kitbag;Fossil specimens|fossil;Excavation brushes|brush;Ranger binoculars|binoculars;Fern seedlings|plant;Tracking radios|radio;Park maps|map;Ranger hats|cap;Dinosaur models|dinosaur;Visitor passes|ticket' },
    { id:'candy', name:'Candy Works', category:'Candy factory supplies', badge:'CANDY',
      tag:'Sweet cargo. A perfectly timed treat.', location:10, accent:'#ffc1df', tempo:118,
      priority:'SWEET ESSENTIALS', priorityCopy:'Chocolate · sugar · sprinkles',
      stages:['Morning batch','Sugar rush','Midnight confection'],
      stories:['The first batch is mixing. Deliver the sweet ingredients.', 'The candy counters are busy. Keep all four docks supplied.', 'The special orders are ready. Fragile treats need perfect timing.'],
      cargo:'Chocolate bars|chocolate;Sugar sacks|bag;Rainbow sprinkles|sprinkles;Swirl lollipops|lollipop;Cupcake trays|cupcake;Cookie tins|cookie;Candy canes|candycane;Gummy bear boxes|teddy;Jam jars|jar;Baking tools|tools;Gift ribbons|bow;Sweet gift boxes|gift' },
    { id:'forest', name:'Moonleaf Forest', category:'Enchanted supplies', badge:'MAGIC',
      tag:'Deliver a little wonder after dark.', location:11, accent:'#d5bfff', tempo:100,
      priority:'MAGIC ESSENTIALS', priorityCopy:'Potions · spellbooks · crystals',
      stages:['Lantern trail','Potion moonrise','Starlight delivery'],
      stories:['Light the lantern trail. The woodland camp needs supplies.', 'Moonrise is near. Bring potions and books to four magic docks.', 'A starlight celebration awaits. Sort fragile crystals and swift spells.'],
      cargo:'Potion bottles|potion;Spellbooks|spellbook;Moon crystals|crystal;Mushroom lanterns|mushroom;Wizard hats|wizardhat;Magic wands|wand;Herb bundles|plant;Bottled starlight|starjar;Silver moon charms|moon;Enchanted maps|map;Fairy house kits|house;Woodland tea|jar' },
    { id:'arctic', name:'Arctic Outpost', category:'Polar expedition supplies', badge:'POLAR',
      tag:'Warm hearts. Ice-cool deliveries.', location:12, accent:'#bdeaff', tempo:102,
      priority:'EXPEDITION ESSENTIALS', priorityCopy:'Parkas · heaters · hot drinks',
      stages:['Warm the camp','Aurora rounds','Polar night express'],
      stories:['The research crew has arrived. Warm up the camp.', 'Aurora rounds are starting. Stock four expedition stations.', 'The polar night is quiet. Deliver instruments and express warmth.'],
      cargo:'Thermal parkas|parka;Camp heaters|heater;Hot drink flasks|thermos;Snow goggles|glasses;Ice axes|iceaxe;Sled repair kits|tools;Research sensors|scanner;Snow boots|boot;Polar radios|radio;Sample cases|crystal;Aurora camera|camera;Snowflake badges|snowflake' },
    { id:'rome', name:'Roman Empire', category:'Roman trade supplies', badge:'ROME', era:'history',
      tag:'All roads lead to your delivery dock.', location:13, accent:'#f2d08c', tempo:114,
      priority:'FORUM ESSENTIALS', priorityCopy:'Amphorae · scrolls · shields',
      stages:['Forum opening','Market morning','Legion supplies','Aqueduct works','Chariot festival','Port of Rome','Senate summit','Empire express'],
      stories:['Open the forum stalls with the first trade crates.', 'The market is waking up. Four merchants await their supplies.', 'Ready the supply depots. Delicate pottery needs careful timing.', 'The aqueduct builders need tools and stone at every dock.', 'The festival starts soon. Keep up as the merchants change places.', 'Trade ships have arrived. Clear the busy harbour shipments.', 'Prepare a grand gathering with precise, flawless deliveries.', 'A final rush across the empire. Master every dock change.'],
      cargo:'Clay amphorae|amphora;Trade scrolls|scroll;Legion shields|romanshield;Bronze helmets|romanhelmet;Laurel wreaths|laurel;Wheat baskets|wheat;Legion standards|standard;Linen tunics|tunic;Lyre cases|lyre;Aqueduct stone|stoneblock;Forum columns|column;Trade coins|coins' },
    { id:'egypt', name:'Ancient Egypt', category:'Nile trade supplies', badge:'NILE', era:'history',
      tag:'Carry wonders along the Nile.', location:14, accent:'#91dfe5', tempo:108,
      priority:'NILE ESSENTIALS', priorityCopy:'Papyrus · jars · linen',
      stages:['Nile landing','Papyrus market','Temple court','River caravan','Obelisk works','Harvest festival','Royal storehouse','Golden Nile express'],
      stories:['The riverboat has docked. Unload the first supplies.', 'The scribes and traders are ready for a busy market.', 'Bring jars and linen to the temple court with care.', 'A new caravan arrives. Watch the changing supply docks.', 'Keep the stoneworkers supplied through the afternoon.', 'Fill the festival stalls with baskets, flowers and cloth.', 'Precious goods fill the belt. Aim for perfect timing.', 'Your grand finale: a fast river trade route with six dock changes.'],
      cargo:'Papyrus scrolls|scroll;Nile pottery|amphora;Linen rolls|linen;Woven baskets|basket;Lotus flowers|lotus;Scarab charms|scarab;Temple stone|stoneblock;Obelisk models|obelisk;Sun dials|sundial;Gold collars|necklace;Reed boat models|reedboat;Bronze tools|hammer' },
    { id:'viking', name:'Viking Harbour', category:'Viking trade supplies', badge:'NORTH', era:'history',
      tag:'Warm lanterns. Bold northern voyages.', location:15, accent:'#b8dbe9', tempo:110,
      priority:'VOYAGE ESSENTIALS', priorityCopy:'Shields · barrels · wool',
      stages:['Longship landing','Trading quay','Forge supplies','Fjord crossing','Winter market','Northern voyage','Harbour gathering','Longship express'],
      stories:['A longship is home. Ready the first trading crates.', 'Four timber docks open for the morning market.', 'Bring the forge its tools and the harbour its supplies.', 'A fresh crew arrives. Learn the new dock positions.', 'Lanterns light the winter market. Keep the cargo flowing.', 'Pack supplies for the next northern voyage.', 'The entire harbour is busy. Fragile trade goods need care.', 'The last fleet arrives. Six dock changes test your trading mastery.'],
      cargo:'Round shields|roundshield;Trade barrels|barrel;Wool blankets|blanket;Iron axes|vikingaxe;Coiled ship ropes|rope;Longship models|longship;Carved stones|runestone;Drinking horns|drinkinghorn;Fish baskets|fishbasket;Folded sailcloth|linen;Forge hammers|hammer;Amber charms|amber' },
    { id:'silkroad', name:'Silk Road', category:'Caravan trade supplies', badge:'CARAVAN', era:'history',
      tag:'Bring distant markets a little closer.', location:16, accent:'#bddea8', tempo:116,
      priority:'CARAVAN ESSENTIALS', priorityCopy:'Silk · tea · spices',
      stages:['Caravan welcome','Tea courtyard','Spice exchange','Lantern market','Mountain passage','Jade bazaar','Great trade fair','Silk Road express'],
      stories:['Welcome the caravan with a steady first delivery.', 'The tea courtyard opens its four trading stalls.', 'Sort colourful silk and precious spice shipments.', 'Lanterns are lit. Keep an eye on the changing docks.', 'Prepare the next caravan with fast, accurate loading.', 'Jade and porcelain arrive. Perfect timing protects the cargo.', 'Merchants gather from every route. Clear the great trade fair.', 'Master the final caravan rush and its six dock changes.'],
      cargo:'Silk bolts|silkrolls;Tea jars|jar;Spice sacks|spices;Rolled carpets|rug;Brass lanterns|lantern;Porcelain bowls|porcelain;Paper fans|paperfan;Jade pendants|jade;Trade coins|coins;Caravan maps|map;Merchant seals|seal;Counting frames|abacus' }
  ];
  // Append worlds so every existing cargo, location and star-record ID stays stable.
  worlds.push(
    {id:'diner',name:'Midnight Diner',category:'Diner deliveries',badge:'DINER',chapter:'city',location:17,accent:'#ffa99c',tempo:112,
      tag:'Hot plates. Neon nights. Happy tables.',priority:'DINNER ESSENTIALS',priorityCopy:'Burgers · fries · shakes',
      stages:['Doors open','Lunch orders','Dinner rush','Drive-through dash','Neon supper','Late-night tables','Kitchen relay','Midnight special'],
      stories:['The grill is warm. Bring the diner its first meal kits.','Tables fill up. Four docks keep lunch on schedule.','Dinner is served. Handle hot meals and express orders.','Drive-through orders arrive. Watch the changing docks.','Neon signs glow. Keep every table supplied.','Night owls need warm food and careful loading.','The kitchen is working flat out. Perfect timing keeps meals moving.','Close the busiest night with six dock changes and a flawless final service.'],
      cargo:'Burger boxes|burger;Fries cartons|fries;Milkshake cups|milkshake;Pizza slices|pizzaslice;Soup bowls|soupbowl;Chef hats|chefhat;Coffee pots|coffeepot;Menu cards|menu;Cutlery bundles|cutlery;Sauce bottles|saucebottle;Takeaway bags|takeaway;Dinner plates|plate'},
    {id:'bakery',name:'Sunrise Bakery',category:'Bakery deliveries',badge:'BAKERY',chapter:'city',location:18,accent:'#ffe1a4',tempo:106,
      tag:'Little pastries. A big morning rush.',priority:'FRESH BATCH',priorityCopy:'Croissants · bread · cakes',
      stages:['First batch','Breakfast boxes','Pastry parade','Market morning','Afternoon tea','Wedding orders','Festival baking','Golden crust'],
      stories:['The first oven opens. Deliver warm bread and fresh pastries.','Breakfast queues grow. Yellow joins the morning fleet.','The pastry counter needs delicate cakes and quick deliveries.','Market orders arrive. Follow the new dock positions.','Tea time means careful loading and a faster belt.','Celebration cakes need steady hands through four dock changes.','The whole neighbourhood orders treats. Keep every batch on time.','Bake your best finale: six dock changes and a legendary breakfast service.'],
      cargo:'Croissant trays|croissant;Bread loaves|breadloaf;Celebration cakes|layercake;Doughnut boxes|donut;Rolling pins|rollingpin;Flour sacks|floursack;Whisk bundles|whisk;Baguettes|baguette;Butter blocks|butter;Oven gloves|keepergloves;Pastry boxes|takeaway;Recipe books|book'},
    {id:'metro',name:'Metro Crossing',category:'Metro deliveries',badge:'METRO',chapter:'city',location:19,accent:'#99deff',tempo:116,
      tag:'Keep a bright little city moving.',priority:'CITY ESSENTIALS',priorityCopy:'Tickets · mail · repairs',
      stages:['Morning commute','Corner kiosks','Station rush','Cross-town relay','Rush hour','Night network','Citywide service','Metro maestro'],
      stories:['The city wakes up. Bring tickets, mail and repair tools.','Corner shops open. Connect all four city docks.','Train arrivals bring fragile parcels and urgent deliveries.','Routes change. Read the docks before the next load.','Rush hour fills the belt. Deliver with precision.','The night network needs supplies across four route changes.','Every district calls. Keep the entire city connected.','Master six route changes and the fastest metropolitan delivery shift.'],
      cargo:'Transit tickets|transitticket;Mail bundles|mailbundle;Repair toolboxes|toolbox;Traffic signals|trafficlight;Bike helmets|bikehelmet;Camera kits|camera;Street plants|plant;Coffee cups|coffeecup;Newspaper stacks|newspaper;Bus passes|transitticket;City maps|map;Signal radios|walkie'},
    {id:'canal',name:'Canal Quarter',category:'Canal market cargo',badge:'CANAL',chapter:'city',location:20,accent:'#a4e4cf',tempo:108,
      tag:'Bridges, boats and waterside markets.',priority:'MARKET ESSENTIALS',priorityCopy:'Flowers · fruit · parcels',
      stages:['Quayside welcome','Bridge market','Boat arrivals','Canal crossings','Floating fair','Evening lanterns','Harbour relay','Waterside wonder'],
      stories:['Open the waterside market with flowers and fresh fruit.','Four market stalls need a steady delivery rhythm.','Boats arrive with fragile gifts and express parcels.','The bridge route changes. Watch the dock colours.','The floating fair fills up. Keep the market moving.','Lanterns light the quay. Four dock changes test your route memory.','Every boat brings another order. Protect the precious cargo.','Complete the grand waterfront fair with six dock changes and perfect loading.'],
      cargo:'Flower bouquets|bouquet;Fruit crates|fruitcrate;Post parcels|mailbundle;Canal boat models|reedboat;Market baskets|basket;Bridge lanterns|lantern;Cycle bells|bell;Paint tins|paintcan;Bread baskets|breadloaf;Striped umbrellas|umbrella;Pottery gifts|porcelain;Watering cans|wateringcan'},
    {id:'skyguard',name:'Skyguard HQ',category:'Skyguard equipment',badge:'HEROES',chapter:'makers',location:21,accent:'#ffc9a1',tempo:118,
      tag:'Supply your own team of city heroes.',priority:'HERO EQUIPMENT',priorityCopy:'Visors · shields · boots',
      stages:['New recruits','Training day','Rescue readiness','Rooftop relay','City defence','Skybridge scramble','Guardian assembly','Heroes united'],
      stories:['Welcome the Skyguard. Equip the first rescue team.','Training opens all four docks. Ready every recruit.','Fragile gear and urgent supplies prepare the next rescue.','Rooftop routes move. Match each load to its new dock.','The city needs its guardians. Keep the equipment flowing.','Four dock changes test the fastest rescue suppliers.','Every hero joins the assembly. Perfect loading protects the gear.','Unite the whole Skyguard through six dock changes and a legendary final dispatch.'],
      cargo:'Flight visors|flightvisor;Rescue shields|heroshield;Jet boots|jetboots;Grapple reels|rope;Wing packs|wingpack;Signal beacons|beacon;Rescue gloves|keepergloves;Drone scouts|drone;Medical packs|firstaid;Training targets|target;Power cells|powercell;Hero badges|herobadge'},
    {id:'arena',name:'All-Star Arena',category:'Arena equipment',badge:'SPORTS',chapter:'makers',location:22,accent:'#b9e8a0',tempo:120,
      tag:'Every court. Every team. Game on.',priority:'GAME-DAY GEAR',priorityCopy:'Basketballs · rackets · mitts',
      stages:['Practice courts','Team check-in','Tournament day','Court switch','Semifinal rush','Championship relay','Arena all-stars','Final whistle'],
      stories:['Open the practice courts with balls, rackets and mitts.','All four teams arrive. Deliver the gear before tipoff.','Tournament supplies include fragile trophies and urgent kits.','Courts switch. Read the new dock order before loading.','The semifinals begin. Keep every team ready to play.','Four dock changes turn championship day into a timing challenge.','The full arena celebrates. Keep the equipment arriving.','Win the final delivery championship through six dock changes and the fastest belt.'],
      cargo:'Basketball bundles|basketball;Tennis rackets|tennisracket;Baseball mitts|baseballmitt;Volleyball packs|volleyball;Badminton shuttles|shuttlecock;Medal cases|medal;Scoreboard kits|scoreboard;Hockey sticks|hockeystick;Swimming goggles|goggles;Track shoes|cleats;Team pennants|flag;Champion cups|trophy'},
    {id:'build',name:'Big Build',category:'Construction supplies',badge:'BUILD',chapter:'makers',location:23,accent:'#ffd276',tempo:114,
      tag:'Raise a new neighbourhood, one load at a time.',priority:'BUILD ESSENTIALS',priorityCopy:'Hard hats · bricks · cement',
      stages:['Site briefing','Foundations','Workshop rush','Crane crossing','Skyline supplies','Concrete convoy','Tower topping','Grand opening'],
      stories:['The site opens. Bring safety helmets and foundation supplies.','Four work crews start building. Keep each dock supplied.','Fragile tools and urgent materials arrive from the workshop.','Crane routes change. Follow the docks around the site.','The skyline grows. Precise loading keeps the build on time.','Cement crews need a steady flow through four dock changes.','The last tower rises. Every material matters.','Finish the neighbourhood with six dock changes and a master builder delivery run.'],
      cargo:'Safety hard hats|hardhat;Brick stacks|brickstack;Cement sacks|cementsack;Blueprint rolls|blueprint;Steel beams|steelbeam;Traffic cones|cone;Paint cans|paintcan;Measuring tapes|tapemeasure;Work boots|workboot;Drill kits|drill;Toolboxes|toolbox;Safety vests|safetyvest'},
    {id:'robot',name:'Robot Lab',category:'Technology components',badge:'TECH',chapter:'makers',location:24,accent:'#a9eee7',tempo:122,
      tag:'Build tiny robots with big ideas.',priority:'LAB COMPONENTS',priorityCopy:'Chips · sensors · cells',
      stages:['Power on','Prototype parts','Assembly line','Circuit switch','Drone launch','Systems relay','Robot showcase','Future express'],
      stories:['Power up the lab with chips, sensors and battery cells.','Four assembly stations open. Connect every component.','Delicate circuits and express parts keep the prototypes moving.','Assembly routes switch. Follow the new station colours.','Scout drones are ready. Deliver their final components.','Four dock changes test your fastest systems relay.','The robot showcase opens. Perfect loading protects the inventions.','Complete the future express through six station changes and the most demanding delivery test.'],
      cargo:'Microchip packs|microchip;Sensor lenses|sensor;Battery cells|powercell;Robot arms|robotarm;Circuit boards|circuitboard;Scout drones|drone;VR headsets|vrheadset;Server drives|serverdrive;Solar tiles|solartile;Cable reels|cablereel;Robot kits|robotkit;Lab tablets|tablet'},
    {id:'prism',name:'Prism Forge',category:'Prism workshop gear',badge:'PRISM',chapter:'prism',location:25,accent:'#c7bfff',tempo:116,
      tag:'Forge rings in the colours of your trucks.',priority:'FORGE ESSENTIALS',priorityCopy:'Rings · gems · bracelets',
      stages:['First spark','Four colours','Crystal orders','Colour crossing','Prism festival','Workshop relay','Master jewellers','Spectrum finale'],
      stories:['The first rings are ready. Match their colour and shape to the trucks.','Yellow joins the workshop. Four colours fill the forge.','Delicate gems and urgent ring orders need careful loading.','The docks move. The rings keep the colour of their matching truck.','The prism festival opens. Bring the jewellers every component.','Four dock changes test your colour reading and timing.','Master jewellers gather. Protect the glowing workshop cargo.','Forge a perfect spectrum finale through six dock changes and legendary delivery timing.'],
      cargo:'Prism rings|prismring;Faceted gems|facetedgem;Prism bracelets|prismbracelet;Jeweller tools|jewellertool;Crystal ingots|crystalingot;Display boxes|ringbox;Polishing cloths|linen;Gem scales|gemscale;Light prisms|lightprism;Workshop goggles|goggles;Ring moulds|ringmould;Colour charts|colourchart'}
  );
  const tiers = [
    { loads:12, priority:3, seconds:45, perfects:4, speed:82, gap:90, shift:1, fragile:0, express:0, shuffleAt:[], difficulty:'EASY', detail:'Three docks. A steady belt. Find your rhythm.' },
    { loads:20, priority:5, seconds:50, perfects:7, speed:102, gap:84, shift:2, fragile:0, express:0, shuffleAt:[], difficulty:'STEADY', detail:'Four docks and a faster belt. Yellow joins in.' },
    { loads:28, priority:7, seconds:55, perfects:10, speed:124, gap:78, shift:4, fragile:.12, express:.12, shuffleAt:[14], difficulty:'BRISK', detail:'Fragile + express. One dock change after 14 loads.' },
    { loads:36, priority:9, seconds:60, perfects:15, speed:142, gap:76, shift:4, fragile:.15, express:.15, shuffleAt:[12,24], difficulty:'BUSY', detail:'Faster arrivals. Two dock changes every 12 loads.' },
    { loads:44, priority:11, seconds:64, perfects:20, speed:156, gap:74, shift:5, fragile:.17, express:.17, shuffleAt:[12,24,36], difficulty:'TOUGH', detail:'More special cargo. Three dock changes. Stay sharp.' },
    { loads:52, priority:13, seconds:68, perfects:25, speed:170, gap:72, shift:6, fragile:.19, express:.19, shuffleAt:[10,20,30,40], difficulty:'EXPERT', detail:'Four dock changes. A shorter window for every load.' },
    { loads:60, priority:15, seconds:72, perfects:30, speed:184, gap:69, shift:7, fragile:.21, express:.21, shuffleAt:[10,20,30,40,50], difficulty:'MASTER', detail:'Five dock changes. Tight timing and precious cargo.' },
    { loads:68, priority:17, seconds:76, perfects:36, speed:196, gap:66, shift:8, fragile:.23, express:.23, shuffleAt:[10,20,30,40,50,60], difficulty:'LEGEND', detail:'Six dock changes. The fastest belt. Your grand finale.' }
  ];
  const laterStages = {
    matchday:['Away-day supplies','Derby night','Extra-time rush','Continental cup','World final express'],
    festival:['Backstage switch','Sunset headliner','Festival marathon','Last-stage legends','Grand finale'],
    rescue:['Storm preparations','Coastline relay','Emergency flotilla','Rescue command','Ocean guardian'],
    space:['Satellite service','Meteor watch','Deep-space convoy','Mission control','Galaxy express'],
    school:['Library deliveries','Sports-day supplies','Exam-week rush','Graduation prep','Campus champion'],
    dino:['Fossil expedition','Feeding frenzy','Raptor rounds','Park-wide rush','Jurassic master'],
    candy:['Caramel convoy','Candy carnival','Sweet-shop scramble','Golden recipe','Confection champion'],
    forest:['Crystal crossings','Firefly festival','Moonlit relay','Ancient tree supplies','Woodland wonder'],
    arctic:['Glacier relay','Blizzard supplies','Icebreaker arrival','Midwinter convoy','Aurora champion']
  };
  for(const w of worlds) {
    if(laterStages[w.id])w.stages.push(...laterStages[w.id]);
    if(!w.stories)w.stories=[w.tag,w.tag,w.tag];
    while(w.stories.length<tiers.length)w.stories.push(`${w.name} needs your best deliveries. ${tiers[w.stories.length].detail}`);
  }
  worlds.push(...pack.worlds);
  const worldPages=[];
  const chapters={adventures:'ADVENTURES',history:'HISTORY',city:'CITY LIFE',makers:'HEROES & MAKERS',prism:'PRISM FORGE',...Object.fromEntries(Object.entries(pack.chapters).map(([id,c])=>[id,c.name]))};
  for(const chapter of Object.keys(chapters)) {
    const group=worlds.filter(w=>(w.chapter || w.era || 'adventures')===chapter);
    for(let i=0;i<group.length;i+=4)worldPages.push(group.slice(i,i+4));
  }
  function pageLabel(page) {const w=worldPages[page]?.[0];return chapters[w?.chapter || w?.era || 'adventures'];}
  function getMission(worldId, stage) {
    const index = worlds.findIndex(w => w.id === worldId);
    if (index < 0 || !Number.isInteger(stage) || stage < 0 || stage >= tiers.length) return null;
    const world = worlds[index], base = 300 + index * 12;
    return { ...tiers[stage], id: `${worldId}-${stage + 1}`, world, stage,
      title: world.stages[stage], story:world.stories?.[stage] || world.tag, products: Array.from({ length: 12 }, (_, i) => base + i),
      priorityProducts: [base, base + 1, base + 2], challenge:challenges.describe(world,stage) };
  }
  const missions = worlds.flatMap(w => tiers.map((_, i) => getMission(w.id, i)));
  function readRecords(raw) {
    let saved;
    try { saved = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) { return {}; }
    const records = {};
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return records;
    for (const mission of missions) {
      // Retired content is translated once at the save boundary; playable IDs are original.
      const r = saved[mission.id] || (mission.world.id==='beacon'?saved[`batcave-${mission.stage+1}`]:null);
      if (!r || typeof r !== 'object' || !Number.isInteger(r.stars) || r.stars < 1 || r.stars > 3) continue;
      records[mission.id] = { stars: r.stars,
        bestScore: Number.isFinite(r.bestScore) ? Math.max(0, Math.min(1e9, Math.floor(r.bestScore))) : 0,
        bestTime: Number.isFinite(r.bestTime) && r.bestTime >= 0 && r.bestTime <= mission.seconds ? r.bestTime : mission.seconds };
    }
    return records;
  }
  function isUnlocked(mission, records) {
    return !!mission && (mission.stage === 0 || (records[`${mission.world.id}-${mission.stage}`]?.stars || 0) > 0);
  }
  function grade(mission, stats) {
    if (!mission || !stats.won || !Number.isFinite(stats.elapsed) || stats.elapsed > mission.seconds || stats.elapsed < 0 ||
      stats.delivered < mission.loads || stats.priorityLoaded < mission.priority || stats.lives <= 0) return 0;
    if (stats.lives === 3 && stats.perfects >= mission.perfects) return 3;
    return stats.lives >= 2 ? 2 : 1;
  }
  function recordResult(records, mission, stats) {
    const stars = grade(mission, stats);
    if (!stars) return records;
    const old = records[mission.id];
    return { ...records, [mission.id]: { stars: Math.max(stars, old?.stars || 0),
      bestScore: Math.max(Math.floor(stats.score), old?.bestScore || 0),
      bestTime: Math.min(stats.elapsed, old?.bestTime ?? mission.seconds) } };
  }
  function totalStars(records, worldId) {
    return missions.filter(m => !worldId || m.world.id === worldId).reduce((sum, m) => sum + (records[m.id]?.stars || 0), 0);
  }
  function lanternCount(records) {return worlds.reduce((n,w)=>n+(records[`${w.id}-${tiers.length}`]?.stars>0?1:0),0);}
  function chapterPages(chapter) {return worldPages.map((page,i)=>({page,i})).filter(({page})=>!chapter||(page[0].chapter||page[0].era||'adventures')===chapter).map(({i})=>i);}
  return { worlds, worldPages, chapters, chapterPages, pageLabel, story:pack, lanternCount, tiers, levelCount:tiers.length, missions, getMission, readRecords, isUnlocked, grade, recordResult, totalStars };
});
