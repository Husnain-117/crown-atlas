export interface PropertyDisplayStatus {
  label: string;
  color: string;
}

const ACTIVE_COLOR = 'bg-green-100 text-green-800';
const PENDING_COLOR = 'bg-amber-100 text-amber-800';
const COMING_SOON_COLOR = 'bg-blue-100 text-blue-800';
const INACTIVE_COLOR = 'bg-gray-100 text-gray-800';

function normalize(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function isActivePropertyStatus(status: unknown): boolean {
  return ['active', 'forsale', 'forrent'].includes(normalize(status));
}

export function propertyDisplayStatus(
  status: unknown,
  propertyType: unknown
): PropertyDisplayStatus {
  const normalizedStatus = normalize(status);
  const isLease = normalize(propertyType).includes('lease');

  if (isActivePropertyStatus(status)) {
    return {
      label: isLease ? 'FOR RENT' : 'FOR SALE',
      color: ACTIVE_COLOR,
    };
  }

  if (['closed', 'sold', 'rented'].includes(normalizedStatus)) {
    return {
      label: isLease ? 'RENTED' : 'SOLD',
      color: INACTIVE_COLOR,
    };
  }

  if (['pending', 'activeundercontract', 'undercontract'].includes(normalizedStatus)) {
    return {
      label: normalizedStatus === 'pending' || isLease ? 'PENDING' : 'UNDER CONTRACT',
      color: PENDING_COLOR,
    };
  }

  if (normalizedStatus === 'comingsoon') {
    return { label: 'COMING SOON', color: COMING_SOON_COLOR };
  }

  return {
    label: String(status || 'UNKNOWN').trim() || 'UNKNOWN',
    color: INACTIVE_COLOR,
  };
}
