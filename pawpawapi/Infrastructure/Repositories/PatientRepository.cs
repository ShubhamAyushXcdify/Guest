using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class PatientRepository : IPatientRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PatientRepository> _logger;

        public PatientRepository(DapperDbContext dbContext, ILogger<PatientRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Patient?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        p.id as Id,
                        p.client_id as ClientId,
                        p.company_id as CompanyId,
                        p.name as Name,
                        p.species as Species,
                        p.breed as Breed,
                        p.secondary_breed as SecondaryBreed,
                        p.color as Color,
                        p.gender as Gender,
                        p.is_neutered as IsNeutered,
                        p.date_of_birth as DateOfBirth,
                        p.weight_kg as WeightKg,
                        p.microchip_number as MicrochipNumber,
                        p.registration_number as RegistrationNumber,
                        p.insurance_provider as InsuranceProvider,
                        p.insurance_policy_number as InsurancePolicyNumber,
                        p.allergies as Allergies,
                        p.medical_conditions as MedicalConditions,
                        p.behavioral_notes as BehavioralNotes,
                        p.is_active as IsActive,
                        p.created_at as CreatedAt,
                        p.updated_at as UpdatedAt,
                        c.first_name AS client_first_name,
                        c.last_name AS client_last_name,
                        c.email AS client_email,
                        c.phone_primary AS client_phone_primary,
                        c.phone_secondary AS client_phone_secondary,
                        c.address_line1 AS client_address_line1,
                        c.address_line2 AS client_address_line2,
                        c.city AS client_city,
                        c.state AS client_state,
                        c.postal_code AS client_postal_code,
                        c.emergency_contact_name AS client_emergency_contact_name,
                        c.emergency_contact_phone AS client_emergency_contact_phone,
                        c.notes AS client_notes
                    FROM patients p
                    LEFT JOIN clients c ON p.client_id = c.id
                    WHERE p.id = @Id";
                return await connection.QueryFirstOrDefaultAsync<Patient>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync");
                throw;
            }
        }

        public async Task<Patient?> GetByMicrochipNumberAsync(string microchipNumber)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        p.id as Id,
                        p.client_id as ClientId,
                        p.company_id as CompanyId,
                        p.name as Name,
                        p.species as Species,
                        p.breed as Breed,
                        p.secondary_breed as SecondaryBreed,
                        p.color as Color,
                        p.gender as Gender,
                        p.is_neutered as IsNeutered,
                        p.date_of_birth as DateOfBirth,
                        p.weight_kg as WeightKg,
                        p.microchip_number as MicrochipNumber,
                        p.registration_number as RegistrationNumber,
                        p.insurance_provider as InsuranceProvider,
                        p.insurance_policy_number as InsurancePolicyNumber,
                        p.allergies as Allergies,
                        p.medical_conditions as MedicalConditions,
                        p.behavioral_notes as BehavioralNotes,
                        p.is_active as IsActive,
                        p.created_at as CreatedAt,
                        p.updated_at as UpdatedAt,
                        c.first_name AS client_first_name,
                        c.last_name AS client_last_name,
                        c.email AS client_email,
                        c.phone_primary AS client_phone_primary,
                        c.phone_secondary AS client_phone_secondary,
                        c.address_line1 AS client_address_line1,
                        c.address_line2 AS client_address_line2,
                        c.city AS client_city,
                        c.state AS client_state,
                        c.postal_code AS client_postal_code,
                        c.emergency_contact_name AS client_emergency_contact_name,
                        c.emergency_contact_phone AS client_emergency_contact_phone,
                        c.notes AS client_notes
                    FROM patients p
                    LEFT JOIN clients c ON p.client_id = c.id
                    WHERE LOWER(TRIM(p.microchip_number)) = LOWER(TRIM(@MicrochipNumber))";
                return await connection.QueryFirstOrDefaultAsync<Patient>(sql, new { MicrochipNumber = microchipNumber });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByMicrochipNumberAsync for microchip number {MicrochipNumber}", microchipNumber);
                throw;
            }
        }

        public async Task<(IEnumerable<Patient> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? medicalRecordId = null,
            bool paginationRequired = true,
            Guid? companyId = null,
            string? search = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (patientId.HasValue)
                {
                    whereClauses.Add("p.id = @PatientId");
                    parameters.Add("PatientId", patientId.Value);
                }
                if (clientId.HasValue)
                {
                    whereClauses.Add("p.client_id = @ClientId");
                    parameters.Add("ClientId", clientId.Value);
                }

                if (medicalRecordId.HasValue)
                {
                    whereClauses.Add("p.medical_record_id = @MedicalRecordId");
                    parameters.Add("MedicalRecordId", medicalRecordId.Value);
                }
                if (companyId.HasValue)
                {
                    whereClauses.Add("p.company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    whereClauses.Add(@"(p.microchip_number ILIKE '%' || @Search || '%' OR p.name ILIKE '%' || @Search || '%' OR COALESCE(c.first_name, '') ILIKE '%' || @Search || '%')");
                    parameters.Add("Search", search.Trim());
                }

                var whereClause = whereClauses.Count > 0
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var countSql = $@"
                    SELECT COUNT(*) 
                    FROM patients p
                    LEFT JOIN clients c ON p.client_id = c.id
                    {whereClause}";
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                var sql = $@"
                    SELECT 
                        p.id as Id,
                        p.client_id as ClientId,
                        p.company_id as CompanyId,
                        p.name as Name,
                        p.species as Species,
                        p.breed as Breed,
                        p.secondary_breed as SecondaryBreed,
                        p.color as Color,
                        p.gender as Gender,
                        p.is_neutered as IsNeutered,
                        p.date_of_birth as DateOfBirth,
                        p.weight_kg as WeightKg,
                        p.microchip_number as MicrochipNumber,
                        p.registration_number as RegistrationNumber,
                        p.insurance_provider as InsuranceProvider,
                        p.insurance_policy_number as InsurancePolicyNumber,
                        p.allergies as Allergies,
                        p.medical_conditions as MedicalConditions,
                        p.behavioral_notes as BehavioralNotes,
                        p.is_active as IsActive,
                        p.created_at as CreatedAt,
                        p.updated_at as UpdatedAt,
                        c.first_name AS client_first_name,
                        c.last_name AS client_last_name,
                        c.email AS client_email,
                        c.phone_primary AS client_phone_primary,
                        c.phone_secondary AS client_phone_secondary,
                        c.address_line1 AS client_address_line1,
                        c.address_line2 AS client_address_line2,
                        c.city AS client_city,
                        c.state AS client_state,
                        c.postal_code AS client_postal_code,
                        c.emergency_contact_name AS client_emergency_contact_name,
                        c.emergency_contact_phone AS client_emergency_contact_phone,
                        c.notes AS client_notes
                    FROM patients p
                    LEFT JOIN clients c ON p.client_id = c.id
                    {whereClause}
                    ORDER BY p.created_at DESC";

                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    sql += " LIMIT @PageSize OFFSET @Offset";
                    parameters.Add("PageSize", pageSize);
                    parameters.Add("Offset", offset);
                }

                var items = await connection.QueryAsync<Patient>(sql, parameters);
                return (items, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<Patient> AddAsync(Patient patient)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                // Generate new ID if not provided
                if (patient.Id == Guid.Empty)
                {
                    patient.Id = Guid.NewGuid();
                }

                // Set timestamps
                patient.CreatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    INSERT INTO patients (
                        id, client_id, company_id, name, species, breed, secondary_breed, color,
                        gender, is_neutered, date_of_birth, weight_kg, microchip_number,
                        registration_number, insurance_provider, insurance_policy_number,
                        allergies, medical_conditions, behavioral_notes, is_active,
                        created_at, updated_at
                    ) VALUES (
                        @Id, @ClientId, @CompanyId, @Name, @Species, @Breed, @SecondaryBreed, @Color,
                        @Gender, @IsNeutered, @DateOfBirth, @WeightKg, @MicrochipNumber,
                        @RegistrationNumber, @InsuranceProvider, @InsurancePolicyNumber,
                        @Allergies, @MedicalConditions, @BehavioralNotes, @IsActive,
                        @CreatedAt, @UpdatedAt
                    )
                    RETURNING
                        id as Id,
                        client_id as ClientId,
                        company_id as CompanyId,
                        name as Name,
                        species as Species,
                        breed as Breed,
                        secondary_breed as SecondaryBreed,
                        color as Color,
                        gender as Gender,
                        is_neutered as IsNeutered,
                        date_of_birth as DateOfBirth,
                        weight_kg as WeightKg,
                        microchip_number as MicrochipNumber,
                        registration_number as RegistrationNumber,
                        insurance_provider as InsuranceProvider,
                        insurance_policy_number as InsurancePolicyNumber,
                        allergies as Allergies,
                        medical_conditions as MedicalConditions,
                        behavioral_notes as BehavioralNotes,
                        is_active as IsActive,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt;";

                return await connection.QuerySingleAsync<Patient>(sql, patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddAsync");
                throw;
            }
        }

        public async Task<IEnumerable<Patient>> SearchAsync(string query, string type, int page, int pageSize, Guid? companyId = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                var whereClause = new List<string>();
                var parameters = new DynamicParameters();

                // First try to find the column in the schema
                var columnName = string.Concat(type.Select((x, i) => i > 0 && char.IsUpper(x) ? "_" + x.ToString() : x.ToString())).ToLower();
                
                // Convert camelCase to lowercase with underscores for switch case matching
                var normalizedType = type.ToLower()
                    // Handle emergency contact fields first
                    .Replace("emergencycontactname", "emergency_contact_name")
                    .Replace("emergencycontactphone", "emergency_contact_phone")
                    // Handle other fields
                    .Replace("firstname", "first_name")
                    .Replace("lastname", "last_name")
                    .Replace("phoneprimary", "phone_primary")
                    .Replace("phonesecondary", "phone_secondary")
                    .Replace("addressline", "address_line")
                    .Replace("emergencycontact", "emergency_contact")
                    .Replace("postalcode", "postal_code")
                    .Replace("emergencyname", "emergency_contact_name")
                    .Replace("emergencyphone", "emergency_contact_phone");

                // Add 'client_' prefix if it's not already there
                if (!normalizedType.StartsWith("client_") && normalizedType.StartsWith("client"))
                {
                    normalizedType = "client_" + normalizedType.Substring(6);
                }

                // "search" type: filter by microchipNumber OR name OR clientFirstName
                if (normalizedType == "search")
                {
                    whereClause.Add(@"(p.microchip_number ILIKE '%' || @Query || '%' OR p.name ILIKE '%' || @Query || '%' OR COALESCE(c.first_name, '') ILIKE '%' || @Query || '%')");
                    parameters.Add("Query", query.Trim());
                }
                else
                {
                // Find the most accurate column match using LIKE and get its data type
                var columnInfo = await connection.QueryFirstOrDefaultAsync<(string TableName, string ColumnName, string DataType)>(@"
                    SELECT 
                        table_name as TableName,
                        column_name as ColumnName,
                        data_type as DataType
                    FROM information_schema.columns 
                    WHERE (table_name = 'patients' OR table_name = 'clients')
                    AND column_name LIKE @ColumnName
                    ORDER BY 
                        CASE 
                            WHEN column_name = @ColumnName THEN 1
                            WHEN column_name LIKE @ColumnName || '%' THEN 2
                            WHEN column_name LIKE '%' || @ColumnName || '%' THEN 3
                            ELSE 4
                        END,
                        column_name
                    LIMIT 1;",
                    new { ColumnName = columnName });

                string finalColumnName;
                string tableAlias;
                bool isNumeric;

                if (columnInfo.TableName != null)
                {
                    finalColumnName = columnInfo.ColumnName;
                    tableAlias = columnInfo.TableName == "patients" ? "p" : "c";
                    isNumeric = columnInfo.DataType == "numeric" || 
                               columnInfo.DataType == "integer" || 
                               columnInfo.DataType == "bigint" || 
                               columnInfo.DataType == "smallint";
                }
                else
                {
                    // If not found in schema, use explicit mapping
                    switch (normalizedType)
                    {
                        case "name":
                            finalColumnName = "name";
                            tableAlias = "p";
                            isNumeric = false;
                            break;
                        case "species":
                            finalColumnName = "species";
                            tableAlias = "p";
                            isNumeric = false;
                            break;
                        case "breed":
                            finalColumnName = "breed";
                            tableAlias = "p";
                            isNumeric = false;
                            break;
                        case "secondary_breed":
                            finalColumnName = "secondary_breed";
                            tableAlias = "p";
                            isNumeric = false;
                            break;
                        case "client_first_name":
                            finalColumnName = "first_name";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_last_name":
                            finalColumnName = "last_name";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_email":
                            finalColumnName = "email";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_phone_primary":
                            finalColumnName = "phone_primary";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_phone_secondary":
                            finalColumnName = "phone_secondary";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_address_line1":
                            finalColumnName = "address_line1";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_address_line2":
                            finalColumnName = "address_line2";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_city":
                            finalColumnName = "city";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_state":
                            finalColumnName = "state";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_postal_code":
                            finalColumnName = "postal_code";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_emergency_contact_name":
                            finalColumnName = "emergency_contact_name";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_emergency_contact_phone":
                            finalColumnName = "emergency_contact_phone";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "client_notes":
                            finalColumnName = "notes";
                            tableAlias = "c";
                            isNumeric = false;
                            break;
                        case "weight_kg":
                            finalColumnName = "weight_kg";
                            tableAlias = "p";
                            isNumeric = true;
                            break;
                        default:
                            throw new ArgumentException($"Invalid search type: {type}. Valid types are: search, name, species, breed, secondary_breed, clientfirstname, clientlastname, clientemail, clientphone, clientphone_secondary, clientaddress_line1, clientaddress_line2, clientcity, clientstate, clientpostal_code, clientemergency_contact_name, clientemergency_contact_phone, clientnotes, weightkg");
                    }
                }

                // Handle numeric fields differently
                if (isNumeric)
                {
                    if (decimal.TryParse(query, out decimal numericValue))
                    {
                        whereClause.Add($"{tableAlias}.{finalColumnName} = @Query");
                        parameters.Add("Query", numericValue);
                    }
                    else
                    {
                        // If the query is not a valid number, return no results
                        return Enumerable.Empty<Patient>();
                    }
                }
                else
                {
                    // Check if the query is numeric even though the field is string
                    if (decimal.TryParse(query, out _))
                    {
                        // For numeric queries on string fields, don't use LOWER
                        whereClause.Add($"{tableAlias}.{finalColumnName} LIKE @Query");
                        parameters.Add("Query", $"%{query}%");
                    }
                else
                {
                    // For non-numeric queries on string fields, use LOWER
                        whereClause.Add($"LOWER({tableAlias}.{finalColumnName}) LIKE LOWER(@Query)");
                        parameters.Add("Query", $"%{query}%");
                    }
                }
                }
                if (companyId.HasValue)
                {
                    whereClause.Add("p.company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                var whereClauseStr = whereClause.Any() ? "WHERE " + string.Join(" AND ", whereClause) : "";
                parameters.Add("Offset", (page - 1) * pageSize);
                parameters.Add("PageSize", pageSize);

                var sql = $@"
                    SELECT 
                        p.id as Id,
                        p.client_id as ClientId,
                        p.company_id as CompanyId,
                        p.name as Name,
                        p.species as Species,
                        p.breed as Breed,
                        p.secondary_breed as SecondaryBreed,
                        p.color as Color,
                        p.gender as Gender,
                        p.is_neutered as IsNeutered,
                        p.date_of_birth as DateOfBirth,
                        p.weight_kg as WeightKg,
                        p.microchip_number as MicrochipNumber,
                        p.registration_number as RegistrationNumber,
                        p.insurance_provider as InsuranceProvider,
                        p.insurance_policy_number as InsurancePolicyNumber,
                        p.allergies as Allergies,
                        p.medical_conditions as MedicalConditions,
                        p.behavioral_notes as BehavioralNotes,
                        p.is_active as IsActive,
                        p.created_at as CreatedAt,
                        p.updated_at as UpdatedAt,
                        c.first_name AS client_first_name,
                        c.last_name AS client_last_name,
                        c.email AS client_email,
                        c.phone_primary AS client_phone_primary,
                        c.phone_secondary AS client_phone_secondary,
                        c.address_line1 AS client_address_line1,
                        c.address_line2 AS client_address_line2,
                        c.city AS client_city,
                        c.state AS client_state,
                        c.postal_code AS client_postal_code,
                        c.emergency_contact_name AS client_emergency_contact_name,
                        c.emergency_contact_phone AS client_emergency_contact_phone,
                        c.notes AS client_notes
                    FROM patients p
                    LEFT JOIN clients c ON p.client_id = c.id
                    {whereClauseStr}
                    ORDER BY p.created_at DESC
                     OFFSET @Offset ROWS 
                        FETCH NEXT @PageSize ROWS ONLY;";

                return await connection.QueryAsync<Patient>(sql, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchAsync");
                throw;
            }
        }

        public async Task<Patient> UpdateAsync(Patient patient)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                // Get existing patient to compare values
                var existingPatient = await GetByIdAsync(patient.Id);
                if (existingPatient == null)
                    throw new KeyNotFoundException("Patient not found.");

                // Build dynamic update query based on changed values
                var setClauses = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("Id", patient.Id);

                // Only include fields that have changed
                if (patient.ClientId != existingPatient.ClientId)
                {
                    setClauses.Add("client_id = @ClientId");
                    parameters.Add("ClientId", patient.ClientId);
                }
                if (patient.CompanyId != existingPatient.CompanyId)
                {
                    setClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", patient.CompanyId);
                }
                if (patient.Name != existingPatient.Name)
                {
                    setClauses.Add("name = @Name");
                    parameters.Add("Name", patient.Name);
                }
                if (patient.Species != existingPatient.Species)
                {
                    setClauses.Add("species = @Species");
                    parameters.Add("Species", patient.Species);
                }
                if (patient.Breed != existingPatient.Breed)
                {
                    setClauses.Add("breed = @Breed");
                    parameters.Add("Breed", patient.Breed);
                }
                if (patient.SecondaryBreed != existingPatient.SecondaryBreed)
                {
                    setClauses.Add("secondary_breed = @SecondaryBreed");
                    parameters.Add("SecondaryBreed", patient.SecondaryBreed);
                }
                if (patient.Color != existingPatient.Color)
                {
                    setClauses.Add("color = @Color");
                    parameters.Add("Color", patient.Color);
                }
                if (patient.Gender != existingPatient.Gender)
                {
                    setClauses.Add("gender = @Gender");
                    parameters.Add("Gender", patient.Gender);
                }
                if (patient.IsNeutered != existingPatient.IsNeutered)
                {
                    setClauses.Add("is_neutered = @IsNeutered");
                    parameters.Add("IsNeutered", patient.IsNeutered);
                }
                if (patient.DateOfBirth != existingPatient.DateOfBirth)
                {
                    setClauses.Add("date_of_birth = @DateOfBirth");
                    parameters.Add("DateOfBirth", patient.DateOfBirth);
                }
                if (patient.WeightKg != existingPatient.WeightKg)
                {
                    setClauses.Add("weight_kg = @WeightKg");
                    parameters.Add("WeightKg", patient.WeightKg);
                }
                if (patient.MicrochipNumber != existingPatient.MicrochipNumber)
                {
                    setClauses.Add("microchip_number = @MicrochipNumber");
                    parameters.Add("MicrochipNumber", patient.MicrochipNumber);
                }
                if (patient.RegistrationNumber != existingPatient.RegistrationNumber)
                {
                    setClauses.Add("registration_number = @RegistrationNumber");
                    parameters.Add("RegistrationNumber", patient.RegistrationNumber);
                }
                if (patient.InsuranceProvider != existingPatient.InsuranceProvider)
                {
                    setClauses.Add("insurance_provider = @InsuranceProvider");
                    parameters.Add("InsuranceProvider", patient.InsuranceProvider);
                }
                if (patient.InsurancePolicyNumber != existingPatient.InsurancePolicyNumber)
                {
                    setClauses.Add("insurance_policy_number = @InsurancePolicyNumber");
                    parameters.Add("InsurancePolicyNumber", patient.InsurancePolicyNumber);
                }
                if (patient.Allergies != existingPatient.Allergies)
                {
                    setClauses.Add("allergies = @Allergies");
                    parameters.Add("Allergies", patient.Allergies);
                }
                if (patient.MedicalConditions != existingPatient.MedicalConditions)
                {
                    setClauses.Add("medical_conditions = @MedicalConditions");
                    parameters.Add("MedicalConditions", patient.MedicalConditions);
                }
                if (patient.BehavioralNotes != existingPatient.BehavioralNotes)
                {
                    setClauses.Add("behavioral_notes = @BehavioralNotes");
                    parameters.Add("BehavioralNotes", patient.BehavioralNotes);
                }
                if (patient.IsActive != existingPatient.IsActive)
                {
                    setClauses.Add("is_active = @IsActive");
                    parameters.Add("IsActive", patient.IsActive);
                }

                if (setClauses.Count == 0) // No changes
                {
                    return existingPatient;
                }

                // Always update the updated_at timestamp
                setClauses.Add("updated_at = @UpdatedAt");
                parameters.Add("UpdatedAt", DateTimeOffset.UtcNow);

                var setClause = string.Join(", ", setClauses);
                var sql = $@"
                    UPDATE patients 
                    SET {setClause} 
                    WHERE id = @Id 
                    RETURNING 
                        id as Id,
                        client_id as ClientId,
                        name as Name,
                        species as Species,
                        breed as Breed,
                        secondary_breed as SecondaryBreed,
                        color as Color,
                        gender as Gender,
                        is_neutered as IsNeutered,
                        date_of_birth as DateOfBirth,
                        weight_kg as WeightKg,
                        microchip_number as MicrochipNumber,
                        registration_number as RegistrationNumber,
                        insurance_provider as InsuranceProvider,
                        insurance_policy_number as InsurancePolicyNumber,
                        allergies as Allergies,
                        medical_conditions as MedicalConditions,
                        behavioral_notes as BehavioralNotes,
                        is_active as IsActive,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt;";

                var result = await connection.QuerySingleOrDefaultAsync<Patient>(sql, parameters);
                if (result == null)
                    throw new KeyNotFoundException("Patient not found.");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM patients WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync");
                throw;
            }
        }

        public async Task<object> GetPatientVisitDetailsAsync(Guid patientId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                                // First, get patient details - Use quoted identifiers to preserve case
                const string patientSql = @"
                    SELECT 
                        p.name AS ""Name"",
                        p.species AS ""Species"",
                        p.breed AS ""Breed"",
                        p.secondary_breed AS ""SecondaryBreed"",
                        p.color AS ""Color"",
                        p.gender AS ""Gender"",
                        p.is_neutered AS ""IsNeutered"",
                        p.date_of_birth AS ""DateOfBirth"",
                        p.weight_kg AS ""WeightKg"",
                        p.microchip_number AS ""MicrochipNumber"",
                        p.registration_number AS ""RegistrationNumber"",
                        p.insurance_provider AS ""InsuranceProvider"",
                        p.insurance_policy_number AS ""InsurancePolicyNumber"",     
                        p.allergies AS ""Allergies"",
                        p.medical_conditions AS ""MedicalConditions"",
                        p.behavioral_notes AS ""BehavioralNotes"",
                        p.is_active AS ""IsActive"",
                        p.created_at AS ""CreatedAt"",
                        p.updated_at AS ""UpdatedAt"",
                        c.first_name AS ""ClientFirstName"",
                        c.last_name AS ""ClientLastName"",
                        c.email AS ""ClientEmail"",
                        c.phone_primary AS ""ClientPhonePrimary"",
                        c.phone_secondary AS ""ClientPhoneSecondary"",
                        c.address_line1 AS ""ClientAddressLine1"",
                        c.address_line2 AS ""ClientAddressLine2"",
                        c.city AS ""ClientCity"",
                        c.state AS ""ClientState"",
                        c.postal_code AS ""ClientPostalCode"",
                        c.emergency_contact_name AS ""ClientEmergencyContactName"", 
                        c.emergency_contact_phone AS ""ClientEmergencyContactPhone"",                                                                               
                        c.notes AS ""ClientNotes""
                    FROM patients p
                    LEFT JOIN clients c ON p.client_id = c.id
                    WHERE p.id = @PatientId";

                var patientData = await connection.QueryFirstOrDefaultAsync<dynamic>(patientSql, new { PatientId = patientId });

                if (patientData == null)
                {
                    throw new KeyNotFoundException($"Patient with id {patientId} not found");
                }

                                // Get all appointments with related data, excluding Certification type - Use quoted identifiers
                const string appointmentsSql = @"
                    SELECT
                        a.id AS ""AppointmentId"",
                        a.appointment_date AS ""AppointmentDate"",
                        a.appointment_time_from AS ""AppointmentTimeFrom"",
                        a.appointment_time_to AS ""AppointmentTimeTo"",
                        at.name AS ""AppointmentType"",
                        a.reason AS ""Reason"",
                        a.status AS ""Status"",
                        a.notes AS ""Notes"",
                        a.is_registered AS ""IsRegistered"",
                        a.created_at AS ""CreatedAt"",
                        a.updated_at AS ""UpdatedAt"",
                        (u.first_name || ' ' || u.last_name) AS ""VeterinarianName"",                                                                               
                        cl.name AS ""ClinicName"",
                        r.name AS ""RoomName"",
                        v.id AS ""VisitId"",
                        pd.id AS ""PrescriptionDetailId"",
                        pd.notes AS ""PrescriptionNotes"",
                        pd.created_at AS ""PrescriptionCreatedAt"",
                        pd.updated_at AS ""PrescriptionUpdatedAt"",
                        ppm.id AS ""ProductMappingId"",
                        ppm.is_checked AS ""IsChecked"",
                        ppm.quantity AS ""Quantity"",
                        ppm.frequency AS ""Frequency"",
                        ppm.directions AS ""Directions"",
                        ppm.number_of_days AS ""NumberOfDays"",
                        ppm.created_at AS ""ProductMappingCreatedAt"",
                        ppm.updated_at AS ""ProductMappingUpdatedAt"",
                        pr.product_number AS ""ProductNumber"",
                        pr.name AS ""ProductName"",
                        pr.generic_name AS ""ProductGenericName"",
                        pr.category AS ""ProductCategory"",
                        pr.brandname AS ""ProductBrandName"",
                        pr.ndc_number AS ""ProductNdcNumber"",
                        pr.dosage_form AS ""ProductDosageForm"",
                        pr.unit_of_measure AS ""ProductUnitOfMeasure"",
                        pr.requires_prescription AS ""ProductRequiresPrescription"",
                        pr.controlled_substance_schedule AS ""ProductControlledSubstanceSchedule"",
                        pr.storage_requirements AS ""ProductStorageRequirements"",
                        pr.is_active AS ""ProductIsActive"",
                        pr.price AS ""ProductPrice"",
                        pr.selling_price AS ""ProductSellingPrice""
                    FROM appointments a
                    LEFT JOIN appointment_type at ON a.appointment_type_id = at.appointment_type_id
                    LEFT JOIN users u ON a.veterinarian_id = u.id
                    LEFT JOIN clinics cl ON a.clinic_id = cl.id
                    LEFT JOIN rooms r ON a.room_id = r.id
                    LEFT JOIN visits v ON v.appointment_id = a.id
                    LEFT JOIN prescription_details pd ON pd.visit_id = v.id
                    LEFT JOIN prescription_product_mapping ppm ON ppm.prescription_detail_id = pd.id
                    LEFT JOIN products pr ON ppm.product_id = pr.id
                    WHERE a.patient_id = @PatientId
                        AND a.id IS NOT NULL
                        AND (at.name IS NULL OR LOWER(at.name) != 'certification')
                    ORDER BY a.appointment_date DESC, a.appointment_time_from DESC, ppm.created_at ASC";

                var appointmentRows = await connection.QueryAsync(appointmentsSql, new { PatientId = patientId });

                // Group appointments and build nested structure using dictionaries
                var appointmentsDict = new Dictionary<Guid, Dictionary<string, object>>();
                var processedProductMappings = new HashSet<Guid>();

                foreach (dynamic row in appointmentRows)
                {
                    // Access dynamic properties using IDictionary to handle case sensitivity
                    var rowDict = (IDictionary<string, object>)row;
                    
                    // Skip rows with null AppointmentId - check both cases
                    object? appointmentIdValue = null;
                    if (rowDict.ContainsKey("AppointmentId"))
                        appointmentIdValue = rowDict["AppointmentId"];
                    else if (rowDict.ContainsKey("appointmentid"))
                        appointmentIdValue = rowDict["appointmentid"];
                    
                    if (appointmentIdValue == null || appointmentIdValue == DBNull.Value)
                        continue;

                    var appointmentId = (Guid)appointmentIdValue;

                    // Helper function to safely get values from dynamic row
                    T GetRowValue<T>(string key, T defaultValue = default(T))
                    {
                        object? value = null;
                        
                        // Try exact match first
                        if (rowDict.ContainsKey(key))
                            value = rowDict[key];
                        // Try lowercase version
                        else
                        {
                            var lowerKey = key.ToLowerInvariant();
                            if (rowDict.ContainsKey(lowerKey))
                                value = rowDict[lowerKey];
                        }
                        
                        if (value == null || value == DBNull.Value)
                            return defaultValue;
                        
                        // Handle nullable types
                        var type = typeof(T);
                        var underlyingType = Nullable.GetUnderlyingType(type);
                        var targetType = underlyingType ?? type;
                        
                        try
                        {
                            // Direct cast if types match exactly
                            if (value is T directValue)
                                return directValue;
                            
                            // Handle DateTimeOffset (both nullable and non-nullable)
                            if (targetType == typeof(DateTimeOffset))
                            {
                                if (value is DateTimeOffset dtOffsetValue)
                                {
                                    if (underlyingType != null)
                                        return (T)(object)(DateTimeOffset?)dtOffsetValue;
                                    return (T)(object)dtOffsetValue;
                                }
                                if (value is DateTime dt)
                                {
                                    var dtOffsetResult = new DateTimeOffset(dt, TimeSpan.Zero);
                                    if (underlyingType != null)
                                        return (T)(object)(DateTimeOffset?)dtOffsetResult;
                                    return (T)(object)dtOffsetResult;
                                }
                            }
                            
                            // Handle TimeSpan (both nullable and non-nullable)
                            if (targetType == typeof(TimeSpan))
                            {
                                if (value is TimeSpan ts)
                                {
                                    if (underlyingType != null)
                                        return (T)(object)(TimeSpan?)ts;
                                    return (T)(object)ts;
                                }
                            }
                            
                            // Handle nullable value types
                            if (underlyingType != null)
                            {
                                // Check if underlying type supports IConvertible
                                if (typeof(IConvertible).IsAssignableFrom(underlyingType))
                                {
                                    var converted = Convert.ChangeType(value, underlyingType);
                                    return (T)converted;
                                }
                                // For non-IConvertible nullable types, try direct cast
                                if (value.GetType() == underlyingType)
                                    return (T)value;
                            }
                            
                            // For non-nullable types that support IConvertible
                            if (typeof(IConvertible).IsAssignableFrom(targetType))
                            {
                                return (T)Convert.ChangeType(value, targetType);
                            }
                            
                            // Final attempt: direct cast
                            return (T)value;
                        }
                        catch
                        {
                            return defaultValue;
                        }
                    }

                    if (!appointmentsDict.ContainsKey(appointmentId))
                    {
                        appointmentsDict[appointmentId] = new Dictionary<string, object>
                        {
                            ["AppointmentDate"] = GetRowValue<DateTime>("AppointmentDate"),
                            ["AppointmentTimeFrom"] = GetRowValue<TimeSpan?>("AppointmentTimeFrom"),
                            ["AppointmentTimeTo"] = GetRowValue<TimeSpan?>("AppointmentTimeTo"),
                            ["AppointmentType"] = GetRowValue<string>("AppointmentType"),
                            ["Reason"] = GetRowValue<string>("Reason"),
                            ["Status"] = GetRowValue<string>("Status"),
                            ["Notes"] = GetRowValue<string>("Notes"),
                            ["IsRegistered"] = GetRowValue<bool?>("IsRegistered") ?? false,
                            ["CreatedAt"] = GetRowValue<DateTimeOffset?>("CreatedAt"),
                            ["UpdatedAt"] = GetRowValue<DateTimeOffset?>("UpdatedAt"),
                            ["VeterinarianName"] = GetRowValue<string>("VeterinarianName"),
                            ["ClinicName"] = GetRowValue<string>("ClinicName"),
                            ["RoomName"] = GetRowValue<string>("RoomName"),
                            ["Prescription"] = GetRowValue<object>("VisitId") != null && GetRowValue<object>("PrescriptionDetailId") != null
                                ? new Dictionary<string, object>
                                {
                                    ["Notes"] = GetRowValue<string>("PrescriptionNotes"),
                                    ["CreatedAt"] = GetRowValue<DateTimeOffset?>("PrescriptionCreatedAt") ?? DateTimeOffset.UtcNow,
                                    ["UpdatedAt"] = GetRowValue<DateTimeOffset?>("PrescriptionUpdatedAt") ?? DateTimeOffset.UtcNow,
                                    ["ProductMappings"] = new List<Dictionary<string, object>>()
                                }
                                : null
                        };
                    }

                    // Add product mapping if exists and not already processed
                    var visitIdValue = GetRowValue<object>("VisitId");
                    var prescriptionDetailIdValue = GetRowValue<object>("PrescriptionDetailId");
                    var productMappingIdValue = GetRowValue<object>("ProductMappingId");
                    
                    if (visitIdValue != null && prescriptionDetailIdValue != null && productMappingIdValue != null)
                    {
                        var productMappingId = (Guid)productMappingIdValue;
                        if (!processedProductMappings.Contains(productMappingId))
                        {
                            processedProductMappings.Add(productMappingId);

                            var appointment = appointmentsDict[appointmentId];
                            var prescription = appointment["Prescription"] as Dictionary<string, object>;
                            
                            if (prescription != null)
                            {
                                var productMappings = prescription["ProductMappings"] as List<Dictionary<string, object>>;
                                
                                if (productMappings != null)
                                {
                                    var productMapping = new Dictionary<string, object>
                                    {
                                        ["IsChecked"] = GetRowValue<bool>("IsChecked", false),
                                        ["Quantity"] = GetRowValue<int?>("Quantity"),
                                        ["Frequency"] = GetRowValue<string>("Frequency"),
                                        ["Directions"] = GetRowValue<string>("Directions"),
                                        ["NumberOfDays"] = GetRowValue<int?>("NumberOfDays"),
                                        ["CreatedAt"] = GetRowValue<DateTimeOffset?>("ProductMappingCreatedAt") ?? DateTimeOffset.UtcNow,
                                        ["UpdatedAt"] = GetRowValue<DateTimeOffset?>("ProductMappingUpdatedAt") ?? DateTimeOffset.UtcNow,
                                        ["Product"] = productMappingIdValue != null && GetRowValue<object>("ProductName") != null
                                            ? new Dictionary<string, object>
                                            {
                                                ["ProductNumber"] = GetRowValue<string>("ProductNumber"),
                                                ["Name"] = GetRowValue<string>("ProductName"),
                                                ["GenericName"] = GetRowValue<string>("ProductGenericName"),
                                                ["Category"] = GetRowValue<string>("ProductCategory"),
                                                ["Manufacturer"] = GetRowValue<string>("ProductBrandName"),
                                                ["NdcNumber"] = GetRowValue<string>("ProductNdcNumber"),
                                                ["DosageForm"] = GetRowValue<string>("ProductDosageForm"),
                                                ["UnitOfMeasure"] = GetRowValue<string>("ProductUnitOfMeasure"),
                                                ["RequiresPrescription"] = GetRowValue<bool?>("ProductRequiresPrescription"),
                                                ["ControlledSubstanceSchedule"] = GetRowValue<string>("ProductControlledSubstanceSchedule"),
                                                ["BrandName"] = GetRowValue<string>("ProductBrandName"),
                                                ["StorageRequirements"] = GetRowValue<string>("ProductStorageRequirements"),
                                                ["IsActive"] = GetRowValue<bool?>("ProductIsActive"),
                                                ["Price"] = GetRowValue<decimal?>("ProductPrice"),
                                                ["SellingPrice"] = GetRowValue<decimal?>("ProductSellingPrice")
                                            }
                                            : null
                                    };
                                    productMappings.Add(productMapping);
                                }
                            }
                        }
                    }
                }

                // Build final result structure - Access dynamic properties using IDictionary
                var patientDict = (IDictionary<string, object>)patientData;
                var GetValue = (string key) => patientDict.ContainsKey(key) ? patientDict[key] : null;
                
                var result = new Dictionary<string, object>
                {
                    ["Name"] = GetValue("Name") ?? GetValue("name") ?? string.Empty,
                    ["Species"] = GetValue("Species") ?? GetValue("species") ?? string.Empty,
                    ["Breed"] = GetValue("Breed") ?? GetValue("breed"),
                    ["SecondaryBreed"] = GetValue("SecondaryBreed") ?? GetValue("secondarybreed"),
                    ["Color"] = GetValue("Color") ?? GetValue("color"),
                    ["Gender"] = GetValue("Gender") ?? GetValue("gender"),
                    ["IsNeutered"] = GetValue("IsNeutered") ?? GetValue("isneutered"),
                    ["DateOfBirth"] = GetValue("DateOfBirth") ?? GetValue("dateofbirth"),
                    ["WeightKg"] = GetValue("WeightKg") ?? GetValue("weightkg"),
                    ["MicrochipNumber"] = GetValue("MicrochipNumber") ?? GetValue("microchipnumber"),
                    ["RegistrationNumber"] = GetValue("RegistrationNumber") ?? GetValue("registrationnumber"),
                    ["InsuranceProvider"] = GetValue("InsuranceProvider") ?? GetValue("insuranceprovider"),
                    ["InsurancePolicyNumber"] = GetValue("InsurancePolicyNumber") ?? GetValue("insurancepolicynumber"),
                    ["Allergies"] = GetValue("Allergies") ?? GetValue("allergies"),
                    ["MedicalConditions"] = GetValue("MedicalConditions") ?? GetValue("medicalconditions"),
                    ["BehavioralNotes"] = GetValue("BehavioralNotes") ?? GetValue("behavioralnotes"),
                    ["IsActive"] = GetValue("IsActive") ?? GetValue("isactive"),
                    ["CreatedAt"] = GetValue("CreatedAt") ?? GetValue("createdat"),
                    ["UpdatedAt"] = GetValue("UpdatedAt") ?? GetValue("updatedat"),
                    ["ClientFirstName"] = GetValue("ClientFirstName") ?? GetValue("clientfirstname"),
                    ["ClientLastName"] = GetValue("ClientLastName") ?? GetValue("clientlastname"),
                    ["ClientEmail"] = GetValue("ClientEmail") ?? GetValue("clientemail"),
                    ["ClientPhonePrimary"] = GetValue("ClientPhonePrimary") ?? GetValue("clientphoneprimary"),
                    ["ClientPhoneSecondary"] = GetValue("ClientPhoneSecondary") ?? GetValue("clientphonesecondary"),
                    ["ClientAddressLine1"] = GetValue("ClientAddressLine1") ?? GetValue("clientaddressline1"),
                    ["ClientAddressLine2"] = GetValue("ClientAddressLine2") ?? GetValue("clientaddressline2"),
                    ["ClientCity"] = GetValue("ClientCity") ?? GetValue("clientcity"),
                    ["ClientState"] = GetValue("ClientState") ?? GetValue("clientstate"),
                    ["ClientPostalCode"] = GetValue("ClientPostalCode") ?? GetValue("clientpostalcode"),
                    ["ClientEmergencyContactName"] = GetValue("ClientEmergencyContactName") ?? GetValue("clientemergencycontactname"),
                    ["ClientEmergencyContactPhone"] = GetValue("ClientEmergencyContactPhone") ?? GetValue("clientemergencycontactphone"),
                    ["ClientNotes"] = GetValue("ClientNotes") ?? GetValue("clientnotes"),
                    ["Appointments"] = appointmentsDict.Values.ToList()
                };

                // Serialize to JSON and return
                return JsonSerializer.Serialize(result);
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientVisitDetailsAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<IEnumerable<object>> GetPatientWeightHistoryAsync(Guid patientId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                const string sql = @"
                    -- Weight from medical_records (appointments)
                    SELECT 
                        mr.weight_kg as WeightKg,
                        COALESCE(mr.visit_date, mr.created_at::date) as Date,
                        'Appointment' as Source,
                        mr.appointment_id as AppointmentId,
                        NULL::uuid as VisitId,
                        mr.created_at as CreatedAt
                    FROM medical_records mr
                    WHERE mr.patient_id = @PatientId
                        AND mr.weight_kg IS NOT NULL

                    UNION ALL

                    -- Weight from intake_details (visits)
                    SELECT 
                        id.weight_kg as WeightKg,
                        COALESCE(a.appointment_date, id.created_at::date) as Date,
                        'Intake' as Source,
                        a.id as AppointmentId,
                        id.visit_id as VisitId,
                        id.created_at as CreatedAt
                    FROM intake_details id
                    INNER JOIN visits v ON id.visit_id = v.id
                    INNER JOIN appointments a ON v.appointment_id = a.id
                    WHERE a.patient_id = @PatientId
                        AND id.weight_kg IS NOT NULL

                    UNION ALL

                    -- Weight from deworming_intake (visits)
                    SELECT 
                        di.weight_kg as WeightKg,
                        COALESCE(a.appointment_date, di.created_at::date) as Date,
                        'Deworming' as Source,
                        a.id as AppointmentId,
                        di.visit_id as VisitId,
                        di.created_at as CreatedAt
                    FROM deworming_intake di
                    INNER JOIN visits v ON di.visit_id = v.id
                    INNER JOIN appointments a ON v.appointment_id = a.id
                    WHERE a.patient_id = @PatientId
                        AND di.weight_kg IS NOT NULL

                    UNION ALL

                    -- Weight from emergency_vitals (visits)
                    SELECT 
                        ev.weight_kg as WeightKg,
                        COALESCE(a.appointment_date, ev.created_at::date) as Date,
                        'Emergency' as Source,
                        a.id as AppointmentId,
                        ev.visit_id as VisitId,
                        ev.created_at as CreatedAt
                    FROM emergency_vitals ev
                    INNER JOIN visits v ON ev.visit_id = v.id
                    INNER JOIN appointments a ON v.appointment_id = a.id
                    WHERE a.patient_id = @PatientId
                        AND ev.weight_kg IS NOT NULL

                    UNION ALL

                    -- Weight from surgery_pre_op (visits)
                    SELECT 
                        spo.weight_kg as WeightKg,
                        COALESCE(a.appointment_date, spo.created_at::date) as Date,
                        'Surgery' as Source,
                        a.id as AppointmentId,
                        spo.visit_id as VisitId,
                        spo.created_at as CreatedAt
                    FROM surgery_pre_op spo
                    INNER JOIN visits v ON spo.visit_id = v.id
                    INNER JOIN appointments a ON v.appointment_id = a.id
                    WHERE a.patient_id = @PatientId
                        AND spo.weight_kg IS NOT NULL

                    ORDER BY Date DESC, CreatedAt DESC;";

                var results = await connection.QueryAsync(sql, new { PatientId = patientId });
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientWeightHistoryAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<IEnumerable<object>> GetPatientAppointmentHistoryAsync(Guid patientId, Guid? clinicId = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                var sql = @"
                    SELECT 
                        a.id as AppointmentId,
                        v.id as VisitId,
                        a.appointment_date as AppointmentDate,
                        a.appointment_time_from as AppointmentTimeFrom,
                        a.appointment_time_to as AppointmentTimeTo,
                        at.name as AppointmentType,
                        a.status as Status,
                        a.reason as Reason,
                        a.notes as Notes,
                        a.is_registered as IsRegistered,
                        a.veterinarian_id as VeterinarianId,
                        (u.first_name || ' ' || u.last_name) as VeterinarianName,
                        a.clinic_id as ClinicId,
                        cl.name as ClinicName,
                        a.room_id as RoomId,
                        r.name as RoomName,
                        a.created_at as CreatedAt,
                        a.updated_at as UpdatedAt
                    FROM appointments a
                    LEFT JOIN appointment_type at ON a.appointment_type_id = at.appointment_type_id
                    LEFT JOIN users u ON a.veterinarian_id = u.id
                    LEFT JOIN clinics cl ON a.clinic_id = cl.id
                    LEFT JOIN rooms r ON a.room_id = r.id
                    LEFT JOIN visits v ON v.appointment_id = a.id
                    WHERE a.patient_id = @PatientId
                        AND NOT (
                            LOWER(at.name) = 'certification' 
                            AND LOWER(a.status) = 'cancelled'
                        )";
                if (clinicId.HasValue)
                {
                    sql += " AND a.clinic_id = @ClinicId";
                }
                sql += @"
                    ORDER BY a.appointment_date DESC, a.appointment_time_from DESC, a.created_at DESC;";

                var parameters = new DynamicParameters();
                parameters.Add("PatientId", patientId);
                if (clinicId.HasValue)
                {
                    parameters.Add("ClinicId", clinicId.Value);
                }

                var results = await connection.QueryAsync(sql, parameters);
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientAppointmentHistoryAsync for patient {PatientId}", patientId);
                throw;
            }
        }
    }
}