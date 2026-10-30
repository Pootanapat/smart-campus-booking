import React from 'react';
import { cn } from '../utils/cn';
export function Stat({
  icon,
  value,
  label,
  note,
  green,
  gold,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  note: string;
  green?: boolean;
  gold?: boolean;
}) {
  return (
    <div className={cn('stat', green && 'stat-green', gold && 'stat-gold')}>
      <span className="stat-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}
