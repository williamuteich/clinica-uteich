import { filterAvailableTimeSlots } from "@/data/services";

interface TimeSlotPickerProps {
  selectedDate: string;
  selectedService: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const periods = [
  { label: "Madrugada", icon: "🌙", min: 0, max: 6 },
  { label: "Manhã", icon: "☀️", min: 6, max: 12 },
  { label: "Tarde", icon: "🌤️", min: 12, max: 18 },
  { label: "Noite", icon: "🌑", min: 18, max: 24 },
];

export const TimeSlotPicker = ({ selectedDate, selectedService, selectedTime, onTimeSelect }: TimeSlotPickerProps) => {
  const slots = filterAvailableTimeSlots(selectedDate, selectedService);

  const grouped = periods
    .map((p) => ({
      ...p,
      slots: slots.filter((t) => {
        const h = parseInt(t);
        return h >= p.min && h < p.max;
      }),
    }))
    .filter((g) => g.slots.length > 0);

  return (
    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-1 z-10">
            <span className="text-lg">{group.icon}</span>
            <span className="text-sm font-semibold text-foreground">{group.label}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {group.slots.map((time) => (
              <button
                key={time}
                onClick={() => onTimeSelect(time)}
                className={`py-2 px-1 rounded-xl text-center text-sm font-medium transition-all ${
                  selectedTime === time
                    ? "gradient-card text-primary-foreground"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
