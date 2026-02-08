import { getEntry } from "astro:content";

const global = await getEntry("global", "global");

export const navItemsPrimary = [
  {
    title: global.data.navItemPlaces,
    href: "https://kompasio.sk/app/sk/map/zoznam",
  },
  {
    title: global.data.navItemGuides,
    href: "/navody",
    test: "^\/(?:navody|zivotne-situacie)(?:\/.*)?$",
  },
  {
    title: global.data.navItemContact,
    href: "/kontakt",
  },
  {
    title: global.data.navItemDonate,
    href: "/podpora",
  },
];

export const navItemsSecondary = [
  {
    title: global.data.navItemTerms,
    url: "/vop",
  },
  {
    title: global.data.navItemGdpr,
    url: "/gdpr",
  },
];
