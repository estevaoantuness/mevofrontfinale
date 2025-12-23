export type PropertyPricingConfig = {
  propertyId: string;
  minValue: number;
  weekdayNormalValue: number;
  weekendValue: number;
  holidayValueManual?: number | null;
  holidayMultiplier: number;
  annualAdjustmentPercent: number;
  applyMonthlyAdjustment: boolean;
  applyMonthlyCostsToCalendar: boolean;
  lastAdjustmentAppliedAt?: string | Date | null;
  holidayValue?: number;
};

export type PropertyPricingConfigInput = {
  minValue: number;
  weekdayNormalValue: number;
  weekendValue: number;
  holidayValueManual?: number | null;
  holidayMultiplier: number;
  annualAdjustmentPercent: number;
  applyMonthlyAdjustment: boolean;
  applyMonthlyCostsToCalendar: boolean;
};

export type MonthlyCostEvent = {
  propertyId: string;
  month: string;
  createdAt: Date;
  type: 'MONTHLY_COST_TRIGGER';
};

const roundInt = (value: number) => Math.round(value);

export function getEffectiveHolidayValue(config: PropertyPricingConfig): number {
  if (config.holidayValueManual && config.holidayValueManual > 0) {
    return roundInt(config.holidayValueManual);
  }

  return roundInt(config.weekdayNormalValue * config.holidayMultiplier);
}

const getMonthsBetween = (from: Date, to: Date) =>
  to.getFullYear() * 12 + to.getMonth() - (from.getFullYear() * 12 + from.getMonth());

export function applyAnnualAdjustment(
  config: PropertyPricingConfig,
  now: Date
): PropertyPricingConfig {
  if (!config.annualAdjustmentPercent || config.annualAdjustmentPercent <= 0) {
    return config;
  }

  const lastApplied = config.lastAdjustmentAppliedAt ? new Date(config.lastAdjustmentAppliedAt) : null;

  if (config.applyMonthlyAdjustment) {
    if (lastApplied && getMonthsBetween(lastApplied, now) < 1) {
      return config;
    }

    const monthlyFactor = (1 + config.annualAdjustmentPercent / 100) ** (1 / 12);
    return {
      ...config,
      minValue: roundInt(config.minValue * monthlyFactor),
      weekdayNormalValue: roundInt(config.weekdayNormalValue * monthlyFactor),
      weekendValue: roundInt(config.weekendValue * monthlyFactor),
      holidayValueManual: config.holidayValueManual != null
        ? roundInt(config.holidayValueManual * monthlyFactor)
        : config.holidayValueManual,
      lastAdjustmentAppliedAt: now
    };
  }

  if (lastApplied && lastApplied.getFullYear() === now.getFullYear()) {
    return config;
  }

  const factor = 1 + config.annualAdjustmentPercent / 100;
  return {
    ...config,
    minValue: roundInt(config.minValue * factor),
    weekdayNormalValue: roundInt(config.weekdayNormalValue * factor),
    weekendValue: roundInt(config.weekendValue * factor),
    holidayValueManual: config.holidayValueManual != null
      ? roundInt(config.holidayValueManual * factor)
      : config.holidayValueManual,
    lastAdjustmentAppliedAt: now
  };
}

export function buildMonthlyCostEvent(
  propertyId: string,
  month: string,
  createdAt: Date = new Date()
): MonthlyCostEvent {
  return {
    propertyId,
    month,
    createdAt,
    type: 'MONTHLY_COST_TRIGGER'
  };
}
