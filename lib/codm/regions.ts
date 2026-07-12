/**
 * Candidate network hubs used to approximate the real-world path toward
 * Call of Duty Mobile's regional server clusters. A browser cannot open a
 * raw UDP socket to Activision/Garena's actual game servers, so this probes
 * well-known, always-on regional cloud endpoints on the same backbone paths
 * (the same technique public latency tools like cloudping.info use) and
 * calibrates the result toward an estimated in-game ping in lib/codm/scoring.ts.
 *
 * CODM's Africa coverage is actually split across three server clusters —
 * Nigeria (West Africa), East Africa, and South Africa — not one shared
 * "MEA" hub. No hyperscaler runs a public region in Lagos or Nairobi
 * (Cape Town is AWS's only African region), so those two are approximated
 * by the nearest cloud region on the same submarine-cable path real ISPs
 * actually use to reach them: West African backbones lean on the
 * Europe-landing cables (Paris), East African backbones lean on the
 * Middle East/India-landing cables (Bahrain/Mumbai).
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
    label: "CODM South Africa Cluster",
    shortLabel: "S. Africa",
    note: "Direct measurement — AWS's actual Cape Town region, on the same backbone CODM's South Africa cluster sits on.",
    probeUrl: "https://s3.af-south-1.amazonaws.com/",
  },
  {
    id: "eu-west",
    label: "CODM Nigeria / West Africa Cluster (via Europe transit)",
    shortLabel: "Nigeria",
    note: "No cloud region exists in Lagos, so this approximates via Paris — the same Europe-landing submarine cables (WACS/ACE/SAT-3) West African ISPs actually route through to reach it.",
    probeUrl: "https://s3.eu-west-3.amazonaws.com/",
  },
  {
    id: "me-south",
    label: "CODM East Africa Cluster (via Middle East transit)",
    shortLabel: "E. Africa",
    note: "No cloud region exists in Nairobi, so this approximates via Bahrain — East African backbones (EASSy/SEACOM) commonly transit the Middle East to reach it.",
    probeUrl: "https://s3.me-south-1.amazonaws.com/",
  },
  {
    id: "ap-southeast",
    label: "Asia (Singapore) — Garena SEA",
    shortLabel: "SEA",
    note: "Garena's Southeast Asia hub — some African CODM accounts default here instead of an Africa cluster.",
    probeUrl: "https://s3.ap-southeast-1.amazonaws.com/",
  },
  {
    id: "ap-south",
    label: "Asia (Mumbai) — India Hub",
    shortLabel: "India",
    note: "Secondary Garena hub some accounts route through — also the same India-landing cables East African traffic often shares.",
    probeUrl: "https://s3.ap-south-1.amazonaws.com/",
  },
];
