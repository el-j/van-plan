import { InteriorModule } from '../types/van';

export const INTERIOR_MODULES: InteriorModule[] = [
  {
    id: 'subfloor',
    name: 'Bodenaufbau, Entdröhnung & Armaflex-Isolierung',
    category: 'Chassis & Subfloor',
    shortDescription: '19mm Armaflex XG Isolierung, 2mm Alubutyl, 24x48mm Lärche-Unterkonstruktion & 12mm Birke-Multiplex Bodenplatte.',
    fullDescription: 'Grundsolider Thermo- und Akustik-Bodenaufbau. Verhindert Dröhnen beim Fahren und Kältebrücken vom Metallboden. Schwimmend verlegte Unterkonstruktion aus sibirischer Lärche (resistent gegen Feuchtigkeit) auf Alubutyl und 19mm Armaflex XG geschlossenzelligem Kautschuk.',
    dimensionsMm: {
      length: 3050,
      width: 1720,
      height: 55,
    },
    weightKg: 42.5,
    totalCostEuro: 585.00,
    materials: [
      '19mm Armaflex XG selbstklebend (6m²)',
      '2mm Reckhorn Alubutyl ABX (4m²)',
      '24x48mm Sibirische Lärche Latten (18 lfm)',
      '12mm Birke Multiplex BB/BB Qualitäts-Sperrholz (3 Platten 1500x3000mm)',
      'SikaFlex 252 Konstruktionskleber (3 Kartuschen)',
      'Heavy-Duty PVC/Vinyl Bodenbelag in Holzoptik (6m²)'
    ],
    highlights: [
      'Vollständige Kältebrückenisolierung',
      'Passgenaue Ausklinkung der Hinterradkästen (850x340mm)',
      'Höhenverlust nur 55mm (Stehhöhe verbleibt bei 1795mm)',
      'Extrem strapazierfähiger PVC-Belag mit Wasserschutz-Kanten'
    ],
    cutList: [
      { id: 'sub-1', name: 'Bodenplatte Heck-Segment', material: '12mm Birke Multiplex', lengthMm: 1500, widthMm: 1720, thicknessMm: 12, quantity: 1, angleLeft: 90, angleRight: 90, notes: 'Radkasten-Ausschnitte 850x340mm an beiden Seiten' },
      { id: 'sub-2', name: 'Bodenplatte Front-Segment', material: '12mm Birke Multiplex', lengthMm: 1550, widthMm: 1720, thicknessMm: 12, quantity: 1, angleLeft: 90, angleRight: 90, notes: 'Schiebetür-Kante gefälzt & Schienen-Aussparung' },
      { id: 'sub-3', name: 'Unterkonstruktions-Längslatten', material: '24x48mm Lärche', lengthMm: 2950, widthMm: 48, thicknessMm: 24, quantity: 5, angleLeft: 90, angleRight: 90 },
      { id: 'sub-4', name: 'Unterkonstruktions-Querträger', material: '24x48mm Lärche', lengthMm: 1600, widthMm: 48, thicknessMm: 24, quantity: 6, angleLeft: 90, angleRight: 90 }
    ],
    assemblySteps: [
      {
        stepNumber: 1,
        title: 'Reinigung & Entrostung des Sickenbodens',
        description: 'Laderaumboden gründlich mit Silikonentferner reinigen. Roststellen anschleifen und mit Brantho-Korrux 3in1 rostschutzgrundieren.',
        toolsNeeded: ['Drahtbürste', 'Akkuschrauber', 'Silikonentferner', 'Pinsel'],
        fastenersNeeded: ['Brantho-Korrux 3in1 Chassislack']
      },
      {
        stepNumber: 2,
        title: 'Entdröhnung mit Alubutyl & Armaflex 19mm',
        description: 'Alubutyl in den Sickenvertiefungen fest anrollen (ca. 40% Flächendeckung reicht). Anschließend Armaflex XG lückenlos verkleben.',
        toolsNeeded: ['Andrückrolle', 'Cutter-Messer mit Abbrechklingen', 'Maßband'],
        fastenersNeeded: ['Reckhorn ABX Alubutyl', 'Armaflex XG 19mm']
      },
      {
        stepNumber: 3,
        title: 'Verklebung der Lärche-Unterkonstruktion',
        description: 'Holzlatten punktuell mit SikaFlex 252 auf die Metallrippen aufkleben (keine Schrauben durch den Fahrzeugboden!). 24 Std. aushärten lassen.',
        toolsNeeded: ['Kartuschenpresse', 'Wasserwaage', 'Schraubzwingen'],
        fastenersNeeded: ['SikaFlex 252 Klebekartuschen']
      },
      {
        stepNumber: 4,
        title: 'Multiplex-Platten einpassen & Nuten stoßen',
        description: 'Multiplex-Platten auf der Latten-Unterkonstruktion verschrauben (Edelstahlschrauben 3,5x35mm senken). Stöße mit Lamello/Nut verbinden.',
        toolsNeeded: ['Stichsäge', 'Oberfräse', 'Akkuschrauber', 'Senker'],
        fastenersNeeded: ['Edelstahlschrauben 3.5x35mm Torx']
      }
    ],
    resellerLinks: [
      { supplier: 'Hornbach', partName: 'Birke Multiplex BB/BB 12mm', partNumber: 'HO-MUX-12', url: 'https://www.hornbach.de', unitPrice: 38.50, currency: 'EUR', inStock: true },
      { supplier: 'Tigerexped', partName: 'Armaflex XG 19mm selbstklebend 6m²', partNumber: 'AF-XG-19-6', url: 'https://tigerexped.de', unitPrice: 89.90, currency: 'EUR', inStock: true },
      { supplier: 'Amazon', partName: 'Reckhorn ABX Alubutyl 2mm 4m²', partNumber: 'RK-ABX-4', url: 'https://www.amazon.de', unitPrice: 49.95, currency: 'EUR', inStock: true },
      { supplier: 'SVB24', partName: 'SikaFlex 252 Konstruktionskleber Schwarz', partNumber: 'SVB-SK252', url: 'https://www.svb.de', unitPrice: 16.90, currency: 'EUR', inStock: true }
    ]
  },
  {
    id: 'bed',
    name: 'Elektrisches 4-Punkt-Gurtband-Hubbett (1850 x 1400 mm)',
    category: 'Bed & Elevator',
    shortDescription: 'Stufenlos verstellbares Längs-/Querbett mit Alu-Profilrahmen, 4-Punkt Sicherheitsgurtband & 12V Rohrmotor-Antrieb.',
    fullDescription: 'Maximaler Komfort ohne Platzverlust. Tagsüber schwebt das Bett direkt unter dem RTW-Hochdach (Stehhöhe 1650mm darunter bleibt frei). Nachts wird es per Taster auf die seitlichen Bänke abgesenkt (Liegefläche 1850 x 1400 mm). Keine störenden vertikalen Führungsschienen im Raum.',
    dimensionsMm: {
      length: 1850,
      width: 1400,
      height: 120,
    },
    weightKg: 36.0,
    totalCostEuro: 745.00,
    materials: [
      'Alu Systemprofil Nut 8 30x30mm anodisiert (12m)',
      '4x Automatik-Sicherheitsgurtbänder 50mm (Reißfestigkeit 2.500kg)',
      '12V DC Tubular Windenmotor mit Schneckengetriebe 60Nm',
      'Welle 60mm Achtkant Alu mit Umlenkrollen & Lagern',
      'Froli Travel Mobil Bettsystem / Tellerfedern',
      'Kaltschaummatratze RG40 1850x1400x100mm (Zweiteilig klappbar)',
      '4x Decken-Sicherheits-Arretierstifte (Mechanical Safety Pins)'
    ],
    highlights: [
      'Volle Stehhöhe tagsüber unter dem hochgezogenen Bett',
      'Kein Verkanten dank starrer 60mm Synchronwelle',
      'Tragfähigkeit abgesenkt: 300 kg (liegt fest auf den Sitzbänken auf)',
      'Integrierte Froli Tellerfedern für exzellente Unterlüftung'
    ],
    cutList: [
      { id: 'bed-1', name: 'Alu-Rahmen Längsträger', material: '30x30mm Alu Nut 8', lengthMm: 1850, widthMm: 30, thicknessMm: 30, quantity: 2, angleLeft: 45, angleRight: 45 },
      { id: 'bed-2', name: 'Alu-Rahmen Querträger', material: '30x30mm Alu Nut 8', lengthMm: 1340, widthMm: 30, thicknessMm: 30, quantity: 4, angleLeft: 90, angleRight: 90 },
      { id: 'bed-3', name: 'Wellen-Synchronachse', material: 'SW60 Achtkant Stahl/Alu Welle', lengthMm: 1650, widthMm: 60, thicknessMm: 60, quantity: 1, angleLeft: 90, angleRight: 90 }
    ],
    assemblySteps: [
      {
        stepNumber: 1,
        title: 'Zusammenbau des Alu-Profilrahmens',
        description: '30x30 Nut 8 Profile mit Automatikverbindern und 90° Eckwinkeln zu einem Verwindungssteifen Rechteck 1850x1400mm verschrauben.',
        toolsNeeded: ['Inbusschlüssel-Set 5mm', 'Drehmomentschlüssel', 'Winkel 90°'],
        fastenersNeeded: ['Item Nut 8 Hammerkopfschrauben M6x15', 'Winkelverbinder 30x30']
      },
      {
        stepNumber: 2,
        title: 'Montage der Deckenlager & Antriebswelle',
        description: 'Achtkantwelle SW60 mit 4x Kugelgelagerten Gurt-Spulen am Mercedes-Dachspriegel mit Verstärkungsplatten M8 verbolzen.',
        toolsNeeded: ['Bohrmaschine', 'Stufenbohrer', 'Schraubenschlüssel 13mm'],
        fastenersNeeded: ['Schlossbolzen M8x60 Edelstahl', 'Kontermuttern M8']
      },
      {
        stepNumber: 3,
        title: 'Gurtband-Einfädelung & Justierung',
        description: '50mm Sicherheitsgurte an den 4 Ecken des Alu-Bettenrahmens befestigen und über die Deckenrollen exakt nivellieren.',
        toolsNeeded: ['Wasserwaage 150cm', 'Gurtzange', 'Schraubendreher'],
        fastenersNeeded: ['Gurt-Adapterplatten Nut 8', 'Edelstahl M6 Schrauben']
      },
      {
        stepNumber: 4,
        title: 'Froli Bettsystem & Matratze installieren',
        description: 'Froli Tellerfedern im Raster auf dem Alu-Rahmen einklicken. 100mm Kaltschaummatratze einlegen.',
        toolsNeeded: ['Handkraft'],
        fastenersNeeded: ['Froli Kreuzfuß-Elemente']
      }
    ],
    resellerLinks: [
      { supplier: 'Dold Mechatronik', partName: 'Aluprofil 30x30 B-Typ Nut 8 (lfm)', partNumber: 'DM-ALU-3030', url: 'https://www.dold-mechatronik.de', unitPrice: 8.90, currency: 'EUR', inStock: true },
      { supplier: 'Amazon', partName: '12V Rohrmotor Windenantrieb 60Nm', partNumber: 'AMZ-MOT-12V60', url: 'https://www.amazon.de', unitPrice: 139.00, currency: 'EUR', inStock: true },
      { supplier: 'Obelink', partName: 'Froli Travel Bettsystem Grundset', partNumber: 'OB-FROLI-TR', url: 'https://www.obelink.de', unitPrice: 119.00, currency: 'EUR', inStock: true },
      { supplier: 'Fraron', partName: 'Sicherheitsgurtband 50mm Schwarz 10m', partNumber: 'FR-GURT-50', url: 'https://www.fraron.de', unitPrice: 24.50, currency: 'EUR', inStock: true }
    ]
  },
  {
    id: 'kitchen',
    name: 'Schwerlast-Auszugsküche mit Parallelogramm-Absenkung',
    category: 'Kitchen & Outdoor',
    shortDescription: 'Schlanker Küchenblock (850 x 400 mm) an der Schiebetür mit 120kg Auszügen & 25cm Outdoor-Absenkung.',
    fullDescription: 'Gelöster Ergonomie-Konflikt: Der Ladeboden des T1 liegt ca. 50 cm über dem Boden. Diese Küche glidet auf 1000mm Schwerlastauszügen aus der Schiebetür heraus und senkt sich über eine Hebel-Mechanik um 25 cm ab – perfekte 90 cm Steh-Kochhöhe im Freien!',
    dimensionsMm: {
      length: 850,
      width: 400,
      height: 880,
    },
    weightKg: 38.0,
    totalCostEuro: 890.00,
    materials: [
      '15mm Pappel-Multiplex HPL-beschichtet Anthrazit (2 Platten 1250x2500mm)',
      'Heavy-Duty Teleskopschienen 1000mm 120kg mit Verriegelung',
      'Parallelogramm-Hebelsegment aus 5mm Edelstahl Flachgut',
      'Teleskopierbarer Aluminium Stützfuß mit Gummifuß (Höhenverstellbar 40-75cm)',
      'Dometic 2-Flammen Gaskocher mit Spülbecken-Kombination (HSG 2445)',
      '12V Weitwinkel-Wasserhahn klappbar Comet Florence',
      '2x 19 Liter Weithals-Kanister (Frischwasser / Grauwasser)'
    ],
    highlights: [
      'Indoor- und Outdoor kochen im selben Modul',
      'Ergonomische 90cm Arbeitshöhe draußen durch Absenkung (-250mm)',
      'Integriertes Gasfach für 5kg Propangasflasche mit Gaskasten-Entlüftung',
      'Teleskopstütze garantiert 100% Wackelfreiheit auf unebenem Boden'
    ],
    cutList: [
      { id: 'kit-1', name: 'Küchenkorpus Seitenteile', material: '15mm HPL Pappel-Multiplex', lengthMm: 850, widthMm: 380, thicknessMm: 15, quantity: 2, angleLeft: 90, angleRight: 90 },
      { id: 'kit-2', name: 'Küchen-Arbeitsplatte HPL', material: '18mm Eiche Massivleimholz', lengthMm: 850, widthMm: 400, thicknessMm: 18, quantity: 1, angleLeft: 90, angleRight: 90, notes: 'Spülen-Ausschnitt 420x320mm' },
      { id: 'kit-3', name: 'Schwerlast-Montage-Schlitten', material: '15mm Birke Multiplex', lengthMm: 950, widthMm: 390, thicknessMm: 15, quantity: 1, angleLeft: 90, angleRight: 90 },
      { id: 'kit-4', name: 'Besteck- & Gas-Schublade', material: '12mm Pappel Multiplex', lengthMm: 380, widthMm: 350, thicknessMm: 12, quantity: 2, angleLeft: 90, angleRight: 90 }
    ],
    assemblySteps: [
      {
        stepNumber: 1,
        title: 'Korpusbau mit Pocket Holes (Kreg Jig)',
        description: 'Pappel-Multiplex-Platten präzise zuschneiden und mit Kreg Taschenbohrungen unsichtbar verschrauben.',
        toolsNeeded: ['Kreg Jig K4', 'Akkuschrauber', 'Schraubzwingen'],
        fastenersNeeded: ['Kreg Pocket Screws 31mm Edelschrauben']
      },
      {
        stepNumber: 2,
        title: 'Montage der 120kg Schwerlastauszüge',
        description: 'Teleskopschienen exakt parallel an der Unterkonstruktion der Sitzbank / Bodenschienen ausrichten.',
        toolsNeeded: ['Wasserwaage', 'Bohrmaschine', 'Schraubenschlüssel 10mm'],
        fastenersNeeded: ['M6x20mm Linsenkopfschrauben mit Stoppmuttern']
      },
      {
        stepNumber: 3,
        title: 'Parallelogramm-Hebelsegment befestigen',
        description: 'Vier Edelstahl-Gelenkarme mit Bronze-Gleitlagern montieren für die sanfte 25cm Absenkbewegung.',
        toolsNeeded: ['Imbusschlüssel 6mm', 'Drehmomentschlüssel'],
        fastenersNeeded: ['M8 Edelstahl Passschrauben + Sinterbronze Büchsen']
      },
      {
        stepNumber: 4,
        title: 'Installation Gas & Wasser',
        description: 'Gaskocher einbauen, 8mm Ermeto-Rohr zum Gaskasten legen. 12V Tauchpumpe an Frischwasserkanister anschließen.',
        toolsNeeded: ['Rohrbiegezange', 'Maulschlüssel 14/17mm', 'Lecksuchspray'],
        fastenersNeeded: ['8mm Schneidringverschraubung', 'Gasschlauch 40cm']
      }
    ],
    resellerLinks: [
      { supplier: 'SVB24', partName: 'Dometic HSG 2445 Kocher-Spülen-Kombi', partNumber: 'SVB-DOM-2445', url: 'https://www.svb.de', unitPrice: 349.00, currency: 'EUR', inStock: true },
      { supplier: 'Tigerexped', partName: 'Schwerlastauszug 1000mm 120kg Lock-in/out', partNumber: 'TE-SL-1000', url: 'https://tigerexped.de', unitPrice: 129.00, currency: 'EUR', inStock: true },
      { supplier: 'Hornbach', partName: 'Eiche Leimholz-Arbeitsplatte 18mm', partNumber: 'HO-EICHE-18', url: 'https://www.hornbach.de', unitPrice: 42.00, currency: 'EUR', inStock: true },
      { supplier: 'Campingwagner', partName: 'Comet Florence Klapp-Wasserhahn 12V', partNumber: 'CW-COMET-FLO', url: 'https://www.campingwagner.de', unitPrice: 48.50, currency: 'EUR', inStock: true }
    ]
  },
  {
    id: 'lounge',
    name: 'Sitzgruppe / L-Lounge mit Technikboxen & Lagun-Tisch',
    category: 'Seating & Lounge',
    shortDescription: 'Zwei Längssitzbänke (1900 x 500 mm) als Tages-Lounge, Stauraum & Gehäuse für Batterie/Standheizung.',
    fullDescription: 'Duo-Funktions-Sitzlandschaft. Die linke Bank nimmt die kompletten 12V/230V Elektrik-Komponenten auf (Victron MultiPlus, 200Ah LiFePO4). Die rechte Bank beherbergt die Autoterm Dieselheizung und den 80L Frischwassertank. Der drehbare Lagun-Tisch schwenkt flexibel.',
    dimensionsMm: {
      length: 1900,
      width: 1540,
      height: 450,
    },
    weightKg: 52.0,
    totalCostEuro: 620.00,
    materials: [
      '15mm Paulownia / Pappel Multiplex Leichtbau (4 Platten)',
      'Lagun Drehtisch-Gestell Original Alu eloxiert',
      '700x500x18mm Eiche Tischplatte',
      'High-Density Schaumstoff-Polster RG35 80mm mit Cord-Bezug Anthrazit',
      '4x Gasdruckdämpfer 100N für Sitzbankdeckel-Öffnung',
      'Klavierband Edelstahl 1800mm'
    ],
    highlights: [
      '600 mm freier Durchgangs-Mittelgang von Heck bis Trennwand',
      'Schall- und wärmeisolierter Bereich für Autoterm Standheizung',
      'Integriertes 12V Belüftungssystem für Batterieraum',
      'Sitzbänke dienen als feste Auflagefläche für das abgesenkte Hubbett'
    ],
    cutList: [
      { id: 'lou-1', name: 'Sitzbank Links Frontblende', material: '15mm Pappel Multiplex', lengthMm: 1900, widthMm: 430, thicknessMm: 15, quantity: 1, angleLeft: 90, angleRight: 90 },
      { id: 'lou-2', name: 'Sitzbank Rechts Frontblende', material: '15mm Pappel Multiplex', lengthMm: 1900, widthMm: 430, thicknessMm: 15, quantity: 1, angleLeft: 90, angleRight: 90 },
      { id: 'lou-3', name: 'Sitzbank Deckel mit Klapp-Scharnier', material: '15mm Birke Multiplex', lengthMm: 1880, widthMm: 480, thicknessMm: 15, quantity: 2, angleLeft: 90, angleRight: 90 },
      { id: 'lou-4', name: 'Lagun Tischplatte Eiche', material: '18mm Eiche Leimholz', lengthMm: 700, widthMm: 500, thicknessMm: 18, quantity: 1, angleLeft: 90, angleRight: 90 }
    ],
    assemblySteps: [
      {
        stepNumber: 1,
        title: 'Rahmenbau Sitzbänke & Wandverankerung',
        description: 'Korpus aus 15mm Pappel-Multiplex mit Alu-Eckwinkeln bauen. Direkt an den Wandverstärkungsrippen des T1 verschrauben.',
        toolsNeeded: ['Akkuschrauber', 'Nietzange / Nietmuttern', 'Wasserwaage'],
        fastenersNeeded: ['M6 Blindnietmuttern Edelstahl', 'M6x25 Sechskantschrauben']
      },
      {
        stepNumber: 2,
        title: 'Montage der Deckel mit Gasdruckdämpfern',
        description: 'Sitzbankdeckel mit Klavierband anschlagen und 100N Gasdruckfedern für einfaches Aufhalten montieren.',
        toolsNeeded: ['Schraubendreher PZ2', 'Bohrer 3mm'],
        fastenersNeeded: ['Edelstahl Spannkopfschrauben 3.5x16mm', 'Gasdruckfeder-Kugelköpfe']
      },
      {
        stepNumber: 3,
        title: 'Lagun Drehtisch-Halterung anbringen',
        description: 'Lagun Aluminium-Befestigungsplatte mit Konterplatte an der linken Sitzbankwand bolzen.',
        toolsNeeded: ['Bohrmaschine 8.5mm', 'Schraubenschlüssel 13mm'],
        fastenersNeeded: ['M8x50mm Edelstahl Durchgangsbolzen']
      }
    ],
    resellerLinks: [
      { supplier: 'Tigerexped', partName: 'Lagun Drehtischgestell Original', partNumber: 'TE-LAGUN-SYS', url: 'https://tigerexped.de', unitPrice: 189.00, currency: 'EUR', inStock: true },
      { supplier: 'Hornbach', partName: 'Pappel Multiplex 15mm 1250x2500', partNumber: 'HO-PAP-15', url: 'https://www.hornbach.de', unitPrice: 32.00, currency: 'EUR', inStock: true },
      { supplier: 'Amazon', partName: 'Gasdruckdämpfer 100N 4er-Set', partNumber: 'AMZ-GAS-100N', url: 'https://www.amazon.de', unitPrice: 19.90, currency: 'EUR', inStock: true }
    ]
  },
  {
    id: 'partition',
    name: 'Trennwand mit Schiebetür & Decken-Hängeschränke',
    category: 'Partition & Storage',
    shortDescription: 'Original T1 RTW Schiebetür-Trennwand (650mm Durchgang) & aerodynamische Dachschränke.',
    fullDescription: 'Erhält den ikonischen Durchstieg vom Cockpit in den Wohnraum. Die Trennwand trennt Fahrerkabine vom Wohnbereich thermisch ab. Oberhalb laufen 6 flache Hängeschränke (Aircraft Lockers) entlang der RTW-Hochdachkurve.',
    dimensionsMm: {
      length: 1720,
      width: 300,
      height: 1800,
    },
    weightKg: 29.0,
    totalCostEuro: 430.00,
    materials: [
      '12mm & 15mm Paulownia Leichtbau-Holz (Extrem leicht: 300kg/m³)',
      'Blum Aventos HK-XS Hochklapp-Scharniere mit Soft-Close',
      'Push-Lock Möbel-Druckschlösser in Matt-Chrom',
      'Original Bremer Schiebetür-Laufrolle & Dichtung'
    ],
    highlights: [
      'Full 650mm freier Durchgang ins Fahrerhaus',
      'Aerodynamisch an die RTW Hochdachkontur angepasste Schränke',
      'Push-Lock Verriegelung verhindert Aufspringen während der Fahrt'
    ],
    cutList: [
      { id: 'par-1', name: 'Hängeschrank Bodenblende Links', material: '12mm Paulownia', lengthMm: 1400, widthMm: 300, thicknessMm: 12, quantity: 1, angleLeft: 90, angleRight: 90 },
      { id: 'par-2', name: 'Hängeschrank Bodenblende Rechts', material: '12mm Paulownia', lengthMm: 1400, widthMm: 300, thicknessMm: 12, quantity: 1, angleLeft: 90, angleRight: 90 },
      { id: 'par-3', name: 'Schrank-Klappen mit Dach-Schräge', material: '12mm Paulownia HPL', lengthMm: 450, widthMm: 280, thicknessMm: 12, quantity: 6, angleLeft: 12, angleRight: 12 }
    ],
    assemblySteps: [
      {
        stepNumber: 1,
        title: 'Schablone der RTW Hochdachkontur nehmen',
        description: 'Mit Konturenlehre die Rundung der oberen Dachkante abgreifen und auf die Paulownia-Seitenwände übertragen.',
        toolsNeeded: ['Konturenlehre', 'Stichsäge mit Feinschnitt-Blatt', 'Schleifklotz'],
        fastenersNeeded: []
      },
      {
        stepNumber: 2,
        title: 'Montage der Blum Klappscharniere',
        description: 'Aventos HK-XS Scharniere einbohren (35mm Forstnerbohrer) und Soft-Close Dämpfung einstellen.',
        toolsNeeded: ['Oberfräse / Forstnerbohrer 35mm', 'Akkuschrauber'],
        fastenersNeeded: ['Blum 3,5x15mm Holzschrauben']
      }
    ],
    resellerLinks: [
      { supplier: 'Bauhaus', partName: 'Paulownia Leimholz 12mm 300x1200', partNumber: 'BH-PAUL-12', url: 'https://www.bauhaus.info', unitPrice: 14.50, currency: 'EUR', inStock: true },
      { supplier: 'Amazon', partName: 'Blum Aventos HK-XS Klappenbeschlag-Set', partNumber: 'AMZ-BLUM-HKXS', url: 'https://www.amazon.de', unitPrice: 38.00, currency: 'EUR', inStock: true }
    ]
  },
  {
    id: 'toilet',
    name: 'Off-Grid Trockentrenntoilette (Trelino / Kildwick Auszug)',
    category: 'Sanitation & Dry Toilet',
    shortDescription: 'Versteckter Schwerlastauszug in der Sitzbank mit geruchsfreiem Trenneinsatz & 12V Lüfter.',
    fullDescription: 'Autarke Sanitärlösung ohne Chemie. Die Trockentrenntoilette glidet bei Bedarf auf 80kg Soft-Close Auszügen aus der vorderen Sitzbank heraus. Flüssig- und Feststoff werden geruchlos getrennt.',
    dimensionsMm: {
      length: 450,
      width: 380,
      height: 410,
    },
    weightKg: 11.5,
    totalCostEuro: 390.00,
    materials: [
      'Trelino Evo M Trenneinsatz mit Spritzschutz',
      '10L Urinkanister mit Membran-Geruchsverschluss',
      '11L Feststoffbehälter recyclebar',
      '12V Silent-PC Lüfter Noctua NF-A4x10 mit Aktivkohlefilter',
      'Soft-Close Vollauszüge 450mm 80kg'
    ],
    highlights: [
      '100% Geruchsfrei durch permanenten 12V Unterdruck-Lüfter (nur 0,6W Verbrauch)',
      'Kompakt im Möbel integriert – vollkommen unsichtbar bei Nichtgebrauch',
      'Bis zu 10 Tage Autarkie für 2 Personen'
    ],
    cutList: [
      { id: 'toi-1', name: 'Toiletten-Auszugsgehäuse', material: '12mm Birke Multiplex', lengthMm: 460, widthMm: 390, thicknessMm: 12, quantity: 1, angleLeft: 90, angleRight: 90 },
      { id: 'toi-2', name: 'Deckelplatte mit Trenneinsatz-Ausfräsung', material: '15mm Birke Multiplex', lengthMm: 450, widthMm: 380, thicknessMm: 15, quantity: 1, angleLeft: 90, angleRight: 90 }
    ],
    assemblySteps: [
      {
        stepNumber: 1,
        title: 'Einbau der Soft-Close Teleskopschienen',
        description: 'Schienen am Boden der Sitzbank ausrichten und Auszugsbox verschrauben.',
        toolsNeeded: ['Akkuschrauber', 'Winkel'],
        fastenersNeeded: ['M4x16mm Linsenkopfschrauben']
      },
      {
        stepNumber: 2,
        title: 'Entlüftungsschlauch nach außen führen',
        description: '38mm Flexschlauch durch die Fahrzeug-Seitenwand / Boden nach außen führen mit Insektenschutz-Gitter.',
        toolsNeeded: ['Lochsäge 40mm', 'Dekalin Dichtmasse'],
        fastenersNeeded: ['Edelstahl Lüftungs-Rosette']
      }
    ],
    resellerLinks: [
      { supplier: 'Tigerexped', partName: 'Trelino Evo M Trockentrenntoilette White', partNumber: 'TE-TREL-EVO', url: 'https://tigerexped.de', unitPrice: 329.00, currency: 'EUR', inStock: true },
      { supplier: 'Amazon', partName: 'Noctua NF-A4x10 12V Silent Lüfter', partNumber: 'AMZ-NOC-40', url: 'https://www.amazon.de', unitPrice: 15.90, currency: 'EUR', inStock: true }
    ]
  }
];
