export const ANOMALY_CHANGE_THRESHOLD = 0.3   // 30%
export const MIN_USERS_THRESHOLD = 20

export const WEATHER_RULES = {
  stormDropThreshold: -0.3,
  stormAnomalyCount: 3,
  cloudyChangeRange: [0.1, 0.2] as const,
  cloudyAnomalyRange: [1, 2] as const,
  sunnyChangeMax: 0.1,
}

export const ALERTS_MAX_COUNT = 5
export const DIMENSION_TOP_COUNT = 3
