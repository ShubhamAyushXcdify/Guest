using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PatientService> _logger;
        private readonly ICompanyService _companyService;
        private readonly IServiceProvider _serviceProvider;
        private readonly IIntakeDetailRepository _intakeDetailRepository;
        private readonly IVitalDetailRepository _vitalDetailRepository;
        private readonly IComplaintDetailRepository _complaintDetailRepository;
        private readonly IProcedureDetailRepository _procedureDetailRepository;
        private readonly IPrescriptionDetailRepository _prescriptionDetailRepository;
        private readonly IPurchaseOrderReceivingHistoryRepository _purchaseOrderReceivingHistoryRepository;
        private readonly IPlanDetailRepository _planDetailRepository;
        private readonly ISurgeryDetailRepository _surgeryDetailRepository;
        private readonly ISurgeryDischargeRepository _surgeryDischargeRepository;
        private readonly ISurgeryPostOpRepository _surgeryPostOpRepository;
        private readonly ISurgeryPreOpRepository _surgeryPreOpRepository;
        private readonly IDewormingCheckoutRepository _dewormingCheckoutRepository;
        private readonly IDewormingIntakeRepository _dewormingIntakeRepository;
        private readonly IDewormingMedicationRepository _dewormingMedicationRepository;
        private readonly IDewormingNoteRepository _dewormingNoteRepository;
        private readonly IEmergencyDischargeRepository _emergencyDischargeRepository;
        private readonly IEmergencyProcedureRepository _emergencyProcedureRepository;
        private readonly IEmergencyVisitRepository _emergencyVisitRepository;
        private readonly IEmergencyVitalRepository _emergencyVitalRepository;
        private readonly ICertificateRepository _certificateRepository;
        private readonly IVaccinationDetailRepository _vaccinationDetailRepository;

        public PatientService(
            IPatientRepository patientRepository,
            IMapper mapper,
            ILogger<PatientService> logger,
            ICompanyService companyService,
            IServiceProvider serviceProvider,
            IIntakeDetailRepository intakeDetailRepository,
            IVitalDetailRepository vitalDetailRepository,
            IComplaintDetailRepository complaintDetailRepository,
            IProcedureDetailRepository procedureDetailRepository,
            IPrescriptionDetailRepository prescriptionDetailRepository,
            IPurchaseOrderReceivingHistoryRepository purchaseOrderReceivingHistoryRepository,
            IPlanDetailRepository planDetailRepository,
            ISurgeryDetailRepository surgeryDetailRepository,
            ISurgeryDischargeRepository surgeryDischargeRepository,
            ISurgeryPostOpRepository surgeryPostOpRepository,
            ISurgeryPreOpRepository surgeryPreOpRepository,
            IDewormingCheckoutRepository dewormingCheckoutRepository,
            IDewormingIntakeRepository dewormingIntakeRepository,
            IDewormingMedicationRepository dewormingMedicationRepository,
            IDewormingNoteRepository dewormingNoteRepository,
            IEmergencyDischargeRepository emergencyDischargeRepository,
            IEmergencyProcedureRepository emergencyProcedureRepository,
            IEmergencyVisitRepository emergencyVisitRepository,
            IEmergencyVitalRepository emergencyVitalRepository,
            ICertificateRepository certificateRepository,
            IVaccinationDetailRepository vaccinationDetailRepository)
        {
            _patientRepository = patientRepository;
            _mapper = mapper;
            _logger = logger;
            _companyService = companyService;
            _serviceProvider = serviceProvider;
            _intakeDetailRepository = intakeDetailRepository;
            _vitalDetailRepository = vitalDetailRepository;
            _complaintDetailRepository = complaintDetailRepository;
            _procedureDetailRepository = procedureDetailRepository;
            _prescriptionDetailRepository = prescriptionDetailRepository;
            _purchaseOrderReceivingHistoryRepository = purchaseOrderReceivingHistoryRepository;
            _planDetailRepository = planDetailRepository;
            _surgeryDetailRepository = surgeryDetailRepository;
            _surgeryDischargeRepository = surgeryDischargeRepository;
            _surgeryPostOpRepository = surgeryPostOpRepository;
            _surgeryPreOpRepository = surgeryPreOpRepository;
            _dewormingCheckoutRepository = dewormingCheckoutRepository;
            _dewormingIntakeRepository = dewormingIntakeRepository;
            _dewormingMedicationRepository = dewormingMedicationRepository;
            _dewormingNoteRepository = dewormingNoteRepository;
            _emergencyDischargeRepository = emergencyDischargeRepository;
            _emergencyProcedureRepository = emergencyProcedureRepository;
            _emergencyVisitRepository = emergencyVisitRepository;
            _emergencyVitalRepository = emergencyVitalRepository;
            _certificateRepository = certificateRepository;
            _vaccinationDetailRepository = vaccinationDetailRepository;
        }

        public async Task<PatientResponseDto?> GetByIdAsync(Guid id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            return patient == null ? null : _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<PaginatedResponseDto<PatientResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? medicalRecordId = null,
            bool paginationRequired = true,
            Guid? companyId = null,
            string? search = null)
        {
            try
            {
                var (patients, totalCount) = await _patientRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    patientId,
                    clientId,
                    medicalRecordId,
                    paginationRequired,
                    companyId,
                    search);

                var dtos = _mapper.Map<IEnumerable<PatientResponseDto>>(patients).ToList();

                return new PaginatedResponseDto<PatientResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = paginationRequired ? pageNumber : 1,
                    PageSize = paginationRequired ? pageSize : totalCount,
                    TotalPages = paginationRequired ? (int)Math.Ceiling(totalCount / (double)pageSize) : 1,
                    HasPreviousPage = paginationRequired && pageNumber > 1,
                    HasNextPage = paginationRequired && pageNumber < (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<IEnumerable<PatientResponseDto>> SearchAsync(
         string query, string type, int page = 1, int pageSize = 2, Guid? companyId = null)
        {
            try
            {
                var patients = await _patientRepository.SearchAsync(query, type, page, pageSize, companyId);
                return _mapper.Map<IEnumerable<PatientResponseDto>>(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchAsync");
                throw;
            }
        }



        public async Task<PatientResponseDto> CreateAsync(CreatePatientRequestDto dto)
        {
            // Validate that the company exists
            var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
            if (company == null)
            {
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
            }

            // Validate microchip number is provided
            if (string.IsNullOrWhiteSpace(dto.MicrochipNumber))
            {
                throw new ArgumentException("Microchip number is required.");
            }

            // Check if microchip number already exists
            var existingPatient = await _patientRepository.GetByMicrochipNumberAsync(dto.MicrochipNumber);
            if (existingPatient != null)
            {
                throw new InvalidOperationException($"Microchip number '{dto.MicrochipNumber}' already exists.");
            }

            var patient = _mapper.Map<Patient>(dto);
            await _patientRepository.AddAsync(patient);
            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<PatientResponseDto> UpdateAsync(UpdatePatientRequestDto dto)
        {
            // Validate that the company exists
            var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
            if (company == null)
            {
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
            }

            // Validate microchip number is provided
            if (string.IsNullOrWhiteSpace(dto.MicrochipNumber))
            {
                throw new ArgumentException("Microchip number is required.");
            }

            // Check if patient exists
            var existingPatient = await _patientRepository.GetByIdAsync(dto.Id);
            if (existingPatient == null)
            {
                throw new KeyNotFoundException($"Patient with ID {dto.Id} not found.");
            }

            // Check if microchip number already exists for a different patient
            var patientWithMicrochip = await _patientRepository.GetByMicrochipNumberAsync(dto.MicrochipNumber);
            if (patientWithMicrochip != null && patientWithMicrochip.Id != dto.Id)
            {
                throw new InvalidOperationException($"Microchip number '{dto.MicrochipNumber}' already exists for another patient.");
            }

            var patient = _mapper.Map<Patient>(dto);
            await _patientRepository.UpdateAsync(patient);
            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _patientRepository.DeleteAsync(id);
        }

        public async Task<PatientVisitDetailsResponseDto> GetPatientVisitDetailsAsync(Guid patientId)
        {
            try
            {
                var result = await _patientRepository.GetPatientVisitDetailsAsync(patientId);
                // Deserialize JSON string to DTO
                var jsonString = result.ToString();
                return System.Text.Json.JsonSerializer.Deserialize<PatientVisitDetailsResponseDto>(jsonString)
                    ?? throw new InvalidOperationException("Failed to deserialize patient visit details");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientVisitDetailsAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<PatientWeightHistoryResponseDto> GetPatientWeightHistoryAsync(Guid patientId)
        {
            try
            {
                // First get patient info to include name
                var patient = await _patientRepository.GetByIdAsync(patientId);
                if (patient == null)
                {
                    throw new KeyNotFoundException($"Patient with id {patientId} not found");
                }

                // Get weight history from repository
                var weightHistoryData = await _patientRepository.GetPatientWeightHistoryAsync(patientId);

                // Helper function to safely get values from dictionary (handles case-insensitive keys)
                T GetDictValue<T>(IDictionary<string, object> dict, string key, T defaultValue = default(T))
                {
                    object? value = null;

                    // Try exact match first
                    if (dict.ContainsKey(key))
                        value = dict[key];
                    // Try lowercase version (PostgreSQL folds unquoted identifiers to lowercase)
                    else if (dict.ContainsKey(key.ToLowerInvariant()))
                        value = dict[key.ToLowerInvariant()];

                    if (value == null || value == DBNull.Value)
                        return defaultValue;

                    try
                    {
                        if (value is T directValue)
                            return directValue;

                        var type = typeof(T);
                        var underlyingType = Nullable.GetUnderlyingType(type);
                        var targetType = underlyingType ?? type;

                        // Handle Guid specifically
                        if (targetType == typeof(Guid))
                        {
                            if (value is Guid guidValue)
                                return underlyingType != null ? (T)(object)(Guid?)guidValue : (T)(object)guidValue;
                            if (value is string stringValue && Guid.TryParse(stringValue, out var parsedGuid))
                                return underlyingType != null ? (T)(object)(Guid?)parsedGuid : (T)(object)parsedGuid;
                        }

                        // Handle DateTimeOffset specifically
                        if (targetType == typeof(DateTimeOffset))
                        {
                            if (value is DateTimeOffset dtOffsetValue)
                                return underlyingType != null ? (T)(object)(DateTimeOffset?)dtOffsetValue : (T)(object)dtOffsetValue;
                            if (value is DateTime dt)
                            {
                                var dtOffsetResult = new DateTimeOffset(dt, TimeSpan.Zero);
                                return underlyingType != null ? (T)(object)(DateTimeOffset?)dtOffsetResult : (T)(object)dtOffsetResult;
                            }
                        }

                        if (underlyingType != null && typeof(IConvertible).IsAssignableFrom(underlyingType))
                        {
                            var converted = Convert.ChangeType(value, underlyingType);
                            return (T)converted;
                        }

                        if (typeof(IConvertible).IsAssignableFrom(targetType))
                        {
                            return (T)Convert.ChangeType(value, targetType);
                        }

                        return (T)value;
                    }
                    catch
                    {
                        return defaultValue;
                    }
                }

                // Map to DTO
                var weightHistoryItems = weightHistoryData.Select(item =>
                {
                    var dict = item as IDictionary<string, object>;
                    if (dict == null) return null;

                    return new WeightHistoryItemDto
                    {
                        WeightKg = GetDictValue<decimal?>(dict, "WeightKg"),
                        Date = GetDictValue<DateTime?>(dict, "Date"),
                        Source = GetDictValue<string>(dict, "Source") ?? string.Empty,
                        AppointmentId = GetDictValue<Guid?>(dict, "AppointmentId"),
                        VisitId = GetDictValue<Guid?>(dict, "VisitId"),
                        CreatedAt = GetDictValue<DateTimeOffset?>(dict, "CreatedAt")
                    };
                })
                .Where(item => item != null)
                .Cast<WeightHistoryItemDto>()
                .ToList();

                return new PatientWeightHistoryResponseDto
                {
                    PatientId = patientId,
                    PatientName = patient.Name,
                    WeightHistory = weightHistoryItems
                };
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientWeightHistoryAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<PatientAppointmentHistoryResponseDto> GetPatientAppointmentHistoryAsync(Guid patientId, Guid? clinicId = null)
        {
            try
            {
                // First get patient info to include name
                var patient = await _patientRepository.GetByIdAsync(patientId);
                if (patient == null)
                {
                    throw new KeyNotFoundException($"Patient with id {patientId} not found");
                }

                // Get appointment history from repository (optionally filtered by clinic)
                var appointmentHistoryData = await _patientRepository.GetPatientAppointmentHistoryAsync(patientId, clinicId);

                // Helper function to safely get values from dictionary (handles case-insensitive keys)
                T GetDictValue<T>(IDictionary<string, object> dict, string key, T defaultValue = default(T))
                {
                    object? value = null;

                    // Try exact match first
                    if (dict.ContainsKey(key))
                        value = dict[key];
                    // Try lowercase version (PostgreSQL folds unquoted identifiers to lowercase)
                    else if (dict.ContainsKey(key.ToLowerInvariant()))
                        value = dict[key.ToLowerInvariant()];

                    if (value == null || value == DBNull.Value)
                        return defaultValue;

                    try
                    {
                        if (value is T directValue)
                            return directValue;

                        var type = typeof(T);
                        var underlyingType = Nullable.GetUnderlyingType(type);
                        var targetType = underlyingType ?? type;

                        // Handle Guid specifically
                        if (targetType == typeof(Guid))
                        {
                            if (value is Guid guidValue)
                                return underlyingType != null ? (T)(object)(Guid?)guidValue : (T)(object)guidValue;
                            if (value is string stringValue && Guid.TryParse(stringValue, out var parsedGuid))
                                return underlyingType != null ? (T)(object)(Guid?)parsedGuid : (T)(object)parsedGuid;
                        }

                        // Handle DateTimeOffset specifically
                        if (targetType == typeof(DateTimeOffset))
                        {
                            if (value is DateTimeOffset dtOffsetValue)
                                return underlyingType != null ? (T)(object)(DateTimeOffset?)dtOffsetValue : (T)(object)dtOffsetValue;
                            if (value is DateTime dt)
                            {
                                var dtOffsetResult = new DateTimeOffset(dt, TimeSpan.Zero);
                                return underlyingType != null ? (T)(object)(DateTimeOffset?)dtOffsetResult : (T)(object)dtOffsetResult;
                            }
                        }

                        // Handle TimeSpan specifically
                        if (targetType == typeof(TimeSpan))
                        {
                            if (value is TimeSpan tsValue)
                                return underlyingType != null ? (T)(object)(TimeSpan?)tsValue : (T)(object)tsValue;
                        }

                        if (underlyingType != null && typeof(IConvertible).IsAssignableFrom(underlyingType))
                        {
                            var converted = Convert.ChangeType(value, underlyingType);
                            return (T)converted;
                        }

                        if (typeof(IConvertible).IsAssignableFrom(targetType))
                        {
                            return (T)Convert.ChangeType(value, targetType);
                        }

                        return (T)value;
                    }
                    catch
                    {
                        return defaultValue;
                    }
                }

                // Map to DTO
                var appointmentHistoryItems = appointmentHistoryData.Select(item =>
                {
                    var dict = item as IDictionary<string, object>;
                    if (dict == null) return null;

                    return new AppointmentHistoryItemDto
                    {
                        AppointmentId = GetDictValue<Guid>(dict, "AppointmentId"),
                        VisitId = GetDictValue<Guid?>(dict, "VisitId"),
                        AppointmentDate = GetDictValue<DateTime>(dict, "AppointmentDate"),
                        AppointmentTimeFrom = GetDictValue<TimeSpan?>(dict, "AppointmentTimeFrom"),
                        AppointmentTimeTo = GetDictValue<TimeSpan?>(dict, "AppointmentTimeTo"),
                        AppointmentType = GetDictValue<string>(dict, "AppointmentType"),
                        Status = GetDictValue<string>(dict, "Status"),
                        Reason = GetDictValue<string>(dict, "Reason"),
                        Notes = GetDictValue<string>(dict, "Notes"),
                        IsRegistered = GetDictValue<bool>(dict, "IsRegistered", false),
                        VeterinarianId = GetDictValue<Guid?>(dict, "VeterinarianId"),
                        VeterinarianName = GetDictValue<string>(dict, "VeterinarianName"),
                        ClinicId = GetDictValue<Guid?>(dict, "ClinicId"),
                        ClinicName = GetDictValue<string>(dict, "ClinicName"),
                        RoomId = GetDictValue<Guid?>(dict, "RoomId"),
                        RoomName = GetDictValue<string>(dict, "RoomName"),
                        CreatedAt = GetDictValue<DateTimeOffset?>(dict, "CreatedAt"),
                        UpdatedAt = GetDictValue<DateTimeOffset?>(dict, "UpdatedAt")
                    };
                })
                .Where(item => item != null)
                .Cast<AppointmentHistoryItemDto>()
                .ToList();

                // Populate visit details for consultation appointments
                foreach (var appointmentItem in appointmentHistoryItems)
                {
                    if (!appointmentItem.VisitId.HasValue ||
                        string.IsNullOrEmpty(appointmentItem.AppointmentType))
                        continue;

                    await LoadVisitDetailsAsync(appointmentItem);
                }

                // return final response
                return new PatientAppointmentHistoryResponseDto
                {
                    PatientId = patientId,
                    PatientName = patient.Name,
                    AppointmentHistory = appointmentHistoryItems
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientAppointmentHistoryAsync for patient {PatientId}", patientId);
                throw;
            }
        }
        private async Task LoadVisitDetailsAsync(AppointmentHistoryItemDto item)
        {
            var visitId = item.VisitId!.Value;
            var type = item.AppointmentType!.ToLower();

            switch (type)
            {
                case "consultation":
                    await LoadConsultationDetails(item, visitId);
                    break;

                case "surgery":
                    await LoadSurgeryDetails(item, visitId);
                    break;

                case "emergency":
                    await LoadEmergencyDetails(item, visitId);
                    break;

                case "deworming":
                    await LoadDewormingDetails(item, visitId);
                    break;

                case "certification":
                    await LoadCertificationDetails(item, visitId);
                    break;

                case "vaccination":
                    await LoadVaccinationDetails(item, visitId);
                    break;

                // Add more appointment types here
                default:
                    _logger.LogInformation("No details loader mapped for appointment type {Type}", type);
                    break;
            }
        }
        private async Task LoadConsultationDetails(AppointmentHistoryItemDto item, Guid visitId)
        {
            try
            {
                var intakeDetail = await _intakeDetailRepository.GetByVisitIdAsync(visitId);
                item.IntakeDetail = intakeDetail != null ? _mapper.Map<IntakeDetailResponseDto>(intakeDetail) : null;

                
                var vitalDetail = await _vitalDetailRepository.GetByVisitIdAsync(visitId);
                item.VitalDetail = vitalDetail != null ? _mapper.Map<VitalDetailResponseDto>(vitalDetail) : null;

                var complaintDetail = await _complaintDetailRepository.GetByVisitIdAsync(visitId);
                item.ComplaintDetail = complaintDetail != null ? _mapper.Map<ComplaintDetailResponseDto>(complaintDetail) : null;

                var procedureDetail = await _procedureDetailRepository.GetByVisitIdAsync(visitId);
                item.ProcedureDetail = procedureDetail != null ? _mapper.Map<ProcedureDetailResponseDto>(procedureDetail) : null;

                var prescriptionDetail = await _prescriptionDetailRepository.GetByVisitIdAsync(visitId);
                if (prescriptionDetail != null)
                {
                    item.PrescriptionDetail = await BuildPrescriptionDetailDto(prescriptionDetail);
                }


                var planDetail = await _planDetailRepository.GetByVisitIdAsync(visitId);
                item.PlanDetail = planDetail != null ? _mapper.Map<PlanDetailResponseDto>(planDetail) : null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load consultation visit details for visit {VisitId}", visitId);
            }
        }

        private async Task LoadSurgeryDetails(AppointmentHistoryItemDto item, Guid visitId)
        {
            try
            {
                var surgeryDetail = await _surgeryDetailRepository.GetByVisitIdAsync(visitId);
                item.SurgeryDetail = surgeryDetail != null ? _mapper.Map<SurgeryDetailResponseDto>(surgeryDetail) : null;

                var surgeryDischarge = await _surgeryDischargeRepository.GetByVisitIdAsync(visitId);
                item.SurgeryDischarge = surgeryDischarge != null ? _mapper.Map<SurgeryDischargeResponseDto>(surgeryDischarge) : null;

                var surgeryPreOp = await _surgeryPreOpRepository.GetByVisitIdAsync(visitId);
                item.SurgeryPreOp = surgeryPreOp != null ? _mapper.Map<SurgeryPreOpResponseDto>(surgeryPreOp) : null;

                var surgeryPostOp = await _surgeryPostOpRepository.GetByVisitIdAsync(visitId);
                item.SurgeryPostOp = surgeryPostOp != null ? _mapper.Map<SurgeryPostOpResponseDto>(surgeryPostOp) : null;

                var prescriptionDetail = await _prescriptionDetailRepository.GetByVisitIdAsync(visitId);
                if (prescriptionDetail != null)
                {
                    item.PrescriptionDetail = await BuildPrescriptionDetailDto(prescriptionDetail);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load surgery visit details for visit {VisitId}", visitId);
            }
        }

        private async Task LoadVaccinationDetails(AppointmentHistoryItemDto item, Guid visitId)
        {
            try
            {
                var vaccinationDetails = await _vaccinationDetailRepository.GetByVisitIdAsync(visitId);

                item.VaccinationDetail = vaccinationDetails?
                    .Select(v => _mapper.Map<VaccinationDetailResponseDto>(v))
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load vaccination visit details for visit {VisitId}", visitId);
            }
        }


        private async Task LoadDewormingDetails(AppointmentHistoryItemDto item, Guid visitId)
        {
            try
            {
                var dewormingCheckout = await _dewormingCheckoutRepository.GetByVisitIdAsync(visitId);
                item.DewormingCheckout = dewormingCheckout?
                .Select(x => _mapper.Map<DewormingCheckoutResponseDto>(x))
                .ToList();

                var dewormingIntake = await _dewormingIntakeRepository.GetByVisitIdAsync(visitId);
                item.DewormingIntake = dewormingIntake != null ? _mapper.Map<DewormingIntakeResponseDto>(dewormingIntake) : null;

                var dewormingMedication = await _dewormingMedicationRepository.GetByVisitIdAsync(visitId);
                item.DewormingMedication = dewormingMedication
                .Select(x => _mapper.Map<DewormingMedicationResponseDto>(x))
                .ToList();

                var dewormingNotes = await _dewormingNoteRepository.GetByVisitIdAsync(visitId);
                item.DewormingNotes = dewormingNotes
                .Select(x => _mapper.Map<DewormingNoteResponseDto>(x))
                .ToList();

                var prescriptionDetail = await _prescriptionDetailRepository.GetByVisitIdAsync(visitId);
                if (prescriptionDetail != null)
                {
                    item.PrescriptionDetail = await BuildPrescriptionDetailDto(prescriptionDetail);
                }

            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load deworming visit details for visit {VisitId}", visitId);
            }
        }

        private async Task LoadEmergencyDetails(AppointmentHistoryItemDto item, Guid visitId)
        {
            try
            {
                var emergencyDischarge = await _emergencyDischargeRepository.GetByVisitIdAsync(visitId);
                item.EmergencyDischarge = emergencyDischarge != null ? _mapper.Map<EmergencyDischargeResponseDto>(emergencyDischarge) : null;

                var emergencyProcedure = await _emergencyProcedureRepository.GetByVisitIdAsync(visitId);
                item.EmergencyProcedure = emergencyProcedure != null ? _mapper.Map<EmergencyProcedureResponseDto>(emergencyProcedure) : null;

                var emergencyTriage = await _emergencyVisitRepository.GetByVisitIdAsync(visitId);
                item.EmergencyTriage = emergencyTriage != null ? _mapper.Map<EmergencyTriageResponseDto>(emergencyTriage) : null;

                var emergencyVital = await _emergencyVitalRepository.GetByVisitIdAsync(visitId);
                item.EmergencyVital = emergencyVital != null ? _mapper.Map<EmergencyVitalResponseDto>(emergencyVital) : null;

                var prescriptionDetail = await _prescriptionDetailRepository.GetByVisitIdAsync(visitId);
                if (prescriptionDetail != null)
                {
                    item.PrescriptionDetail = await BuildPrescriptionDetailDto(prescriptionDetail);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load emergency visit details for visit {VisitId}", visitId);
            }
        }

        private async Task LoadCertificationDetails(AppointmentHistoryItemDto item, Guid visitId)
        {
            try
            {
                var certification = await _certificateRepository.GetByVisitIdAsync(visitId);
                item.Certificate = certification != null ? _mapper.Map<CertificateResponseDto>(certification) : null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load certification details for visit {VisitId}", visitId);
            }
        }

        private async Task<PrescriptionDetailResponseDto> BuildPrescriptionDetailDto(PrescriptionDetail prescriptionDetail)
        {
            var mappings = await _prescriptionDetailRepository.GetProductMappingsWithProductAsync(prescriptionDetail.Id);

            var dto = new PrescriptionDetailResponseDto
            {
                Id = prescriptionDetail.Id,
                VisitId = prescriptionDetail.VisitId,
                Notes = prescriptionDetail.Notes,
                CreatedAt = prescriptionDetail.CreatedAt,
                UpdatedAt = prescriptionDetail.UpdatedAt,
                ProductMappings = new List<PrescriptionProductMappingDto>()
            };

            foreach (var pm in mappings)
            {
                PurchaseOrderReceivingHistoryResponseDto? receivingHistory = null;

                if (pm.PurchaseOrderReceivingHistoryId.HasValue)
                {
                    var r = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(pm.PurchaseOrderReceivingHistoryId.Value);
                    if (r != null)
                    {
                        receivingHistory = new PurchaseOrderReceivingHistoryResponseDto
                        {
                            Id = r.Id,
                            PurchaseOrderId = r.PurchaseOrderId,
                            PurchaseOrderItemId = r.PurchaseOrderItemId,
                            ProductId = r.ProductId,
                            ClinicId = r.ClinicId,
                            QuantityReceived = r.QuantityReceived,
                            BatchNumber = r.BatchNumber,
                            ExpiryDate = r.ExpiryDate,
                            DateOfManufacture = r.DateOfManufacture,
                            ReceivedDate = r.ReceivedDate,
                            ReceivedBy = r.ReceivedBy,
                            Notes = r.Notes,
                            UnitCost = r.UnitCost,
                            SupplierId = r.SupplierId,
                            QuantityInHand = r.QuantityOnHand,
                            Barcode = r.Barcode,
                            CreatedAt = r.CreatedAt,
                            UpdatedAt = r.UpdatedAt
                        };
                    }
                }

                dto.ProductMappings.Add(new PrescriptionProductMappingDto
                {
                    Id = pm.Id,
                    ProductId = pm.ProductId,
                    IsChecked = pm.IsChecked,
                    Quantity = pm.Quantity,
                    Frequency = pm.Frequency,
                    Directions = pm.Directions,
                    NumberOfDays = pm.NumberOfDays,
                    PurchaseOrderReceivingHistoryId = pm.PurchaseOrderReceivingHistoryId,
                    PurchaseOrderReceivingHistory = receivingHistory,
                    Product = pm.Product_Id != null ? new ProductDto
                    {
                        Id = pm.Product_Id,
                        ProductNumber = pm.Product_ProductNumber,
                        Name = pm.Product_Name,
                        GenericName = pm.Product_GenericName,
                        Category = pm.Product_Category,
                        Manufacturer = pm.Product_Manufacturer,
                        NdcNumber = pm.Product_NdcNumber,
                        Strength = pm.Product_Strength,
                        DosageForm = pm.Product_DosageForm,
                        UnitOfMeasure = pm.Product_UnitOfMeasure,
                        RequiresPrescription = pm.Product_RequiresPrescription,
                        ControlledSubstanceSchedule = pm.Product_ControlledSubstanceSchedule,
                        BrandName = pm.Product_BrandName,
                        StorageRequirements = pm.Product_StorageRequirements,
                        IsActive = pm.Product_IsActive,
                        Price = pm.Product_Price,
                        SellingPrice = pm.Product_SellingPrice
                    } : null
                });
            }

            return dto;
        }


    }
}