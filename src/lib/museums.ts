import data from '../../data.json';

export interface Ticket {
  name: string;
  price: number;
  description: string;
}

export interface Show {
  name: string;
  description: string;
  schedule: string;
  price: number | string;
}

export interface Museum {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  timings: {
    opening: string;
    closing: string;
    holidays: string[];
  };
  tickets: {
    [key: string]: Ticket;
  };
  shows: Show[];
  facilities: string[];
}

// Parse the data correctly instead of using a direct type assertion
export const museums: Museum[] = (data as Record<string, unknown>[]).map(item => ({
  id: item.id as string,
  name: item.name as string,
  description: item.description as string,
  location: item.location as Museum['location'],
  timings: item.timings as Museum['timings'],
  tickets: item.tickets as {[key: string]: Ticket},
  shows: item.shows as Show[],
  facilities: item.facilities as string[]
}));

export function getMuseum(id: string): Museum | undefined {
  return museums.find(museum => museum.id === id);
}

export function getAllMuseums(): Museum[] {
  return museums;
}

export function getMuseumTickets(museumId: string): Array<Ticket & { id: string }> {
  const museum = getMuseum(museumId);
  return museum ? Object.entries(museum.tickets).map(([id, ticket]) => ({
    id,
    ...ticket
  })) : [];
}

export function getMuseumShows(museumId: string): Show[] {
  const museum = getMuseum(museumId);
  return museum?.shows || [];
}
