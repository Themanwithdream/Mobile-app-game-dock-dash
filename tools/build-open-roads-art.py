"""Build the 77 original Open Roads pixel scenes without altering existing art.

Each authored scene combines its own terrain, architectural plan, working props,
and arrangement. All detail is painted offline; mobile devices load a 360x640
indexed PNG and the existing small WebP card preview, not a live art generator.
Requires Pillow. No external images, fonts, samples, or downloads.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
import json
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/worlds/open-roads'
INK = '#1b2b34'
CREAM = '#ede0bd'
GOLD = '#d6ad62'
WOOD = '#8d664a'
GLASS = '#75b9c5'
GREEN = '#6e9b73'

# ground, ambience, left upper/lower plans, right upper/lower plans.
# Plans differ in silhouette as well as palette. The loading strip stays empty.
PLANS = {
 'citadel':('#766f63','stone','goldtower','stonegarden','goldhall','masonyard'),
 'treepark':('#64785b','park','ancienttree','seedbeds','walkway','classgarden'),
 'polarfort':('#98aab1','snow','fortwall','rockface','fortmuseum','weatherkit'),
 'forgeworks':('#665b51','industrial','furnace','metalrack','anvilroom','cartbench'),
 'coastalresearch':('#59828a','water','researchboat','coastalsamples','glasslab','divegear'),
 'burgerkitchen':('#9a8b70','street','burgerfront','pickupbench','burgerprep','mealracks'),
 'icecreamshop':('#a39b88','coast','icecreamfront','seasidebench','coldcounter','fruitprep'),
 'supermarket':('#85917e','street','groceryfront','producepallets','groceryaisles','coldroom'),
 'enterprisehub':('#899297','city','officefront','sharedequipment','classdesks','noticecourt'),
 'station1950':('#8c8372','rail','stationroof','porterroom','steamplatform','signaltower'),
 'cinema':('#786967','night','cinemafront','ticketbooth','projectionroom','theatreseats'),
 'militarycamp':('#6e7962','field','camptents','vehiclechecks','trainingyard','shelterstores'),
 'fashionhouse':('#988688','city','fashionfront','fabricracks','cuttingroom','dressrails'),
 'stockexchange':('#7c8c8a','city','exchangefront','certificatehall','pricewall','learningdesks'),
 'accramarket':('#aa9773','coast','marketcanopy','packingcourt','coldstorefront','marketrepair'),
 'college':('#899688','park','collegearch','libraryroom','studentbenches','displaycourt'),
 'mixedfarm':('#87905c','field','farmbarn','harvestrows','tractoryard','coveredcrates'),
 'carassembly':('#788a91','industrial','assemblybays','partsconveyor','inspectionline','dispatchcars'),
 'autoshop':('#8b8b7c','street','repairbay','loanbikes','tyreworkshop','servicecars'),
 'hospital':('#899c99','city','hospitalfront','waitinggarden','linensupply','hospitalstores'),
 'fishmarket':('#748f93','water','fishlanding','netshed','fishcounter','icecrates'),
 'vineyard':('#92906c','hill','vinerows','terracecart','grapepergola','fruitpacking'),
 'olivepress':('#87866b','field','olivetrees','memberyard','pressmachine','bottlebench'),
 'roofgreenhouse':('#879993','roof','greenhousebeds','watertank','glassgreenhouse','seedlingracks'),
 'cheesery':('#97937b','field','milkreceiving','canracks','cheeseshelves','wrapbench'),
 'saltpans':('#a59c80','coast','saltbasins','gatewheel','saltcrystals','saltpacking'),
 'teahouse':('#8c9270','hill','tealeafbeds','basketstacks','dryingracks','teapacking'),
 'riceterraces':('#87926a','field','paddies','fieldbaskets','terracedpath','graindrying'),
 'tilestudio':('#a3937e','craft','tilecourtyard','glazebench','tilekiln','patterntables'),
 'bookbindery':('#908779','craft','bookpress','paperstacks','stitchbench','readingcourt'),
 'brassworkshop':('#988970','craft','brassbench','instrumentracks','musicstands','concertcourt'),
 'filmarchive':('#859296','interior','reelarchive','filmviewing','inspectiontables','captioncourt'),
 'glassrecovery':('#7e9491','industrial','glassbins','glassconveyor','bottleracks','windowwork'),
 'darkroom':('#847b92','interior','phototanks','negativebench','dryingphotos','photogallery'),
 'sailloft':('#929c92','water','sailbench','roperacks','sailmast','harbourkits'),
 'weavinghall':('#a18a77','craft','weavinglooms','yarnracks','rugtables','finishedrugs'),
 'cabledepot':('#819297','hill','cablecabins','partsbench','cablewheel','platformshelter'),
 'containerport':('#7c9298','water','containerstack','portcrane','receivingcontainers','gateshed'),
 'bikeyard':('#83937d','street','bikeracks','repaircycles','mailpanniers','departurecanopy'),
 'ferryterminal':('#749494','water','ferrylanding','cargoquay','passengershelter','ticketoffice'),
 'airhangar':('#8b9ba0','industrial','medhangar','restroom','helipad','supportstores'),
 'mailsorting':('#959081','industrial','sortingbelts','mailsacks','dispatchshelves','mailvans'),
 'canallock':('#7e9c8f','water','lockgates','lockworkshop','moorings','noticequay'),
 'tramdepot':('#9a8e79','rail','restorationtram','seattimber','tramworkshop','museumpath'),
 'wetlandstation':('#779c85','wetland','reedbeds','sampledeck','birdhide','walkway'),
 'windfarm':('#82949d','hill','turbinebase','serviceracks','windmast','servicehut'),
 'solaryard':('#9d9878','industrial','solarpanelrows','assessmentracks','testbenches','recoverybay'),
 'hydropower':('#7f9995','water','powerhouse','repairgantry','waterchannels','partsarchive'),
 'waterworks':('#87a3a3','industrial','watertanks','pipeyard','filterbasins','visitorclass'),
 'weatherpost':('#b49b75','desert','weatherhut','shadedbench','weatherinstruments','waterstores'),
 'dunerestoration':('#aaa383','coast','dunefence','grassnursery','dunewalk','surveyhut'),
 'forestrydepot':('#778b6c','forest','forestryracks','seedlingbeds','trailhut','timberpanels'),
 'animalcare':('#8e9c86','park','careenclosures','quietgarden','recoveryrooms','volunteerhut'),
 'mobilityshop':('#8c9e9e','street','mobilitybenches','loancabinet','fittingroom','partdrawers'),
 'firestation':('#998982','street','fireenginebay','crewstores','trainingclass','stationhistory'),
 'donationcentre':('#a59997','park','donationfront','receptiondesk','refreshmentroom','staffstores'),
 'dentalclinic':('#92a39b','street','clinicfront','bookcorner','dentalroom','supportoffice'),
 'seniorcentre':('#a69e85','park','activityroom','teagarden','accessiblecraft','courtyardbenches'),
 'publicpool':('#80a0a6','interior','poollanes','swimracks','changingroom','spectatorsteps'),
 'boxinggym':('#9f887a','street','boxingring','kitracks','homeworkroom','gymseats'),
 'roofworkshops':('#b1947d','roof','roofawning','leatherbench','notebookmakers','sharedcourtyard'),
 'busworks':('#989783','industrial','busrepair','upholsterybench','destinationwork','busdispatch'),
 'recordingcourt':('#a38d7e','craft','recordingroom','soundcases','listeningcourt','musiccourtyard'),
 'paperworks':('#a2a18d','water','papertanks','fibrestore','papermesh','notebookbench'),
 'tilequay':('#9aa6a5','water','tilewall','tilecases','quaystairs','patternworkshop'),
 'hilllift':('#a89987','hill','funicular','hillsidestairs','parcelroom','hillviewcourt'),
 'monsoonboatyard':('#849d8d','water','boatrepair','woodstacks','boatshelter','landingbags'),
 'wintermarket':('#9fa8b1','snow','winterstalls','warmcounters','coveredreceiving','winterbenches'),
 'courthouse':('#a59a8b','stone','courthousecolumns','planarchive','recordshelves','publicreading'),
 'cooperativebank':('#959e8d','city','creditfront','memberroom','privatedesks','learningcorner'),
 'newspaperpress':('#949185','industrial','printmachine','paperrolls','proofroom','editionbundles'),
 'roaddepot':('#a6977b','industrial','roadtools','materialbins','roadworkbay','diversionmaps'),
 'responsecentre':('#909da0','city','mapwalls','shelterroom','radiodesk','informationcourt'),
 'reusemarket':('#959c81','street','furnitureracks','repairchairs','inspectionbay','collectioncourt'),
 'flowerauction':('#a49695','interior','flowerrows','auctiondesks','flowerreceiving','packingflowers'),
 'coldstorage':('#8c9fa6','industrial','coldstacks','insulatedboxes','coolingroom','shelfmap'),
 'repairfair':('#a59b80','park','repairtables','foodstalls','makertables','storywall'),
}


class Painter:
    def __init__(self, place):
        self.place = place
        self.seed = int(hashlib.sha256(place['id'].encode()).hexdigest()[:16], 16)
        self.rng = random.Random(self.seed)
        self.im = Image.new('RGB', (360, 640), INK)
        self.d = ImageDraw.Draw(self.im)
        self.accent = place['accent']

    def r(self, x, y, w, h, color):
        if w > 0 and h > 0:
            self.d.rectangle((round(x), round(y), round(x+w-1), round(y+h-1)), fill=color)

    def p(self, points, color):
        self.d.polygon([(round(x), round(y)) for x, y in points], fill=color)

    def l(self, x, y, xx, yy, color, width=2):
        self.d.line((round(x), round(y), round(xx), round(yy)), fill=color, width=width)

    def oval(self, x, y, w, h, color):
        self.d.ellipse((round(x), round(y), round(x+w-1), round(y+h-1)), fill=color)

    def shade(self, color, amount):
        value = tuple(int(color[i:i+2], 16) for i in (1, 3, 5)) if isinstance(color, str) else color
        return tuple(max(0, min(255, n+amount)) for n in value)

    def texture(self, x, y, w, h, color, spacing=9):
        self.r(x, y, w, h, color)
        for yy in range(int(y+2), int(y+h-2), spacing):
            for xx in range(int(x+2), int(x+w-2), spacing):
                self.r(xx+self.rng.randrange(3), yy+self.rng.randrange(3), self.rng.randrange(1, 4), 1,
                       self.shade(color, self.rng.choice([-16, -9, 7, 15])))

    def tiles(self, x, y, w, h, color, step=10):
        self.texture(x, y, w, h, color)
        for yy in range(int(y), int(y+h), step):
            self.r(x, yy, w, 1, self.shade(color, -18))
            for xx in range(int(x+(step//2 if (yy//step)%2 else 0)), int(x+w), step):
                self.r(xx, yy, 1, min(step, y+h-yy), self.shade(color, -12))

    def box(self, x, y, w=19, h=15, col=WOOD):
        self.r(x+3, y+4, w, h, '#233039')
        self.r(x, y, w, h, col)
        self.r(x, y, w, 3, self.shade(col, 30))
        self.r(x+w-3, y+3, 3, h-3, self.shade(col, -25))
        self.r(x+3, y+5, w-6, 2, GOLD)
        self.r(x+3, y+h-4, w-6, 1, '#4c4538')

    def lamp(self, x, y):
        self.r(x+1, y+8, 3, 14, INK)
        self.r(x-3, y, 11, 12, '#665d49')
        self.r(x-1, y+2, 7, 8, '#d5a75e')
        self.r(x+1, y+3, 3, 5, '#fff0ba')
        self.r(x-4, y-2, 13, 3, '#34434a')

    def plant(self, x, y, size=13, kind='leaf'):
        self.r(x-size//3, y+size-4, size*2//3, 7, '#796048')
        self.r(x-1, y, 3, size+3, '#5f7851')
        if kind == 'pine':
            for off in range(3):
                sy = y-8+off*6
                self.p([(x, sy-10), (x-size+off*2, sy+12), (x+size-off*2, sy+12)], ['#46745e','#548365','#679975'][off])
        else:
            for dx, dy in [(-size//2,0),(size//2,-2),(0,-size//2),(0,5)]:
                self.oval(x+dx-size//2,y+dy-size//2,size,size,['#4a775c','#60916a','#75a577','#548764'][self.rng.randrange(4)])
                self.r(x+dx-3,y+dy-3,4,2,'#9cb888')

    def bench(self, x, y, w=34, color=WOOD):
        self.r(x+3, y+8, w, 15, '#35413c')
        self.r(x, y, w, 17, color)
        for yy in [2, 6, 11]: self.r(x+2,y+yy,w-4,2,self.shade(color,25))
        for xx in [x+4,x+w-7]: self.r(xx,y+17,3,7,INK)

    def window(self, x, y, w=16, h=22, warm=False):
        self.r(x-2,y-2,w+4,h+4,INK)
        self.r(x,y,w,h,'#d7b178' if warm else GLASS)
        self.p([(x+2,y+2),(x+w-2,y+2),(x+2,y+h-5)],'#e7e4b9' if warm else '#b4d8d5')
        self.r(x+w//2,y,2,h,'#587079')
        self.r(x,y+h//2,w,2,'#587079')

    def roof(self, x, y, w, h, col, style='tile'):
        self.r(x+5,y+6,w,h,'#253238')
        self.tiles(x,y,w,h,col,8 if style=='tile' else 15)
        self.r(x,y,w,3,self.shade(col,32))
        self.r(x+w-4,y,4,h,self.shade(col,-30))
        self.r(x,y+h-4,w,4,self.shade(col,-18))
        if style=='metal':
            for xx in range(int(x+7),int(x+w-5),8):self.r(xx,y+4,2,h-9,self.shade(col,20))

    def room(self, x, y, w=86, h=118, floor='#9e927e', wall='#c6b696'):
        self.r(x+4,y+5,w,h,'#263239')
        self.tiles(x,y,w,h,floor,12)
        self.r(x,y,w,6,wall);self.r(x,y,5,h,wall);self.r(x+w-5,y,5,h,self.shade(wall,-25))
        self.r(x,y+h-6,w,6,self.shade(wall,-30))
        self.r(x+7,y+7,w-14,2,self.shade(wall,30))
        for xx in [x+12,x+w-30]:self.window(xx,y+9,15,13)

    def awning(self, x, y, w, col):
        self.r(x+2,y+8,w,14,INK)
        self.r(x,y,w,17,col)
        for xx in range(int(x+2),int(x+w-5),12):self.r(xx,y+1,5,15,CREAM)
        self.r(x,y,w,3,self.shade(col,28))
        self.r(x,y+16,w,3,self.shade(col,-28))

    def vehicle(self, x, y, kind='car', col='#b87361'):
        w, h = (29, 58) if kind in ['bus','tram','fireengine'] else (24, 40)
        self.r(x+3,y+5,w,h,INK)
        for yy in [y+6,y+h-13]:self.r(x-3,yy,5,9,'#22343c');self.r(x+w-2,yy,5,9,'#22343c')
        self.r(x,y,w,h,col);self.r(x+3,y+3,w-6,h-6,self.shade(col,15))
        self.r(x+3,y+8,w-6,9,GLASS);self.r(x+4,y+9,w-10,2,'#bfd9d1')
        self.r(x+3,y+h-14,w-6,8,'#5e93a2')
        self.r(x+3,y+h-4,w-6,2,CREAM)
        if kind in ['bus','tram']:self.r(x+5,y+20,w-10,h-37,'#d8d2b4');self.r(x+7,y+22,3,h-42,'#9a9e95')
        if kind=='fireengine':
            for yy in range(int(y+21),int(y+44),6):self.r(x+5,yy,w-10,3,CREAM)
            self.r(x+3,y+2,7,3,'#bcdae1');self.r(x+w-10,y+2,7,3,'#e9b47b')

    def boat(self, x, y, w=48, h=95, col='#ac8d63'):
        self.p([(x+w/2,y),(x+w-3,y+20),(x+w-5,y+h-9),(x+w/2,y+h),(x+5,y+h-9),(x+3,y+20)],INK)
        self.p([(x+w/2,y+5),(x+w-7,y+22),(x+w-9,y+h-13),(x+w/2,y+h-6),(x+9,y+h-13),(x+7,y+22)],col)
        for yy in range(int(y+20),int(y+h-14),8):self.r(x+11,yy,w-22,2,self.shade(col,28))
        self.r(x+w/2-10,y+27,20,30,'#d6d8bf');self.window(x+w/2-7,y+32,14,11)

    def bike(self, x, y, col='#b66f58'):
        for yy in [y,y+29]:self.oval(x-6,yy-6,12,12,INK);self.oval(x-3,yy-3,6,6,'#9eaaa4')
        self.l(x,y,x+7,y+15,col,3);self.l(x+7,y+15,x,y+29,col,3);self.l(x,y,x,y+29,col,2)
        self.r(x-6,y+8,12,4,WOOD);self.l(x-6,y-2,x+7,y-2,CREAM,2)

    def shelves(self, x, y, w=62, h=67, content='boxes'):
        self.r(x,y,w,h,'#48595b')
        for yy in range(int(y+6),int(y+h-5),19):
            self.r(x+2,yy+13,w-4,4,WOOD)
            for xx in range(int(x+5),int(x+w-11),14):
                if content=='books':
                    for dx in [0,4,8]:self.r(xx+dx,yy,3,12,self.rng.choice([CREAM,GOLD,self.accent,'#7f9d94']))
                elif content=='reels':
                    self.oval(xx,yy,12,12,'#b3bdb7');self.oval(xx+4,yy+4,4,4,INK)
                elif content=='bottles':
                    self.r(xx+3,yy,5,3,CREAM);self.r(xx+1,yy+3,9,10,GLASS)
                elif content=='yarn':
                    self.oval(xx,yy+1,12,11,self.rng.choice([self.accent,GOLD,CREAM,'#b88588']))
                    self.r(xx+3,yy+3,6,2,'#efdfbd')
                else:self.box(xx,yy,11,12,self.rng.choice([WOOD,'#839c91','#b0ad89']))

    def props(self, x, y, kind='tools', n=5):
        for i in range(n):
            xx=x+(i%3)*16; yy=y+(i//3)*17
            if kind in ['paper','books']:
                self.r(xx,yy,12,11,CREAM);self.r(xx+2,yy+3,8,1,'#929286');self.r(xx+2,yy+6,5,1,'#929286')
            elif kind=='flowers':
                self.r(xx+3,yy+7,6,8,GREEN)
                for dx,dy in [(-2,2),(5,1),(2,-3)]:self.oval(xx+dx,yy+dy,7,7,self.rng.choice([self.accent,'#d79aa0',GOLD,CREAM]))
            elif kind=='food':
                self.box(xx,yy,13,12);self.oval(xx+2,yy+1,5,5,'#bb7658');self.oval(xx+7,yy+3,5,5,'#a3b279')
            elif kind=='bottles':
                self.r(xx+4,yy,4,3,CREAM);self.r(xx+2,yy+3,8,12,GLASS);self.r(xx+3,yy+7,6,4,self.accent)
            elif kind=='cloth':
                self.r(xx,yy,13,14,self.rng.choice([self.accent,CREAM,'#a5bcc0']));self.r(xx+2,yy+3,9,2,'#e6d8bc')
            elif kind=='tools':
                self.l(xx+2,yy+12,xx+8,yy+3,'#aeaea0',3);self.r(xx+4,yy+1,10,4,GOLD)
            else:self.box(xx,yy,12,13)

    def ground(self, color, ambience):
        self.tiles(0,0,360,640,color,18)
        for side in [0,247]:
            if ambience in ['water','coast','wetland']:
                self.texture(side,110,113,338,'#54838a' if ambience!='wetland' else '#537968',7)
                for yy in range(120,448,17):
                    for xx in range(side+6,side+105,23):self.r(xx+(yy%7),yy,11,2,'#85b0ac')
            elif ambience=='snow':
                self.texture(side,107,113,338,'#c2cbd0',8)
                for yy in range(112,444,37):self.r(side+4+(yy%23),yy,47,5,'#dce0d6')
            elif ambience in ['park','forest','field','hill','wetland']:
                self.texture(side,108,113,338,'#71866a' if ambience not in ['field','hill'] else '#8b8d65',6)
            elif ambience=='desert':self.texture(side,108,113,338,'#b2a07b',7)
            elif ambience=='roof':
                self.tiles(side,110,113,338,'#827c75',12)
                self.r(side+2,111,4,335,'#b7ab8e');self.r(side+105,111,5,335,'#5b6460')
        # Space for the existing game HUD, conveyor, and four sorting trucks.
        self.tiles(120,0,120,468,'#39464b',26)
        self.r(121,112,3,340,'#777f79');self.r(236,112,3,340,'#777f79')
        self.r(127,114,2,337,'#182a32');self.r(232,114,2,337,'#182a32')
        self.tiles(0,458,360,182,'#465155',30)
        for x in [10,96,264,348]:
            for y in range(481,622,32):self.r(x,y,2,13,'#b8aa76')
        for x in range(20,348,28):self.r(x,462,11,2,GOLD)
        for x in [18,105,254,337]:self.lamp(x,440)
        if ambience in ['park','field','forest','hill']:
            for x in [13,95,265,345]:self.plant(x,121,10,'pine' if ambience=='forest' else 'leaf')

    def feature(self, kind, x, y, w=94, h=126):
        a=self.accent; r=self.r; p=self.p
        # Architectural monuments and outdoor terrain have their own silhouettes.
        if kind=='goldtower':
            self.tiles(x+8,y+19,72,95,'#bdb193',10)
            for xx in [x+7,x+57]:
                self.tiles(xx,y+5,28,100,'#d0c3a0',7);self.roof(xx-3,y-2,34,25,'#bd974f');self.window(xx+7,y+43,10,24,True)
            self.roof(x+23,y+14,42,30,'#d2ad5b');self.r(x+35,y+79,19,34,INK)
            for n in range(4):r(x+24-n*2,y+110+n*4,40+n*4,3,'#b7ae96')
        elif kind=='goldhall':
            self.tiles(x+6,y+5,82,111,'#cabc99',9);self.roof(x+3,y+1,88,32,'#bb9853')
            for xx in range(int(x+13),int(x+83),18):r(xx,y+39,7,63,'#ede0bb');r(xx+4,y+39,3,63,'#a39472')
            self.r(x+32,y+55,26,41,INK);self.r(x+38,y+58,14,35,'#b38c4c')
        elif kind=='ancienttree':
            self.r(x+40,y+61,14,64,'#7a6548')
            for dx in [-20,18]:self.l(x+47,y+106,x+47+dx,y+127,'#6a6046',5)
            for dx,dy,ww,hh in [(2,21,51,58),(34,13,58,56),(15,3,60,51),(6,60,40,39),(51,47,37,45)]:
                self.oval(x+dx,y+dy,ww,hh,self.rng.choice(['#477554','#57845c','#689468']))
                for i in range(24):self.r(x+dx+self.rng.randrange(ww-4),y+dy+self.rng.randrange(hh-4),3,2,self.rng.choice(['#80a371','#456d4e','#b1bb79']))
            self.bench(x+5,y+114,27);self.plant(x+83,y+103,8)
        elif kind in ['fortwall','rockface']:
            self.tiles(x+6,y+8,78,115,'#a2aaa7',12)
            for xx in [x+2,x+65]:self.tiles(xx,y+2,25,77,'#bbc1b3',8);r(xx-1,y-3,27,9,'#dde0d6')
            for yy in [y+31,y+78,y+118]:r(x+5,yy,80,5,'#e0e1d7')
            if kind=='fortwall':self.r(x+34,y+85,23,38,INK);self.window(x+36,y+35,18,25)
            else:
                for yy in range(int(y+11),int(y+114),19):self.p([(x+7,yy),(x+42,yy-7),(x+83,yy+12),(x+66,yy+18)],'#7f9090')
        elif kind in ['vineyard','vinerows','grapepergola','olivetrees','tealeafbeds','harvestrows','paddies','reedbeds','seedbeds','seedlingbeds','grassnursery']:
            self.texture(x+4,y+5,w-8,h-8,'#897e58' if kind not in ['paddies','reedbeds'] else '#719584',6)
            for yy in range(int(y+12),int(y+h-10),20):
                self.r(x+9,yy+10,w-18,3,'#b6a16e')
                for xx in range(int(x+12),int(x+w-10),15):
                    if kind=='paddies':self.r(xx,yy,2,12,'#c0c986');self.r(xx+3,yy+4,2,9,'#90ae68')
                    elif kind=='reedbeds':self.l(xx,yy+11,xx+2,yy-7,'#94ad7b',2);self.r(xx+1,yy-8,3,5,'#ba9971')
                    else:self.plant(xx,yy,6 if kind not in ['olivetrees','grapepergola'] else 9)
            if kind in ['vinerows','grapepergola']:
                for xx in [x+8,x+82]:r(xx,y+5,3,114,WOOD)
                for yy in range(int(y+17),int(y+119),20):self.l(x+8,yy,x+85,yy,'#aa9c79',2)
        elif kind in ['saltbasins','saltcrystals','filterbasins','poollanes','waterchannels']:
            for n in range(3 if kind!='poollanes' else 4):
                yy=y+8+n*30;self.r(x+5,yy,84,25,'#d2c9ac');self.r(x+9,yy+4,76,17,'#88b5b8' if kind!='saltcrystals' else '#dfe0c9')
                for xx in range(int(x+13),int(x+80),12):self.r(xx,yy+7,7,2,'#c8ddd3')
                if kind=='poollanes':self.r(x+9,yy+12,76,2,'#6b879a');self.r(x+45,yy+5,3,14,'#e2d6a1')
            if kind=='poollanes':self.l(x+16,y+7,x+16,y+117,'#d0d9ca',3)
        elif kind in ['walkway','terracedpath','dunewalk','dunefence','hillsidestairs','quaystairs','museumpath']:
            self.tiles(x+25,y+5,44,h-8,'#b4a588',9)
            for yy in range(int(y+8),int(y+h-7),9):self.r(x+27,yy,40,3,'#d2c6a7')
            for xx in [x+19,x+73]:self.r(xx,y+4,3,h-9,'#536c63');
            for yy in range(int(y+7),int(y+h-5),20):self.r(x+15,yy,10,3,CREAM);self.r(x+69,yy,10,3,CREAM)
            for xx,yy in [(x+10,y+20),(x+84,y+64),(x+8,y+100)]:self.plant(xx,yy,8)
        elif kind in ['researchboat','ferrylanding','boatrepair','boatshelter','sailmast']:
            self.r(x+4,y+3,85,112,'#55848a');self.boat(x+25,y+6,49,100,'#c2a67c' if kind!='researchboat' else '#d5d7c6')
            self.r(x+3,y+7,12,111,WOOD)
            for yy in range(int(y+10),int(y+115),10):self.r(x+3,yy,12,2,'#b59b73')
            if kind in ['boatshelter','boatrepair']:self.roof(x+2,y-1,88,25,'#7b8c7e','metal')
            if kind=='sailmast':self.l(x+49,y+13,x+49,y+95,CREAM,3);self.p([(x+51,y+18),(x+82,y+81),(x+51,y+79)],'#dcd9bf')
        elif kind in ['lockgates','moorings']:
            self.r(x+11,y+2,73,119,'#507e81');self.tiles(x+2,y+1,10,123,'#9e9a84',8);self.tiles(x+84,y+1,10,123,'#9e9a84',8)
            for yy in [y+27,y+79]:self.r(x+12,yy,73,11,WOOD);self.r(x+12,yy,73,3,GOLD)
            self.r(x+43,y+25,3,67,'#aec0ad')
            if kind=='moorings':self.boat(x+25,y+7,48,102)
        elif kind in ['turbinebase','windmast']:
            self.r(x+40,y+48,15,77,'#c4d2ce');self.r(x+51,y+48,4,77,'#8cabae')
            self.oval(x+37,y+37,22,22,'#dce3d5')
            self.p([(x+48,y+46),(x+44,y),(x+52,y+2),(x+54,y+40)],'#e7e4d2')
            self.p([(x+49,y+48),(x+10,y+71),(x+9,y+63),(x+43,y+42)],'#d8ded1')
            self.p([(x+50,y+46),(x+88,y+65),(x+89,y+73),(x+54,y+52)],'#c9d7d0')
            self.r(x+31,y+121,32,5,'#798d87')
        elif kind in ['weatherinstruments','weatherkit']:
            self.r(x+41,y+12,4,95,'#c7c7b4');self.r(x+21,y+106,43,6,WOOD)
            self.l(x+23,y+25,x+65,y+25,CREAM,3)
            for xx in [x+19,x+40,x+61]:self.oval(xx,y+17,10,8,'#8b9f9b')
            self.r(x+29,y+49,30,21,'#d4d7c5');self.r(x+35,y+53,18,8,GLASS)
            self.l(x+42,y+12,x+27,y+2,GOLD,2);self.l(x+42,y+12,x+61,y+2,GOLD,2)
            self.box(x+6,y+85,22,22);self.box(x+66,y+80,22,25)
        elif kind in ['solarpanelrows','glassgreenhouse','glasslab','greenhousebeds']:
            for yy in range(int(y+5),int(y+105),34):
                self.r(x+6,yy,82,28,'#c4ccbd');self.r(x+9,yy+3,76,21,'#4e798d' if kind=='solarpanelrows' else '#83b6b7')
                for xx in range(int(x+12),int(x+83),17):self.r(xx,yy+3,2,21,'#a9c6c7')
                self.r(x+9,yy+12,76,2,'#adc5bf')
                if kind!='solarpanelrows':
                    for xx in [x+19,x+43,x+68]:self.oval(xx,yy+15,9,7,'#6d997a')
            self.r(x+45,y+114,5,11,'#617477');self.r(x+9,y+120,78,3,'#8b9d8a')
        elif kind in ['containerstack','receivingcontainers']:
            for n in range(3):
                yy=y+5+n*36;col=['#c48f63','#679a9f','#929c76'][(n+(self.seed%3))%3]
                self.roof(x+7+(n%2)*4,yy,79,30,col,'metal');self.r(x+12,yy+21,66,2,CREAM)
                for xx in [x+11,x+76]:self.r(xx,yy+5,2,23,INK)
        elif kind=='portcrane':
            self.r(x+42,y+16,9,105,'#bdac78');self.r(x+37,y+5,19,18,'#dac784')
            self.l(x+8,y+20,x+87,y+20,GOLD,6);self.l(x+46,y+9,x+11,y+22,'#dde0bd',2)
            self.l(x+13,y+23,x+13,y+69,CREAM,2);self.r(x+8,y+70,12,5,WOOD)
            self.r(x+27,y+111,39,12,'#8b8164');self.box(x+4,y+87,27,23)
        elif kind in ['steamplatform','restorationtram','tramworkshop','funicular','busrepair','busdispatch','dispatchcars','servicecars','vehiclechecks','fireenginebay','mailvans','inspectionline']:
            self.tiles(x+2,y+2,90,122,'#858c87',12)
            for xx in [x+17,x+61]:
                if kind in ['steamplatform','restorationtram','tramworkshop','funicular']:
                    self.r(xx-6,y+5,2,111,'#4c5556');self.r(xx+24,y+5,2,111,'#4c5556')
                    for yy in range(int(y+6),int(y+110),10):self.r(xx-6,yy,32,3,'#76694f')
                self.vehicle(xx,y+19,'tram' if kind in ['restorationtram','tramworkshop','funicular'] else 'bus' if kind in ['busrepair','busdispatch','steamplatform'] else 'fireengine' if kind=='fireenginebay' else 'car',a if xx==x+17 else '#9d9d89')
            if kind in ['busrepair','inspectionline','vehiclechecks']:self.r(x+4,y+13,87,5,GOLD);self.r(x+6,y+13,4,83,WOOD)
            self.box(x+6,y+101,24,19)
        elif kind=='helipad':
            self.r(x+4,y+4,86,119,'#647b80');self.oval(x+8,y+20,78,78,'#b6bda8');self.oval(x+12,y+24,70,70,'#788f91')
            self.r(x+38,y+51,15,33,'#dbe0ce');self.r(x+31,y+61,30,9,'#dbe0ce')
            self.r(x+40,y+29,16,54,'#a8c5c3');self.r(x+33,y+39,30,29,'#e1e0c8');self.r(x+34,y+43,27,10,GLASS)
            self.l(x+7,y+51,x+87,y+51,INK,3);self.l(x+47,y+9,x+47,y+97,INK,3)
        elif kind in ['watertanks','watertank','filterbasins','papertanks']:
            for xx,yy in [(x+8,y+7),(x+43,y+59)]:
                self.oval(xx+3,yy+8,43,44,'#506e74');self.oval(xx,yy,44,43,'#b8c3b5');self.oval(xx+5,yy+5,34,32,'#7198a0');self.r(xx+18,yy+3,6,36,'#d7d6c0')
            self.l(x+15,y+49,x+56,y+69,'#adbbaf',5)
        elif kind in ['boxingring','boxingring2']:
            self.r(x+5,y+7,85,94,WOOD);self.r(x+11,y+13,73,82,'#9eafac')
            for xx,yy in [(x+8,y+10),(x+83,y+10),(x+8,y+94),(x+83,y+94)]:self.r(xx-2,yy-5,5,15,INK)
            for off in [0,5,10]:
                self.l(x+8,y+10+off,x+84,y+10+off,CREAM,2);self.l(x+8,y+10+off,x+8,y+94+off,CREAM,2);self.l(x+84,y+10+off,x+84,y+94+off,CREAM,2);self.l(x+8,y+94+off,x+84,y+94+off,CREAM,2)
            self.bench(x+27,y+112,44)
        else:
            self.workplace(kind,x,y,w,h)

    def workplace(self, kind, x, y, w, h):
        a=self.accent;r=self.r;p=self.p
        # Cutaway working rooms: each receives recognisable equipment below.
        self.room(x+3,y+3,88,120,'#a99a80' if self.seed%2 else '#929b90',self.shade(a,-16) if isinstance(a,str) else CREAM)
        if kind in ['burgerfront','icecreamfront','groceryfront','officefront','cinemafront','fashionfront','exchangefront','collegearch','hospitalfront','coldstorefront','donationfront','clinicfront','creditfront','courthousecolumns','stationroof','fortmuseum','weatherhut','trailhut','gateshed','volunteerhut','surveyhut','medhangar','powerhouse']:
            self.roof(x+1,y+1,93,35,self.shade(a,-28),'metal' if kind in ['medhangar','coldstorefront','powerhouse'] else 'tile')
            for xx in [x+14,x+61]:self.window(xx,y+46,19,28,kind=='cinemafront')
            self.r(x+34,y+84,28,37,INK);self.r(x+40,y+89,15,30,'#9c8570')
            if kind in ['burgerfront','icecreamfront','groceryfront','fashionfront','cinemafront']:
                self.awning(x+5,y+75,84,a)
                if kind=='burgerfront':
                    self.oval(x+30,y+11,36,18,GOLD);r(x+28,y+24,40,5,GREEN);r(x+30,y+29,36,5,WOOD)
                elif kind=='icecreamfront':
                    p([(x+40,y+24),(x+56,y+24),(x+48,y+37)],GOLD);self.oval(x+37,y+9,23,20,CREAM);self.oval(x+50,y+15,14,12,'#d3a3ba')
                elif kind=='cinemafront':
                    r(x+17,y+16,60,11,'#574655')
                    for xx in range(int(x+19),int(x+74),9):r(xx,y+18,3,6,'#f4dd94')
                    self.oval(x+35,y+49,25,25,'#d4c8ad');self.oval(x+43,y+57,9,9,INK)
                elif kind=='fashionfront':self.props(x+16,y+49,'cloth',3)
                else:self.props(x+15,y+47,'food',3)
            elif kind in ['collegearch','courthousecolumns','exchangefront']:
                for xx in [x+12,x+26,x+65,x+79]:r(xx,y+39,6,76,CREAM)
                for n in range(3):r(x+10-n*2,y+115+n*3,75+n*4,2,'#c8c1a7')
            elif kind in ['hospitalfront','donationfront','clinicfront']:
                r(x+37,y+12,22,19,'#d8daca');r(x+45,y+14,6,15,'#678f8f');r(x+40,y+19,16,5,'#678f8f')
            elif kind=='stationroof':self.oval(x+37,y+47,23,23,CREAM);self.l(x+48,y+58,x+48,y+49,INK,2);self.l(x+48,y+58,x+56,y+61,INK,2)
            elif kind=='fortmuseum':r(x+10,y+3,80,8,'#e0e4dc')
        elif kind in ['furnace','tilekiln','pressmachine','printmachine','bookpress','cablewheel','gatewheel','assemblybays','partsconveyor','sortingbelts','glassconveyor','repairgantry','coolingroom']:
            self.r(x+14,y+32,67,69,'#647b78');self.r(x+18,y+36,59,9,'#c2bda5')
            if kind in ['furnace','tilekiln']:
                self.tiles(x+20,y+24,53,70,'#a68366',8);self.r(x+34,y+57,29,30,INK);self.r(x+39,y+67,20,15,'#d4a158');self.r(x+46,y+62,6,18,'#f6ca6b');self.r(x+54,y+9,10,21,'#797d73')
            elif kind in ['pressmachine','bookpress','printmachine']:
                for xx in [x+19,x+66]:self.r(xx,y+26,6,75,'#526663')
                for yy in [y+40,y+66,y+87]:self.r(x+19,yy,54,6,'#c4c5ac')
                self.r(x+29,y+54,35,13,CREAM);self.oval(x+52,y+18,16,16,GOLD)
            elif kind in ['cablewheel','gatewheel']:
                self.oval(x+19,y+32,58,58,INK);self.oval(x+25,y+38,46,46,'#9db1a5');self.oval(x+31,y+44,34,34,'#506e72')
                for dx,dy in [(0,-17),(0,17),(-17,0),(17,0)]:self.l(x+48,y+61,x+48+dx,y+61+dy,CREAM,3)
            elif kind in ['sortingbelts','glassconveyor','partsconveyor','assemblybays']:
                self.r(x+30,y+24,36,88,INK)
                for yy in range(int(y+28),int(y+107),8):self.r(x+32,yy,32,2,'#879b93')
                for yy in [y+41,y+78]:self.box(x+36,yy,23,19)
            elif kind=='coolingroom':
                self.oval(x+22,y+50,25,25,'#afc7c0');self.oval(x+51,y+50,25,25,'#afc7c0')
                for xx in [x+31,x+60]:self.l(xx,y+52,xx,y+73,INK,3)
            else:self.r(x+19,y+42,56,7,GOLD);self.props(x+22,y+57,'tools',5)
        elif kind in ['bikeracks','loanbikes','repaircycles','mailpanniers']:
            for xx in [x+19,x+48,x+76]:self.bike(xx,y+46,a)
            r(x+9,y+42,76,3,'#5d7974');self.shelves(x+17,y+92,65,24)
        elif kind in ['careenclosures','recoveryrooms','quietgarden','birdhide']:
            self.r(x+10,y+31,77,77,'#8f9b7c');self.bench(x+20,y+61,44)
            for xx in range(int(x+10),int(x+89),10):self.r(xx,y+31,2,77,'#c6cbb3')
            for yy in range(int(y+31),int(y+110),10):self.r(x+10,yy,77,1,'#c6cbb3')
            self.plant(x+54,y+62,14)
            if kind=='birdhide':self.roof(x+5,y+5,85,38,'#788668');self.window(x+13,y+48,68,17)
        elif kind in ['camptents','trainingyard','shelterstores']:
            for yy in [y+30,y+79]:
                self.p([(x+12,yy+27),(x+27,yy),(x+68,yy),(x+85,yy+27)],'#9cab87');self.r(x+17,yy+27,62,17,'#758568');self.r(x+40,yy+24,20,20,INK)
                self.l(x+27,yy,x+40,yy+42,CREAM,2)
        elif kind in ['flowerrows','packingflowers','flowerreceiving','classgarden','teagarden','stonegarden']:
            for yy in [y+36,y+81]:
                self.bench(x+11,yy,72,'#8c8d72');self.props(x+15,yy-4,'flowers',4)
            for xx in [x+13,x+79]:self.plant(xx,y+110,8)
        elif kind in ['projectionroom','filmviewing','recordingroom','radiodesk','pricewall','mapwalls','shelfmap','diversionmaps']:
            self.r(x+12,y+34,72,41,'#324852')
            if kind in ['pricewall','mapwalls','shelfmap','diversionmaps']:
                for yy in range(int(y+39),int(y+70),9):
                    for xx in range(int(x+17),int(x+79),13):self.r(xx,yy,8,3,self.rng.choice([a,GOLD,CREAM,'#8fbca7']))
            elif kind in ['projectionroom','filmviewing']:
                for xx in [x+24,x+55]:self.oval(xx,y+35,23,23,'#aab6aa');self.oval(xx+8,y+43,7,7,INK)
                self.r(x+31,y+58,30,26,'#647e84');self.r(x+49,y+64,20,10,GOLD)
            else:
                self.r(x+18,y+42,22,24,GLASS);self.r(x+45,y+45,29,14,'#b7c3b3')
                for xx in [x+51,x+61,x+69]:self.oval(xx,y+49,5,5,INK)
            self.bench(x+14,y+89,68);self.props(x+21,y+88,'paper',3)
        elif kind in ['weavinglooms','papermesh','dryingracks','sailbench']:
            for yy in [y+36,y+78]:
                self.r(x+14,yy,67,32,WOOD);self.r(x+19,yy+4,57,23,a)
                for xx in range(int(x+22),int(x+74),5):self.r(xx,yy+4,1,23,CREAM)
                self.r(x+11,yy-3,73,5,'#c9b68e')
            self.props(x+14,y+113,'cloth',4)
        elif kind in ['theatreseats','spectatorsteps','gymseats','concertcourt','listeningcourt','waitinggarden','publicreading','readingcourt','communityroom','memberroom','hillviewcourt','courtyardbenches','seasidebench','pickupbench']:
            for yy in [y+37,y+69,y+101]:
                self.bench(x+13,yy,30,a);self.bench(x+51,yy,30,a)
            if kind in ['waitinggarden','seasidebench','hillviewcourt','courtyardbenches']:self.plant(x+49,y+66,10)
            else:self.r(x+12,y+27,70,4,'#b9ae8c')
        elif kind in ['coldroom','coldcounter','icecrates','coldstacks','insulatedboxes','supportstores','hospitalstores','staffstores','loancabinet','partdrawers','assessmentracks','linensupply']:
            for xx in [x+12,x+51]:
                self.r(xx,y+31,32,78,'#aebcb7');self.r(xx+3,y+35,25,69,'#cad2c3');self.r(xx+25,y+40,3,56,'#718e8b')
                for yy in [y+55,y+81]:self.r(xx+3,yy,25,3,'#829b92')
                self.r(xx+6,y+42,14,5,a)
        elif kind in ['groceryaisles','reelarchive','recordshelves','partsarchive','planarchive','paperstacks','libraryroom','yarnracks','fabricracks','dressrails','finishedrugs','mailsacks','dispatchshelves','milkreceiving','canracks','cheeseshelves','bottleracks','metalrack','roperacks','fibrestore','paperrolls','editionbundles','furnitureracks','kitracks','swimracks','sharedequipment','crewstores','serviceracks','timberpanels','woodstacks','soundcases','tilecases']:
            content='reels' if kind=='reelarchive' else 'books' if kind in ['recordshelves','planarchive','libraryroom','paperstacks','partsarchive'] else 'yarn' if kind in ['yarnracks','fabricracks','dressrails','finishedrugs','roperacks'] else 'bottles' if kind in ['milkreceiving','canracks','bottleracks'] else 'boxes'
            self.shelves(x+13,y+35,69,67,content)
            if kind=='dressrails':
                for xx in [x+20,x+48,x+68]:self.p([(xx,y+57),(xx+10,y+57),(xx+15,y+89),(xx-6,y+89)],a)
            if kind=='furnitureracks':self.bench(x+16,y+83,55,a)
        elif kind in ['roofawning','marketcanopy','winterstalls','departurecanopy','platformshelter','passengershelter','coveredreceiving','coveredcrates','grapepergola','farmbarn']:
            self.roof(x+1,y+3,92,43,self.shade(a,-20));self.r(x+9,y+45,5,68,WOOD);self.r(x+80,y+45,5,68,WOOD)
            if kind in ['marketcanopy','winterstalls']:self.awning(x+3,y+36,89,a)
            self.bench(x+18,y+71,57);self.props(x+22,y+66,'food',3);self.box(x+19,y+101,26,17)
        elif kind in ['cablecabins','funicular2']:
            for yy in [y+33,y+85]:
                self.r(x+21,yy,53,31,a);self.window(x+25,yy+3,45,14);self.r(x+25,yy+23,45,4,CREAM)
                self.l(x+47,yy,x+47,yy-15,INK,3);self.l(x+15,yy-15,x+82,yy-15,'#bbbfb1',2)
        elif kind in ['phototanks','dryingphotos','negativebench','photogallery']:
            for yy in [y+37,y+76]:
                self.l(x+13,yy,x+83,yy,'#464b57',2)
                for xx in [x+15,x+38,x+61]:self.r(xx,yy+3,19,24,CREAM);self.r(xx+3,yy+6,13,15,'#6e817d');self.r(xx+8,yy+12,5,7,'#b1b7a6')
        elif kind in ['mobilitybenches','fittingroom','dentalroom']:
            self.bench(x+12,y+36,67);self.props(x+18,y+31,'tools',4)
            self.r(x+38,y+83,21,23,a);self.r(x+35,y+75,26,13,'#d7d9ca');self.oval(x+25,y+88,15,15,INK);self.oval(x+60,y+88,15,15,INK)
            self.l(x+73,y+74,x+73,y+37,CREAM,3);self.r(x+64,y+37,20,9,GLASS)
        elif kind in ['brassbench','instrumentracks','musicstands','musiccourtyard']:
            self.bench(x+12,y+45,70)
            for xx in [x+17,x+43,x+68]:self.l(xx,y+44,xx+9,y+36,GOLD,5);self.oval(xx+7,y+29,13,13,GOLD);self.oval(xx+10,y+32,7,7,INK)
            for xx in [x+25,x+62]:self.r(xx,y+80,22,17,INK);self.r(xx+9,y+97,3,21,CREAM);self.r(xx+2,y+115,17,3,CREAM)
        elif kind in ['ticketbooth','receptiondesk','privatedesks','officefront2','supportoffice','auctiondesks']:
            self.bench(x+12,y+50,69,a);self.props(x+18,y+45,'paper',4)
            self.r(x+43,y+39,24,18,INK);self.r(x+46,y+42,18,12,GLASS)
            self.bench(x+29,y+95,36,WOOD)
            if kind=='privatedesks':self.r(x+47,y+29,4,85,'#babfaa')
        elif kind in ['burgerprep','fruitprep','wrapbench','bottlebench','teapacking','fruitpacking','fishcounter','fishstall','fishlanding','warmcounters','refreshmentroom','mealracks','foodstalls','graindrying','producepallets']:
            for yy in [y+38,y+83]:self.bench(x+12,yy,70,'#a2ac9a');self.props(x+17,yy-5,'bottles' if kind in ['bottlebench','teapacking','refreshmentroom'] else 'food',4)
            if kind in ['fishcounter','fishlanding']:self.r(x+20,y+44,14,6,'#89adb0');self.r(x+53,y+89,19,6,'#6d9eae')
        else:
            # Individually arranged worktables for the remaining authored plans.
            self.bench(x+12,y+37,68);self.bench(x+12+(self.seed%8),y+88,62)
            content='paper' if kind in ['classdesks','learningdesks','studentbenches','proofroom','notebookbench','notebookmakers','homeworkroom','bookcorner','visitorclass','learningcorner','informationcourt','storywall','noticecourt','displaycourt','captioncourt','stationhistory'] else 'cloth' if kind in ['cuttingroom','upholsterybench','leatherbench','rugtables'] else 'tools'
            self.props(x+17,y+33,content,4);self.props(x+20,y+84,content,3)
            if kind in ['tilecourtyard','patterntables','tilewall','patternworkshop']:
                for yy in range(int(y+38),int(y+63),8):
                    for xx in range(int(x+17),int(x+76),8):self.r(xx,yy,6,6,a if (xx+yy)%3 else '#688caa')
            if kind=='repairchairs':self.bench(x+22,y+64,25,a)
        self.lamp(x+82,y+106)

    def paint(self):
        color, ambience, lefttop, leftbottom, righttop, rightbottom = PLANS[self.place['artPlan']]
        self.ground(color,ambience)
        # Extend the setting behind the HUD rather than leaving an empty apron.
        for x in [8,250]:
            if ambience in ['forest','park','field','hill']:
                for xx,yy in [(x+14,27),(x+65,41),(x+37,88)]:self.plant(xx,yy,20,'pine' if ambience=='forest' else 'leaf')
                self.bench(x+20,109,57)
            elif ambience in ['water','wetland','coast']:
                self.texture(x,0,94,130,'#568189',8)
                for yy in range(12,121,17):self.r(x+8+(yy%11),yy,65,2,'#85aaa8')
                self.r(x+6,91,82,26,WOOD)
                for yy in [94,101,109]:self.r(x+9,yy,76,2,'#b19b77')
                self.box(x+14,89,24,22);self.plant(x+76,94,12)
            elif ambience=='snow':
                self.tiles(x,0,94,132,'#a8b8ba',20)
                self.roof(x+4,32,85,46,'#b2bcae');self.r(x+8,33,77,9,'#e0e1d7')
                self.plant(x+30,108,15,'pine')
            else:
                self.roof(x+3,16,86,60,self.shade(self.accent,-44),'metal' if ambience=='industrial' else 'tile')
                self.r(x+18,83,60,30,self.shade(self.accent,-30))
                self.window(x+24,87,15,17);self.window(x+54,87,15,17)
                self.plant(x+83,124,9)
        # The little street objects vary by place, without entering the live belt.
        for x,y in [(16,282),(81,281),(259,293),(318,292)]:
            if ambience in ['park','field','forest','hill','wetland']:self.plant(x,y,8)
            else:self.box(x,y,20,15,self.shade(self.accent,-42))
        self.feature(lefttop,8,147)
        self.feature(righttop,250,158)
        # Lower bays carry the secondary story, with different staggered plans.
        self.feature(leftbottom,8,303,94,126)
        self.feature(rightbottom,250,314,94,126)
        for x in [7,102,250,345]:
            self.r(x,132,3,301,'#34444a');self.r(x+1,132,1,301,'#b8b393')
        # A delivery noticeboard is a ordinary object, separate from the game UI.
        self.r(83,112,23,17,'#32494d');self.r(85,114,19,13,self.accent)
        self.r(88,117,12,2,CREAM);self.r(88,122,8,2,CREAM)
        for x in [20,329]:self.plant(x,620,8)
        # Crisp indexed output gives small downloads without a runtime canvas cost.
        return self.im.quantize(colors=192,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)


def main():
    data=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./missions/open-roads').worlds))"],cwd=ROOT,text=True))
    assert len(data)==77 and set(PLANS)=={w['artPlan'] for w in data}
    OUT.mkdir(parents=True,exist_ok=True)
    manifest=[]
    for w in data:
        target=OUT/(w['id']+'.png')
        art=Painter(w).paint()
        art.save(target,optimize=True)
        raw=target.read_bytes()
        manifest.append({'id':w['id'],'name':w['name'],'plan':w['artPlan'],'location':w['location'],'file':target.name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
    assert len({r['sha256'] for r in manifest})==77
    (OUT/'manifest.json').write_text(json.dumps({'width':360,'height':640,'images':manifest},indent=2)+'\n')
    print(json.dumps({'places':len(manifest),'bytes':sum(r['bytes'] for r in manifest),'maxBytes':max(r['bytes'] for r in manifest)}))


if __name__=='__main__': main()
