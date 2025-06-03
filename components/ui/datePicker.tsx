"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

interface DatePickerProps {
    value?: Date | null
    onChange?: (date: Date | null) => void
    label?: string
    minDate?: Date
    maxDate?: Date
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function DatePicker({
    value,
    onChange,
    label,
    minDate,
    maxDate,
    placeholder = "Select date",
    className,
    disabled = false,
}: DatePickerProps) {
    const [date, setDate] = React.useState<Date | null>(value || null)
    const [calendarOpen, setCalendarOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState<string>(value ? format(value, "MM/dd/yyyy") : "")
    const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(value || undefined)
    const [yearSelectOpen, setYearSelectOpen] = React.useState(false)
    const [monthSelectOpen, setMonthSelectOpen] = React.useState(false)
    const listRef = React.useRef<HTMLDivElement>(null)

    // Generate years (current year ± 100 years)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i)

    // Month names
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    // Update internal state when external value changes
    React.useEffect(() => {
        if (value) {
            setDate(value)
            setInputValue(format(value, "MM/dd/yyyy"))
            setCalendarDate(value)
        } else {
            setDate(null)
            setInputValue("")
        }
    }, [value])

    // Handle manual input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)

        // Try to parse the date
        if (newValue.length >= 8) {
            // Only try to parse if we have enough characters
            const parsedDate = parse(newValue, "MM/dd/yyyy", new Date())

            if (isValid(parsedDate)) {
                // Check if date is within min/max constraints
                const isAfterMinDate = minDate ? parsedDate >= minDate : true
                const isBeforeMaxDate = maxDate ? parsedDate <= maxDate : true

                if (isAfterMinDate && isBeforeMaxDate) {
                    setDate(parsedDate)
                    setCalendarDate(parsedDate)
                    if (onChange) onChange(parsedDate)
                }
            }
        }
    }

    // Handle calendar date selection
    const handleCalendarSelect = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate)
            setInputValue(format(newDate, "MM/dd/yyyy"))
            if (onChange) onChange(newDate)
            setCalendarOpen(false)
        }
    }

    // Handle year change
    const handleYearChange = (year: string) => {
        if (!calendarDate) return

        const newDate = new Date(calendarDate)
        newDate.setFullYear(Number.parseInt(year))

        setCalendarDate(newDate)
        setYearSelectOpen(false)
    }

    // Handle month change
    const handleMonthChange = (monthIndex: string) => {
        if (!calendarDate) return

        const newDate = new Date(calendarDate)
        newDate.setMonth(Number.parseInt(monthIndex))

        setCalendarDate(newDate)
        setMonthSelectOpen(false)
    }


    const handleWheel = (event: React.WheelEvent) => {
        if (listRef.current) {
            event.stopPropagation();
            listRef.current.scrollTop += event.deltaY;
        }
    };

    // Get current month and year for display
    const currentMonthYear = calendarDate
        ? { month: calendarDate.getMonth(), year: calendarDate.getFullYear() }
        : { month: new Date().getMonth(), year: new Date().getFullYear() }

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            <div className="flex">
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="MM/DD/YYYY"
                    readOnly={true}
                    className="rounded-r-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                    disabled={disabled}
                />
                <Popover open={calendarOpen && !disabled} onOpenChange={setCalendarOpen} modal={true}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={calendarOpen}
                            className={cn("rounded-l-none border-l-0", !date && "text-muted-foreground")}
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCalendarOpen(!calendarOpen);
                            }}
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <div className="flex items-center justify-between p-2 border-b w-full">
                            <Popover open={monthSelectOpen} onOpenChange={setMonthSelectOpen} modal={true}>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-sm font-normal"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMonthSelectOpen(!monthSelectOpen);
                                        }}
                                    >
                                        Month: {months[currentMonthYear.month]}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0">
                                    <div className="grid grid-cols-3 gap-1 p-2 max-h-[200px] overflow-y-auto">
                                        {months.map((month, index) => (
                                            <Button
                                                key={month}
                                                variant="ghost"
                                                size="sm"
                                                className={cn("text-xs", currentMonthYear.month === index && "bg-primary/10")}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMonthChange(index.toString());
                                                }}
                                            >
                                                {month}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Popover open={yearSelectOpen} onOpenChange={setYearSelectOpen} modal={true}>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        role="combobox" 
                                        className="text-sm font-normal"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setYearSelectOpen(!yearSelectOpen);
                                        }}
                                    >
                                        Year: {currentMonthYear.year}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search year..." />
                                        <CommandList ref={listRef}
                                            onWheel={handleWheel} className="max-h-[200px] overflow-y-auto scrollbar">
                                            <CommandEmpty>No year found.</CommandEmpty>
                                            <CommandGroup>
                                                {years.map((year) => (
                                                    <CommandItem
                                                        key={year}
                                                        value={year.toString()}
                                                        onSelect={() => {
                                                            handleYearChange(year.toString())
                                                            setYearSelectOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                currentMonthYear.year === year ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {year}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Calendar
                            mode="single"
                            selected={date || undefined}
                            onSelect={handleCalendarSelect}
                            month={calendarDate}
                            onMonthChange={setCalendarDate}
                            disabled={(date) => {
                                if (minDate && date < minDate) return true
                                if (maxDate && date > maxDate) return true
                                return false
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

