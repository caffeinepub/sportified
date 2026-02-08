import { Sport } from '../backend';

export const SPORT_OPTIONS: Sport[] = [
  Sport.badminton,
  Sport.basketball,
  Sport.football,
  Sport.baseball,
  Sport.swimming,
  Sport.cycling,
  Sport.tennis,
  Sport.volleyball,
  Sport.yoga,
  Sport.skiing,
];

export function getSportLabel(sport: Sport): string {
  const labels: Record<Sport, string> = {
    [Sport.badminton]: 'Badminton',
    [Sport.basketball]: 'Basketball',
    [Sport.football]: 'Football',
    [Sport.baseball]: 'Baseball',
    [Sport.swimming]: 'Swimming',
    [Sport.cycling]: 'Cycling',
    [Sport.tennis]: 'Tennis',
    [Sport.volleyball]: 'Volleyball',
    [Sport.yoga]: 'Yoga',
    [Sport.skiing]: 'Skiing',
  };
  return labels[sport];
}
