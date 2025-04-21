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
export const museums: Museum[] = (data as any[]).map(item => ({
  id: item.id,
  name: item.name,
  description: item.description,
  location: item.location,
  timings: item.timings,
  tickets: item.tickets as {[key: string]: Ticket},
  shows: item.shows as Show[],
  facilities: item.facilities
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
