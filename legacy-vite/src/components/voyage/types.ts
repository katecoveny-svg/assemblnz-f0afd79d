export interface Trip {
  id: string;
  owner_id: string | null;
  name: string;
  tagline: string | null;
  currency: string;
  start_date: string;
  end_date: string;
  base_lat: number | null;
  base_lng: number | null;
  base_zoom: number | null;
  is_sample: boolean;
}

export interface TripFamily {
  id: string;
  trip_id: string;
  name: string;
  accent_color: string;
  home_city: string | null;
  home_lat: number | null;
  home_lng: number | null;
  member_count: number;
  members: string[] | null;
}

export interface TripDestination {
  id: string;
  trip_id: string;
  name: string;
  region: string | null;
  color: string;
  arrival_date: string;
  departure_date: string;
  lat: number;
  lng: number;
  sort_order: number;
}

export interface TripDay {
  id: string;
  trip_id: string;
  destination_id: string | null;
  date: string;
  title: string | null;
  summary: string | null;
  weather_note: string | null;
}

export interface TripActivity {
  id: string;
  trip_id: string;
  day_id: string;
  name: string;
  start_time: string | null;
  duration_minutes: number | null;
  cost: number | null;
  activity_type: string;
  booked: boolean;
  urgent: boolean;
  link: string | null;
  note: string | null;
  sort_order: number;
}

export interface TripConvoy {
  id: string;
  trip_id: string;
  family_id: string;
  day_id: string;
  origin_label: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  destination_label: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  depart_at: string | null;
  arrive_at: string | null;
  distance_km: number | null;
  status: string;
  route_polyline: Array<[number, number]> | null;
}

export interface TripBundle {
  trip: Trip;
  families: TripFamily[];
  destinations: TripDestination[];
  days: TripDay[];
  activities: TripActivity[];
  convoys: TripConvoy[];
}
