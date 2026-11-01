import L from 'leaflet';

const icons = new Map();

// Leaflet icons are only templates (each marker builds its own DOM), so one instance
// per distinct set of options can be shared by every marker instead of rebuilt per render.
export default function cachedIcon(options) {
  const key = JSON.stringify(options);
  if (!icons.has(key)) {
    icons.set(key, new L.Icon(options));
  }
  return icons.get(key);
}
