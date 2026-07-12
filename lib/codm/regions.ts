/**
 * Candidate network hubs used to approximate the real-world path toward
 * Call of Duty Mobile's regional server clusters. A browser cannot open a
 * raw UDP socket to Activision/Garena's actual game servers, so this probes
 * well-known, always-on regional cloud endpoints on the same backbone paths
 * (the same technique public latency tools like cloudping.info use) and
 * calibrates the result toward an estimated in-game ping in lib/codm/scoring.ts.
 */
export interface CodmRegion {
  id: string;
  label: string;
  shortLabel: string;
  /** Why this hub is a relevant proxy for Cameroonian CODM players. */
  note: string;
  probeUrl: string;
}

export const CODM_REGIONS: CodmRegion[] = [
  {
    id: "af-south",
    label: "Africa (Cape Town) — MEA Hub",
    shortLabel: "Africa",
    note: "Closest major backbone hub to Cameroon — best case for regional MEA game servers.",
    probeUrl: "https://s3.af-south-1.amazonaws.com/",
  },
  {
    id: "eu-west",
    label: "Europe (Paris) — EU Hub",
    shortLabel: "Europe",
    note: "Most Cameroonian international routes transit through Europe — often the real path even for 'local' traffic.",
    probeUrl: "https://s3.eu-west-3.amazonaws.com/",
  },
  {
    id: "me-south",
    label: "Middle East (Bahrain)",
    shortLabel: "Middle East",
    note: "Approximates MEA game clusters some CODM accounts get routed through.",
    probeUrl: "https://s3.me-south-1.amazonaws.com/",
  },
  {
    id: "ap-southeast",
    label: "Asia (Singapore) — Garena SEA",
    shortLabel: "SEA",
    note: "Garena's Southeast Asia hub — common default for many African CODM accounts.",
    probeUrl: "https://s3.ap-southeast-1.amazonaws.com/",
  },
  {
    id: "ap-south",
    label: "Asia (Mumbai) — India Hub",
    shortLabel: "India",
    note: "Secondary Garena hub some accounts route through.",
    probeUrl: "https://s3.ap-south-1.amazonaws.com/",
  },
];
