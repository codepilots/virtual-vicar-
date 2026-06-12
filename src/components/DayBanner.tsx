import type { LiturgicalDay } from '../data/calendar';

export function DayBanner({ day }: { day: LiturgicalDay }) {
  return (
    <div className={`day-banner colour-${day.colour}`}>
      <div className="season">{day.season}</div>
      <div className="name">{day.name}</div>
      <div className="meta">
        {day.dateLabel} · Sunday cycle Year {day.rclYear} · Daily Office Year {day.dailyYear}
        {day.proper ? ` · Proper ${day.proper}` : ''}
      </div>
    </div>
  );
}
