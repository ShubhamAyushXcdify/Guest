import { createSerializer, inferParserType, parseAsString, useQueryStates } from 'nuqs'

export const appointmentSearchParamsParser = {
    search: parseAsString,
    status: parseAsString,
    provider: parseAsString,
    dateFrom: parseAsString,
    dateTo: parseAsString,
}

export const appointmentSearchParamsSerializer = createSerializer(appointmentSearchParamsParser);
export type AppointmentSearchParamsType = inferParserType<typeof appointmentSearchParamsParser>;

function useAppointmentFilter() {
    const [searchParams, setSearchParams] = useQueryStates(appointmentSearchParamsParser);

    const handleSearch = (search: string) => {
        setSearchParams({ search });
    }

    const handleStatus = (status: string) => {
        setSearchParams({ status });
    }

    const handleProvider = (provider: string) => {
        setSearchParams({ provider });
    }

    const handleDate = (dateFrom: string | null, dateTo: string | null) => {
        let dateToApi = null;
        let dateFromApi = null;

        if (dateFrom === "today") {
            dateToApi = new Date().toISOString();
        } else if (dateFrom === "yesterday") {
            dateToApi = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
        } else if (dateFrom === "thisWeek") {
            dateToApi = new Date().toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
        } else if (dateFrom === "thisMonth") {
            dateToApi = new Date().toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
        } else if (dateFrom === "thisYear") {
            dateToApi = new Date().toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 365)).toISOString();
        } else if (dateFrom === "lastWeek") {
            dateToApi = new Date().toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
        } else if (dateFrom === "lastMonth") {
            dateToApi = new Date().toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
        } else if (dateFrom === "lastYear") {
            dateToApi = new Date().toISOString();
            dateFromApi = new Date(new Date().setDate(new Date().getDate() - 365)).toISOString();
        } else if (dateFrom) {
            dateToApi = dateTo;
            dateFromApi = dateFrom;
        }

        // Set both date and provider parameters
        setSearchParams({
            dateFrom: dateFromApi,
            dateTo: dateToApi,
            provider: searchParams.provider // Preserve existing provider
        });

    }

    const removeAllFilters = () => {
        setSearchParams({
            dateFrom: null,
            dateTo: null,
            provider: null
        });
    }
    return { searchParams, handleSearch, handleStatus, handleProvider, handleDate, removeAllFilters };
}

export default useAppointmentFilter
