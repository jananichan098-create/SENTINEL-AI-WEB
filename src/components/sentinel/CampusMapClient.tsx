import { useEffect, useRef } from "react";
import L from "leaflet";
import { BUILDINGS, type BuildingId } from "@/lib/sentinel-data";

function markerIcon(state: "danger" | "warn" | "safe") {
  const color = state === "danger" ? "#ff4d4d" : state === "warn" ? "#ffb020" : "#31d68a";
  const danger = state !== "safe";
  return L.divIcon({
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `
      <div style="position:relative;display:grid;place-items:center;width:38px;height:38px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.18;${
          danger ? "animation:sentinel-ping 1.4s ease-out infinite;" : ""
        }"></span>
        <span style="display:grid;place-items:center;width:26px;height:26px;border-radius:9999px;background:#101827;border:2px solid ${color};box-shadow:0 0 14px ${color}99;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 7h13v10H2z"/><path d="M15 11l7-4v10l-7-4z"/>
          </svg>
        </span>
      </div>`,
  });
}

export default function CampusMapClient({
  emergencyBuildings,
  warningBuildings = [],
  onSelect,
}: {
  emergencyBuildings: BuildingId[];
  warningBuildings?: BuildingId[] | undefined;
  onSelect?: ((id: BuildingId) => void) | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [12.9727, 79.1597],
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    BUILDINGS.forEach((b) => {
      const marker = L.marker([b.lat, b.lng], { icon: markerIcon("safe") }).addTo(map);
      marker.on("click", () => onSelect?.(b.id));
      markersRef.current[b.id] = marker;
    });

    mapRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [onSelect]);

  useEffect(() => {
    BUILDINGS.forEach((b) => {
      const marker = markersRef.current[b.id];
      if (!marker) return;
      const danger = emergencyBuildings.includes(b.id);
      const warn = !danger && warningBuildings.includes(b.id);
      marker.setIcon(markerIcon(danger ? "danger" : warn ? "warn" : "safe"));
      marker.bindPopup(`
        <div style="min-width:210px;font-size:13px">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">${b.name}</div>
          <div style="opacity:.7;font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">${b.cameraName}</div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="opacity:.7">Status</span><b style="color:${
            danger ? "#ff4d4d" : warn ? "#ffb020" : "#31d68a"
          }">${danger ? "EMERGENCY" : warn ? "WARNING" : "SECURE"}</b></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="opacity:.7">Last alert</span><b>${b.lastAlert}</b></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="opacity:.7">People count</span><b>${b.peopleCount}</b></div>
        </div>`);
    });
  }, [emergencyBuildings, warningBuildings]);

  return (
    <>
      <style>{`@keyframes sentinel-ping{0%{transform:scale(.6);opacity:.5}100%{transform:scale(1.6);opacity:0}}`}</style>
      <div ref={containerRef} className="h-full w-full rounded-2xl" />
    </>
  );
}
