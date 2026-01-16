"use client";

import * as React from "react";
import { format, sub, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parse, add } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DatePickerWithRangeV2Props
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  showYear?: boolean;
}

export function DatePickerWithRangeV2({
  className,
  date,
  setDate,
  showYear = true,
}: DatePickerWithRangeV2Props) {
  const today = new Date();
  const [startDateInput, setStartDateInput] = React.useState("");
  const [endDateInput, setEndDateInput] = React.useState("");

  const isSameDay = (date1: Date, date2: Date) => {
    return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
  };

  const isSameWeek = (date1: Date, date2: Date) => {
    const week1 = format(date1, 'yyyy-ww');
    const week2 = format(date2, 'yyyy-ww');
    return week1 === week2;
  };

  const isSameMonth = (date1: Date, date2: Date) => {
    return format(date1, 'yyyy-MM') === format(date2, 'yyyy-MM');
  };

  const isSameYear = (date1: Date, date2: Date) => {
    return format(date1, 'yyyy') === format(date2, 'yyyy');
  };

  const getActivePreset = () => {
    if (!date?.from || !date?.to) return null;

    if (isSameDay(date.from, date.to)) {
      if (isSameDay(date.from, today)) return 'Today';
      if (isSameDay(date.from, sub(today, { days: 1 }))) return 'Yesterday';
    }

    if (isSameWeek(date.from, startOfWeek(today, { weekStartsOn: 1 })) && 
        isSameWeek(date.to, endOfWeek(today, { weekStartsOn: 1 }))) {
      return 'This Week';
    }

    if (isSameMonth(date.from, startOfMonth(today)) && 
        isSameMonth(date.to, endOfMonth(today))) {
      return 'This Month';
    }

    if (isSameYear(date.from, startOfYear(today)) && 
        isSameYear(date.to, endOfYear(today))) {
      return 'This Year';
    }

    return null;
  };

  React.useEffect(() => {
    if (date?.from) {
      setStartDateInput(format(date.from, "MM/dd/yyyy"));
    }
    if (date?.to) {
      setEndDateInput(format(date.to, "MM/dd/yyyy"));
    }
  }, [date]);

  const handleDateInputChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDateInput(value);
      if (value.length === 10) {
        const parsedDate = parse(value, "MM/dd/yyyy", new Date());
        if (!isNaN(parsedDate.getTime())) {
          setDate({ from: parsedDate, to: date?.to });
        }
      }
    } else {
      setEndDateInput(value);
      if (value.length === 10) {
        const parsedDate = parse(value, "MM/dd/yyyy", new Date());
        if (!isNaN(parsedDate.getTime())) {
          setDate({ from: date?.from, to: parsedDate });
        }
      }
    }
  };

  const presets = [
    {
      label: "Today",
      value: { from: today, to: today }
    },
    {
      label: "Yesterday",
      value: {
        from: sub(today, { days: 1 }),
        to: sub(today, { days: 1 })
      }
    },
    {
      label: "This Week",
      value: {
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 })
      }
    },
    {
      label: "This Month",
      value: {
        from: startOfMonth(today), // Ensure this is the 1st of the month
        to: endOfMonth(today)      // Ensure this is the last day of the month
      }
    },
    {
      label: "This Year",
      value: {
        from: startOfYear(today),
        to: endOfYear(today)
      }
    }
  ];

  const formatDate = (date: Date) => {
    return format(date, showYear ? "MMM dd, yyyy" : "MMM dd");
  };

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 stroke-primary" />
            {date?.from ? (
              date.to && !isSameDay(date.from, date.to) ? (
                <>
                  {formatDate(date.from)} - {formatDate(date.to)}
                </>
              ) : (
                formatDate(date.from)
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0 mr-2 ml-2" align="start">
          <div className="flex flex-col w-full">
            <div className="flex w-full">
              <div className="border-r p-3 space-y-2 max-w-[7rem]">
                {presets.map((preset) => {
                  const isActive = getActivePreset() === preset.label;
                  return (
                    <Button
                      key={preset.label}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-center font-normal flex items-center ",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                      onClick={() => setDate(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
              <div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  showOutsideDays={false}
                  classNames={{
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    head_cell: "w-9 font-normal text-muted-foreground",
                    cell: cn(
                      "h-9 w-9 text-center text-sm relative [&:has([aria-selected])]:bg-accent",
                      "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                    ),
                    day: cn(
                      "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 p-3 border-t w-full">
              <div className="flex flex-row gap-2 w-full">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm text-muted-foreground">Start Date</Label>
                  <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={startDateInput}
                  onChange={(e) => handleDateInputChange('start', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-muted-foreground">End Date</Label>
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={endDateInput}
                  onChange={(e) => handleDateInputChange('end', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                />
              </div>
            </div>
              <div className="flex flex-row gap-2 w-full mt-6">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  onClick={() => {
                    if (date?.from && date?.to) {
                      const newFrom = sub(date.from, { days: 1 });
                      const newTo = sub(date.to, { days: 1 });
                      setDate({ from: newFrom, to: newTo });
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  onClick={() => {
                    if (date?.from && date?.to) {
                      const newFrom = add(date.from, { days: 1 });
                      const newTo = add(date.to, { days: 1 });
                      setDate({ from: newFrom, to: newTo });
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 