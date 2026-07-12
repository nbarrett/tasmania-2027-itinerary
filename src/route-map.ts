import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {oneWeekGeometry, twoWeekGeometry} from "./route-data";

export type PlanKey = "two" | "one";

type RouteStop = {
  name: string;
  coordinates: L.LatLngTuple;
  target: string;
};

const stopCatalogue: Record<string, RouteStop> = {
  hobart: {name: "Hobart", coordinates: [-42.8825088, 147.3281233], target: "stop-hobart"},
  tasman: {name: "Tasman Peninsula", coordinates: [-43.1435301, 147.8440404], target: "stop-tasman"},
  freycinet: {name: "Freycinet", coordinates: [-42.125218, 148.2885381], target: "stop-freycinet"},
  deloraine: {name: "Deloraine", coordinates: [-41.5250938, 146.65993], target: "stop-highlands"},
  miena: {name: "Great Lake and Miena", coordinates: [-41.9916452, 146.7075939], target: "stop-highlands"},
  cradle: {name: "Cradle Mountain", coordinates: [-41.5834613, 145.9369068], target: "stop-cradle"},
  queenstown: {name: "Queenstown", coordinates: [-42.0801236, 145.5553843], target: "stop-west"},
  burbury: {name: "Lake Burbury", coordinates: [-42.1167505, 145.670006], target: "stop-west"},
  strahan: {name: "Strahan", coordinates: [-42.1525389, 145.3282194], target: "stop-strahan"},
  nelson: {name: "Nelson Falls", coordinates: [-42.09989, 145.73737], target: "stop-return"}
};

const routePlans: Record<PlanKey, {stopKeys: string[]; geometry: L.LatLngTuple[]; label: string}> = {
  two: {
    stopKeys: ["hobart", "tasman", "freycinet", "deloraine", "miena", "cradle", "queenstown", "burbury", "strahan", "nelson"],
    geometry: twoWeekGeometry,
    label: "Two-week route · 10 stops · 1,228 km"
  },
  one: {
    stopKeys: ["hobart", "tasman", "freycinet", "cradle", "queenstown", "burbury", "strahan", "nelson"],
    geometry: oneWeekGeometry,
    label: "One-week route · 8 stops · 1,083 km"
  }
};

function nearestIndex(geometry: L.LatLngTuple[], point: L.LatLngTuple): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  geometry.forEach(([lat, lng], index) => {
    const distance = (lat - point[0]) ** 2 + (lng - point[1]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

const skippedHighlands = twoWeekGeometry.slice(
  nearestIndex(twoWeekGeometry, stopCatalogue.freycinet.coordinates),
  nearestIndex(twoWeekGeometry, stopCatalogue.cradle.coordinates) + 1
);

const routeMap = L.map("route-map", {scrollWheelZoom: false});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19
}).addTo(routeMap);

const planLayer = L.layerGroup().addTo(routeMap);

const PlanBadge = L.Control.extend({
  onAdd(): HTMLElement {
    const badge = L.DomUtil.create("div", "map-plan-badge");
    badge.id = "map-plan-badge";
    return badge;
  }
});
new PlanBadge({position: "topright"}).addTo(routeMap);

export function setRoutePlan(plan: PlanKey): void {
  const {stopKeys, geometry, label} = routePlans[plan];
  planLayer.clearLayers();
  const badge = document.getElementById("map-plan-badge");
  if (badge) {
    badge.textContent = label;
  }
  if (plan === "one") {
    const skippedLine = L.polyline(skippedHighlands, {
      color: "#7d8d80",
      opacity: 0.75,
      weight: 4,
      dashArray: "6 10"
    });
    skippedLine.bindTooltip("Highlands section via Deloraine and Great Lake - only on the two-week plan", {sticky: true});
    planLayer.addLayer(skippedLine);
  }
  const routeLine = L.polyline(geometry, {
    color: "#2e6b4e",
    opacity: 0.92,
    weight: 6
  });
  planLayer.addLayer(routeLine);
  stopKeys.forEach((key, index) => {
    const stop = stopCatalogue[key];
    const markerIcon = L.divIcon({
      className: "",
      html: `<div class="numbered-map-pin"><span>${index + 1}</span></div>`,
      iconAnchor: [17, 34],
      iconSize: [34, 34],
      tooltipAnchor: [0, -30]
    });
    const marker = L.marker(stop.coordinates, {icon: markerIcon, title: stop.name});
    marker.bindTooltip(stop.name, {direction: "top"});
    marker.on("click", () => {
      const target = document.getElementById(stop.target);
      if (target) {
        document.querySelectorAll(".itinerary-day.map-highlight").forEach(item => item.classList.remove("map-highlight"));
        target.classList.add("map-highlight");
        target.scrollIntoView({behavior: "smooth", block: "center"});
        window.setTimeout(() => target.classList.remove("map-highlight"), 2600);
      }
    });
    planLayer.addLayer(marker);
  });
  routeMap.fitBounds(routeLine.getBounds(), {padding: [28, 28]});
}

L.control.scale({imperial: false}).addTo(routeMap);
setRoutePlan("two");
