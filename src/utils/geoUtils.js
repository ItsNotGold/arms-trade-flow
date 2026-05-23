/**
 * Fix antimeridian-crossing polygons by shifting eastern fragments
 * from negative to positive longitude space
 */
export function fixAntimeridian(geojson) {
  if (!geojson || !geojson.features) return geojson;

  const fixedFeatures = geojson.features.map(feature => {
    if (!feature.geometry) return feature;

    const geom = feature.geometry;
    const type = geom.type;

    if (type === 'Polygon') {
      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: fixPolygonRing(geom.coordinates)
        }
      };
    } else if (type === 'MultiPolygon') {
      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: geom.coordinates.map(fixPolygonRing)
        }
      };
    }

    return feature;
  });

  return {
    ...geojson,
    features: fixedFeatures
  };
}

/**
 * Process a polygon's coordinate rings and detect antimeridian crossings
 */
function fixPolygonRing(rings) {
  if (!Array.isArray(rings) || rings.length === 0) return rings;

  // Check if this polygon crosses the antimeridian
  const hasAntimeridianCrossing = rings.some(ring => 
    detectAntimeridianCrossing(ring)
  );

  if (!hasAntimeridianCrossing) return rings;

  // Fix the crossing by shifting negative longitudes to 0-360 range
  return rings.map(ring => fixRing(ring));
}

/**
 * Detect if a ring (array of [lng, lat] coordinates) crosses the antimeridian
 */
function detectAntimeridianCrossing(ring) {
  if (!Array.isArray(ring) || ring.length < 2) return false;

  for (let i = 1; i < ring.length; i++) {
    const prev = ring[i - 1];
    const curr = ring[i];
    
    if (!Array.isArray(prev) || !Array.isArray(curr)) continue;
    
    const delta = curr[0] - prev[0];
    
    // A jump of more than 180° in longitude indicates antimeridian crossing
    if (Math.abs(delta) > 180) {
      return true;
    }
  }

  return false;
}

/**
 * Fix a coordinate ring by shifting negative longitudes to 0-360 range
 * This keeps the polygon on one side of the antimeridian
 */
function fixRing(ring) {
  if (!Array.isArray(ring)) return ring;

  return ring.map(coord => {
    if (!Array.isArray(coord) || coord.length < 2) return coord;
    
    const [lng, lat] = coord;
    
    // Shift negative longitudes (western hemisphere) to 0-360 range
    // This keeps Russia and Fiji on the eastern side where they logically belong
    const fixedLng = lng < 0 ? lng + 360 : lng;
    
    return [fixedLng, lat];
  });
}
