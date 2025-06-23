import { createSerializer, inferParserType, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

export const appointmentSearchParamsParser = {
    search: parseAsString,
    status: parseAsString,
    provider: parseAsString,
    dateFrom: parseAsString,
    dateTo: parseAsString,
    clinicId: parseAsString,
    patientId: parseAsString,
    clientId: parseAsString,
    veterinarianId: parseAsString,
    roomId: parseAsString,
    pageNumber: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
}

export const appointmentSearchParamsSerializer = createSerializer(appointmentSearchParamsParser);
export type AppointmentSearchParamsType = inferParserType<typeof appointmentSearchParamsParser>;

function useAppointmentFilter() {
    const [searchParams, setSearchParams] = useQueryStates(appointmentSearchParamsParser);

    const handleSearch = (search: string) => {
        setSearchParams({ search });
    }

    const handleStatus = (status: string) => {
        setSearchParams({ 
            status,
            pageNumber: 1 // Reset to page 1 when changing status filter
        });
    }

    const handleProvider = (veterinarianId: string) => {
        setSearchParams({ 
            veterinarianId,
            provider: null, // Clear the legacy provider parameter
            pageNumber: 1 // Reset to page 1 when changing provider filter
        });
    }

    const handleDate = (dateFrom: string | null, dateTo: string | null) => {
        // Directly set the date parameters without any additional processing
        // If both parameters are provided, use them as is
        if (dateFrom && dateTo) {
            setSearchParams({
                dateFrom,
                dateTo,
            });
            return;
        }

        let dateToApi = null;
        let dateFromApi = null;

        if (dateFrom === "today") {
            const today = formatDateOnly(new Date());
            dateToApi = today;
            dateFromApi = today;
        } else if (dateFrom === "yesterday") {
            dateToApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 1)));
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 1)));
        } else if (dateFrom === "thisWeek") {
            dateToApi = formatDateOnly(new Date());
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 7)));
        } else if (dateFrom === "thisMonth") {
            dateToApi = formatDateOnly(new Date());
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 30)));
        } else if (dateFrom === "thisYear") {
            dateToApi = formatDateOnly(new Date());
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 365)));
        } else if (dateFrom === "lastWeek") {
            dateToApi = formatDateOnly(new Date());
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 7)));
        } else if (dateFrom === "lastMonth") {
            dateToApi = formatDateOnly(new Date());
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 30)));
        } else if (dateFrom === "lastYear") {
            dateToApi = formatDateOnly(new Date());
            dateFromApi = formatDateOnly(new Date(new Date().setDate(new Date().getDate() - 365)));
        } else if (dateFrom) {
            // If dateFrom is an ISO string, extract just the date part
            dateToApi = dateTo ? (dateTo.includes('T') ? dateTo.split('T')[0] : dateTo) : dateFrom;
            dateFromApi = dateFrom ? (dateFrom.includes('T') ? dateFrom.split('T')[0] : dateFrom) : null;
        }
        
        // Set both date and provider parameters
        setSearchParams({
            dateFrom: dateFromApi,
            dateTo: dateToApi,
            veterinarianId: searchParams.veterinarianId, // Preserve existing veterinarianId
            pageNumber: 1, // Reset to page 1 when changing date
        });
    }

    const removeAllFilters = () => {
        setSearchParams({
            dateFrom: null,
            dateTo: null,
            provider: null,
            veterinarianId: null,
            pageNumber: 1,
        });
    }

    // Helper function to format date as YYYY-MM-DD
    const formatDateOnly = (date: Date): string => {
        return date.toISOString().split('T')[0];
    }
    
    return { searchParams, handleSearch, handleStatus, handleProvider, handleDate, removeAllFilters };
}

export default useAppointmentFilter
