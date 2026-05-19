export type TempReading = {
  label: string;
  tempC: number;
};

export type CookingReading = {
  dish: string;
  tempC: number;
  cookedToTime: string;
};

export type CleaningChecks = {
  surfacesSanitised: boolean;
  floorsMopped: boolean;
  chillersWiped: boolean;
  handwashStationsStocked: boolean;
};

export type FailedReading = {
  area: string;
  label: string;
  tempC: number;
  target: string;
  action: string;
};

export type FoodAuditLog = {
  id: string;
  venue_name: string;
  recorded_by: string;
  recorded_date: string;
  fridge_temps: TempReading[];
  freezer_temps: TempReading[];
  hot_hold_temps: TempReading[];
  cooking_temps: CookingReading[];
  cleaning_checks: CleaningChecks;
  notes: string | null;
  failed_readings: FailedReading[];
  photo_urls: string[] | null;
  created_at?: string;
};

export function todayNzDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function assessFoodAudit(input: {
  fridgeTemps: TempReading[];
  freezerTemps: TempReading[];
  hotHoldTemps: TempReading[];
  cookingTemps: CookingReading[];
}): FailedReading[] {
  const failed: FailedReading[] = [];

  for (const reading of input.fridgeTemps) {
    if (Number.isFinite(reading.tempC) && reading.tempC > 4) {
      failed.push({
        area: 'Fridge',
        label: reading.label,
        tempC: reading.tempC,
        target: '≤4°C',
        action: 'Move stock to a compliant unit, check the door seal and thermostat, and log the corrective action in your Food Control Plan.',
      });
    }
  }

  for (const reading of input.freezerTemps) {
    if (Number.isFinite(reading.tempC) && reading.tempC > -18) {
      failed.push({
        area: 'Freezer',
        label: reading.label,
        tempC: reading.tempC,
        target: '≤-18°C',
        action: 'Check whether stock is still frozen hard, move it to a compliant freezer if needed, and log the equipment check.',
      });
    }
  }

  for (const reading of input.hotHoldTemps) {
    if (Number.isFinite(reading.tempC) && reading.tempC < 60) {
      failed.push({
        area: 'Hot hold',
        label: reading.label,
        tempC: reading.tempC,
        target: '≥60°C',
        action: 'Reheat food to a compliant temperature or discard it if time and temperature controls cannot be verified.',
      });
    }
  }

  for (const reading of input.cookingTemps) {
    if (Number.isFinite(reading.tempC) && reading.tempC < 75) {
      failed.push({
        area: 'Cooking',
        label: reading.dish,
        tempC: reading.tempC,
        target: '≥75°C for 30 sec',
        action: 'Continue cooking until the final temperature reaches 75°C for 30 seconds, then record the corrected reading.',
      });
    }
  }

  return failed;
}
