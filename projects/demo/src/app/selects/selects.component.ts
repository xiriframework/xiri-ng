import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriFormSettings } from 'projects/xiri-ng/src/lib/form/form.component';
import { XiriFormComponent } from 'projects/xiri-ng/src/lib/form/form.component';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component( {
	            selector: 'app-selects',
	            templateUrl: './selects.component.html',
	            styleUrls: [ './selects.component.scss' ],
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, MatCard, MatCardContent, XiriFormComponent ]
            } )
export class SelectsComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Select Fields',
		subtitle: 'Select, MultiSelect, TreeSelect und Server-side',
		icon: 'checklist',
		iconColor: 'primary',
	};

	sectionSelectFields: XiriSectionSettings = {
		title: 'Select Field Types',
		subtitle: 'multiselect (mit Chips und max. Limit), treeselect (hierarchische Baumauswahl mit Gruppen)',
		icon: 'checklist',
	};
	
	public data: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'multiselect',
			name: 'multiselect',
			class: 'xcol-start xcol-md-6 xcol-xl-4',
			id: 'multiselect',
			hint: 'test',
			max: 3,
			value: [ 3 ],
			list: [
				{
					"id": 1,
					"name": "SYSTEM",
				}, {
					"id": 2,
					"name": "Michi",
				}, {
					"id": 3,
					"name": "MTest",
				}, {
					"id": 4,
					"name": "MTest 4",
				}, {
					"id": "2",
					"name": "MTest 1"
				}, {
					"id": "1058",
					"name": "MTest FM1100 T1"
				}, {
					"id": "693",
					"name": "MTest FMB640"
				}, {
					"id": "661",
					"name": "IBEACON"
				}
			],
			required: true,
		}, {
			type: 'treeselect',
			name: 'treeselect',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'treeselect',
			hint: 'test',
			// max:      3,
			// value:    [ 3 ],
			list: [
				{
					"id": 1,
					"name": "SYSTEM",
					"isGroup": true,
					"children": [
						{
							"id": 2,
							"name": "Michi",
							"isGroup": true,
							"children": [
								{
									"id": 3,
									"name": "MTest",
									"isGroup": true,
									"children": [
										{
											"id": 4,
											"name": "MTest 4",
											"isGroup": true,
											"children": [
												{
													"id": "2",
													"name": "MTest 1"
												},
												{
													"id": "1058",
													"name": "MTest FM1100 T1"
												},
												{
													"id": "693",
													"name": "MTest FMB640"
												}
											]
										},
										{
											"id": "661",
											"name": "IBEACON"
										}
									]
								}
							]
						},
						{
							"id": 22,
							"name": "Perfect Tracking",
							"isGroup": true,
							"children": [
								{
									"id": 177,
									"name": "ABAG Verwaltungs GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 426,
											"name": "ABAG Privat",
											"isGroup": true,
											"children": [
												{
													"id": 428,
													"name": "ABAG Posch",
													"isGroup": true,
													"children": [
														{
															"id": "654",
															"name": "G 171 PM - Pepperl"
														}
													]
												},
												{
													"id": "237",
													"name": "Fahrtenbuch Rutter"
												},
												{
													"id": "1970",
													"name": "Hütter"
												}
											]
										},
										{
											"id": 425,
											"name": "ABAG VW GmbH",
											"isGroup": true,
											"children": [
												{
													"id": "375",
													"name": "ABAG 24"
												},
												{
													"id": "361",
													"name": "Ammann AC70"
												},
												{
													"id": "1523",
													"name": "Atlas Radlader"
												},
												{
													"id": "357",
													"name": "BW 100"
												},
												{
													"id": "372",
													"name": "BW 120"
												},
												{
													"id": "373",
													"name": "Caddy grau"
												},
												{
													"id": "358",
													"name": "Caddy weiss"
												},
												{
													"id": "698",
													"name": "Fahler"
												},
												{
													"id": "360",
													"name": "G 960 RZ"
												},
												{
													"id": "1212",
													"name": "Gmeiner"
												},
												{
													"id": "371",
													"name": "Gradwohl"
												},
												{
													"id": "369",
													"name": "Gsell Johann"
												},
												{
													"id": "1237",
													"name": "Gsell Thomas"
												},
												{
													"id": "352",
													"name": "Herneth"
												},
												{
													"id": "351",
													"name": "Hierzer"
												},
												{
													"id": "350",
													"name": "Jahrbacher"
												},
												{
													"id": "1601",
													"name": "Jambrosic NEU"
												},
												{
													"id": "1363",
													"name": "Kangoo Gmeiner"
												},
												{
													"id": "1491",
													"name": "Lagerplatz Gery G 921WG"
												},
												{
													"id": "1755",
													"name": "Liebherr Radlader"
												},
												{
													"id": "356",
													"name": "Monsberger"
												},
												{
													"id": "481",
													"name": "Neusson G 459GL"
												},
												{
													"id": "367",
													"name": "Schantl"
												},
												{
													"id": "366",
													"name": "Schuster"
												},
												{
													"id": "362",
													"name": "Slamek"
												},
												{
													"id": "364",
													"name": "Springer G-161MC/Ex Schantl"
												},
												{
													"id": "349",
													"name": "Springer G-628MT"
												},
												{
													"id": "655",
													"name": "Springer/Master G-715NT"
												},
												{
													"id": "370",
													"name": "Stelzl"
												},
												{
													"id": "374",
													"name": "Tankwagen Jimmy"
												},
												{
													"id": "365",
													"name": "TB 216"
												},
												{
													"id": "355",
													"name": "TB 219"
												},
												{
													"id": "195",
													"name": "TB 225"
												},
												{
													"id": "354",
													"name": "TB 235"
												},
												{
													"id": "231",
													"name": "TB 240"
												},
												{
													"id": "359",
													"name": "TB 250"
												},
												{
													"id": "909",
													"name": "TB 175 Rad"
												},
												{
													"id": "353",
													"name": "TB 240 Neu"
												},
												{
													"id": "479",
													"name": "Terex gelb G313FT"
												},
												{
													"id": "478",
													"name": "Terex grau St Gallen G 233 SY"
												},
												{
													"id": "480",
													"name": "Terex groß G131MI"
												},
												{
													"id": "483",
													"name": "Terex rot G317FT"
												},
												{
													"id": "482",
													"name": "Terex rot neu G387PH"
												},
												{
													"id": "845",
													"name": "Terrex grau neu G152 UM"
												},
												{
													"id": "363",
													"name": "Zotter"
												}
											]
										},
										{
											"id": "1999",
											"name": "Tankstelle"
										}
									]
								},
								{
									"id": 383,
									"name": "Adria Mulden Service GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1044",
											"name": "EU-478 CR"
										},
										{
											"id": "1045",
											"name": "EU-725 DL"
										},
										{
											"id": "1042",
											"name": "EU-815 DF"
										},
										{
											"id": "1043",
											"name": "LKW 02"
										}
									]
								},
								{
									"id": 217,
									"name": "Andjelkovic Transport KG",
									"isGroup": true,
									"children": [
										{
											"id": 307,
											"name": "ROLSPED",
											"isGroup": true,
											"children": [
												{
													"id": "971",
													"name": "16 BL-333 EZ"
												}
											]
										},
										{
											"id": "672",
											"name": "01 BL-134 FC"
										},
										{
											"id": "677",
											"name": "02 BL-130 FC"
										},
										{
											"id": "668",
											"name": "03 BL-102 FC"
										},
										{
											"id": "673",
											"name": "04 BL-103 FC"
										},
										{
											"id": "678",
											"name": "05 BL-125 FC"
										},
										{
											"id": "1642",
											"name": "06 BL-142 FC"
										},
										{
											"id": "1370",
											"name": "07 BL-129 FC"
										},
										{
											"id": "671",
											"name": "08 BL-132 FC"
										},
										{
											"id": "674",
											"name": "09 BL-117 FC"
										},
										{
											"id": "676",
											"name": "10 BL-101 FC"
										},
										{
											"id": "675",
											"name": "11 BL-128 FC"
										},
										{
											"id": "1059",
											"name": "12 BL-116 FC"
										},
										{
											"id": "1022",
											"name": "13 BL-113 FC"
										},
										{
											"id": "670",
											"name": "14 BL-675 MY"
										},
										{
											"id": "1485",
											"name": "15 BL-109 FC"
										},
										{
											"id": "1504",
											"name": "17 BL-112FC"
										},
										{
											"id": "669",
											"name": "18 BL-118 FC"
										},
										{
											"id": "2002",
											"name": "LKW 01"
										}
									]
								},
								{
									"id": 238,
									"name": "Argonics GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 239,
											"name": "BAW Bundesanstalt fuer Wasserbau",
											"isGroup": true,
											"children": [
												{
													"id": "730",
													"name": "MS Odeon"
												}
											]
										},
										{
											"id": 240,
											"name": "CroisiEurope",
											"isGroup": true,
											"children": [
												{
													"id": "731",
													"name": "African Dream"
												},
												{
													"id": "755",
													"name": "Anne-Marie"
												},
												{
													"id": "745",
													"name": "Danièle"
												},
												{
													"id": "760",
													"name": "Deborah"
												},
												{
													"id": "773",
													"name": "Indochine 1"
												},
												{
													"id": "771",
													"name": "Indochine 2"
												},
												{
													"id": "752",
													"name": "Jeanine"
												},
												{
													"id": "761",
													"name": "Madeleine"
												},
												{
													"id": "774",
													"name": "MS Amalia Rodrigues"
												},
												{
													"id": "758",
													"name": "MS Beethoven"
												},
												{
													"id": "743",
													"name": "MS Botticelli"
												},
												{
													"id": "750",
													"name": "MS Camargue"
												},
												{
													"id": "765",
													"name": "MS Cyrano de Bergerac"
												},
												{
													"id": "759",
													"name": "MS Douce France"
												},
												{
													"id": "749",
													"name": "MS Elbe Princesse"
												},
												{
													"id": "744",
													"name": "MS Elbe Princesse 2"
												},
												{
													"id": "766",
													"name": "MS Fernao de Magalhaes"
												},
												{
													"id": "739",
													"name": "MS France"
												},
												{
													"id": "740",
													"name": "MS Galateia"
												},
												{
													"id": "753",
													"name": "MS Gérard Schmitter"
												},
												{
													"id": "754",
													"name": "MS Gil Eanes"
												},
												{
													"id": "767",
													"name": "MS Infante don Henrique"
												},
												{
													"id": "734",
													"name": "MS La Belle de Cadix"
												},
												{
													"id": "772",
													"name": "MS La Belle de L Adriatique"
												},
												{
													"id": "736",
													"name": "MS La Boheme"
												},
												{
													"id": "737",
													"name": "MS Lafayette"
												},
												{
													"id": "746",
													"name": "MS Leonardo da Vinci"
												},
												{
													"id": "770",
													"name": "MS Loire Princesse"
												},
												{
													"id": "747",
													"name": "MS Michelangelo"
												},
												{
													"id": "733",
													"name": "MS Miguel Torga"
												},
												{
													"id": "751",
													"name": "MS Mistral"
												},
												{
													"id": "735",
													"name": "MS Modigliani"
												},
												{
													"id": "756",
													"name": "MS Mona Lisa"
												},
												{
													"id": "769",
													"name": "MS Renoir"
												},
												{
													"id": "742",
													"name": "MS Rhône Princesse"
												},
												{
													"id": "741",
													"name": "MS Seine Princesse"
												},
												{
													"id": "738",
													"name": "MS Symphonie"
												},
												{
													"id": "732",
													"name": "MS Van Gogh"
												},
												{
													"id": "768",
													"name": "MS Vasco da Gama"
												},
												{
													"id": "748",
													"name": "MS Victor Hugo"
												},
												{
													"id": "757",
													"name": "MS Vivaldi"
												},
												{
													"id": "763",
													"name": "Raymonde"
												}
											]
										},
										{
											"id": 241,
											"name": "Prominent",
											"isGroup": true,
											"children": [
												{
													"id": 242,
													"name": "Reederei Deymann",
													"isGroup": true,
													"children": [
														{
															"id": "775",
															"name": "MS Monika Deymann"
														}
													]
												},
												{
													"id": 243,
													"name": "Reederei Schwaben",
													"isGroup": true,
													"children": [
														{
															"id": "776",
															"name": "MS Baden-Württemberg"
														}
													]
												}
											]
										},
										{
											"id": 565,
											"name": "RHENUS  Logistics",
											"isGroup": true,
											"children": [
												{
													"id": "1998",
													"name": "RHENUS"
												}
											]
										},
										{
											"id": "885",
											"name": "MS L Europe"
										},
										{
											"id": "762",
											"name": "MS Monet"
										},
										{
											"id": "2001",
											"name": "NMEA0183/2000"
										},
										{
											"id": "764",
											"name": "Reserve01"
										},
										{
											"id": "886",
											"name": "Schiff 02"
										},
										{
											"id": "884",
											"name": "USA"
										},
										{
											"id": "729",
											"name": "VW T6.1 Multivan"
										}
									]
								},
								{
									"id": 530,
									"name": "A. Schwarzl GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "2133",
											"name": "G-341 VW"
										},
										{
											"id": "1667",
											"name": "G 357 RP"
										},
										{
											"id": "1662",
											"name": "G 457 PK"
										},
										{
											"id": "1660",
											"name": "G 511 HV"
										},
										{
											"id": "1663",
											"name": "G 522 GJ"
										},
										{
											"id": "1665",
											"name": "G 561 JX E-Auto"
										},
										{
											"id": "1666",
											"name": "G 632 VL"
										},
										{
											"id": "1661",
											"name": "G 646 MV"
										},
										{
											"id": "1658",
											"name": "G 669 JX"
										},
										{
											"id": "1664",
											"name": "G 731 TI"
										},
										{
											"id": "1659",
											"name": "G 732 AU"
										},
										{
											"id": "2134",
											"name": "PKW 12"
										}
									]
								},
								{
									"id": 215,
									"name": "AS Versicherung",
									"isGroup": true,
									"children": [
										{
											"id": "666",
											"name": "Boot"
										}
									]
								},
								{
									"id": 179,
									"name": "Bergedienst.at Briscek Roberto",
									"isGroup": true,
									"children": [
										{
											"id": "393",
											"name": "Audi A1 /  MT-513 CH"
										},
										{
											"id": "396",
											"name": "ERKIN 172.000/ MT-SOS 10"
										},
										{
											"id": "388",
											"name": "ERKIN 250.000 / MT-SOS 1"
										},
										{
											"id": "397",
											"name": "Fiat Abarth / MT-SOS 46"
										},
										{
											"id": "389",
											"name": "MAN TGA / MT-530 DF"
										},
										{
											"id": "386",
											"name": "MAN TGE / MT-SOS 5"
										},
										{
											"id": "392",
											"name": "MAN TGL  /  MT-SOS 12"
										},
										{
											"id": "394",
											"name": "MAN TGM / MT-SOS 15"
										},
										{
											"id": "390",
											"name": "MB Vito  /  MT-SOS 4"
										},
										{
											"id": "384",
											"name": "ohne Zuweisung  (ex JU-SOS 24)"
										},
										{
											"id": "88",
											"name": "ohne Zuweisung (ex. MT-610 CU)"
										},
										{
											"id": "391",
											"name": "ohne Zuweisung (ex MT-757 BY)"
										},
										{
											"id": "387",
											"name": "ohne Zuweisung (ex MT-873 BT)"
										},
										{
											"id": "385",
											"name": "T6 Speeder / MT-SOS 2"
										},
										{
											"id": "395",
											"name": "Volvo FH16 750 / MT-SOS 24"
										}
									]
								},
								{
									"id": 525,
									"name": "BESTREIN GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1626",
											"name": "867648043613833"
										},
										{
											"id": "1625",
											"name": "Bus Renault"
										},
										{
											"id": "1624",
											"name": "Bus Toyota"
										}
									]
								},
								{
									"id": 279,
									"name": "BOKU  Wien",
									"isGroup": true,
									"children": [
										{
											"id": "956",
											"name": "BOKU"
										},
										{
											"id": "1205",
											"name": "PKW 02"
										}
									]
								},
								{
									"id": 61,
									"name": "Boote Kamper",
									"isGroup": true,
									"children": [
										{
											"id": 87,
											"name": "Angelina Biograd",
											"isGroup": true,
											"children": [
												{
													"id": 566,
													"name": "BKB Bertelshofer",
													"isGroup": true,
													"children": [
														{
															"id": "109",
															"name": "HUBBLE"
														}
													]
												},
												{
													"id": 110,
													"name": "BKB Come and go D.o.o",
													"isGroup": true,
													"children": [
														{
															"id": "112",
															"name": "Demi Doux"
														},
														{
															"id": "113",
															"name": "Demi Doux 2"
														}
													]
												},
												{
													"id": 98,
													"name": "BKB PUNT SP. Z.o.o. THESAURUS d.o.o.",
													"isGroup": true,
													"children": [
														{
															"id": "105",
															"name": "FEELING GOOD"
														},
														{
															"id": "97",
															"name": "JAM SESSION"
														},
														{
															"id": "76",
															"name": "JAZZ BAND"
														},
														{
															"id": "87",
															"name": "KALISPERA"
														},
														{
															"id": "89",
															"name": "WILD CAT"
														}
													]
												},
												{
													"id": "1850",
													"name": "ADRIATIC QUEEN"
												},
												{
													"id": "81",
													"name": "AIR PRINCESS"
												},
												{
													"id": "103",
													"name": "ARABELLA"
												},
												{
													"id": "69",
													"name": "Auto Opel Combo Biograd AM"
												},
												{
													"id": "122",
													"name": "Auto Renault Traffic  AM"
												},
												{
													"id": "117",
													"name": "BELLAVITA"
												},
												{
													"id": "115",
													"name": "BLACK PEARL"
												},
												{
													"id": "1852",
													"name": "CHARDONNAY"
												},
												{
													"id": "1844",
													"name": "CHILL COURSE"
												},
												{
													"id": "106",
													"name": "DUGI II"
												},
												{
													"id": "100",
													"name": "EVOLUTION"
												},
												{
													"id": "80",
													"name": "FIRST CHOICE"
												},
												{
													"id": "1497",
													"name": "ICE CAT"
												},
												{
													"id": "72",
													"name": "JOLIE"
												},
												{
													"id": "79",
													"name": "JUPITER"
												},
												{
													"id": "997",
													"name": "LOVE SONG"
												},
												{
													"id": "996",
													"name": "MAUPITI"
												},
												{
													"id": "1851",
													"name": "MOJE"
												},
												{
													"id": "993",
													"name": "NEPTUN"
												},
												{
													"id": "96",
													"name": "NIKO"
												},
												{
													"id": "71",
													"name": "NIRVANA"
												},
												{
													"id": "85",
													"name": "ONE"
												},
												{
													"id": "1001",
													"name": "PANNA"
												},
												{
													"id": "111",
													"name": "PHONIX II"
												},
												{
													"id": "101",
													"name": "SIEGAL"
												},
												{
													"id": "152",
													"name": "STAR ROMEO"
												},
												{
													"id": "94",
													"name": "STRAWBERRY III"
												},
												{
													"id": "1357",
													"name": "SUN COURSE"
												},
												{
													"id": "107",
													"name": "SUSSO"
												},
												{
													"id": "995",
													"name": "SYLKE"
												},
												{
													"id": "68",
													"name": "VERTIGO"
												}
											]
										},
										{
											"id": 308,
											"name": "Angelina Frappa",
											"isGroup": true,
											"children": [
												{
													"id": "986",
													"name": "AIR WAVE"
												},
												{
													"id": "82",
													"name": "Believe"
												},
												{
													"id": "1004",
													"name": "BEST FRIENDS"
												},
												{
													"id": "1002",
													"name": "Excellence"
												},
												{
													"id": "39",
													"name": "FIAT DUPLO AS"
												},
												{
													"id": "174",
													"name": "Indigo Star"
												},
												{
													"id": "145",
													"name": "LADIES FIRST"
												},
												{
													"id": "175",
													"name": "LA LOUNGE"
												},
												{
													"id": "140",
													"name": "MARTIN V"
												},
												{
													"id": "194",
													"name": "Pandora V"
												},
												{
													"id": "141",
													"name": "QUEEN BEE"
												},
												{
													"id": "985",
													"name": "VENUS"
												}
											]
										},
										{
											"id": 62,
											"name": "Angelina Sibenik",
											"isGroup": true,
											"children": [
												{
													"id": 543,
													"name": "angelina sea",
													"isGroup": true,
													"children": [
														{
															"id": "1355",
															"name": "MERCURY"
														}
													]
												},
												{
													"id": 572,
													"name": "Niesenbacher Manfred",
													"isGroup": true,
													"children": [
														{
															"id": "1848",
															"name": "SHOOTING STAR"
														}
													]
												},
												{
													"id": "50",
													"name": "3 FRIENDS"
												},
												{
													"id": "989",
													"name": "AIR 1"
												},
												{
													"id": "37",
													"name": "ANGELIC"
												},
												{
													"id": "49",
													"name": "APOLLO"
												},
												{
													"id": "48",
													"name": "ARIZONA"
												},
												{
													"id": "55",
													"name": "Auto Opel Combo Sukosan"
												},
												{
													"id": "42",
													"name": "BE MINE"
												},
												{
													"id": "44",
													"name": "CHUCK"
												},
												{
													"id": "43",
													"name": "DOLCE VITA"
												},
												{
													"id": "47",
													"name": "ERCO"
												},
												{
													"id": "32",
													"name": "FENIKS"
												},
												{
													"id": "990",
													"name": "FREYA"
												},
												{
													"id": "202",
													"name": "FRIENDSHIP"
												},
												{
													"id": "56",
													"name": "FUN 4 FRIENDS"
												},
												{
													"id": "40",
													"name": "KINGA V"
												},
												{
													"id": "41",
													"name": "LILLA V"
												},
												{
													"id": "991",
													"name": "MARYLAND"
												},
												{
													"id": "35",
													"name": "MEDIA LUNA"
												},
												{
													"id": "1847",
													"name": "MY 5ive"
												},
												{
													"id": "33",
													"name": "PAPILLON"
												},
												{
													"id": "34",
													"name": "ROZI V"
												},
												{
													"id": "51",
													"name": "SAPPHIRE"
												},
												{
													"id": "45",
													"name": "STAR ELISABETH"
												}
											]
										},
										{
											"id": 76,
											"name": "Angelina Sukosan",
											"isGroup": true,
											"children": [
												{
													"id": 579,
													"name": "BKS Stargate",
													"isGroup": true,
													"children": [
														{
															"id": "67",
															"name": "STARGATE"
														}
													]
												},
												{
													"id": 528,
													"name": "KBS Bertelshofer",
													"isGroup": true,
													"children": [
														{
															"id": "1348",
															"name": "CUPID"
														}
													]
												},
												{
													"id": 86,
													"name": "KBS prgomet d.o.o",
													"isGroup": true,
													"children": [
														{
															"id": "65",
															"name": "EX ZEPHYRA"
														},
														{
															"id": "149",
															"name": "KRISTINA II"
														},
														{
															"id": "66",
															"name": "ZYNTHA"
														}
													]
												},
												{
													"id": "635",
													"name": "AIR STAR"
												},
												{
													"id": "57",
													"name": "Auto Fiat Duplo Sukosan"
												},
												{
													"id": "62",
													"name": "BACKUP"
												},
												{
													"id": "130",
													"name": "DANCER"
												},
												{
													"id": "54",
													"name": "FAMILY OFFICE"
												},
												{
													"id": "61",
													"name": "KULFOLDI PANNA"
												},
												{
													"id": "52",
													"name": "L ALBATROS"
												},
												{
													"id": "192",
													"name": "LA LUNA"
												},
												{
													"id": "1349",
													"name": "MACHO"
												},
												{
													"id": "59",
													"name": "MAJA V"
												},
												{
													"id": "53",
													"name": "MARK V"
												},
												{
													"id": "133",
													"name": "SIMPLY THE BEST"
												},
												{
													"id": "63",
													"name": "WHITE STAR"
												},
												{
													"id": "64",
													"name": "ZEPHYRA"
												}
											]
										},
										{
											"id": 119,
											"name": "Angelina Trogir",
											"isGroup": true,
											"children": [
												{
													"id": 521,
													"name": "Angelina Horido",
													"isGroup": true,
													"children": [
														{
															"id": "187",
															"name": "Horido"
														}
													]
												},
												{
													"id": 522,
													"name": "angelina suppan",
													"isGroup": true,
													"children": [
														{
															"id": "1360",
															"name": "FORTUNA"
														}
													]
												},
												{
													"id": 477,
													"name": "BKT Bertelshofer",
													"isGroup": true,
													"children": [
														{
															"id": "1845",
															"name": "JAMES WEBB"
														},
														{
															"id": "1346",
															"name": "TITAN"
														}
													]
												},
												{
													"id": 380,
													"name": "BKT MONA",
													"isGroup": true,
													"children": [
														{
															"id": "147",
															"name": "MONA"
														}
													]
												},
												{
													"id": 130,
													"name": "BKT PRGOMET d.o.o.",
													"isGroup": true,
													"children": [
														{
															"id": "150",
															"name": "TISIA"
														}
													]
												},
												{
													"id": 390,
													"name": "BKT RiverandStone",
													"isGroup": true,
													"children": [
														{
															"id": "138",
															"name": "KARINA V"
														},
														{
															"id": "114",
															"name": "MAKE ME YOURS"
														},
														{
															"id": "142",
															"name": "NINA V"
														},
														{
															"id": "143",
															"name": "TAMARA V"
														}
													]
												},
												{
													"id": "125",
													"name": "4 FRIENDS"
												},
												{
													"id": "170",
													"name": "4 YOU   ME"
												},
												{
													"id": "189",
													"name": "ADRIATIC OFFICE"
												},
												{
													"id": "186",
													"name": "Adrio"
												},
												{
													"id": "1857",
													"name": "ADVENTURE"
												},
												{
													"id": "75",
													"name": "AIR 2"
												},
												{
													"id": "184",
													"name": "Air King"
												},
												{
													"id": "1853",
													"name": "ALABAMA"
												},
												{
													"id": "179",
													"name": "ALPHA"
												},
												{
													"id": "1000",
													"name": "ANJNA"
												},
												{
													"id": "90",
													"name": "AUF KURS"
												},
												{
													"id": "74",
													"name": "Auto Opel AC"
												},
												{
													"id": "123",
													"name": "Auto Opel Vivano ATR"
												},
												{
													"id": "171",
													"name": "BARBARELLA"
												},
												{
													"id": "167",
													"name": "BARBARELLA II"
												},
												{
													"id": "1003",
													"name": "BARBARELLA III"
												},
												{
													"id": "1049",
													"name": "BCM"
												},
												{
													"id": "1855",
													"name": "BELLA EPOQUE"
												},
												{
													"id": "177",
													"name": "CARINA"
												},
												{
													"id": "176",
													"name": "Citroen Berlingo Trogir"
												},
												{
													"id": "190",
													"name": "delta"
												},
												{
													"id": "139",
													"name": "DORKA V"
												},
												{
													"id": "159",
													"name": "DREAM STAR"
												},
												{
													"id": "173",
													"name": "EASY COURSE"
												},
												{
													"id": "126",
													"name": "Escape I"
												},
												{
													"id": "146",
													"name": "FEELING FREE"
												},
												{
													"id": "999",
													"name": "GEMINI"
												},
												{
													"id": "191",
													"name": "Good Friends"
												},
												{
													"id": "1347",
													"name": "HI FRIENDS"
												},
												{
													"id": "1856",
													"name": "JASMINE"
												},
												{
													"id": "135",
													"name": "LADY BUG"
												},
												{
													"id": "185",
													"name": "LADY ONE"
												},
												{
													"id": "180",
													"name": "LA MAR"
												},
												{
													"id": "134",
													"name": "LAMBDA"
												},
												{
													"id": "1854",
													"name": "LA VIE"
												},
												{
													"id": "1849",
													"name": "LUISA"
												},
												{
													"id": "188",
													"name": "MELANIE"
												},
												{
													"id": "998",
													"name": "MONIKA"
												},
												{
													"id": "232",
													"name": "MY COURSE"
												},
												{
													"id": "160",
													"name": "MY STAR"
												},
												{
													"id": "162",
													"name": "OCEAN STAR"
												},
												{
													"id": "128",
													"name": "OCEAN TANGO"
												},
												{
													"id": "183",
													"name": "PASKO I"
												},
												{
													"id": "1496",
													"name": "POCO LOCO"
												},
												{
													"id": "165",
													"name": "PRETTY LADY"
												},
												{
													"id": "95",
													"name": "RUNING GAG"
												},
												{
													"id": "116",
													"name": "SANTA ROSA"
												},
												{
													"id": "108",
													"name": "SASOOL"
												},
												{
													"id": "166",
													"name": "SEA OFFICE"
												},
												{
													"id": "129",
													"name": "SILVER ARROW"
												},
												{
													"id": "1846",
													"name": "SKADI"
												},
												{
													"id": "92",
													"name": "SOPHIE"
												},
												{
													"id": "157",
													"name": "STAR DORIS"
												},
												{
													"id": "155",
													"name": "STAR FABIAN"
												},
												{
													"id": "549",
													"name": "STAR ISABELLA"
												},
												{
													"id": "156",
													"name": "STAR LILLI"
												},
												{
													"id": "163",
													"name": "STAR PHILIP"
												},
												{
													"id": "161",
													"name": "STAR PRINCESS"
												},
												{
													"id": "158",
													"name": "STAR SISSI"
												},
												{
													"id": "994",
													"name": "SUN OFFICE"
												},
												{
													"id": "169",
													"name": "VIDAR"
												},
												{
													"id": "172",
													"name": "Whatever"
												},
												{
													"id": "1686",
													"name": "WHATEVER"
												},
												{
													"id": "144",
													"name": "WHY NOT"
												}
											]
										},
										{
											"id": 461,
											"name": "Angelina Vodice",
											"isGroup": true,
											"children": [
												{
													"id": 478,
													"name": "BKV Bertelshofer",
													"isGroup": true,
													"children": [
														{
															"id": "1352",
															"name": "THEMISTO"
														},
														{
															"id": "1354",
															"name": "TRITON"
														}
													]
												},
												{
													"id": 101,
													"name": "BKV Dokter",
													"isGroup": true,
													"children": [
														{
															"id": "99",
															"name": "SWEET LADY"
														}
													]
												},
												{
													"id": 518,
													"name": "BKV Floating",
													"isGroup": true,
													"children": [
														{
															"id": "1353",
															"name": "GONGONG"
														}
													]
												},
												{
													"id": 485,
													"name": "EUPORIE",
													"isGroup": true,
													"children": [
														{
															"id": "1351",
															"name": "ANTHEA"
														}
													]
												},
												{
													"id": 570,
													"name": "Mischkots Erich",
													"isGroup": true,
													"children": [
														{
															"id": "1207",
															"name": "SEEADLER"
														}
													]
												},
												{
													"id": "93",
													"name": "4 YOU"
												},
												{
													"id": "136",
													"name": "ABRAKADABRA"
												},
												{
													"id": "98",
													"name": "ANNE"
												},
												{
													"id": "31",
													"name": "Auto Peugeot Sibenik AB"
												},
												{
													"id": "78",
													"name": "CAPRICE"
												},
												{
													"id": "1361",
													"name": "CARUSO"
												},
												{
													"id": "182",
													"name": "DREAM COURSE"
												},
												{
													"id": "1359",
													"name": "ex_caruso"
												},
												{
													"id": "91",
													"name": "HOME OFFICE"
												},
												{
													"id": "84",
													"name": "LA BOHEME"
												},
												{
													"id": "988",
													"name": "LOVE HUNTER"
												},
												{
													"id": "900",
													"name": "MARS"
												},
												{
													"id": "38",
													"name": "MIRA"
												},
												{
													"id": "197",
													"name": "PARTY BREAKER"
												},
												{
													"id": "132",
													"name": "SATURN"
												},
												{
													"id": "992",
													"name": "SEAVIEW III"
												},
												{
													"id": "73",
													"name": "STAR CHIARA"
												},
												{
													"id": "1350",
													"name": "THOR"
												}
											]
										},
										{
											"id": 118,
											"name": "Service angelina.hr",
											"isGroup": true,
											"children": [
												{
													"id": "127",
													"name": "Auto clean 4 us"
												},
												{
													"id": "120",
													"name": "HIGHFELD 590"
												}
											]
										},
										{
											"id": "121",
											"name": "Auto Opel Combo AC"
										},
										{
											"id": "181",
											"name": "BOAT 16"
										},
										{
											"id": "1356",
											"name": "EX_ADRIATIC QUEEN"
										},
										{
											"id": "193",
											"name": "ex_AIR PRINCESS"
										},
										{
											"id": "987",
											"name": "ex_BEST FRIENDS"
										},
										{
											"id": "104",
											"name": "ex_JAZZ BAND"
										},
										{
											"id": "458",
											"name": "EX_POCO LOCO"
										},
										{
											"id": "36",
											"name": "FAMILY OFFICE ex"
										},
										{
											"id": "77",
											"name": "MIRA V"
										},
										{
											"id": "1909",
											"name": "PKW reserve"
										},
										{
											"id": "178",
											"name": "SEEADLER"
										},
										{
											"id": "102",
											"name": "SUN COURSE"
										},
										{
											"id": "60",
											"name": "xBARBARELLA II"
										},
										{
											"id": "46",
											"name": "x_Private Beach"
										}
									]
								},
								{
									"id": 439,
									"name": "BRM-Recycling GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1193",
											"name": "GU 134NN-Volvo"
										},
										{
											"id": "1192",
											"name": "GU 286MK"
										},
										{
											"id": "1189",
											"name": "GU-348 KV-Franz"
										},
										{
											"id": "1188",
											"name": "GU-361 KV-Agim"
										},
										{
											"id": "1191",
											"name": "GU611NR-Stefan"
										},
										{
											"id": "1190",
											"name": "GU-767 LG-Feri"
										}
									]
								},
								{
									"id": 548,
									"name": "Car-Trade Gebrauchtwagen GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1794",
											"name": "LKW 01"
										},
										{
											"id": "1795",
											"name": "LKW 02"
										},
										{
											"id": "1796",
											"name": "LKW 03"
										},
										{
											"id": "1797",
											"name": "LKW 04"
										},
										{
											"id": "1798",
											"name": "LKW 05"
										},
										{
											"id": "1799",
											"name": "LKW 06"
										},
										{
											"id": "1800",
											"name": "LKW 07"
										},
										{
											"id": "1801",
											"name": "LKW 08"
										},
										{
											"id": "1802",
											"name": "LKW 09"
										},
										{
											"id": "1803",
											"name": "LKW 10"
										},
										{
											"id": "1804",
											"name": "LKW 11"
										},
										{
											"id": "1805",
											"name": "LKW 12"
										},
										{
											"id": "1806",
											"name": "LKW 13"
										},
										{
											"id": "1807",
											"name": "LKW 14"
										},
										{
											"id": "1808",
											"name": "LKW 15"
										},
										{
											"id": "1809",
											"name": "LKW 16"
										},
										{
											"id": "1810",
											"name": "LKW 17"
										},
										{
											"id": "1811",
											"name": "LKW 18"
										},
										{
											"id": "1812",
											"name": "LKW 19"
										},
										{
											"id": "1813",
											"name": "LKW 20"
										},
										{
											"id": "1814",
											"name": "LKW 21"
										},
										{
											"id": "1815",
											"name": "LKW 22"
										},
										{
											"id": "1816",
											"name": "LKW 23"
										},
										{
											"id": "1817",
											"name": "LKW 24"
										},
										{
											"id": "1818",
											"name": "LKW 25"
										},
										{
											"id": "1819",
											"name": "LKW 26"
										},
										{
											"id": "1820",
											"name": "LKW 27"
										},
										{
											"id": "1821",
											"name": "LKW 28"
										},
										{
											"id": "1822",
											"name": "LKW 29"
										},
										{
											"id": "1823",
											"name": "LKW 30"
										},
										{
											"id": "1824",
											"name": "LKW 31"
										},
										{
											"id": "1825",
											"name": "LKW 32"
										},
										{
											"id": "1826",
											"name": "LKW 33"
										},
										{
											"id": "1827",
											"name": "LKW 34"
										},
										{
											"id": "1828",
											"name": "LKW 35"
										},
										{
											"id": "1829",
											"name": "LKW 36"
										},
										{
											"id": "1830",
											"name": "LKW 37"
										},
										{
											"id": "1831",
											"name": "LKW 38"
										},
										{
											"id": "1832",
											"name": "LKW 39"
										},
										{
											"id": "1833",
											"name": "LKW 40"
										},
										{
											"id": "1834",
											"name": "LKW 41"
										},
										{
											"id": "1835",
											"name": "LKW 42"
										},
										{
											"id": "1836",
											"name": "LKW 43"
										},
										{
											"id": "1837",
											"name": "LKW 44"
										},
										{
											"id": "1838",
											"name": "LKW 45"
										},
										{
											"id": "1839",
											"name": "LKW 46"
										},
										{
											"id": "1840",
											"name": "LKW 47"
										},
										{
											"id": "1841",
											"name": "LKW 48"
										},
										{
											"id": "1842",
											"name": "LKW 49"
										},
										{
											"id": "1843",
											"name": "LKW 50"
										}
									]
								},
								{
									"id": 178,
									"name": "Charter Service Punat d.o.o.",
									"isGroup": true,
									"children": [
										{
											"id": 275,
											"name": "Olofsson",
											"isGroup": true,
											"children": [
												{
													"id": "380",
													"name": "BMB 400 RHEA"
												}
											]
										},
										{
											"id": 225,
											"name": "Reinthaler Max",
											"isGroup": true,
											"children": [
												{
													"id": "453",
													"name": "AZZURRO"
												}
											]
										},
										{
											"id": 472,
											"name": "sonimed",
											"isGroup": true,
											"children": [
												{
													"id": "378",
													"name": "LADY VERONIKA"
												}
											]
										},
										{
											"id": "382",
											"name": "BAV 34 THEIA"
										},
										{
											"id": "460",
											"name": "BAV 41 Bella"
										},
										{
											"id": "379",
											"name": "BAV 44 Gin"
										},
										{
											"id": "383",
											"name": "BAV 46 DIANA"
										},
										{
											"id": "1046",
											"name": "Zodiac"
										}
									]
								},
								{
									"id": 474,
									"name": "Ciric Transport KEG",
									"isGroup": true,
									"children": [
										{
											"id": "1502",
											"name": "BN 360 MC"
										},
										{
											"id": "1500",
											"name": "BN 871 MH"
										},
										{
											"id": "1501",
											"name": "DEV 69988"
										},
										{
											"id": "722",
											"name": "DEV 83155"
										}
									]
								},
								{
									"id": 25,
									"name": "Delfin Charter d.o.o.",
									"isGroup": true,
									"children": [
										{
											"id": 550,
											"name": "Berggren",
											"isGroup": true,
											"children": [
												{
													"id": "1024",
													"name": "Bavaria 37 Kai"
												}
											]
										},
										{
											"id": "19",
											"name": "Bavaria 37 Bella Angelina"
										},
										{
											"id": "1217",
											"name": "Bavaria 37  Snelly"
										},
										{
											"id": "28",
											"name": "Bavaria 38C Danny"
										},
										{
											"id": "17",
											"name": "Bavaria 38C Zoom"
										},
										{
											"id": "1343",
											"name": "Bavaria 42C  Nola"
										},
										{
											"id": "27",
											"name": "Bavaria 46 Elsa"
										},
										{
											"id": "26",
											"name": "Bavaria  46 Romi"
										},
										{
											"id": "1344",
											"name": "Bavaria 46 TAC II"
										},
										{
											"id": "1025",
											"name": "Bavaria 51 Sir david"
										},
										{
											"id": "1023",
											"name": "Bavaria 51 Style"
										},
										{
											"id": "15",
											"name": "Cobra 38 Teuta"
										},
										{
											"id": "20",
											"name": "Oceanis 48 Bordeaux"
										},
										{
											"id": "25",
											"name": "Sun Odyssey 45 Sanjar"
										}
									]
								},
								{
									"id": 379,
									"name": "Dingleder Privat",
									"isGroup": true,
									"children": [
										{
											"id": "896",
											"name": "LB 386 FZ (31.01.2021 Autotausch Alois)"
										},
										{
											"id": "266",
											"name": "LB.710 DR.  Audi A6"
										}
									]
								},
								{
									"id": 163,
									"name": "Dingsleder Metallbau GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1369",
											"name": "Fiat Scudoo"
										},
										{
											"id": "264",
											"name": "LB 1 JDN (Mercedes Pritsche)"
										},
										{
											"id": "469",
											"name": "LB 605 CD ( Mercedes Bus)"
										},
										{
											"id": "267",
											"name": "LB 814 EU (Iveco Pritsche)"
										},
										{
											"id": "265",
											"name": "LB 857 EX (Renault Pritsche)"
										},
										{
											"id": "506",
											"name": "LB 871 EZ (Citroen Kangoo)"
										}
									]
								},
								{
									"id": 170,
									"name": "Dokter GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 173,
											"name": "Benko Bernd",
											"isGroup": true,
											"children": [
												{
													"id": 174,
													"name": "Antsfer",
													"isGroup": true,
													"children": [
														{
															"id": 277,
															"name": "Antsfer-MFG",
															"isGroup": true,
															"children": [
																{
																	"id": "311",
																	"name": "GU 327LP Plane Antsfer"
																}
															]
														},
														{
															"id": "305",
															"name": "GU 627ME ANTSFER Tagtour + GU 262KS POST Salzburg"
														},
														{
															"id": "1481",
															"name": "GU 769 MK (2) Antsfer u. Wels + GU 588LN"
														}
													]
												}
											]
										},
										{
											"id": 266,
											"name": "GLS Group",
											"isGroup": true,
											"children": [
												{
													"id": 577,
													"name": "Dokter GLS Antsfer",
													"isGroup": true,
													"children": [
														{
															"id": "292",
															"name": "GU 118KB Antsfer ; GLS + 223NY"
														},
														{
															"id": "1681",
															"name": "GU 352PA"
														}
													]
												},
												{
													"id": "1738",
													"name": "GU 343PD + GU 297MR (  ex 551MO )"
												},
												{
													"id": "1735",
													"name": "GU  345PD"
												},
												{
													"id": "1737",
													"name": "GU 346PA"
												},
												{
													"id": "679",
													"name": "GU 420 PF  WIESEL"
												},
												{
													"id": "1083",
													"name": "GU 675 ND  GLS rot laslo"
												},
												{
													"id": "313",
													"name": "GU 984MW  + 193NJ GLS  ( 26 /7 /21 )"
												},
												{
													"id": "1522",
													"name": "GU DOKT3 + GU 568ME  GLS ERDING   ( 26 /07/2021 )"
												}
											]
										},
										{
											"id": "1063",
											"name": "GU 131HH     Takko /  New Yorker"
										},
										{
											"id": "297",
											"name": "GU 200PG ( Plane Neu ab 11.07.2022 )"
										},
										{
											"id": "283",
											"name": "GU 208HG Plane Gebrüder Weiss"
										},
										{
											"id": "1006",
											"name": "GU 264MS Englmayer Graz-West (ex 935KT )"
										},
										{
											"id": "1366",
											"name": "GU 314 HN + GU 186PE ( Post Thalgau )"
										},
										{
											"id": "697",
											"name": "GU  405 NT ( Nagel Group GRAZ u. NACHT )"
										},
										{
											"id": "308",
											"name": "GU 423LI + GU 289LN  POST WIEN"
										},
										{
											"id": "294",
											"name": "GU 451ML Englm. Stadt Ost Tour"
										},
										{
											"id": "952",
											"name": "GU 545 PE  Winkler  mur 1 mur 2"
										},
										{
											"id": "2130",
											"name": "GU 545 PE Winkler mur 1 mur 2"
										},
										{
											"id": "295",
											"name": "GU 564LK Englm. Weiz"
										},
										{
											"id": "1021",
											"name": "GU 581KC"
										},
										{
											"id": "1065",
											"name": "GU 656NE + 115KB MS Gebrüder Weiss ( Belic )"
										},
										{
											"id": "300",
											"name": "GU 692NE Winkler GU 1 ( seit 7.3.2022 )"
										},
										{
											"id": "1731",
											"name": "GU 694NE Sprinter Winkler für Kärnten"
										},
										{
											"id": "1641",
											"name": "GU 749NV + GU 145NU ( DB Schenker, Tour Salzburg )"
										},
										{
											"id": "293",
											"name": "GU  889JX Caddy"
										},
										{
											"id": "1736",
											"name": "GU 911LE 3128 + GU 296MA GLS Kapfenberg - Ansfelden"
										},
										{
											"id": "304",
											"name": "GU 926KT +  GU 292LN   H    M Linie Kärnten"
										},
										{
											"id": "1214",
											"name": "GU 933KT + GU 258MI  GLS Kapfenberg - Erding"
										},
										{
											"id": "314",
											"name": "GU DOKT2 + GU 279LJ  POST SALZBURG"
										},
										{
											"id": "2099",
											"name": "Lkw  Erding GU 688PJ.  AnH GU 185 PE"
										},
										{
											"id": "310",
											"name": "LKW GU 1FRY für Nagel Tag u Nacht"
										}
									]
								},
								{
									"id": 265,
									"name": "domestic DATA Markt- und Meinungsforschungs GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1014",
											"name": "Auto (FMB010)"
										},
										{
											"id": "908",
											"name": "Mobil (TMT250)"
										}
									]
								},
								{
									"id": 269,
									"name": "Eco Technologies GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 437,
											"name": "Eco Technologies GmbH",
											"isGroup": true,
											"children": [
												{
													"id": 453,
													"name": "ECOTEC_C220",
													"isGroup": true,
													"children": [
														{
															"id": "916",
															"name": "Mercedes C220 (FFB-ET900) Hubert Weber"
														},
														{
															"id": "1096",
															"name": "Mercedes C220 (LB-804FO) ECO - keiner Person zugeordnet"
														}
													]
												}
											]
										},
										{
											"id": "1095",
											"name": "Mercedes Vito (LB-592GF) Christian Dengg"
										}
									]
								},
								{
									"id": 197,
									"name": "Elektrotechnik Mitterwallner GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 202,
											"name": "ET-Mitterwallner intern",
											"isGroup": true,
											"children": [
												{
													"id": 231,
													"name": "ET-Mit David",
													"isGroup": true,
													"children": [
														{
															"id": "717",
															"name": "JO-149JJ"
														}
													]
												},
												{
													"id": 228,
													"name": "ET-Mit Lukas",
													"isGroup": true,
													"children": [
														{
															"id": "714",
															"name": "JO-147JJ"
														}
													]
												},
												{
													"id": 229,
													"name": "ET-Mit Michi",
													"isGroup": true,
													"children": [
														{
															"id": "718",
															"name": "JO-143JJ"
														}
													]
												},
												{
													"id": 230,
													"name": "ET-Mit Siegi",
													"isGroup": true,
													"children": [
														{
															"id": "719",
															"name": "JO-144JJ"
														}
													]
												},
												{
													"id": 232,
													"name": "ET-Mit Tarik",
													"isGroup": true,
													"children": [
														{
															"id": "593",
															"name": "JO-145JJ"
														}
													]
												},
												{
													"id": 233,
													"name": "ET-Mit Wiff",
													"isGroup": true,
													"children": [
														{
															"id": "716",
															"name": "JO-148JJ"
														}
													]
												},
												{
													"id": "715",
													"name": "MIT-FM11-Reserve"
												}
											]
										},
										{
											"id": 201,
											"name": "HWD",
											"isGroup": true,
											"children": [
												{
													"id": "587",
													"name": "1 JO-428HZ VW Transvan Helmut"
												},
												{
													"id": "582",
													"name": "2 JO-145IH VW Golf David"
												},
												{
													"id": "944",
													"name": "3 JO-184IE Peugeot Expert"
												},
												{
													"id": "583",
													"name": "4 JO-451HW Peugeot Expert Robert"
												},
												{
													"id": "592",
													"name": "5 JO-330HN Peugeot Expert Mirko/Igor"
												},
												{
													"id": "590",
													"name": "6 JO-328JF Peugeot Expert Laszlo"
												},
												{
													"id": "586",
													"name": "7 JO-643IH Peugeot Expert Zsolt/Sandor"
												},
												{
													"id": "585",
													"name": "JO-149GZ Peugeot Parntner Lilla"
												},
												{
													"id": "591",
													"name": "JO-421HA Peugeot Partner Gabi"
												},
												{
													"id": "588",
													"name": "JO-430HK Peugeot Partner Gyöngyi"
												},
												{
													"id": "589",
													"name": "JO-513HF Peugeot Partner Shpresa"
												},
												{
													"id": "584",
													"name": "Radlader Avant"
												}
											]
										},
										{
											"id": 198,
											"name": "Reiteralm Bergbahnen",
											"isGroup": true,
											"children": [
												{
													"id": 199,
													"name": "Fageralm",
													"isGroup": true,
													"children": [
														{
															"id": "562",
															"name": "Fendt Nr. 13"
														},
														{
															"id": "563",
															"name": "Skidoo Nr. 11"
														},
														{
															"id": "564",
															"name": "Skidoo Nr. 12"
														}
													]
												},
												{
													"id": 200,
													"name": "Reiteralm",
													"isGroup": true,
													"children": [
														{
															"id": "575",
															"name": "1103"
														},
														{
															"id": "578",
															"name": "1106"
														},
														{
															"id": "576",
															"name": "1107"
														},
														{
															"id": "577",
															"name": "1108"
														},
														{
															"id": "579",
															"name": "1109"
														},
														{
															"id": "580",
															"name": "1110"
														},
														{
															"id": "557",
															"name": "Gerät 01"
														},
														{
															"id": "571",
															"name": "John Deere Nr. 10"
														},
														{
															"id": "558",
															"name": "Pistengerät 0012"
														},
														{
															"id": "559",
															"name": "Pistengerät 0013"
														},
														{
															"id": "560",
															"name": "Pistengerät 0014"
														},
														{
															"id": "561",
															"name": "Pistengerät 0015"
														},
														{
															"id": "574",
															"name": "PKW 01"
														},
														{
															"id": "570",
															"name": "Quad Nr. 09"
														},
														{
															"id": "581",
															"name": "Skidoo Nr. 01"
														},
														{
															"id": "565",
															"name": "Skidoo Nr. 02"
														},
														{
															"id": "573",
															"name": "Skidoo Nr. 03"
														},
														{
															"id": "566",
															"name": "Skidoo Nr. 04"
														},
														{
															"id": "568",
															"name": "Skidoo Nr. 05"
														},
														{
															"id": "572",
															"name": "Skidoo Nr. 06"
														},
														{
															"id": "567",
															"name": "Skidoo Nr. 07"
														},
														{
															"id": "569",
															"name": "Skidoo Nr. 08"
														}
													]
												}
											]
										},
										{
											"id": "1955",
											"name": "PKW 01"
										},
										{
											"id": "1079",
											"name": "Skidoo neu"
										}
									]
								},
								{
									"id": 259,
									"name": "Elektrotechnik Nebel GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "871",
											"name": "Aqua DL 229 DW Goran Tirnanic"
										},
										{
											"id": "873",
											"name": "Aqua DL 470 DY Patrick Reinbacher"
										},
										{
											"id": "872",
											"name": "Aqua DL 664 CJ Gergö Gyulai"
										},
										{
											"id": "876",
											"name": "Aqua DL 792 CL Slobodan Marinovic"
										},
										{
											"id": "875",
											"name": "Aqua DL 868 DD Mario Kraxner"
										},
										{
											"id": "866",
											"name": "Aqua DL 894 CZ Christoph Kumpitsch"
										},
										{
											"id": "878",
											"name": "aqua DL 953 CY Franz Reinisch"
										},
										{
											"id": "879",
											"name": "Aqua San 892 DF Muhamed Arnautovic"
										},
										{
											"id": "1995",
											"name": "Aqua San DL 494 ER Bela Senyi"
										},
										{
											"id": "1996",
											"name": "Aqua San DL 495 ER Laszlo Kutasi"
										},
										{
											"id": "870",
											"name": "Aqua San DL 764 EC Zoltan Vegh"
										},
										{
											"id": "880",
											"name": "aqua san DL 912 DZ Thomas Barl"
										},
										{
											"id": "905",
											"name": "DL 719 EK Robert Muchitsch"
										},
										{
											"id": "906",
											"name": "DL 757 DY - Ewald Ladler"
										},
										{
											"id": "1994",
											"name": "DL 772 EO Siegfried Zmugg"
										},
										{
											"id": "901",
											"name": "LI 262 DJ - Christian Kreiner"
										},
										{
											"id": "904",
											"name": "LI 389 CR - Christina Zamberger"
										},
										{
											"id": "902",
											"name": "LI 422 DK - Florian Seebacher"
										}
									]
								},
								{
									"id": 205,
									"name": "Fardin Tabrizi",
									"isGroup": true,
									"children": [
										{
											"id": "605",
											"name": "3468"
										},
										{
											"id": "645",
											"name": "3909"
										},
										{
											"id": "604",
											"name": "4066"
										},
										{
											"id": "601",
											"name": "4309"
										},
										{
											"id": "603",
											"name": "4313"
										},
										{
											"id": "600",
											"name": "Deaktiv"
										},
										{
											"id": "598",
											"name": "Deaktiv"
										}
									]
								},
								{
									"id": 236,
									"name": "Franco Maier KG",
									"isGroup": true,
									"children": [
										{
											"id": 535,
											"name": "novus transporte",
											"isGroup": true,
											"children": [
												{
													"id": "725",
													"name": "GU MAI 1 Robert 2"
												}
											]
										},
										{
											"id": 237,
											"name": "Raichhart Logistik",
											"isGroup": true,
											"children": [
												{
													"id": "728",
													"name": "GU MAI 11 Damir"
												},
												{
													"id": "727",
													"name": "GU MAI 12 Franco und Michael"
												}
											]
										},
										{
											"id": "882",
											"name": "Boot"
										},
										{
											"id": "723",
											"name": "GU 444 MR Danijel"
										},
										{
											"id": "726",
											"name": "GU MAI 15 Manfred"
										},
										{
											"id": "724",
											"name": "GU MAI 2 Daniel"
										},
										{
											"id": "721",
											"name": "GU MAI 3 Kevin"
										},
										{
											"id": "720",
											"name": "GU MAI 5 Daniel"
										}
									]
								},
								{
									"id": 483,
									"name": "F. u. M. Kampel GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 520,
											"name": "KAMPEL",
											"isGroup": true,
											"children": [
												{
													"id": "1605",
													"name": "100 VW Caddy XII"
												},
												{
													"id": "815",
													"name": "101 Renault Trafic"
												},
												{
													"id": "1604",
													"name": "102 Renault Kangoo"
												},
												{
													"id": "1559",
													"name": "103 Fiat Fiorino"
												},
												{
													"id": "1558",
													"name": "104 Ford Fiesta I"
												},
												{
													"id": "813",
													"name": "105 Ford Fiesta II"
												},
												{
													"id": "1542",
													"name": "106 Ford Fiesta III"
												},
												{
													"id": "1606",
													"name": "107 Renault Clio"
												},
												{
													"id": "811",
													"name": "108 Citroen C3"
												},
												{
													"id": "1040",
													"name": "109 Renault Clio"
												},
												{
													"id": "814",
													"name": "110 Citroen C3"
												},
												{
													"id": "1530",
													"name": "111 IVECO Daily"
												},
												{
													"id": "1563",
													"name": "112 VW Caddy III"
												},
												{
													"id": "1561",
													"name": "113 VW Caddy II"
												},
												{
													"id": "1562",
													"name": "114 VW Caddy IV"
												},
												{
													"id": "1560",
													"name": "115 VW Caddy I"
												},
												{
													"id": "1565",
													"name": "116 VW Caddy V"
												},
												{
													"id": "1564",
													"name": "117 VW Caddy VI"
												},
												{
													"id": "807",
													"name": "122 Caddy VII"
												},
												{
													"id": "1620",
													"name": "127 Caddy VIII"
												},
												{
													"id": "1529",
													"name": "200 VOLVO FL"
												},
												{
													"id": "1528",
													"name": "301 MAN TGS"
												},
												{
													"id": "1539",
													"name": "303 VOLVO 750"
												},
												{
													"id": "1940",
													"name": "305 Auflieger kurz"
												},
												{
													"id": "1936",
													"name": "306 Auflieger kurz"
												},
												{
													"id": "1526",
													"name": "307 MAN TGS 4x4"
												},
												{
													"id": "1923",
													"name": "308 Auflieger kurz"
												},
												{
													"id": "1924",
													"name": "312 Auflieger kurz Bordwand"
												},
												{
													"id": "1524",
													"name": "313 Renault C440"
												},
												{
													"id": "1541",
													"name": "314 Renault T520"
												},
												{
													"id": "1532",
													"name": "334 VOLVO 460"
												},
												{
													"id": "1525",
													"name": "337 Scania 500S"
												},
												{
													"id": "1941",
													"name": "343 Auflieger lang"
												},
												{
													"id": "1922",
													"name": "344 Auflieger lang"
												},
												{
													"id": "1945",
													"name": "351 Scania R450"
												},
												{
													"id": "1615",
													"name": "400 LTM 1040-2.1"
												},
												{
													"id": "1616",
													"name": "402 LTM 1055-3.1"
												},
												{
													"id": "1611",
													"name": "403 LTM 1050-3.1"
												},
												{
													"id": "1608",
													"name": "405 LTM 1100-4.2"
												},
												{
													"id": "1607",
													"name": "406 LTM 1130-5.1"
												},
												{
													"id": "1621",
													"name": "407 LTM 1160-5.2"
												},
												{
													"id": "1609",
													"name": "408 MK 88 Plus"
												},
												{
													"id": "1533",
													"name": "409 Scania 135mto"
												},
												{
													"id": "1614",
													"name": "412 LTM 1230-5.1"
												},
												{
													"id": "1610",
													"name": "416 LTM 1350-6.1"
												},
												{
													"id": "1613",
													"name": "417 LTM 1120-4.1"
												}
											]
										},
										{
											"id": 519,
											"name": "KAMPEL Trans",
											"isGroup": true,
											"children": [
												{
													"id": "1537",
													"name": "320 VOLVO 540"
												},
												{
													"id": "1534",
													"name": "321 VOLVO 500TC"
												},
												{
													"id": "1538",
													"name": "322 - VOLVO 540"
												},
												{
													"id": "1531",
													"name": "324 Scania S580"
												},
												{
													"id": "1527",
													"name": "346 VOLVO 540 NG"
												}
											]
										},
										{
											"id": "1618",
											"name": "118 VW Caddy IX"
										},
										{
											"id": "1557",
											"name": "119 AUDI A4"
										},
										{
											"id": "1434",
											"name": "120 VW Touareg"
										},
										{
											"id": "1612",
											"name": "123 VW Tiguan"
										},
										{
											"id": "1622",
											"name": "124 VW T6"
										},
										{
											"id": "1619",
											"name": "125 VW Caddy X"
										},
										{
											"id": "1617",
											"name": "128 VW Caddy XI"
										},
										{
											"id": "2087",
											"name": "129 Skoda Octavia"
										},
										{
											"id": "1918",
											"name": "304 Semi 4 Rampe"
										},
										{
											"id": "1917",
											"name": "309 Auflieger lang"
										},
										{
											"id": "1919",
											"name": "310 Auflieger lang Bordwand"
										},
										{
											"id": "1938",
											"name": "315 Auflieger lang"
										},
										{
											"id": "1921",
											"name": "316 Auflieger lang zwangsgelenkt"
										},
										{
											"id": "1939",
											"name": "317 Auflieger lang zwangsgelenkt"
										},
										{
											"id": "1947",
											"name": "319 VOLVO 500"
										},
										{
											"id": "1914",
											"name": "336"
										},
										{
											"id": "1915",
											"name": "340 Auflieger lang zwangsgelenkt"
										},
										{
											"id": "1944",
											"name": "342 Auflieger lang"
										},
										{
											"id": "1911",
											"name": "346 Auflieger lang"
										},
										{
											"id": "2084",
											"name": "411 LTM 1060-3.1"
										},
										{
											"id": "1912",
											"name": "AUF 02"
										},
										{
											"id": "1913",
											"name": "AUF 03"
										},
										{
											"id": "1916",
											"name": "AUF 06"
										},
										{
											"id": "1910",
											"name": "AUF 08"
										},
										{
											"id": "1920",
											"name": "AUF 11"
										},
										{
											"id": "1925",
											"name": "AUF 16"
										},
										{
											"id": "1926",
											"name": "AUF 17"
										},
										{
											"id": "1927",
											"name": "AUF 18"
										},
										{
											"id": "1928",
											"name": "AUF 19"
										},
										{
											"id": "1929",
											"name": "AUF 20"
										},
										{
											"id": "1930",
											"name": "AUF 21"
										},
										{
											"id": "1931",
											"name": "AUF 22"
										},
										{
											"id": "1932",
											"name": "AUF 23"
										},
										{
											"id": "1933",
											"name": "AUF 24"
										},
										{
											"id": "1934",
											"name": "AUF 25"
										},
										{
											"id": "1935",
											"name": "AUF 26"
										},
										{
											"id": "1937",
											"name": "AUF 28"
										},
										{
											"id": "1942",
											"name": "AUF 33"
										},
										{
											"id": "1943",
											"name": "AUF 34"
										},
										{
											"id": "1540",
											"name": "LKW 15"
										},
										{
											"id": "1946",
											"name": "LKW 17"
										},
										{
											"id": "1948",
											"name": "LKW 19"
										},
										{
											"id": "1949",
											"name": "LKW 20"
										},
										{
											"id": "1950",
											"name": "LKW 21"
										},
										{
											"id": "1951",
											"name": "LKW 22"
										},
										{
											"id": "1952",
											"name": "LKW 23"
										},
										{
											"id": "1953",
											"name": "LKW 24"
										},
										{
											"id": "1954",
											"name": "LKW 25"
										},
										{
											"id": "2085",
											"name": "PKW 02"
										},
										{
											"id": "2086",
											"name": "PKW 03"
										},
										{
											"id": "2088",
											"name": "PKW 05"
										},
										{
											"id": "2089",
											"name": "PKW 06"
										},
										{
											"id": "2090",
											"name": "PKW 07"
										},
										{
											"id": "2091",
											"name": "PKW 08"
										},
										{
											"id": "2092",
											"name": "PKW 09"
										},
										{
											"id": "2093",
											"name": "PKW 10"
										}
									]
								},
								{
									"id": 216,
									"name": "Gamsjaeger GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "667",
											"name": "PKW"
										}
									]
								},
								{
									"id": 196,
									"name": "Gottinger GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "457",
											"name": "GU 210 KR  derzeit Idriz"
										},
										{
											"id": "969",
											"name": "GU 367 MZ  Nermin"
										},
										{
											"id": "555",
											"name": "GU 457 HO Ivica"
										},
										{
											"id": "553",
											"name": "GU 517 DA  Grigore kleiner Bus"
										},
										{
											"id": "1061",
											"name": "GU 648 NE Allgemeiner Schrottbus Selman ab 20.09."
										},
										{
											"id": "551",
											"name": "GU 655 KH  Grigore"
										},
										{
											"id": "1520",
											"name": "GU-773 NV Idriz"
										},
										{
											"id": "552",
											"name": "GU 894 FP Adel"
										},
										{
											"id": "550",
											"name": "GU 980 LV  Fadil"
										},
										{
											"id": "1458",
											"name": "GU 993 NO Herbert"
										}
									]
								},
								{
									"id": 452,
									"name": "Guggi Heribert",
									"isGroup": true,
									"children": [
										{
											"id": "1216",
											"name": "KIA"
										}
									]
								},
								{
									"id": 274,
									"name": "GUMAN KFZ-Technik",
									"isGroup": true,
									"children": [
										{
											"id": "1030",
											"name": "Citroën Jumper DLGUM1"
										},
										{
											"id": "2022",
											"name": "Citroën Jumper Kurz DL GUM9"
										},
										{
											"id": "984",
											"name": "FIAT Panda blau"
										},
										{
											"id": "1213",
											"name": "Opel Astra Kombi grau"
										},
										{
											"id": "1460",
											"name": "Peugeot Expert blau"
										},
										{
											"id": "704",
											"name": "Vw caddy"
										},
										{
											"id": "947",
											"name": "VW T6 9 Sitzer"
										}
									]
								},
								{
									"id": 531,
									"name": "HLW Bio GsmbH   Co KG",
									"isGroup": true,
									"children": [
										{
											"id": "1669",
											"name": "Traktor 01"
										}
									]
								},
								{
									"id": 293,
									"name": "Hösele-Lechner Haustechnik GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "974",
											"name": "DEMO"
										}
									]
								},
								{
									"id": 262,
									"name": "HQ Trockenbau GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "892",
											"name": "GU 386 MR - Kenad"
										},
										{
											"id": "1674",
											"name": "GU 401NU Ivan"
										},
										{
											"id": "891",
											"name": "GU 460 MN - Nevenko"
										},
										{
											"id": "889",
											"name": "GU 568 NF - Ivica"
										},
										{
											"id": "1073",
											"name": "GU 569 NF - Niko"
										},
										{
											"id": "893",
											"name": "GU 599 MC - Patrick"
										},
										{
											"id": "945",
											"name": "GU 719MT - Sead"
										},
										{
											"id": "890",
											"name": "GU 878 KY - Tomo"
										},
										{
											"id": "1072",
											"name": "Kaputt"
										}
									]
								},
								{
									"id": 250,
									"name": "HS Segelreisen GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 552,
											"name": "HS_Polaris",
											"isGroup": true,
											"children": [
												{
													"id": "951",
													"name": "Segelyacht - POLARIS"
												}
											]
										},
										{
											"id": "820",
											"name": "Motorboot - POLLUX"
										},
										{
											"id": "819",
											"name": "Segelyacht - MIZAR"
										},
										{
											"id": "818",
											"name": "Segelyacht - NORDSTERN"
										}
									]
								},
								{
									"id": 214,
									"name": "H & W",
									"isGroup": true,
									"children": [
										{
											"id": "664",
											"name": "LL 995RR"
										},
										{
											"id": "665",
											"name": "MD 164KU"
										},
										{
											"id": "662",
											"name": "MD 165KU"
										},
										{
											"id": "663",
											"name": "MD 166KU"
										}
									]
								},
								{
									"id": 208,
									"name": "IGH-Transport GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 209,
											"name": "IGH Transporte & Kurierdienste",
											"isGroup": true,
											"children": [
												{
													"id": "209",
													"name": "PAF-GH 74"
												},
												{
													"id": "1471",
													"name": "PAF-GH 238"
												},
												{
													"id": "634",
													"name": "PAF-GH 250"
												},
												{
													"id": "633",
													"name": "PAF-GH 350"
												},
												{
													"id": "1472",
													"name": "PAF-GH 450"
												},
												{
													"id": "632",
													"name": "PAF-GH 750"
												}
											]
										}
									]
								},
								{
									"id": 467,
									"name": "Ing. Erwin Hofstätter GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1468",
											"name": "K3 C1633"
										},
										{
											"id": "1470",
											"name": "PKW"
										}
									]
								},
								{
									"id": 235,
									"name": "Janssen2go",
									"isGroup": true,
									"children": [
										{
											"id": 329,
											"name": "Lawrence",
											"isGroup": true,
											"children": [
												{
													"id": "1016",
													"name": "CK 240 HC"
												},
												{
													"id": "1015",
													"name": "Teltonika FMB 920"
												},
												{
													"id": "1013",
													"name": "Teltonika FMB 920"
												}
											]
										},
										{
											"id": 343,
											"name": "Luis Technology GmbH",
											"isGroup": true,
											"children": [
												{
													"id": 450,
													"name": "Benedikt Thelen LUIS",
													"isGroup": true,
													"children": [
														{
															"id": "1215",
															"name": "ROW-M-3738"
														}
													]
												},
												{
													"id": 482,
													"name": "Customer Demonstration",
													"isGroup": true,
													"children": [
														{
															"id": 317,
															"name": "Stadtreinigung Hamburg",
															"isGroup": true,
															"children": [
																{
																	"id": "937",
																	"name": "HH-SR-2428"
																},
																{
																	"id": "922",
																	"name": "HH-SR-2429"
																},
																{
																	"id": "935",
																	"name": "HH-SR-2437"
																},
																{
																	"id": "925",
																	"name": "HH-SR-2479"
																},
																{
																	"id": "931",
																	"name": "HH-SR-2681"
																},
																{
																	"id": "918",
																	"name": "HH-SR-2829"
																},
																{
																	"id": "929",
																	"name": "HH-SR-3122"
																},
																{
																	"id": "936",
																	"name": "HH-SR-3164"
																}
															]
														},
														{
															"id": "1091",
															"name": "HH-LT-106"
														},
														{
															"id": "1088",
															"name": "HH-LT-146"
														},
														{
															"id": "981",
															"name": "HH-LT-218"
														},
														{
															"id": "1086",
															"name": "HH-LT-318"
														},
														{
															"id": "1388",
															"name": "HH-LT-460"
														},
														{
															"id": "977",
															"name": "HH-LT-1090"
														},
														{
															"id": "1100",
															"name": "HH-LT-217E"
														},
														{
															"id": "924",
															"name": "LUIS SMART IDENT"
														},
														{
															"id": "1092",
															"name": "NEA-LT-222"
														},
														{
															"id": "1089",
															"name": "NEA-LT-296"
														}
													]
												},
												{
													"id": 484,
													"name": "Customer Demonstration Cosmic",
													"isGroup": true,
													"children": [
														{
															"id": "1535",
															"name": "Demonstrator Cosmic"
														}
													]
												},
												{
													"id": 435,
													"name": "Digitalfunk OWL",
													"isGroup": true,
													"children": [
														{
															"id": 457,
															"name": "Kreis Minden-Lübbecke",
															"isGroup": true,
															"children": [
																{
																	"id": "1132",
																	"name": "MI-LK-7112"
																}
															]
														},
														{
															"id": 466,
															"name": "Stadt Preußisch Oldendorf",
															"isGroup": true,
															"children": [
																{
																	"id": "1467",
																	"name": "MI-PO-4011"
																}
															]
														},
														{
															"id": "1131",
															"name": "MI-TV-112"
														}
													]
												},
												{
													"id": 534,
													"name": "Duchemin AGT",
													"isGroup": true,
													"children": [
														{
															"id": "1680",
															"name": "LUIS GPS-Tracker Basic Test"
														},
														{
															"id": "1672",
															"name": "LUIS GPS-Tracker Professional Test"
														}
													]
												},
												{
													"id": 459,
													"name": "FT-Mueller",
													"isGroup": true,
													"children": [
														{
															"id": "1105",
															"name": "Testgerät"
														}
													]
												},
												{
													"id": 402,
													"name": "Giorgio Valletta LUIS",
													"isGroup": true,
													"children": [
														{
															"id": "1070",
															"name": "GI-VA-10"
														},
														{
															"id": "1071",
															"name": "GI-VA-10"
														}
													]
												},
												{
													"id": 297,
													"name": "Glaserei Sommer",
													"isGroup": true,
													"children": [
														{
															"id": "919",
															"name": "FZG 02"
														}
													]
												},
												{
													"id": 434,
													"name": "Henking Nutzfahrzeuge",
													"isGroup": true,
													"children": [
														{
															"id": "1127",
															"name": "FMC640"
														},
														{
															"id": "1129",
															"name": "NI-AH-119"
														},
														{
															"id": "1128",
															"name": "NI-AH-338"
														}
													]
												},
												{
													"id": 438,
													"name": "Hibbe Truck Service",
													"isGroup": true,
													"children": [
														{
															"id": "280",
															"name": "COE-HT-516"
														}
													]
												},
												{
													"id": 532,
													"name": "Junge Fahrzeugbau",
													"isGroup": true,
													"children": [
														{
															"id": "1671",
															"name": "JUNGE E-Bike"
														}
													]
												},
												{
													"id": 536,
													"name": "LINDE",
													"isGroup": true,
													"children": [
														{
															"id": "1688",
															"name": "Testfahrzeug 01"
														},
														{
															"id": "1689",
															"name": "Testfahrzeug 02"
														}
													]
												},
												{
													"id": 451,
													"name": "Oliver Welt LUIS",
													"isGroup": true,
													"children": [
														{
															"id": "1077",
															"name": "OL-WE-1NCE"
														},
														{
															"id": "1078",
															"name": "OL-WE-T2"
														},
														{
															"id": "1018",
															"name": "OL-WE-TRPH"
														}
													]
												},
												{
													"id": 460,
													"name": "Praxis Anke Richter-Scheer",
													"isGroup": true,
													"children": [
														{
															"id": "1362",
															"name": "Praxis Anke Richter-Scheer"
														}
													]
												},
												{
													"id": 432,
													"name": "Remondis",
													"isGroup": true,
													"children": [
														{
															"id": "1104",
															"name": "RD-RE-493"
														}
													]
												},
												{
													"id": 398,
													"name": "Tele2IoT",
													"isGroup": true,
													"children": [
														{
															"id": "1067",
															"name": "Test Vehicle"
														}
													]
												},
												{
													"id": 556,
													"name": "Test-Fahrzeuge",
													"isGroup": true,
													"children": [
														{
															"id": 558,
															"name": "Lommy",
															"isGroup": true,
															"children": [
																{
																	"id": "1858",
																	"name": "lommy"
																}
															]
														},
														{
															"id": "920",
															"name": "HH-SR-10"
														},
														{
															"id": "926",
															"name": "HH-SR-2427"
														},
														{
															"id": "923",
															"name": "HH-SR-2429"
														}
													]
												},
												{
													"id": 406,
													"name": "Werner Mehrtens LUIS",
													"isGroup": true,
													"children": [
														{
															"id": "1087",
															"name": "WE-ME-LUIS"
														}
													]
												},
												{
													"id": "1536",
													"name": "Demonstrator LKW"
												}
											]
										},
										{
											"id": "1052",
											"name": "FMB920  1NCE"
										},
										{
											"id": "1054",
											"name": "FMB920 Tele2"
										},
										{
											"id": "1053",
											"name": "FMB920 Truphone"
										},
										{
											"id": "980",
											"name": "fmb_demo_2"
										},
										{
											"id": "1094",
											"name": "Kombi 2"
										},
										{
											"id": "1969",
											"name": "Test-FMB920-NoWo"
										}
									]
								},
								{
									"id": 382,
									"name": "Jerich Austria GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 455,
											"name": "JERICH Austria LKW",
											"isGroup": true,
											"children": [
												{
													"id": 413,
													"name": "Deutschland",
													"isGroup": true,
													"children": [
														{
															"id": 416,
															"name": "Gotha",
															"isGroup": true,
															"children": [
																{
																	"id": "1144",
																	"name": "WES-J 1023"
																},
																{
																	"id": "1151",
																	"name": "WES-J 1043"
																},
																{
																	"id": "1146",
																	"name": "WES-J 1046"
																},
																{
																	"id": "1148",
																	"name": "WES-J 1047"
																},
																{
																	"id": "1147",
																	"name": "WES-J 1048"
																},
																{
																	"id": "1150",
																	"name": "WES-J 2398"
																}
															]
														},
														{
															"id": 415,
															"name": "Karlsruhe",
															"isGroup": true,
															"children": [
																{
																	"id": "1145",
																	"name": "WES-J 1016"
																},
																{
																	"id": "1180",
																	"name": "WES-J 1025"
																},
																{
																	"id": "1175",
																	"name": "WES-J 1026"
																},
																{
																	"id": "1183",
																	"name": "WES-J 1028"
																},
																{
																	"id": "1223",
																	"name": "WES-J 1251"
																},
																{
																	"id": "1219",
																	"name": "WES-J 1252"
																},
																{
																	"id": "1218",
																	"name": "WES-J 1253"
																},
																{
																	"id": "1220",
																	"name": "WES-J 1254"
																},
																{
																	"id": "1221",
																	"name": "WES-J 1255"
																},
																{
																	"id": "1222",
																	"name": "WES-J 1256"
																},
																{
																	"id": "1179",
																	"name": "WES-J 1259"
																}
															]
														},
														{
															"id": 559,
															"name": "Karlsruhe Mobil",
															"isGroup": true,
															"children": [
																{
																	"id": "1971",
																	"name": "JKM 001"
																},
																{
																	"id": "1972",
																	"name": "JKM 002"
																},
																{
																	"id": "1973",
																	"name": "JKM 003"
																},
																{
																	"id": "1974",
																	"name": "JKM 004"
																},
																{
																	"id": "1975",
																	"name": "JKM 005"
																},
																{
																	"id": "1976",
																	"name": "JKM 006"
																},
																{
																	"id": "1977",
																	"name": "JKM 007"
																},
																{
																	"id": "1978",
																	"name": "JKM 008"
																},
																{
																	"id": "1979",
																	"name": "JKM 009"
																},
																{
																	"id": "1980",
																	"name": "JKM 010"
																},
																{
																	"id": "1981",
																	"name": "JKM 011"
																},
																{
																	"id": "1982",
																	"name": "JKM 012"
																},
																{
																	"id": "1983",
																	"name": "JKM 013"
																},
																{
																	"id": "1984",
																	"name": "JKM 014"
																},
																{
																	"id": "1985",
																	"name": "JKM 015"
																},
																{
																	"id": "1644",
																	"name": "JKM 016"
																},
																{
																	"id": "1645",
																	"name": "JKM 017"
																},
																{
																	"id": "1992",
																	"name": "JKM 018"
																},
																{
																	"id": "1987",
																	"name": "JKM 019"
																},
																{
																	"id": "1988",
																	"name": "JKM 020"
																},
																{
																	"id": "1646",
																	"name": "JKM 021"
																},
																{
																	"id": "1989",
																	"name": "JKM 022"
																},
																{
																	"id": "1991",
																	"name": "JKM 023"
																},
																{
																	"id": "1986",
																	"name": "JKM 024"
																},
																{
																	"id": "1990",
																	"name": "JKM 025"
																},
																{
																	"id": "2008",
																	"name": "JKM 026"
																},
																{
																	"id": "2011",
																	"name": "JKM 027"
																},
																{
																	"id": "2010",
																	"name": "JKM 028"
																},
																{
																	"id": "2014",
																	"name": "JKM 029"
																},
																{
																	"id": "2017",
																	"name": "JKM 030"
																},
																{
																	"id": "2016",
																	"name": "JKM 031"
																},
																{
																	"id": "2018",
																	"name": "JKM 032"
																},
																{
																	"id": "2019",
																	"name": "JKM 033"
																},
																{
																	"id": "2013",
																	"name": "JKM 034"
																},
																{
																	"id": "2020",
																	"name": "JKM 035"
																},
																{
																	"id": "2015",
																	"name": "JKM 036"
																},
																{
																	"id": "2012",
																	"name": "JKM 037"
																},
																{
																	"id": "2006",
																	"name": "JKM 038"
																},
																{
																	"id": "2009",
																	"name": "JKM 039"
																},
																{
																	"id": "2007",
																	"name": "JKM 040"
																}
															]
														},
														{
															"id": 575,
															"name": "Soest",
															"isGroup": true,
															"children": [
																{
																	"id": "1166",
																	"name": "WES-J 1264"
																},
																{
																	"id": "1167",
																	"name": "WES-J 1265"
																}
															]
														},
														{
															"id": 414,
															"name": "Wesel",
															"isGroup": true,
															"children": [
																{
																	"id": 568,
																	"name": "Jerich Wesel E-Ameisen",
																	"isGroup": true,
																	"children": [
																		{
																			"id": "1997",
																			"name": "Ameise 01"
																		},
																		{
																			"id": "2026",
																			"name": "Ameise 02"
																		},
																		{
																			"id": "2027",
																			"name": "Ameise 03"
																		},
																		{
																			"id": "2028",
																			"name": "Ameise 04"
																		},
																		{
																			"id": "2029",
																			"name": "Ameise 05"
																		},
																		{
																			"id": "2030",
																			"name": "Ameise 06"
																		}
																	]
																},
																{
																	"id": 569,
																	"name": "Jerich Wesel mobil",
																	"isGroup": true,
																	"children": [
																		{
																			"id": "2034",
																			"name": "JWM 01"
																		},
																		{
																			"id": "2035",
																			"name": "JWM 02"
																		},
																		{
																			"id": "2036",
																			"name": "JWM 03"
																		},
																		{
																			"id": "2037",
																			"name": "JWM 04"
																		},
																		{
																			"id": "2038",
																			"name": "JWM 05"
																		},
																		{
																			"id": "2039",
																			"name": "JWM 06"
																		},
																		{
																			"id": "2040",
																			"name": "JWM 07"
																		},
																		{
																			"id": "2041",
																			"name": "JWM 08"
																		},
																		{
																			"id": "2042",
																			"name": "JWM 09"
																		},
																		{
																			"id": "2043",
																			"name": "JWM 10"
																		},
																		{
																			"id": "2044",
																			"name": "JWM 11"
																		},
																		{
																			"id": "2045",
																			"name": "JWM 12"
																		},
																		{
																			"id": "2046",
																			"name": "JWM 13"
																		},
																		{
																			"id": "2047",
																			"name": "JWM 14"
																		},
																		{
																			"id": "2048",
																			"name": "JWM 15"
																		},
																		{
																			"id": "2049",
																			"name": "JWM 16"
																		},
																		{
																			"id": "2050",
																			"name": "JWM 17"
																		},
																		{
																			"id": "2051",
																			"name": "JWM 18"
																		},
																		{
																			"id": "2052",
																			"name": "JWM 19"
																		},
																		{
																			"id": "2053",
																			"name": "JWM 20"
																		}
																	]
																},
																{
																	"id": "1178",
																	"name": "JE-7003"
																},
																{
																	"id": "1200",
																	"name": "WES-J641"
																},
																{
																	"id": "1649",
																	"name": "WES-J 538"
																},
																{
																	"id": "1153",
																	"name": "WES-J 539"
																},
																{
																	"id": "1169",
																	"name": "WES-J 677"
																},
																{
																	"id": "1202",
																	"name": "WES-J 1018"
																},
																{
																	"id": "1172",
																	"name": "WES-J 1021"
																},
																{
																	"id": "1165",
																	"name": "WES-J 1024"
																},
																{
																	"id": "1176",
																	"name": "WES-J 1042"
																},
																{
																	"id": "1171",
																	"name": "WES-J 1135"
																},
																{
																	"id": "1199",
																	"name": "WES-J 1136"
																},
																{
																	"id": "1201",
																	"name": "WES-J 1137"
																},
																{
																	"id": "1195",
																	"name": "WES-J 1139"
																},
																{
																	"id": "1170",
																	"name": "WES-J 1140"
																},
																{
																	"id": "1173",
																	"name": "WES-J 2347"
																},
																{
																	"id": "1152",
																	"name": "WES-J 2348"
																},
																{
																	"id": "1198",
																	"name": "WES-J 2349"
																}
															]
														}
													]
												},
												{
													"id": 418,
													"name": "Italien",
													"isGroup": true,
													"children": [
														{
															"id": 419,
															"name": "Marghera",
															"isGroup": true,
															"children": [
																{
																	"id": "1149",
																	"name": "FF-985 PM"
																},
																{
																	"id": "1138",
																	"name": "FF-986 PM"
																},
																{
																	"id": "1118",
																	"name": "FF-987 PM"
																}
															]
														}
													]
												},
												{
													"id": 567,
													"name": "Jerich Romania",
													"isGroup": true,
													"children": [
														{
															"id": "2097",
															"name": "DAF 01"
														},
														{
															"id": "2101",
															"name": "DAF 02"
														},
														{
															"id": "2103",
															"name": "DAF 03"
														},
														{
															"id": "2098",
															"name": "DAF 05"
														},
														{
															"id": "1168",
															"name": "TM-40 JER"
														},
														{
															"id": "2024",
															"name": "TM-41 JER"
														},
														{
															"id": "2025",
															"name": "TM-42 JER"
														},
														{
															"id": "2023",
															"name": "TM-43 JER"
														},
														{
															"id": "1182",
															"name": "TM-44 JER"
														}
													]
												},
												{
													"id": 544,
													"name": "Jerich UK LTD",
													"isGroup": true,
													"children": [
														{
															"id": "1957",
															"name": "DA-18GRZ"
														},
														{
															"id": "1956",
															"name": "DA-18GUO"
														},
														{
															"id": "1959",
															"name": "DA-18GVC"
														},
														{
															"id": "1958",
															"name": "DA-18GVO"
														},
														{
															"id": "1961",
															"name": "DF-18NVU"
														},
														{
															"id": "1960",
															"name": "DK-68VXJ"
														},
														{
															"id": "1781",
															"name": "GB 01"
														},
														{
															"id": "1782",
															"name": "GB 02"
														},
														{
															"id": "1783",
															"name": "GB 03"
														},
														{
															"id": "1227",
															"name": "MT-72GVA"
														},
														{
															"id": "1197",
															"name": "MT-72GVJ"
														},
														{
															"id": "1774",
															"name": "MT-72GVK"
														},
														{
															"id": "1777",
															"name": "MT-72GVL"
														},
														{
															"id": "1964",
															"name": "PE-67WJD"
														},
														{
															"id": "1965",
															"name": "PE-67WJF"
														},
														{
															"id": "1963",
															"name": "PO-18TWA"
														},
														{
															"id": "1903",
															"name": "PO-18TWD"
														},
														{
															"id": "1164",
															"name": "UK 02"
														},
														{
															"id": "1650",
															"name": "UK 04"
														},
														{
															"id": "1773",
															"name": "UK 05"
														},
														{
															"id": "1775",
															"name": "UK 07"
														},
														{
															"id": "1776",
															"name": "UK 08"
														},
														{
															"id": "1778",
															"name": "UK 10"
														},
														{
															"id": "1779",
															"name": "UK 11"
														},
														{
															"id": "1962",
															"name": "UKM 07"
														}
													]
												},
												{
													"id": 420,
													"name": "Luxembourg",
													"isGroup": true,
													"children": [
														{
															"id": 538,
															"name": "Jerich Luxembourg Auflieger",
															"isGroup": true,
															"children": [
																{
																	"id": "1679",
																	"name": "WZ-118 DE"
																},
																{
																	"id": "1712",
																	"name": "WZ-121 DE"
																},
																{
																	"id": "1710",
																	"name": "WZ-121 GE"
																},
																{
																	"id": "1704",
																	"name": "WZ-122 DE"
																},
																{
																	"id": "1709",
																	"name": "WZ-172 FM"
																},
																{
																	"id": "1707",
																	"name": "WZ-176 FM"
																},
																{
																	"id": "1708",
																	"name": "WZ-202 EZ"
																},
																{
																	"id": "1678",
																	"name": "WZ-206 EZ"
																},
																{
																	"id": "1705",
																	"name": "WZ-213 EZ"
																},
																{
																	"id": "1713",
																	"name": "WZ-214 HA"
																},
																{
																	"id": "1706",
																	"name": "WZ-235 FT"
																},
																{
																	"id": "1696",
																	"name": "WZ-237 FT"
																},
																{
																	"id": "1697",
																	"name": "WZ-297 GC"
																},
																{
																	"id": "1701",
																	"name": "WZ-298 GC"
																},
																{
																	"id": "1703",
																	"name": "WZ-319 GE"
																},
																{
																	"id": "1702",
																	"name": "WZ-320 GE"
																},
																{
																	"id": "1694",
																	"name": "WZ-329 DD"
																},
																{
																	"id": "1695",
																	"name": "WZ-428 DK"
																},
																{
																	"id": "1711",
																	"name": "WZ-430 DK"
																},
																{
																	"id": "1714",
																	"name": "WZ-AUF 02"
																},
																{
																	"id": "1715",
																	"name": "WZ-AUF 03"
																}
															]
														},
														{
															"id": 557,
															"name": "Jerich Luxembourg LKW",
															"isGroup": true,
															"children": [
																{
																	"id": "1236",
																	"name": "JE-0202"
																},
																{
																	"id": "1480",
																	"name": "JE-0203"
																},
																{
																	"id": "1230",
																	"name": "JE-0204"
																},
																{
																	"id": "1196",
																	"name": "JE-0205"
																},
																{
																	"id": "1231",
																	"name": "JE-0206"
																},
																{
																	"id": "1229",
																	"name": "JE-0208"
																},
																{
																	"id": "1235",
																	"name": "JE-0209"
																},
																{
																	"id": "1226",
																	"name": "JE-0210"
																},
																{
																	"id": "1521",
																	"name": "JE-0211"
																},
																{
																	"id": "1234",
																	"name": "JE-0213"
																},
																{
																	"id": "1700",
																	"name": "JE-0215"
																},
																{
																	"id": "1698",
																	"name": "JE-0216"
																},
																{
																	"id": "1177",
																	"name": "JE-7001"
																},
																{
																	"id": "1124",
																	"name": "WZ-J 200"
																},
																{
																	"id": "1134",
																	"name": "WZ-J 201"
																},
																{
																	"id": "1123",
																	"name": "WZ-J 202"
																},
																{
																	"id": "1160",
																	"name": "WZ-J 209"
																},
																{
																	"id": "1119",
																	"name": "WZ-J 210"
																},
																{
																	"id": "1233",
																	"name": "WZ-J 211"
																},
																{
																	"id": "1228",
																	"name": "WZ-J 212"
																},
																{
																	"id": "1224",
																	"name": "WZ-J 213"
																},
																{
																	"id": "1174",
																	"name": "WZ-J 214"
																},
																{
																	"id": "1181",
																	"name": "WZ-J 215"
																}
															]
														}
													]
												},
												{
													"id": 527,
													"name": "Magna Verschub",
													"isGroup": true,
													"children": [
														{
															"id": "1380",
															"name": "WZ-120 BT"
														}
													]
												},
												{
													"id": 411,
													"name": "Österreich",
													"isGroup": true,
													"children": [
														{
															"id": 412,
															"name": "Gleisdorf",
															"isGroup": true,
															"children": [
																{
																	"id": "1115",
																	"name": "WZ-539 EA"
																},
																{
																	"id": "1122",
																	"name": "WZ-J 101"
																},
																{
																	"id": "1162",
																	"name": "WZ-J 102"
																},
																{
																	"id": "1041",
																	"name": "WZ-J 103"
																},
																{
																	"id": "1116",
																	"name": "WZ-J 104"
																},
																{
																	"id": "1142",
																	"name": "WZ-J 105"
																},
																{
																	"id": "1156",
																	"name": "WZ-J 106"
																},
																{
																	"id": "1143",
																	"name": "WZ-J 107"
																},
																{
																	"id": "1140",
																	"name": "WZ-J 108"
																},
																{
																	"id": "1101",
																	"name": "WZ-J 109"
																},
																{
																	"id": "1113",
																	"name": "WZ-J 110"
																},
																{
																	"id": "1161",
																	"name": "WZ-J 113"
																},
																{
																	"id": "1159",
																	"name": "WZ-J 114"
																},
																{
																	"id": "1111",
																	"name": "WZ-J 115"
																},
																{
																	"id": "1157",
																	"name": "WZ-J 116"
																},
																{
																	"id": "1112",
																	"name": "WZ-J 117"
																},
																{
																	"id": "1154",
																	"name": "WZ-J 118"
																},
																{
																	"id": "1102",
																	"name": "WZ-J 119"
																},
																{
																	"id": "1135",
																	"name": "WZ-J 120"
																},
																{
																	"id": "1117",
																	"name": "WZ-J 122"
																},
																{
																	"id": "1074",
																	"name": "WZ-J 123"
																},
																{
																	"id": "1139",
																	"name": "WZ-J 124"
																},
																{
																	"id": "1158",
																	"name": "WZ-J 125"
																},
																{
																	"id": "1126",
																	"name": "WZ-J 126"
																},
																{
																	"id": "1108",
																	"name": "WZ-J 127"
																},
																{
																	"id": "1060",
																	"name": "WZ-J 128"
																},
																{
																	"id": "1137",
																	"name": "WZ-J 129"
																},
																{
																	"id": "1121",
																	"name": "WZ-J 131"
																},
																{
																	"id": "1125",
																	"name": "WZ-J 132"
																},
																{
																	"id": "1107",
																	"name": "WZ-J 133"
																},
																{
																	"id": "1120",
																	"name": "WZ-J 134"
																},
																{
																	"id": "1141",
																	"name": "WZ-J 135"
																},
																{
																	"id": "1109",
																	"name": "WZ-J 137"
																},
																{
																	"id": "1106",
																	"name": "WZ-J 138"
																},
																{
																	"id": "1114",
																	"name": "WZ-J 139"
																},
																{
																	"id": "1136",
																	"name": "WZ-J 141"
																},
																{
																	"id": "1155",
																	"name": "WZ-J 142"
																},
																{
																	"id": "1110",
																	"name": "WZ-ZUG 08"
																}
															]
														}
													]
												},
												{
													"id": "1691",
													"name": "WZ -00 13"
												}
											]
										},
										{
											"id": 387,
											"name": "Jerich Austria mobil",
											"isGroup": true,
											"children": [
												{
													"id": 454,
													"name": "Jerich France",
													"isGroup": true,
													"children": [
														{
															"id": "1238",
															"name": "Jerich France 001"
														},
														{
															"id": "1239",
															"name": "Jerich France 002"
														},
														{
															"id": "1240",
															"name": "Jerich France 003"
														},
														{
															"id": "1241",
															"name": "Jerich France 004"
														},
														{
															"id": "1242",
															"name": "Jerich France 005"
														},
														{
															"id": "1243",
															"name": "Jerich France 006"
														},
														{
															"id": "1244",
															"name": "Jerich France 007"
														},
														{
															"id": "1245",
															"name": "Jerich France 008"
														},
														{
															"id": "1246",
															"name": "Jerich France 009"
														},
														{
															"id": "1247",
															"name": "Jerich France 010"
														},
														{
															"id": "1248",
															"name": "Jerich France 011"
														},
														{
															"id": "1249",
															"name": "Jerich France 012"
														},
														{
															"id": "1250",
															"name": "Jerich France 013"
														},
														{
															"id": "1251",
															"name": "Jerich France 014"
														},
														{
															"id": "1252",
															"name": "Jerich France 015"
														},
														{
															"id": "1253",
															"name": "Jerich France 016"
														},
														{
															"id": "1254",
															"name": "Jerich France 017"
														},
														{
															"id": "1255",
															"name": "Jerich France 018"
														},
														{
															"id": "1256",
															"name": "Jerich France 019"
														},
														{
															"id": "1257",
															"name": "Jerich France 020"
														},
														{
															"id": "1258",
															"name": "Jerich France 021"
														},
														{
															"id": "1259",
															"name": "Jerich France 022"
														},
														{
															"id": "1260",
															"name": "Jerich France 023"
														},
														{
															"id": "1261",
															"name": "Jerich France 024"
														},
														{
															"id": "1262",
															"name": "Jerich France 025"
														},
														{
															"id": "1263",
															"name": "Jerich France 026"
														},
														{
															"id": "1264",
															"name": "Jerich France 027"
														},
														{
															"id": "1265",
															"name": "Jerich France 028"
														},
														{
															"id": "1266",
															"name": "Jerich France 029"
														},
														{
															"id": "1267",
															"name": "Jerich France 030"
														},
														{
															"id": "1268",
															"name": "Jerich France 031"
														},
														{
															"id": "1269",
															"name": "Jerich France 032"
														},
														{
															"id": "1270",
															"name": "Jerich France 033"
														},
														{
															"id": "1271",
															"name": "Jerich France 034"
														},
														{
															"id": "1272",
															"name": "Jerich France 035"
														},
														{
															"id": "1273",
															"name": "Jerich France 036"
														},
														{
															"id": "1274",
															"name": "Jerich France 037"
														},
														{
															"id": "1275",
															"name": "Jerich France 038"
														},
														{
															"id": "1276",
															"name": "Jerich France 039"
														},
														{
															"id": "1277",
															"name": "Jerich France 040"
														},
														{
															"id": "1278",
															"name": "Jerich France 041"
														},
														{
															"id": "1279",
															"name": "Jerich France 042"
														},
														{
															"id": "1280",
															"name": "Jerich France 043"
														},
														{
															"id": "1281",
															"name": "Jerich France 044"
														},
														{
															"id": "1282",
															"name": "Jerich France 045"
														},
														{
															"id": "1283",
															"name": "Jerich France 046"
														},
														{
															"id": "1284",
															"name": "Jerich France 047"
														},
														{
															"id": "1285",
															"name": "Jerich France 048"
														},
														{
															"id": "1286",
															"name": "Jerich France 049"
														},
														{
															"id": "1287",
															"name": "Jerich France 050"
														},
														{
															"id": "1288",
															"name": "Jerich France 051"
														},
														{
															"id": "1289",
															"name": "Jerich France 052"
														},
														{
															"id": "1290",
															"name": "Jerich France 053"
														},
														{
															"id": "1291",
															"name": "Jerich France 054"
														},
														{
															"id": "1292",
															"name": "Jerich France 055"
														},
														{
															"id": "1293",
															"name": "Jerich France 056"
														},
														{
															"id": "1294",
															"name": "Jerich France 057"
														},
														{
															"id": "1295",
															"name": "Jerich France 058"
														},
														{
															"id": "1296",
															"name": "Jerich France 059"
														},
														{
															"id": "1297",
															"name": "Jerich France 060"
														},
														{
															"id": "1298",
															"name": "Jerich France 061"
														},
														{
															"id": "1299",
															"name": "Jerich France 062"
														},
														{
															"id": "1300",
															"name": "Jerich France 063"
														},
														{
															"id": "1301",
															"name": "Jerich France 064"
														},
														{
															"id": "1302",
															"name": "Jerich France 065"
														},
														{
															"id": "1303",
															"name": "Jerich France 066"
														},
														{
															"id": "1304",
															"name": "Jerich France 067"
														},
														{
															"id": "1305",
															"name": "Jerich France 068"
														},
														{
															"id": "1306",
															"name": "Jerich France 069"
														},
														{
															"id": "1307",
															"name": "Jerich France 070"
														},
														{
															"id": "1308",
															"name": "Jerich France 071"
														},
														{
															"id": "1309",
															"name": "Jerich France 072"
														},
														{
															"id": "1310",
															"name": "Jerich France 073"
														},
														{
															"id": "1311",
															"name": "Jerich France 074"
														},
														{
															"id": "1312",
															"name": "Jerich France 075"
														},
														{
															"id": "1313",
															"name": "Jerich France 076"
														},
														{
															"id": "1314",
															"name": "Jerich France 077"
														},
														{
															"id": "1315",
															"name": "Jerich France 078"
														},
														{
															"id": "1316",
															"name": "Jerich France 079"
														},
														{
															"id": "1317",
															"name": "Jerich France 080"
														},
														{
															"id": "1318",
															"name": "Jerich France 081"
														},
														{
															"id": "1319",
															"name": "Jerich France 082"
														},
														{
															"id": "1320",
															"name": "Jerich France 083"
														},
														{
															"id": "1321",
															"name": "Jerich France 084"
														},
														{
															"id": "1322",
															"name": "Jerich France 085"
														},
														{
															"id": "1323",
															"name": "Jerich France 086"
														},
														{
															"id": "1324",
															"name": "Jerich France 087"
														},
														{
															"id": "1325",
															"name": "Jerich France 088"
														},
														{
															"id": "1326",
															"name": "Jerich France 089"
														},
														{
															"id": "1327",
															"name": "Jerich France 090"
														},
														{
															"id": "1328",
															"name": "Jerich France 091"
														},
														{
															"id": "1329",
															"name": "Jerich France 092"
														},
														{
															"id": "1330",
															"name": "Jerich France 093"
														},
														{
															"id": "1331",
															"name": "Jerich France 094"
														},
														{
															"id": "1332",
															"name": "Jerich France 095"
														},
														{
															"id": "1333",
															"name": "Jerich France 096"
														},
														{
															"id": "1334",
															"name": "Jerich France 097"
														},
														{
															"id": "1335",
															"name": "Jerich France 098"
														},
														{
															"id": "1336",
															"name": "Jerich France 099"
														},
														{
															"id": "1337",
															"name": "Jerich France 100"
														},
														{
															"id": "1338",
															"name": "Jerich France 101"
														},
														{
															"id": "1339",
															"name": "Jerich France 102"
														},
														{
															"id": "1340",
															"name": "Jerich France 103"
														},
														{
															"id": "1341",
															"name": "Jerich France 104"
														},
														{
															"id": "1342",
															"name": "Jerich France 105"
														},
														{
															"id": "1401",
															"name": "Jerich France 106"
														},
														{
															"id": "1402",
															"name": "Jerich France 107"
														},
														{
															"id": "1403",
															"name": "Jerich France 108"
														},
														{
															"id": "1404",
															"name": "Jerich France 109"
														},
														{
															"id": "1405",
															"name": "Jerich France 110"
														},
														{
															"id": "1406",
															"name": "Jerich France 111"
														},
														{
															"id": "1407",
															"name": "Jerich France 112"
														},
														{
															"id": "1408",
															"name": "Jerich France 113"
														},
														{
															"id": "1409",
															"name": "Jerich France 114"
														},
														{
															"id": "1410",
															"name": "Jerich France 115"
														},
														{
															"id": "1411",
															"name": "Jerich France 116"
														},
														{
															"id": "1412",
															"name": "Jerich France 117"
														},
														{
															"id": "1413",
															"name": "Jerich France 118"
														},
														{
															"id": "1414",
															"name": "Jerich France 119"
														},
														{
															"id": "1415",
															"name": "Jerich France 120"
														},
														{
															"id": "2067",
															"name": "Jerich France 121"
														},
														{
															"id": "2068",
															"name": "Jerich France 122"
														},
														{
															"id": "2069",
															"name": "Jerich France 123"
														},
														{
															"id": "2070",
															"name": "Jerich France 124"
														},
														{
															"id": "2071",
															"name": "Jerich France 125"
														},
														{
															"id": "2072",
															"name": "Jerich France 126"
														},
														{
															"id": "2073",
															"name": "Jerich France 127"
														},
														{
															"id": "2074",
															"name": "Jerich France 128"
														},
														{
															"id": "2075",
															"name": "Jerich France 129"
														},
														{
															"id": "2076",
															"name": "Jerich France 130"
														},
														{
															"id": "2077",
															"name": "Jerich France 131"
														},
														{
															"id": "2078",
															"name": "Jerich France 132"
														},
														{
															"id": "2079",
															"name": "Jerich France 134"
														},
														{
															"id": "2080",
															"name": "Jerich France 135"
														},
														{
															"id": "2081",
															"name": "Jerich France 136"
														},
														{
															"id": "2082",
															"name": "Jerich France 137"
														},
														{
															"id": "2083",
															"name": "Jerich France 138"
														},
														{
															"id": "2104",
															"name": "Jerich France 139"
														},
														{
															"id": "2105",
															"name": "Jerich France 140"
														},
														{
															"id": "2106",
															"name": "Jerich France 141"
														},
														{
															"id": "2107",
															"name": "Jerich France 142"
														},
														{
															"id": "2108",
															"name": "Jerich France 143"
														},
														{
															"id": "2109",
															"name": "Jerich France 144"
														},
														{
															"id": "2110",
															"name": "Jerich France 145"
														},
														{
															"id": "2111",
															"name": "Jerich France 146"
														},
														{
															"id": "2112",
															"name": "Jerich France 147"
														},
														{
															"id": "2113",
															"name": "Jerich France 148"
														},
														{
															"id": "2114",
															"name": "Jerich France 149"
														},
														{
															"id": "2115",
															"name": "Jerich France 150"
														}
													]
												}
											]
										},
										{
											"id": "2062",
											"name": "Jerich France 133"
										}
									]
								},
								{
									"id": 562,
									"name": "JERICH ITALY s.r.l.",
									"isGroup": true,
									"children": [
										{
											"id": "1469",
											"name": "CB-289 ML"
										},
										{
											"id": "1787",
											"name": "DG-691 MX"
										},
										{
											"id": "1792",
											"name": "FB-950 DN"
										},
										{
											"id": "1789",
											"name": "FK-744 SN"
										},
										{
											"id": "1791",
											"name": "FV-087 KB"
										},
										{
											"id": "1788",
											"name": "JERITALY6"
										},
										{
											"id": "1793",
											"name": "JERITALY7"
										},
										{
											"id": "1790",
											"name": "JERITALY8"
										}
									]
								},
								{
									"id": 553,
									"name": "JERRY-Trans",
									"isGroup": true,
									"children": [
										{
											"id": "1860",
											"name": "OP 4365G"
										},
										{
											"id": "1865",
											"name": "WA 92742"
										},
										{
											"id": "1861",
											"name": "WA 0410F"
										},
										{
											"id": "1862",
											"name": "WA 1616F"
										},
										{
											"id": "1863",
											"name": "WA 2440C"
										},
										{
											"id": "1864",
											"name": "WA 8705A"
										},
										{
											"id": "1866",
											"name": "WB 5532M"
										},
										{
											"id": "1868",
											"name": "WGM 55320"
										},
										{
											"id": "1869",
											"name": "WGM 56150"
										},
										{
											"id": "1870",
											"name": "WGM 56151"
										},
										{
											"id": "1871",
											"name": "WGM 56154"
										},
										{
											"id": "1872",
											"name": "WGM 56155"
										},
										{
											"id": "1873",
											"name": "WGM 56721"
										},
										{
											"id": "1874",
											"name": "WGM 59490"
										},
										{
											"id": "1875",
											"name": "WGM 59557"
										},
										{
											"id": "1876",
											"name": "WGM 73871"
										},
										{
											"id": "1879",
											"name": "WGM 84610"
										},
										{
											"id": "1880",
											"name": "WGM 90016"
										},
										{
											"id": "1883",
											"name": "WGM 97608"
										},
										{
											"id": "1884",
											"name": "WGM 97609"
										},
										{
											"id": "1867",
											"name": "WGM 4808C"
										},
										{
											"id": "1877",
											"name": "WGM 7795C"
										},
										{
											"id": "1878",
											"name": "WGM 7819A"
										},
										{
											"id": "1881",
											"name": "WGM 9586C"
										},
										{
											"id": "1882",
											"name": "WGM 9690A"
										},
										{
											"id": "1885",
											"name": "WU 4609M"
										},
										{
											"id": "1886",
											"name": "WU 6456F"
										},
										{
											"id": "1887",
											"name": "WU 6457F"
										},
										{
											"id": "1888",
											"name": "WZ 0602W"
										},
										{
											"id": "1889",
											"name": "WZ 0603W"
										},
										{
											"id": "1890",
											"name": "WZ 0604W"
										},
										{
											"id": "1891",
											"name": "WZ 0605W"
										},
										{
											"id": "1892",
											"name": "WZ 4330Y"
										}
									]
								},
								{
									"id": 319,
									"name": "J. Kern Transporte",
									"isGroup": true,
									"children": [
										{
											"id": "1010",
											"name": "PKW-Walzen Anhänger"
										},
										{
											"id": "1055",
											"name": "SO STOA 3"
										},
										{
											"id": "1066",
											"name": "Takeuchi TB250"
										},
										{
											"id": "1367",
											"name": "Tandem Tieflader groß"
										}
									]
								},
								{
									"id": 463,
									"name": "Josef Rath GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1368",
											"name": "PKW 01"
										}
									]
								},
								{
									"id": 176,
									"name": "J. und W. Roessler Gesellschaft m.b.H.",
									"isGroup": true,
									"children": [
										{
											"id": "319",
											"name": "LKW 03"
										},
										{
											"id": "321",
											"name": "LKW 04"
										},
										{
											"id": "327",
											"name": "LKW 05"
										},
										{
											"id": "324",
											"name": "LKW 06"
										},
										{
											"id": "325",
											"name": "LKW 07"
										},
										{
											"id": "326",
											"name": "LKW 08"
										},
										{
											"id": "322",
											"name": "LKW 09"
										},
										{
											"id": "331",
											"name": "LKW 11"
										},
										{
											"id": "337",
											"name": "LKW 12"
										},
										{
											"id": "338",
											"name": "LKW 13"
										},
										{
											"id": "340",
											"name": "LKW 14"
										},
										{
											"id": "329",
											"name": "LKW 15"
										},
										{
											"id": "332",
											"name": "LKW 16"
										},
										{
											"id": "342",
											"name": "LKW 17"
										},
										{
											"id": "334",
											"name": "LKW 18"
										},
										{
											"id": "341",
											"name": "LKW 19"
										},
										{
											"id": "335",
											"name": "LKW 20"
										},
										{
											"id": "343",
											"name": "LKW 21"
										},
										{
											"id": "344",
											"name": "LKW 22"
										},
										{
											"id": "345",
											"name": "LKW 23"
										},
										{
											"id": "323",
											"name": "LKW 25"
										},
										{
											"id": "320",
											"name": "LKW 26"
										},
										{
											"id": "317",
											"name": "LKW 27"
										},
										{
											"id": "336",
											"name": "LKW 28"
										},
										{
											"id": "333",
											"name": "LKW 29"
										},
										{
											"id": "328",
											"name": "LKW 30"
										},
										{
											"id": "346",
											"name": "LKW 32"
										},
										{
											"id": "330",
											"name": "LKW 33"
										},
										{
											"id": "1085",
											"name": "LKW 34"
										},
										{
											"id": "318",
											"name": "LKW 35"
										},
										{
											"id": "316",
											"name": "LKW 36"
										},
										{
											"id": "1206",
											"name": "LKW 37"
										},
										{
											"id": "1518",
											"name": "LKW 38"
										},
										{
											"id": "339",
											"name": "Relax"
										}
									]
								},
								{
									"id": 545,
									"name": "KFZ Lorch",
									"isGroup": true,
									"children": [
										{
											"id": "1759",
											"name": "Isuzu IL-739NM"
										},
										{
											"id": "1761",
											"name": "LKW 01"
										},
										{
											"id": "1762",
											"name": "LKW 02"
										},
										{
											"id": "1760",
											"name": "VW T5,  IL-121NB"
										}
									]
								},
								{
									"id": 256,
									"name": "KFZ TEMMEL",
									"isGroup": true,
									"children": [
										{
											"id": "846",
											"name": "KFZ TEMMEL"
										},
										{
											"id": "847",
											"name": "KFZ TEMMEL 02"
										}
									]
								},
								{
									"id": 282,
									"name": "KFZ Zirngast",
									"isGroup": true,
									"children": [
										{
											"id": "2005",
											"name": "Actros LB KFZ1"
										},
										{
											"id": "962",
											"name": "ATEGO LB HELP 1"
										},
										{
											"id": "1194",
											"name": "Audi A1 LB 841 EI"
										},
										{
											"id": "1069",
											"name": "Daily LB KFZ 4"
										},
										{
											"id": "961",
											"name": "Daily LB KFZ 5"
										},
										{
											"id": "960",
											"name": "Seat Altea LB 115 FX"
										},
										{
											"id": "958",
											"name": "Seat Ibiza LB 325 FZ"
										},
										{
											"id": "959",
											"name": "VW Golf LB 475 FZ"
										},
										{
											"id": "957",
											"name": "VW Golf LB 603 FL"
										},
										{
											"id": "705",
											"name": "VW Passat LB 124 FX"
										}
									]
								},
								{
									"id": 468,
									"name": "K   K Poolworld",
									"isGroup": true,
									"children": [
										{
											"id": "1473",
											"name": "PKW 01"
										},
										{
											"id": "1474",
											"name": "PKW 02 peugeot"
										}
									]
								},
								{
									"id": 244,
									"name": "Kleinbau Markus Fuchs",
									"isGroup": true,
									"children": [
										{
											"id": "681",
											"name": "PKW"
										}
									]
								},
								{
									"id": 473,
									"name": "Koman GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1907",
											"name": "BM-116EW"
										},
										{
											"id": "1490",
											"name": "BM-230EP"
										},
										{
											"id": "1684",
											"name": "BM-288GB"
										},
										{
											"id": "1487",
											"name": "BM-439DA"
										},
										{
											"id": "1489",
											"name": "BM-440DA"
										},
										{
											"id": "1683",
											"name": "BM-535GJ"
										},
										{
											"id": "1482",
											"name": "BM-KO101"
										},
										{
											"id": "1486",
											"name": "BM-KO102"
										},
										{
											"id": "1488",
											"name": "BM-KO104"
										},
										{
											"id": "1906",
											"name": "MB Sprinter"
										},
										{
											"id": "2031",
											"name": "PKW 01"
										},
										{
											"id": "2032",
											"name": "PKW 02"
										},
										{
											"id": "2033",
											"name": "PKW 03"
										}
									]
								},
								{
									"id": 180,
									"name": "Leitner Franz Transport GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 181,
											"name": "Lidl",
											"isGroup": true,
											"children": [
												{
													"id": "404",
													"name": "VO 2FXH"
												},
												{
													"id": "403",
													"name": "VO 4IRJ"
												},
												{
													"id": "402",
													"name": "VO 6DEC"
												}
											]
										},
										{
											"id": "911",
											"name": "Ex vo 510 cb"
										},
										{
											"id": "461",
											"name": "LKW 20"
										},
										{
											"id": "554",
											"name": "LKW 21"
										},
										{
											"id": "456",
											"name": "LKW 22"
										},
										{
											"id": "204",
											"name": "LKW 23"
										},
										{
											"id": "821",
											"name": "LKW 24"
										},
										{
											"id": "912",
											"name": "LKW 26"
										},
										{
											"id": "913",
											"name": "LKW 27"
										},
										{
											"id": "914",
											"name": "LKW 28"
										},
										{
											"id": "685",
											"name": "VO 245DL"
										},
										{
											"id": "686",
											"name": "VO 246DL"
										},
										{
											"id": "684",
											"name": "VO 247DL"
										},
										{
											"id": "405",
											"name": "VO 2 KYG"
										},
										{
											"id": "399",
											"name": "VO 3 KYE"
										},
										{
											"id": "398",
											"name": "VO 510 CB"
										},
										{
											"id": "400",
											"name": "VO 6 HJI"
										},
										{
											"id": "687",
											"name": "VO 971DJ"
										},
										{
											"id": "688",
											"name": "VO 972DJ"
										},
										{
											"id": "683",
											"name": "VO 973 DJ"
										},
										{
											"id": "689",
											"name": "VO 974DJ"
										},
										{
											"id": "910",
											"name": "VO 975 DJ"
										},
										{
											"id": "690",
											"name": "VO 975DJ"
										},
										{
											"id": "691",
											"name": "VO 976DJ"
										},
										{
											"id": "692",
											"name": "VO 977DJ"
										}
									]
								},
								{
									"id": 27,
									"name": "LTP-Primo GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 227,
											"name": "LTP-Primo-Service",
											"isGroup": true,
											"children": [
												{
													"id": "696",
													"name": "LKW 10  Marcel"
												},
												{
													"id": "694",
													"name": "LKW 14 neu"
												},
												{
													"id": "682",
													"name": "Marcel"
												}
											]
										},
										{
											"id": "23",
											"name": "LKW 11 neu"
										}
									]
								},
								{
									"id": 211,
									"name": "Marcic Transporte",
									"isGroup": true,
									"children": [
										{
											"id": "653",
											"name": "LKW08"
										},
										{
											"id": "955",
											"name": "LKW09"
										},
										{
											"id": "2100",
											"name": "LKW Tacho"
										},
										{
											"id": "954",
											"name": "SJY165"
										},
										{
											"id": "647",
											"name": "STH097"
										},
										{
											"id": "651",
											"name": "W5023GT"
										},
										{
											"id": "652",
											"name": "W5026GT"
										},
										{
											"id": "649",
											"name": "W6466GT"
										},
										{
											"id": "648",
											"name": "W6489GT"
										},
										{
											"id": "1394",
											"name": "W8730GT"
										}
									]
								},
								{
									"id": 529,
									"name": "Marktgemeinde Deutschfeistritz",
									"isGroup": true,
									"children": [
										{
											"id": "1726",
											"name": "E-Auto Schule"
										},
										{
											"id": "1725",
											"name": "Ford Ranger"
										},
										{
											"id": "1657",
											"name": "Holder"
										},
										{
											"id": "1653",
											"name": "John Deere 6320"
										},
										{
											"id": "1654",
											"name": "John Deere 6115 R"
										},
										{
											"id": "1655",
											"name": "John Deere Kläre"
										},
										{
											"id": "1652",
											"name": "John Deere Schule"
										},
										{
											"id": "1656",
											"name": "LKW MAN TGS"
										},
										{
											"id": "1723",
											"name": "Mitsubishi L200"
										},
										{
											"id": "1724",
											"name": "Renault Trafic"
										}
									]
								},
								{
									"id": 399,
									"name": "Mild Haustechnik GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1068",
											"name": "PKW"
										}
									]
								},
								{
									"id": 539,
									"name": "Moz-Glas e.U.",
									"isGroup": true,
									"children": [
										{
											"id": "1717",
											"name": "PKW 01"
										}
									]
								},
								{
									"id": 207,
									"name": "Neuco GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "626",
											"name": "Baggeranhänger, LB-395 GD"
										},
										{
											"id": "625",
											"name": "Grüner Dumper klein, LB-393 GD"
										},
										{
											"id": "629",
											"name": "Hari, LB-489 GC"
										},
										{
											"id": "630",
											"name": "Marko, LB-775 GF"
										},
										{
											"id": "1372",
											"name": "Miha, LB-513 GL"
										},
										{
											"id": "627",
											"name": "Pritsche lang, LB-684 GM"
										},
										{
											"id": "887",
											"name": "Pritsche, LB_773 GF"
										},
										{
											"id": "1739",
											"name": "Riccardo_LB-774 GF"
										}
									]
								},
								{
									"id": 373,
									"name": "numotion",
									"isGroup": true,
									"children": [
										{
											"id": 574,
											"name": "Produktion und Rennen",
											"isGroup": true,
											"children": [
												{
													"id": 571,
													"name": "Produktion",
													"isGroup": true,
													"children": [
														{
															"id": "2060",
															"name": "DROHNE"
														},
														{
															"id": "2057",
															"name": "Kamera AVI 1"
														},
														{
															"id": "2056",
															"name": "Kamera AVI 2"
														},
														{
															"id": "2058",
															"name": "Kamera AVI 3"
														},
														{
															"id": "2059",
															"name": "Kamera AVI 4"
														},
														{
															"id": "2061",
															"name": "Kamera AVI 5"
														}
													]
												},
												{
													"id": 573,
													"name": "Rennen",
													"isGroup": true,
													"children": [
														{
															"id": "2054",
															"name": "SCHLUSSFAHRZEUG"
														},
														{
															"id": "2055",
															"name": "SPITZENGRUPPE"
														}
													]
												}
											]
										},
										{
											"id": "2063",
											"name": "LED WALL TRAILER"
										}
									]
								},
								{
									"id": 564,
									"name": "Oswald Lukas",
									"isGroup": true,
									"children": [
										{
											"id": "2000",
											"name": "Motorrad"
										}
									]
								},
								{
									"id": 561,
									"name": "OVT LOGISTICZENTRUM s.r.l.",
									"isGroup": true,
									"children": [
										{
											"id": "1786",
											"name": "SJ-50 WIP"
										},
										{
											"id": "1765",
											"name": "SJ-51 VIP"
										},
										{
											"id": "1780",
											"name": "SJ-52 VIP"
										},
										{
											"id": "1647",
											"name": "SJ-52 VYP"
										},
										{
											"id": "1784",
											"name": "SJ-64 VIP"
										},
										{
											"id": "1203",
											"name": "SJ-64 VYP"
										}
									]
								},
								{
									"id": 292,
									"name": "PAPPAS",
									"isGroup": true,
									"children": [
										{
											"id": 436,
											"name": "PAPPA LKW",
											"isGroup": true,
											"children": [
												{
													"id": "970",
													"name": "G-917GZ"
												}
											]
										},
										{
											"id": "973",
											"name": "PAPPAS 01"
										}
									]
								},
								{
									"id": 23,
									"name": "perfect-tracking Lager",
									"isGroup": true,
									"children": [
										{
											"id": "1498",
											"name": "ADRIATIC QUEEN"
										},
										{
											"id": "1908",
											"name": "AUF 01"
										},
										{
											"id": "2117",
											"name": "AUF 10"
										},
										{
											"id": "2118",
											"name": "AUF 11"
										},
										{
											"id": "2119",
											"name": "AUF 12"
										},
										{
											"id": "2120",
											"name": "AUF 13"
										},
										{
											"id": "2121",
											"name": "AUF 14"
										},
										{
											"id": "2122",
											"name": "AUF 15"
										},
										{
											"id": "2123",
											"name": "AUF 16"
										},
										{
											"id": "2124",
											"name": "AUF 17"
										},
										{
											"id": "2125",
											"name": "AUF 18"
										},
										{
											"id": "2126",
											"name": "AUF 19"
										},
										{
											"id": "2127",
											"name": "AUF 20"
										},
										{
											"id": "2128",
											"name": "AUF 21"
										},
										{
											"id": "381",
											"name": "BAV 37 NAIADE"
										},
										{
											"id": "2135",
											"name": "Beacon_Demo"
										},
										{
											"id": "1436",
											"name": "ex_DL-645 ES"
										},
										{
											"id": "1437",
											"name": "ex_DL-656 ES"
										},
										{
											"id": "1692",
											"name": "FBR DEMO"
										},
										{
											"id": "556",
											"name": "GU 181 KA  Abgemeldet SEAT"
										},
										{
											"id": "289",
											"name": "GU  584LP Englmayer Graz-Ost"
										},
										{
											"id": "287",
											"name": "GU 591NM 2.4.2021 ( ex 550JP ) WINKLER Himberg"
										},
										{
											"id": "301",
											"name": "GU 911LE  3128 + GU 296MA GLS Kapfenberg - Ansfelden"
										},
										{
											"id": "1993",
											"name": "Hüttis in Italien"
										},
										{
											"id": "86",
											"name": "JASMINE"
										},
										{
											"id": "2021",
											"name": "Jerich France 115 2"
										},
										{
											"id": "628",
											"name": "kaputt_LB-774 GF"
										},
										{
											"id": "2094",
											"name": "LKW 01"
										},
										{
											"id": "2095",
											"name": "LKW 02"
										},
										{
											"id": "2096",
											"name": "LKW 03"
										},
										{
											"id": "2102",
											"name": "LKW 09"
										},
										{
											"id": "1729",
											"name": "LKW Tacho"
										},
										{
											"id": "1763",
											"name": "Lommy Capture 32"
										},
										{
											"id": "83",
											"name": "MOJE"
										},
										{
											"id": "1358",
											"name": "SEEADLER"
										},
										{
											"id": "1734",
											"name": "TAT_100"
										},
										{
											"id": "1733",
											"name": "TAT_100"
										},
										{
											"id": "1204",
											"name": "T_FMP100"
										},
										{
											"id": "1756",
											"name": "who am i"
										},
										{
											"id": "2066",
											"name": "who am i"
										},
										{
											"id": "2065",
											"name": "who am i"
										},
										{
											"id": "2064",
											"name": "who am i"
										},
										{
											"id": "1764",
											"name": "who am i"
										},
										{
											"id": "1232",
											"name": "who am i"
										}
									]
								},
								{
									"id": 462,
									"name": "Pirker Transport GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 551,
											"name": "Werkstatt",
											"isGroup": true,
											"children": [
												{
													"id": "1859",
													"name": "Werkstattbus VW T5"
												}
											]
										},
										{
											"id": "1451",
											"name": "DL-103 DW"
										},
										{
											"id": "1453",
											"name": "DL-112 BA"
										},
										{
											"id": "1447",
											"name": "DL-127 DO"
										},
										{
											"id": "1435",
											"name": "DL-146 CV"
										},
										{
											"id": "1450",
											"name": "DL-190 DJ"
										},
										{
											"id": "1475",
											"name": "DL-260 DJ"
										},
										{
											"id": "1365",
											"name": "DL-286 ES"
										},
										{
											"id": "1364",
											"name": "DL-290 ES"
										},
										{
											"id": "1449",
											"name": "DL-324 BK"
										},
										{
											"id": "1448",
											"name": "DL-386 CC"
										},
										{
											"id": "1438",
											"name": "DL-387 CC"
										},
										{
											"id": "1440",
											"name": "DL-573 EL"
										},
										{
											"id": "1442",
											"name": "DL-574 EL"
										},
										{
											"id": "1446",
											"name": "DL-586 EL"
										},
										{
											"id": "1444",
											"name": "DL-637 DJ"
										},
										{
											"id": "1476",
											"name": "DL-689 DT"
										},
										{
											"id": "1462",
											"name": "DL-794 BZ"
										},
										{
											"id": "1464",
											"name": "DL-803 EC"
										},
										{
											"id": "1454",
											"name": "DL-807 EH"
										},
										{
											"id": "1439",
											"name": "DL-808 EH"
										},
										{
											"id": "1466",
											"name": "DL-819 EC"
										},
										{
											"id": "1443",
											"name": "DL-837 DE"
										},
										{
											"id": "1463",
											"name": "DL-852 EG"
										},
										{
											"id": "1445",
											"name": "DL-875EU"
										},
										{
											"id": "1452",
											"name": "DL-913 DP"
										},
										{
											"id": "1441",
											"name": "DL-969 EK"
										},
										{
											"id": "1465",
											"name": "DL-971 CT"
										}
									]
								},
								{
									"id": 301,
									"name": "Powoden Bau GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1081",
											"name": "Ford Transit"
										},
										{
											"id": "1499",
											"name": "LKW 01"
										},
										{
											"id": "983",
											"name": "MAN TGE"
										},
										{
											"id": "1084",
											"name": "MB Sprinter LB868FI"
										},
										{
											"id": "1673",
											"name": "PKW"
										},
										{
											"id": "2129",
											"name": "PKW neu"
										},
										{
											"id": "1225",
											"name": "S-LKW"
										},
										{
											"id": "1495",
											"name": "Sprinter Allrad LB726GA"
										},
										{
											"id": "1493",
											"name": "Sprinter Reimi LB 521FK"
										},
										{
											"id": "1082",
											"name": "U530"
										},
										{
											"id": "1494",
											"name": "VW Crafter LB 671GM"
										},
										{
											"id": "1492",
											"name": "VW T5 LB996GE"
										}
									]
								},
								{
									"id": 578,
									"name": "Prattes Domenik",
									"isGroup": true,
									"children": [
										{
											"id": "2116",
											"name": "Jeep"
										}
									]
								},
								{
									"id": 160,
									"name": "Quaxi Taxi",
									"isGroup": true,
									"children": [
										{
											"id": "245",
											"name": "Eri 01"
										},
										{
											"id": "256",
											"name": "Eri 02"
										},
										{
											"id": "252",
											"name": "Eri 03"
										},
										{
											"id": "255",
											"name": "Eri 04"
										},
										{
											"id": "251",
											"name": "Eri 05"
										},
										{
											"id": "249",
											"name": "Eri 06"
										},
										{
											"id": "257",
											"name": "Eri 07"
										},
										{
											"id": "254",
											"name": "Eri 09"
										},
										{
											"id": "244",
											"name": "Eri 10"
										},
										{
											"id": "247",
											"name": "Eri 11"
										},
										{
											"id": "253",
											"name": "Eri 12"
										},
										{
											"id": "248",
											"name": "Eri 15"
										},
										{
											"id": "246",
											"name": "Eri 16"
										},
										{
											"id": "258",
											"name": "Eri 17"
										},
										{
											"id": "1716",
											"name": "ERI 08"
										},
										{
											"id": "1718",
											"name": "ERI 14"
										},
										{
											"id": "250",
											"name": "VIP 01"
										}
									]
								},
								{
									"id": 155,
									"name": "Resch Helmut",
									"isGroup": true,
									"children": [
										{
											"id": "484",
											"name": "G 344 TI - Perfect Tracking Resch"
										}
									]
								},
								{
									"id": 442,
									"name": "Resch Michaela",
									"isGroup": true,
									"children": [
										{
											"id": "119",
											"name": "LB 565 CS"
										}
									]
								},
								{
									"id": 24,
									"name": "Resch Transporte GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 537,
											"name": "Resch Demo",
											"isGroup": true,
											"children": [
												{
													"id": "214",
													"name": "LB RT 24"
												},
												{
													"id": "227",
													"name": "LB RT 33"
												},
												{
													"id": "1163",
													"name": "LB RT 34 Simon Stamper"
												}
											]
										},
										{
											"id": 234,
											"name": "Resch Transporte GmbH Sattel",
											"isGroup": true,
											"children": [
												{
													"id": "4",
													"name": "LB 388 FI Marco"
												},
												{
													"id": "5",
													"name": "LB 447 ES Hubert"
												},
												{
													"id": "6",
													"name": "LB 449 ES Robert"
												},
												{
													"id": "8",
													"name": "LB 909 FB Raimund"
												},
												{
													"id": "11",
													"name": "LB RT 800 Patrick"
												}
											]
										},
										{
											"id": "24",
											"name": "LB 286FT Gerhard"
										},
										{
											"id": "228",
											"name": "LB 387 FI Michi"
										},
										{
											"id": "203",
											"name": "LB 890 EX"
										},
										{
											"id": "964",
											"name": "LB RT 2"
										},
										{
											"id": "1648",
											"name": "LB RT 03"
										},
										{
											"id": "1133",
											"name": "LB RT 4"
										},
										{
											"id": "213",
											"name": "LB RT 05"
										},
										{
											"id": "225",
											"name": "LB RT 06"
										},
										{
											"id": "226",
											"name": "LB RT 07"
										},
										{
											"id": "1371",
											"name": "LB RT 08"
										},
										{
											"id": "7",
											"name": "LB RT 09"
										},
										{
											"id": "200",
											"name": "LB RT 10"
										},
										{
											"id": "229",
											"name": "LB RT 12"
										},
										{
											"id": "198",
											"name": "LB RT 13"
										},
										{
											"id": "1345",
											"name": "LB RT 14"
										},
										{
											"id": "376",
											"name": "LB RT 16"
										},
										{
											"id": "206",
											"name": "LB RT 17"
										},
										{
											"id": "207",
											"name": "LB RT 18"
										},
										{
											"id": "208",
											"name": "LB RT 19"
										},
										{
											"id": "210",
											"name": "LB RT 20"
										},
										{
											"id": "21",
											"name": "LB RT 21"
										},
										{
											"id": "212",
											"name": "LB RT 22"
										},
										{
											"id": "215",
											"name": "LB RT 25"
										},
										{
											"id": "211",
											"name": "LB RT 26"
										},
										{
											"id": "217",
											"name": "LB RT 27"
										},
										{
											"id": "898",
											"name": "LB RT 28"
										},
										{
											"id": "219",
											"name": "LB RT 29"
										},
										{
											"id": "377",
											"name": "LB RT 31"
										},
										{
											"id": "221",
											"name": "LB RT 32"
										},
										{
											"id": "1685",
											"name": "LB RT 46"
										},
										{
											"id": "223",
											"name": "LB RT 47"
										},
										{
											"id": "1757",
											"name": "LB-RT 23"
										},
										{
											"id": "1758",
											"name": "LB-RT 30"
										},
										{
											"id": "1185",
											"name": "LB RT 50 Toni"
										}
									]
								},
								{
									"id": 526,
									"name": "Rijad Transport KG",
									"isGroup": true,
									"children": [
										{
											"id": "1639",
											"name": "NMEP979"
										},
										{
											"id": "1631",
											"name": "NMEP-908"
										},
										{
											"id": "1633",
											"name": "NM-RICHI"
										},
										{
											"id": "1637",
											"name": "NM SH-064"
										},
										{
											"id": "1640",
											"name": "W-3889GT"
										},
										{
											"id": "1632",
											"name": "W-4028GT"
										},
										{
											"id": "1630",
											"name": "W-4436GT"
										},
										{
											"id": "1627",
											"name": "W-4449GT"
										},
										{
											"id": "1638",
											"name": "W-5810GT"
										},
										{
											"id": "1628",
											"name": "W-6097 GT"
										},
										{
											"id": "1629",
											"name": "W 8090GT"
										},
										{
											"id": "1634",
											"name": "W-9474GT"
										},
										{
											"id": "1636",
											"name": "W-9663GT"
										},
										{
											"id": "1635",
											"name": "W-9668GT"
										}
									]
								},
								{
									"id": 206,
									"name": "Rubinig Karl GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "894",
											"name": "G-108TG"
										},
										{
											"id": "614",
											"name": "G-110TG"
										},
										{
											"id": "618",
											"name": "G-338CY"
										},
										{
											"id": "615",
											"name": "G-410HP"
										},
										{
											"id": "606",
											"name": "G-433LR"
										},
										{
											"id": "613",
											"name": "G-474GD"
										},
										{
											"id": "2131",
											"name": "G-535CD"
										},
										{
											"id": "621",
											"name": "G-540SV"
										},
										{
											"id": "620",
											"name": "G-550SD"
										},
										{
											"id": "609",
											"name": "G-590RC"
										},
										{
											"id": "611",
											"name": "G-600RC"
										},
										{
											"id": "612",
											"name": "G-704PD"
										},
										{
											"id": "610",
											"name": "G-723NX"
										},
										{
											"id": "623",
											"name": "G-727HX"
										},
										{
											"id": "622",
											"name": "G-792MZ"
										},
										{
											"id": "616",
											"name": "G-850VE"
										},
										{
											"id": "619",
											"name": "G-866DH"
										},
										{
											"id": "617",
											"name": "G-867DH"
										},
										{
											"id": "608",
											"name": "G-905JN"
										}
									]
								},
								{
									"id": 158,
									"name": "Sagmeister Busreisen GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "234",
											"name": "GS 151BC"
										},
										{
											"id": "235",
											"name": "GS 278BL"
										},
										{
											"id": "233",
											"name": "GS 479AR"
										},
										{
											"id": "236",
											"name": "GS 803AU"
										}
									]
								},
								{
									"id": 580,
									"name": "Schneeweiss GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "2136",
											"name": "PKW 01"
										},
										{
											"id": "2137",
											"name": "PKW 02"
										},
										{
											"id": "2138",
											"name": "PKW 03"
										},
										{
											"id": "2139",
											"name": "PKW 04"
										}
									]
								},
								{
									"id": 429,
									"name": "Schriften Binder GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1097",
											"name": "Peugeot G-552NL"
										},
										{
											"id": "1099",
											"name": "Transit G-49BEC"
										},
										{
											"id": "1098",
											"name": "VW-Bus G-938LD"
										}
									]
								},
								{
									"id": 476,
									"name": "SPK Kommunalservice GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1026",
											"name": "PKW"
										}
									]
								},
								{
									"id": 164,
									"name": "SSG Spezialservice GmbH",
									"isGroup": true,
									"children": [
										{
											"id": 166,
											"name": "Joe",
											"isGroup": true,
											"children": [
												{
													"id": 168,
													"name": "DISPO",
													"isGroup": true,
													"children": [
														{
															"id": "1039",
															"name": "LB 288FW Esen"
														},
														{
															"id": "274",
															"name": "LB 484EY"
														},
														{
															"id": "276",
															"name": "LB 497FP"
														},
														{
															"id": "273",
															"name": "LB 847GO    Luder"
														},
														{
															"id": "278",
															"name": "LB 848GO   Probst"
														},
														{
															"id": "275",
															"name": "LB 849 GO"
														},
														{
															"id": "277",
															"name": "LB 979EM"
														}
													]
												},
												{
													"id": "272",
													"name": "LB 368GN Revo M181146"
												},
												{
													"id": "268",
													"name": "LB 455EL"
												},
												{
													"id": "270",
													"name": "LB 681GC MegaSport M181328"
												},
												{
													"id": "269",
													"name": "M181438  Classic"
												},
												{
													"id": "1730",
													"name": "mobil tracker"
												},
												{
													"id": "279",
													"name": "neu 01"
												},
												{
													"id": "1038",
													"name": "POWER DUC"
												}
											]
										},
										{
											"id": 165,
											"name": "SSG Spezialservice GmbH",
											"isGroup": true,
											"children": [
												{
													"id": "1732",
													"name": "Demo"
												}
											]
										},
										{
											"id": "1905",
											"name": "neu 02"
										}
									]
								},
								{
									"id": 161,
									"name": "Stelzl Wilhelm Viehandels GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1722",
											"name": "LB 380 GU"
										},
										{
											"id": "259",
											"name": "LB 393FW"
										},
										{
											"id": "1668",
											"name": "LB 810 GR"
										},
										{
											"id": "260",
											"name": "LB 886 BY"
										}
									]
								},
								{
									"id": 210,
									"name": "STP Transporte",
									"isGroup": true,
									"children": [
										{
											"id": "978",
											"name": "Stp 4"
										},
										{
											"id": "979",
											"name": "STP 6"
										},
										{
											"id": "953",
											"name": "STP 1 Montagen"
										},
										{
											"id": "643",
											"name": "Stp 2 sorin"
										},
										{
											"id": "967",
											"name": "STP 3 Ahmet"
										},
										{
											"id": "646",
											"name": "Stp 5 andrei"
										}
									]
								},
								{
									"id": 245,
									"name": "Strempfl GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "777",
											"name": "FF766BB (Rosenkranz)"
										},
										{
											"id": "883",
											"name": "FF947BC _Erich"
										},
										{
											"id": "778",
											"name": "HF280DY (Schwarz Chr.)"
										},
										{
											"id": "1728",
											"name": "HF281DY (König)"
										},
										{
											"id": "781",
											"name": "HF359BL(3Achs)"
										},
										{
											"id": "782",
											"name": "HF362CN(Jakum H)"
										},
										{
											"id": "783",
											"name": "HF363CL (Prem M.)"
										},
										{
											"id": "780",
											"name": "HF773CZ (Genser)"
										},
										{
											"id": "779",
											"name": "HF779CZ (Wagner)"
										},
										{
											"id": "965",
											"name": "HF950DF(Kevin)"
										},
										{
											"id": "784",
											"name": "Rene"
										}
									]
								},
								{
									"id": 246,
									"name": "Stvarnik Bau GesmbH",
									"isGroup": true,
									"children": [
										{
											"id": 263,
											"name": "Stvarnik Reiter",
											"isGroup": true,
											"children": [
												{
													"id": "795",
													"name": "JU 941 BX Liscovici"
												},
												{
													"id": "785",
													"name": "JU 977 BP Zekoli Istref"
												},
												{
													"id": "792",
													"name": "MAN JU 421 BD Habich J."
												},
												{
													"id": "789",
													"name": "MT 120BZ ( LUKI )"
												},
												{
													"id": "800",
													"name": "MT 168 AH Schlager S."
												},
												{
													"id": "801",
													"name": "MT 207CG Bischof G."
												},
												{
													"id": "799",
													"name": "MT  217CF ( Moisi Geri )"
												},
												{
													"id": "797",
													"name": "MT 318DF Schoberegger"
												},
												{
													"id": "788",
													"name": "MT 345CY Arben"
												},
												{
													"id": "1670",
													"name": "MT 346CY Primas Jörg"
												},
												{
													"id": "798",
													"name": "MT 347CY Steiner F."
												},
												{
													"id": "796",
													"name": "MT 374CT   Peugeot Boxer Steinwidder Franz"
												},
												{
													"id": "794",
													"name": "MT 561 AX Gazmed Zekoli"
												},
												{
													"id": "791",
													"name": "MT 614CK ( Wieser G.)"
												},
												{
													"id": "793",
													"name": "MT 630 BO Liskovici"
												},
												{
													"id": "1904",
													"name": "MT 743 CZ Felber Peter"
												},
												{
													"id": "790",
													"name": "MT 938 AT Gruber Ph."
												},
												{
													"id": "786",
													"name": "SCANIA JU 475 BZ Rappitsch Hannes"
												},
												{
													"id": "787",
													"name": "Scania MT 389 CT"
												}
											]
										}
									]
								},
								{
									"id": 255,
									"name": "Stvarnik Gert",
									"isGroup": true,
									"children": [
										{
											"id": "817",
											"name": "MT 490 BH"
										}
									]
								},
								{
									"id": 254,
									"name": "Stvarnik Grosserger",
									"isGroup": true,
									"children": [
										{
											"id": "816",
											"name": "MT 932 CU"
										}
									]
								},
								{
									"id": 182,
									"name": "Südsteirische Brennstoffvertriebs GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "408",
											"name": "Kohlen LKW"
										},
										{
											"id": "411",
											"name": "LB 260 DF"
										},
										{
											"id": "413",
											"name": "LB 492GJ"
										},
										{
											"id": "409",
											"name": "LB 554 EN"
										},
										{
											"id": "412",
											"name": "LB 561 DT"
										},
										{
											"id": "410",
											"name": "LB 625 BJ"
										},
										{
											"id": "407",
											"name": "LB 833 AN"
										},
										{
											"id": "966",
											"name": "LB883GD"
										},
										{
											"id": "406",
											"name": "Radladler"
										}
									]
								},
								{
									"id": 218,
									"name": "Taurus FMS",
									"isGroup": true,
									"children": [
										{
											"id": 261,
											"name": "Zoltan Dömös",
											"isGroup": true,
											"children": [
												{
													"id": "347",
													"name": "Demo FMB120"
												}
											]
										},
										{
											"id": "455",
											"name": "Demo FMB010"
										}
									]
								},
								{
									"id": 213,
									"name": "TFS -trend facility Service GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "9",
											"name": "01/RO- 609 CZ  Touareg"
										},
										{
											"id": "659",
											"name": "02/RO-733CR Reno Kastenwagen ab.1. August Springerauto"
										},
										{
											"id": "660",
											"name": "03/RO-43O DG VW Bus Hr. Islami Shpetim"
										},
										{
											"id": "942",
											"name": "04/RO - 869 DR Caddy Hr. Zsolti"
										},
										{
											"id": "658",
											"name": "05/RO-621CN Reno Kangoo"
										},
										{
											"id": "976",
											"name": "06/RO- 355 DS Ford Rafaela Maria"
										},
										{
											"id": "975",
											"name": "07/RO- 393 VC Caddy Nisveta"
										},
										{
											"id": "963",
											"name": "08/RO - 611CZ  Caddy Sedlakova Emilie"
										},
										{
											"id": "1187",
											"name": "09/RO-725 CR Asye"
										},
										{
											"id": "2003",
											"name": "Audi SQ 7 RO 848 EF"
										},
										{
											"id": "2004",
											"name": "RO-310 DZ"
										}
									]
								},
								{
									"id": 188,
									"name": "Time Expert",
									"isGroup": true,
									"children": [
										{
											"id": "1459",
											"name": "FMT100"
										},
										{
											"id": "1186",
											"name": "LB 665 GL"
										},
										{
											"id": "477",
											"name": "Motorrad"
										}
									]
								},
								{
									"id": 162,
									"name": "Tor   Zaunsysteme TZS GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "1461",
											"name": "Ford Bus LB  425 GM"
										},
										{
											"id": "462",
											"name": "Ford Kurz LB 320 GA"
										},
										{
											"id": "263",
											"name": "Ford Pritsche Alt LB 622 FC"
										},
										{
											"id": "261",
											"name": "Ford Pritsche Neu LB 682 FR"
										},
										{
											"id": "895",
											"name": "LB 143 EW Reinhard"
										},
										{
											"id": "262",
											"name": "LB 386 FZ Martin"
										},
										{
											"id": "948",
											"name": "LB 492 GB Amarok"
										},
										{
											"id": "949",
											"name": "LB 958 FK Peter"
										}
									]
								},
								{
									"id": 540,
									"name": "Uhl GmbH   Co KG",
									"isGroup": true,
									"children": [
										{
											"id": "1746",
											"name": "PKW 01"
										},
										{
											"id": "1747",
											"name": "PKW 02"
										},
										{
											"id": "1748",
											"name": "PKW 03"
										}
									]
								},
								{
									"id": 384,
									"name": "Union Sportfliegerclub Baden",
									"isGroup": true,
									"children": [
										{
											"id": "1050",
											"name": "Starflight One N-31233"
										}
									]
								},
								{
									"id": 186,
									"name": "Walter Mayer GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "196",
											"name": "Demo2"
										}
									]
								},
								{
									"id": 223,
									"name": "WSTV",
									"isGroup": true,
									"children": [
										{
											"id": "710",
											"name": "WSTV 1 S-113VZ"
										},
										{
											"id": "711",
											"name": "WSTV 2 S-112VZ"
										},
										{
											"id": "712",
											"name": "WSTV 3 S-161VZ"
										},
										{
											"id": "709",
											"name": "WSTV 4 S-244MX"
										}
									]
								},
								{
									"id": 159,
									"name": "Zisser Schwertransporte GmbH",
									"isGroup": true,
									"children": [
										{
											"id": "239",
											"name": "MD 129 ME Zug 4"
										},
										{
											"id": "242",
											"name": "MD 133HR  Zug6"
										},
										{
											"id": "238",
											"name": "MD 341HN Zug3"
										},
										{
											"id": "240",
											"name": "MD 382IN Zug2"
										},
										{
											"id": "241",
											"name": "MD 745JP Zug1"
										},
										{
											"id": "1130",
											"name": "MD MAN 50 Zug 5"
										},
										{
											"id": "2132",
											"name": "PKW 01 Seat"
										},
										{
											"id": "454",
											"name": "PKW 02 Vito"
										},
										{
											"id": "1643",
											"name": "PKW 03 T6"
										}
									]
								}
							]
						}
					]
				}
			],
			required: true,
		}, {
			type: 'treeselect',
			name: 'treeselect3',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'treeselect3',
			hint: 'test',
			list: null,
			required: false,
		} ],
		buttons: [ {
			text: 'Back',
			type: 'raised',
			action: 'simulate'
		}, {
			text: 'Ok',
			type: 'raised',
			default: true,
			action: 'simulate'
		} ]
	};
	
}
