export type Severity = "high" | "medium" | "low";

export type AlertType =
  | "Fire Detected"
  | "Smoke Detected"
  | "Person Detected"
  | "Crowd Forming"
  | "Unauthorized Entry"
  | "Loitering"
  | "Motion Detected";

export type BuildingId =
  | "main-gate"
  | "library"
  | "admin-block"
  | "biomedical-lab"
  | "engineering-block"
  | "hostel"
  | "parking"
  | "sports-complex";

export interface Building {
  id: BuildingId;
  name: string;
  lat: number;
  lng: number;
  cameraName: string;
  cameraId: string;
  peopleCount: number;
  lastAlert: string;
}

export interface CameraInfo {
  id: string;
  name: string;
  location: string;
  building: BuildingId;
  online: boolean;
  health: number;
  resolution: string;
  fps: number;
  uptime: string;
}

export interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: Severity;
  cameraId: string;
  building: string;
  buildingId: BuildingId;
  time: string;
  confidence: number;
  status: "Active" | "Acknowledged" | "Resolved";
}

export const BUILDINGS: Building[] = [
  {
    id: "main-gate",
    name: "Main Gate",
    lat: 12.9718,
    lng: 79.1594,
    cameraName: "CAM-01 Main Gate ANPR",
    cameraId: "CAM-01",
    peopleCount: 42,
    lastAlert: "Unauthorized Entry — 08:12",
  },
  {
    id: "library",
    name: "Central Library",
    lat: 12.9731,
    lng: 79.1612,
    cameraName: "CAM-02 Library Atrium",
    cameraId: "CAM-02",
    peopleCount: 118,
    lastAlert: "Crowd Forming — 11:47",
  },
  {
    id: "admin-block",
    name: "Admin Block",
    lat: 12.9709,
    lng: 79.1621,
    cameraName: "CAM-03 Admin Lobby",
    cameraId: "CAM-03",
    peopleCount: 27,
    lastAlert: "Motion Detected — 06:03",
  },
  {
    id: "biomedical-lab",
    name: "Biomedical Lab",
    lat: 12.9744,
    lng: 79.1589,
    cameraName: "CAM-04 Biomed Corridor",
    cameraId: "CAM-04",
    peopleCount: 14,
    lastAlert: "Smoke Detected — 09:58",
  },
  {
    id: "engineering-block",
    name: "Engineering Block",
    lat: 12.9752,
    lng: 79.1627,
    cameraName: "CAM-05 Engg. Workshop",
    cameraId: "CAM-05",
    peopleCount: 76,
    lastAlert: "Fire Detected — 13:21",
  },
  {
    id: "hostel",
    name: "Hostel Zone B",
    lat: 12.9695,
    lng: 79.1573,
    cameraName: "CAM-06 Hostel Entrance",
    cameraId: "CAM-06",
    peopleCount: 63,
    lastAlert: "Loitering — 23:41",
  },
  {
    id: "parking",
    name: "North Parking",
    lat: 12.9727,
    lng: 79.1563,
    cameraName: "CAM-07 Parking Deck",
    cameraId: "CAM-07",
    peopleCount: 19,
    lastAlert: "Person Detected — 07:35",
  },
  {
    id: "sports-complex",
    name: "Sports Complex",
    lat: 12.9762,
    lng: 79.1601,
    cameraName: "CAM-08 Stadium West",
    cameraId: "CAM-08",
    peopleCount: 205,
    lastAlert: "Crowd Forming — 17:05",
  },
];

export const CAMERAS: CameraInfo[] = [
  {
    id: "CAM-01",
    name: "Main Gate ANPR",
    location: "Main Gate — North Entry",
    building: "main-gate",
    online: true,
    health: 98,
    resolution: "4K UHD",
    fps: 30,
    uptime: "42d 06h",
  },
  {
    id: "CAM-02",
    name: "Library Atrium",
    location: "Central Library — Ground Floor",
    building: "library",
    online: true,
    health: 94,
    resolution: "1080p",
    fps: 25,
    uptime: "31d 19h",
  },
  {
    id: "CAM-03",
    name: "Admin Lobby",
    location: "Admin Block — Reception",
    building: "admin-block",
    online: true,
    health: 88,
    resolution: "1080p",
    fps: 25,
    uptime: "17d 02h",
  },
  {
    id: "CAM-04",
    name: "Biomed Corridor",
    location: "Biomedical Lab — Level 2",
    building: "biomedical-lab",
    online: true,
    health: 76,
    resolution: "1080p",
    fps: 20,
    uptime: "9d 11h",
  },
  {
    id: "CAM-05",
    name: "Engg. Workshop",
    location: "Engineering Block — Bay 3",
    building: "engineering-block",
    online: true,
    health: 91,
    resolution: "4K UHD",
    fps: 30,
    uptime: "58d 04h",
  },
  {
    id: "CAM-06",
    name: "Hostel Entrance",
    location: "Hostel Zone B — Gate",
    building: "hostel",
    online: false,
    health: 21,
    resolution: "1080p",
    fps: 0,
    uptime: "0d 00h",
  },
  {
    id: "CAM-07",
    name: "Parking Deck",
    location: "North Parking — Level P1",
    building: "parking",
    online: true,
    health: 83,
    resolution: "1080p",
    fps: 25,
    uptime: "23d 15h",
  },
  {
    id: "CAM-08",
    name: "Stadium West",
    location: "Sports Complex — West Stand",
    building: "sports-complex",
    online: true,
    health: 96,
    resolution: "4K UHD",
    fps: 30,
    uptime: "12d 08h",
  },
];

export const ALERT_TEMPLATES: {
  type: AlertType;
  severity: Severity;
  buildingId: BuildingId;
}[] = [
  { type: "Fire Detected", severity: "high", buildingId: "engineering-block" },
  { type: "Smoke Detected", severity: "high", buildingId: "biomedical-lab" },
  { type: "Unauthorized Entry", severity: "high", buildingId: "main-gate" },
  { type: "Crowd Forming", severity: "medium", buildingId: "sports-complex" },
  { type: "Loitering", severity: "medium", buildingId: "hostel" },
  { type: "Person Detected", severity: "low", buildingId: "parking" },
  { type: "Motion Detected", severity: "low", buildingId: "admin-block" },
];

export const DAILY_ALERTS = [
  { day: "Mon", fire: 1, crowd: 6, intrusion: 3, motion: 14 },
  { day: "Tue", fire: 0, crowd: 9, intrusion: 2, motion: 18 },
  { day: "Wed", fire: 2, crowd: 4, intrusion: 5, motion: 11 },
  { day: "Thu", fire: 0, crowd: 12, intrusion: 4, motion: 21 },
  { day: "Fri", fire: 3, crowd: 15, intrusion: 6, motion: 26 },
  { day: "Sat", fire: 1, crowd: 8, intrusion: 2, motion: 9 },
  { day: "Sun", fire: 0, crowd: 3, intrusion: 1, motion: 6 },
];

export const PEOPLE_FLOW = [
  { hour: "06:00", people: 62 },
  { hour: "08:00", people: 348 },
  { hour: "10:00", people: 712 },
  { hour: "12:00", people: 986 },
  { hour: "14:00", people: 845 },
  { hour: "16:00", people: 1104 },
  { hour: "18:00", people: 623 },
  { hour: "20:00", people: 214 },
  { hour: "22:00", people: 87 },
];

export const ALERT_TYPE_SPLIT = [
  { name: "Motion", value: 105, color: "var(--color-chart-1)" },
  { name: "Crowd", value: 57, color: "var(--color-chart-3)" },
  { name: "Intrusion", value: 23, color: "var(--color-chart-5)" },
  { name: "Fire / Smoke", value: 7, color: "var(--color-chart-2)" },
];

export const CAMERA_USAGE = CAMERAS.map((c, i) => ({
  camera: c.id,
  hours: [23.8, 22.4, 21.1, 18.6, 23.9, 4.2, 20.5, 23.2][i],
}));

export const EVENT_HISTORY: (SecurityAlert & { snapshot: string })[] = [
  {
    id: "EVT-4821",
    time: "2026-08-04 13:21:07",
    type: "Fire Detected",
    severity: "high",
    cameraId: "CAM-05",
    building: "Engineering Block",
    buildingId: "engineering-block",
    confidence: 97.4,
    status: "Active",
    snapshot: "engineering",
  },
  {
    id: "EVT-4820",
    time: "2026-08-04 11:47:52",
    type: "Crowd Forming",
    severity: "medium",
    cameraId: "CAM-02",
    building: "Central Library",
    buildingId: "library",
    confidence: 91.2,
    status: "Acknowledged",
    snapshot: "library",
  },
  {
    id: "EVT-4819",
    time: "2026-08-04 09:58:33",
    type: "Smoke Detected",
    severity: "high",
    cameraId: "CAM-04",
    building: "Biomedical Lab",
    buildingId: "biomedical-lab",
    confidence: 88.6,
    status: "Resolved",
    snapshot: "biomed",
  },
  {
    id: "EVT-4818",
    time: "2026-08-04 08:12:19",
    type: "Unauthorized Entry",
    severity: "high",
    cameraId: "CAM-01",
    building: "Main Gate",
    buildingId: "main-gate",
    confidence: 95.1,
    status: "Resolved",
    snapshot: "gate",
  },
  {
    id: "EVT-4817",
    time: "2026-08-04 07:35:44",
    type: "Person Detected",
    severity: "low",
    cameraId: "CAM-07",
    building: "North Parking",
    buildingId: "parking",
    confidence: 82.9,
    status: "Resolved",
    snapshot: "parking",
  },
  {
    id: "EVT-4816",
    time: "2026-08-03 23:41:02",
    type: "Loitering",
    severity: "medium",
    cameraId: "CAM-06",
    building: "Hostel Zone B",
    buildingId: "hostel",
    confidence: 79.3,
    status: "Resolved",
    snapshot: "hostel",
  },
  {
    id: "EVT-4815",
    time: "2026-08-03 17:05:26",
    type: "Crowd Forming",
    severity: "medium",
    cameraId: "CAM-08",
    building: "Sports Complex",
    buildingId: "sports-complex",
    confidence: 93.8,
    status: "Resolved",
    snapshot: "sports",
  },
  {
    id: "EVT-4814",
    time: "2026-08-03 14:22:10",
    type: "Motion Detected",
    severity: "low",
    cameraId: "CAM-03",
    building: "Admin Block",
    buildingId: "admin-block",
    confidence: 74.5,
    status: "Resolved",
    snapshot: "admin",
  },
  {
    id: "EVT-4813",
    time: "2026-08-02 19:48:55",
    type: "Fire Detected",
    severity: "high",
    cameraId: "CAM-05",
    building: "Engineering Block",
    buildingId: "engineering-block",
    confidence: 96.0,
    status: "Resolved",
    snapshot: "engineering",
  },
  {
    id: "EVT-4812",
    time: "2026-08-02 10:14:38",
    type: "Person Detected",
    severity: "low",
    cameraId: "CAM-02",
    building: "Central Library",
    buildingId: "library",
    confidence: 86.7,
    status: "Resolved",
    snapshot: "library",
  },
];

export const severityStyles: Record<Severity, { chip: string; glow: string; dot: string }> = {
  high: {
    chip: "bg-danger/15 text-danger border-danger/40",
    glow: "glow-danger",
    dot: "bg-danger",
  },
  medium: {
    chip: "bg-warn/15 text-warn border-warn/40",
    glow: "glow-warn",
    dot: "bg-warn",
  },
  low: {
    chip: "bg-safe/15 text-safe border-safe/40",
    glow: "glow-safe",
    dot: "bg-safe",
  },
};
