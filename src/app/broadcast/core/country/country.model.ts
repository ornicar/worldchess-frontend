export enum countryRegion {
  AFRICA = 1,
  AMERICA = 2,
  ASIA = 3,
  EUROPE = 4
}

export interface ICountry {
  id: number;
  name: string;
  region: countryRegion;
  code: string;
  long_code: string;
}
