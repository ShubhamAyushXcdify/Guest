"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date | null
    onChange?: (date: Date | null) => void
    minDate?: Date
    maxDate?: Date
    placeholder?: string
    className?: string
    disabled?: boolean
    inputFormat?: string // date-fns format string, e.g. "dd/MM/yyyy" or "MMMM dd, yyyy"
    autoFormatTyping?: boolean // when true and inputFormat is dd/MM/yyyy, auto-insert slashes while typing
}

const DEFAULT_DISPLAY_FORMAT = "MMMM dd, yyyy"

export function DatePicker({
    value,
    onChange,
    minDate,
    maxDate,
    placeholder,
    className,
    disabled = false,
    inputFormat = DEFAULT_DISPLAY_FORMAT,
    autoFormatTyping = false,
}: DatePickerProps) {
    const initialDate = value ?? null
    const [open, setOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(initialDate)
    const [visibleMonth, setVisibleMonth] = React.useState<Date | undefined>(initialDate ?? undefined)
    const [inputValue, setInputValue] = React.useState<string>(initialDate ? format(initialDate, inputFormat) : "")

    React.useEffect(() => {
        if (value) {
            setSelectedDate(value)
            setVisibleMonth(value)
            setInputValue(format(value, inputFormat))
        } else {
            setSelectedDate(null)
            setInputValue("")
        }
    }, [value, inputFormat])

    const withinBounds = (date: Date) => {
        if (minDate && date < minDate) return false
        if (maxDate && date > maxDate) return false
        return true
    }

    const formatDdMmYyyyMask = (raw: string) => {
        const digits = raw.replace(/\D/g, "").slice(0, 8)
        const dd = digits.slice(0, 2)
        const mm = digits.slice(2, 4)
        const yyyy = digits.slice(4, 8)
        let masked = dd
        if (mm) masked += "/" + mm
        if (yyyy) masked += "/" + yyyy
        return masked
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let next = e.target.value

        if (autoFormatTyping && inputFormat === "dd/MM/yyyy") {
            next = formatDdMmYyyyMask(next)
            setInputValue(next)
            if (next.length === 10) {
                const parsed = parse(next, inputFormat, new Date())
                if (isValid(parsed) && withinBounds(parsed)) {
                    setSelectedDate(parsed)
                    setVisibleMonth(parsed)
                    if (onChange) onChange(parsed)
                }
            }
            return
        }

        setInputValue(next)
        const parsed = parse(next, inputFormat, new Date())
        if (isValid(parsed) && withinBounds(parsed)) {
            setSelectedDate(parsed)
            setVisibleMonth(parsed)
            if (onChange) onChange(parsed)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
        }
    }

    const handleSelect = (date: Date | undefined) => {
        if (!date) return
        if (!withinBounds(date)) return
        setSelectedDate(date)
        setInputValue(format(date, inputFormat))
        if (onChange) onChange(date)
        setOpen(false)
    }

    return (
        <div className={cn("flex", className)}>
            <Input
                value={inputValue}
                placeholder={placeholder ?? (inputFormat === "dd/MM/yyyy" ? "dd/mm/yyyy" : "June 01, 2025")}
                className="bg-background pr-10 rounded-r-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
            <Popover open={open && !disabled} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-l-none border-l-0"
                        onClick={() => setOpen((v) => !v)}
                        disabled={disabled}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span className="sr-only">Select date</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                    <Calendar
                        mode="single"
                        selected={selectedDate ?? undefined}
                        captionLayout="dropdown"
                        month={visibleMonth}
                        onMonthChange={setVisibleMonth}
                        onSelect={handleSelect}
                        disabled={(d) => {
                            if (minDate && d < minDate) return true
                            if (maxDate && d > maxDate) return true
                            return false
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

