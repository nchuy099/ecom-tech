import React from 'react';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { TrackingEvent, ShipmentStatus } from '../../types';
import { formatDate } from '../../utils/format';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events }) => {
  const getIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'READY_FOR_PICKUP':
      case 'PICKED_UP':
        return <Package className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
      {events.map((event, index) => (
        <div key={index} className="relative flex items-start gap-4 pl-1 group">
          <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 z-10 group-hover:border-brand-500 transition-colors shadow-sm">
            {getIcon(event.status)}
          </div>
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 p-3.5 rounded-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {event.location}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {formatDate(event.timestamp)}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              {event.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
