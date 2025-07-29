export interface VaccinationMaster {
    id: string;
    species: string;
    isCore: boolean;
    disease: string;
    vaccineType: string;
    initialDose: string;
    booster: string;
    revaccinationInterval: string;
    notes: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateVaccinationMasterData {
    species: string;
    isCore: boolean;
    disease: string;
    vaccineType: string;
    initialDose: string;
    booster: string;
    revaccinationInterval: string;
    notes: string;
}

export interface UpdateVaccinationMasterData {
    id: string;
    species?: string;
    isCore?: boolean;
    disease?: string;
    vaccineType?: string;
    initialDose?: string;
    booster?: string;
    revaccinationInterval?: string;
    notes?: string;
} 