import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"

interface Patient {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
}

export function usePatientSearch(query: string, searchType: string) {
    const [results, setResults] = useState<Patient[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
        const searchPatients = async () => {
            if (!debouncedQuery) {
                setResults([])
                return
            }
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/patients/search?query=${debouncedQuery}&type=${searchType}`)
                
                if (!response.ok) {
                    throw new Error('Failed to fetch patients')
                }

                const data = await response.json()
                setResults(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }

        searchPatients()
    }, [debouncedQuery, searchType])

    return { results, isLoading, error }
} 