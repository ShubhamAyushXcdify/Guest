using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Core.Interfaces;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace Application.Services
{
    public class DischargeSummaryService : IDischargeSummaryService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IAppointmentService _appointmentService;
        private readonly IPatientService _patientService;
        private readonly IClientService _clientService;
        private readonly IUserService _userService;
        private readonly IClinicService _clinicService;
        private readonly IRoomService _roomService;
        private readonly IIntakeDetailService _intakeDetailService;
        private readonly IComplaintDetailService _complaintDetailService;
        private readonly IMedicalHistoryDetailService _medicalHistoryDetailService;
        private readonly IVitalDetailService _vitalDetailService;
        private readonly IPlanDetailService _planDetailService;
        private readonly IProcedureDetailService _procedureDetailService;
        private readonly IPrescriptionDetailService _prescriptionDetailService;
        private readonly IEmergencyVisitService _emergencyVisitService;
        private readonly IEmergencyVitalService _emergencyVitalService;
        private readonly IEmergencyProcedureService _emergencyProcedureService;
        private readonly IEmergencyDischargeService _emergencyDischargeService;
        private readonly ISurgeryPreOpService _surgeryPreOpService;
        private readonly ISurgeryDetailService _surgeryDetailService;
        private readonly ISurgeryPostOpService _surgeryPostOpService;
        private readonly ISurgeryDischargeService _surgeryDischargeService;
        private readonly IDewormingIntakeService _dewormingIntakeService;
        private readonly IDewormingMedicationService _dewormingMedicationService;
        private readonly IDewormingNoteService _dewormingNoteService;
        private readonly IDewormingCheckoutService _dewormingCheckoutService;
        private readonly IVaccinationDetailService _vaccinationDetailService;
        private readonly IVaccinationMasterService _vaccinationMasterService;

        private readonly ILogger<DischargeSummaryService> _logger;

        public DischargeSummaryService(
            IVisitRepository visitRepository,
            IAppointmentService appointmentService,
            IPatientService patientService,
            IClientService clientService,
            IUserService userService,
            IClinicService clinicService,
            IRoomService roomService,
            IIntakeDetailService intakeDetailService,
            IComplaintDetailService complaintDetailService,
            IMedicalHistoryDetailService medicalHistoryDetailService,
            IVitalDetailService vitalDetailService,
            IPlanDetailService planDetailService,
            IProcedureDetailService procedureDetailService,
            IPrescriptionDetailService prescriptionDetailService,
            IEmergencyVisitService emergencyVisitService,
            IEmergencyVitalService emergencyVitalService,
            IEmergencyProcedureService emergencyProcedureService,
            IEmergencyDischargeService emergencyDischargeService,
            ISurgeryPreOpService surgeryPreOpService,
            ISurgeryDetailService surgeryDetailService,
            ISurgeryPostOpService surgeryPostOpService,
            ISurgeryDischargeService surgeryDischargeService,
            IDewormingIntakeService dewormingIntakeService,
            IDewormingMedicationService dewormingMedicationService,
            IDewormingNoteService dewormingNoteService,
            IDewormingCheckoutService dewormingCheckoutService,
            IVaccinationDetailService vaccinationDetailService,
            IVaccinationMasterService vaccinationMasterService,
            ILogger<DischargeSummaryService> logger)
        {
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _appointmentService = appointmentService ?? throw new ArgumentNullException(nameof(appointmentService));
            _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _clinicService = clinicService ?? throw new ArgumentNullException(nameof(clinicService));
            _roomService = roomService ?? throw new ArgumentNullException(nameof(roomService));
            _intakeDetailService = intakeDetailService ?? throw new ArgumentNullException(nameof(intakeDetailService));
            _complaintDetailService = complaintDetailService ?? throw new ArgumentNullException(nameof(complaintDetailService));
            _medicalHistoryDetailService = medicalHistoryDetailService ?? throw new ArgumentNullException(nameof(medicalHistoryDetailService));
            _vitalDetailService = vitalDetailService ?? throw new ArgumentNullException(nameof(vitalDetailService));
            _planDetailService = planDetailService ?? throw new ArgumentNullException(nameof(planDetailService));
            _procedureDetailService = procedureDetailService ?? throw new ArgumentNullException(nameof(procedureDetailService));
            _prescriptionDetailService = prescriptionDetailService ?? throw new ArgumentNullException(nameof(prescriptionDetailService));
            _emergencyVisitService = emergencyVisitService ?? throw new ArgumentNullException(nameof(emergencyVisitService));
            _emergencyVitalService = emergencyVitalService ?? throw new ArgumentNullException(nameof(emergencyVitalService));
            _emergencyProcedureService = emergencyProcedureService ?? throw new ArgumentNullException(nameof(emergencyProcedureService));
            _emergencyDischargeService = emergencyDischargeService ?? throw new ArgumentNullException(nameof(emergencyDischargeService));
            _surgeryPreOpService = surgeryPreOpService ?? throw new ArgumentNullException(nameof(surgeryPreOpService));
            _surgeryDetailService = surgeryDetailService ?? throw new ArgumentNullException(nameof(surgeryDetailService));
            _surgeryPostOpService = surgeryPostOpService ?? throw new ArgumentNullException(nameof(surgeryPostOpService));
            _surgeryDischargeService = surgeryDischargeService ?? throw new ArgumentNullException(nameof(surgeryDischargeService));
            _dewormingIntakeService = dewormingIntakeService ?? throw new ArgumentNullException(nameof(dewormingIntakeService));
            _dewormingMedicationService = dewormingMedicationService ?? throw new ArgumentNullException(nameof(dewormingMedicationService));
            _dewormingNoteService = dewormingNoteService ?? throw new ArgumentNullException(nameof(dewormingNoteService));
            _dewormingCheckoutService = dewormingCheckoutService ?? throw new ArgumentNullException(nameof(dewormingCheckoutService));
            _vaccinationDetailService = vaccinationDetailService ?? throw new ArgumentNullException(nameof(vaccinationDetailService));
            _vaccinationMasterService = vaccinationMasterService ?? throw new ArgumentNullException(nameof(vaccinationMasterService));


            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DischargeSummaryResponseDto> GetDischargeSummaryByVisitIdAsync(Guid visitId)
        {
            try
            {
                // Get visit information
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                {
                    throw new KeyNotFoundException($"Visit with id {visitId} not found");
                }

                var dischargeSummary = new DischargeSummaryResponseDto
                {
                    VisitId = visit.Id,
                    AppointmentId = visit.AppointmentId,
                    PatientId = visit.PatientId,
                    VisitCreatedAt = visit.CreatedAt,
                    VisitUpdatedAt = visit.UpdatedAt,
                    IsIntakeCompleted = visit.IsIntakeCompleted,
                    IsComplaintsCompleted = visit.IsComplaintsCompleted,
                    IsVitalsCompleted = visit.IsVitalsCompleted,
                    IsPlanCompleted = visit.IsPlanCompleted,
                    IsPrescriptionCompleted = visit.IsPrescriptionCompleted,
                    IsProceduresCompleted = visit.IsProceduresCompleted,
                    IsVaccinationDetailCompleted = visit.IsVaccinationDetailCompleted
                };

                // Get appointment information
                try
                {
                    dischargeSummary.Appointment = await _appointmentService.GetByIdAsync(visit.AppointmentId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get appointment information for visit {VisitId}", visitId);
                }

                // Get patient information if available
                if (visit.PatientId.HasValue)
                {
                    try
                    {
                        dischargeSummary.Patient = await _patientService.GetByIdAsync(visit.PatientId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get patient information for visit {VisitId}", visitId);
                    }
                }

                // Get client information if available from appointment
                if (dischargeSummary.Appointment?.ClientId.HasValue == true)
                {
                    try
                    {
                        dischargeSummary.Client = await _clientService.GetByIdAsync(dischargeSummary.Appointment.ClientId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get client information for visit {VisitId}", visitId);
                    }
                }

                // Get veterinarian information if available from appointment
                if (dischargeSummary.Appointment?.VeterinarianId.HasValue == true)
                {
                    try
                    {
                        dischargeSummary.Veterinarian = await _userService.GetByIdAsync(dischargeSummary.Appointment.VeterinarianId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get veterinarian information for visit {VisitId}", visitId);
                    }
                }

                // Get clinic information if available from appointment
                if (dischargeSummary.Appointment?.ClinicId.HasValue == true)
                {
                    try
                    {
                        dischargeSummary.Clinic = await _clinicService.GetByIdAsync(dischargeSummary.Appointment.ClinicId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get clinic information for visit {VisitId}", visitId);
                    }
                }

                // Get room information if available from appointment
                if (dischargeSummary.Appointment?.RoomId.HasValue == true)
                {
                    try
                    {
                        dischargeSummary.Room = await _roomService.GetByIdAsync(dischargeSummary.Appointment.RoomId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get room information for visit {VisitId}", visitId);
                    }
                }

                // Get intake detail if completed
                if (visit.IsIntakeCompleted == true)
                {
                    try
                    {
                        dischargeSummary.IntakeDetail = await _intakeDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get intake detail for visit {VisitId}", visitId);
                    }
                }

                // Get complaint detail if completed
                if (visit.IsComplaintsCompleted == true)
                {
                    try
                    {
                        dischargeSummary.ComplaintDetail = await _complaintDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get complaint detail for visit {VisitId}", visitId);
                    }
                }

                // Get medical history detail
                try
                {
                    if (visit.PatientId.HasValue)
                    {
                        dischargeSummary.MedicalHistoryDetail = await _medicalHistoryDetailService.GetByPatientIdAsync(visit.PatientId.Value);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get medical history detail for patient {PatientId}", visit.PatientId);
                }

                // Get vital detail if completed
                if (visit.IsVitalsCompleted == true)
                {
                    try
                    {
                        dischargeSummary.VitalDetail = await _vitalDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get vital detail for visit {VisitId}", visitId);
                    }
                }

                // Get plan detail if completed
                if (visit.IsPlanCompleted == true)
                {
                    try
                    {
                        dischargeSummary.PlanDetail = await _planDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get plan detail for visit {VisitId}", visitId);
                    }
                }

                // Get procedure detail if completed
                if (visit.IsProceduresCompleted == true)
                {
                    try
                    {
                        dischargeSummary.ProcedureDetail = await _procedureDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get procedure detail for visit {VisitId}", visitId);
                    }
                }

                // Get prescription detail if completed
                if (visit.IsPrescriptionCompleted == true)
                {
                    try
                    {
                        dischargeSummary.PrescriptionDetail = await _prescriptionDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get prescription detail for visit {VisitId}", visitId);
                    }
                }



                return dischargeSummary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDischargeSummaryByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<EmergencyDischargeSummaryResponseDto> GetEmergencyDischargeSummaryByVisitIdAsync(Guid visitId)
        {
            try
            {
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                {
                    throw new KeyNotFoundException($"Visit with id {visitId} not found");
                }

                var summary = new EmergencyDischargeSummaryResponseDto
                {
                    VisitId = visit.Id,
                    AppointmentId = visit.AppointmentId,
                    PatientId = visit.PatientId,
                    VisitCreatedAt = visit.CreatedAt,
                    VisitUpdatedAt = visit.UpdatedAt,
                    IsEmergencyTriageCompleted = visit.IsEmergencyTriageCompleted,
                    IsEmergencyVitalCompleted = visit.IsEmergencyVitalCompleted,
                    IsEmergencyProcedureCompleted = visit.IsEmergencyProcedureCompleted,
                    IsEmergencyDischargeCompleted = visit.IsEmergencyDischargeCompleted
                };

                // Get appointment information
                try
                {
                    summary.Appointment = await _appointmentService.GetByIdAsync(visit.AppointmentId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get appointment information for visit {VisitId}", visitId);
                }

                // Get patient information if available
                if (visit.PatientId.HasValue)
                {
                    try
                    {
                        summary.Patient = await _patientService.GetByIdAsync(visit.PatientId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get patient information for visit {VisitId}", visitId);
                    }
                }

                // Get client information if available from appointment
                if (summary.Appointment?.ClientId.HasValue == true)
                {
                    try
                    {
                        summary.Client = await _clientService.GetByIdAsync(summary.Appointment.ClientId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get client information for visit {VisitId}", visitId);
                    }
                }

                // Get veterinarian information if available from appointment
                if (summary.Appointment?.VeterinarianId.HasValue == true)
                {
                    try
                    {
                        summary.Veterinarian = await _userService.GetByIdAsync(summary.Appointment.VeterinarianId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get veterinarian information for visit {VisitId}", visitId);
                    }
                }

                // Get clinic information if available from appointment
                if (summary.Appointment?.ClinicId.HasValue == true)
                {
                    try
                    {
                        summary.Clinic = await _clinicService.GetByIdAsync(summary.Appointment.ClinicId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get clinic information for visit {VisitId}", visitId);
                    }
                }

                // Get room information if available from appointment
                if (summary.Appointment?.RoomId.HasValue == true)
                {
                    try
                    {
                        summary.Room = await _roomService.GetByIdAsync(summary.Appointment.RoomId.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get room information for visit {VisitId}", visitId);
                    }
                }

                // Always fetch and assign emergency triage
                try
                {
                    var triageList = await _emergencyVisitService.GetByVisitIdAsync(visitId);
                    summary.EmergencyTriage = triageList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency triage for visit {VisitId}", visitId);
                    summary.EmergencyTriage = null;
                }

                // Always fetch and assign emergency vitals
                try
                {
                    var vitalsList = await _emergencyVitalService.GetByVisitIdAsync(visitId);
                    summary.EmergencyVitals = vitalsList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency vitals for visit {VisitId}", visitId);
                    summary.EmergencyVitals = null;
                }

                // Always fetch and assign emergency procedures
                try
                {
                    var proceduresList = await _emergencyProcedureService.GetByVisitIdAsync(visitId);
                    summary.EmergencyProcedures = proceduresList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency procedures for visit {VisitId}", visitId);
                    summary.EmergencyProcedures = null;
                }

                // Always fetch and assign emergency discharges
                try
                {
                    var dischargesList = await _emergencyDischargeService.GetAllWithPrescriptionsByVisitIdAsync(visitId);
                    summary.EmergencyDischarges = dischargesList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency discharges for visit {VisitId}", visitId);
                    summary.EmergencyDischarges = null;
                }

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetEmergencyDischargeSummaryByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<SurgeryDischargeSummaryResponseDto> GetSurgeryDischargeSummaryByVisitIdAsync(Guid visitId)
        {
            try
            {
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                {
                    throw new KeyNotFoundException($"Visit with id {visitId} not found");
                }

                var summary = new SurgeryDischargeSummaryResponseDto
                {
                    VisitId = visit.Id,
                    AppointmentId = visit.AppointmentId,
                    PatientId = visit.PatientId,
                    VisitCreatedAt = visit.CreatedAt,
                    VisitUpdatedAt = visit.UpdatedAt,
                    IsSurgeryPreOpCompleted = visit.IsSurgeryPreOpCompleted,
                    IsSurgeryDetailsCompleted = visit.IsSurgeryDetailsCompleted,
                    IsSurgeryPostOpCompleted = visit.IsSurgeryPostOpCompleted,
                    IsSurgeryDischargeCompleted = visit.IsSurgeryDischargeCompleted
                };

                // Appointment
                try { summary.Appointment = await _appointmentService.GetByIdAsync(visit.AppointmentId); } catch { }
                // Patient
                if (visit.PatientId.HasValue) { try { summary.Patient = await _patientService.GetByIdAsync(visit.PatientId.Value); } catch { } }
                // Client
                if (summary.Appointment?.ClientId.HasValue == true) { try { summary.Client = await _clientService.GetByIdAsync(summary.Appointment.ClientId.Value); } catch { } }
                // Veterinarian
                if (summary.Appointment?.VeterinarianId.HasValue == true) { try { summary.Veterinarian = await _userService.GetByIdAsync(summary.Appointment.VeterinarianId.Value); } catch { } }
                // Clinic
                if (summary.Appointment?.ClinicId.HasValue == true) { try { summary.Clinic = await _clinicService.GetByIdAsync(summary.Appointment.ClinicId.Value); } catch { } }
                // Room
                if (summary.Appointment?.RoomId.HasValue == true) { try { summary.Room = await _roomService.GetByIdAsync(summary.Appointment.RoomId.Value); } catch { } }

                // Always fetch and assign surgery pre-op
                try
                {
                    var preOp = await _surgeryPreOpService.GetByVisitIdAsync(visitId);
                    summary.SurgeryPreOp = preOp;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery pre-op for visit {VisitId}", visitId);
                    summary.SurgeryPreOp = null;
                }

                // Always fetch and assign surgery detail
                try
                {
                    var detail = await _surgeryDetailService.GetByVisitIdAsync(visitId);
                    summary.SurgeryDetail = detail;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery detail for visit {VisitId}", visitId);
                    summary.SurgeryDetail = null;
                }

                // Always fetch and assign surgery post-op
                try
                {
                    var postOp = await _surgeryPostOpService.GetByVisitIdAsync(visitId);
                    summary.SurgeryPostOp = postOp;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery post-op for visit {VisitId}", visitId);
                    summary.SurgeryPostOp = null;
                }

                // Always fetch and assign surgery discharge
                try
                {
                    var discharge = await _surgeryDischargeService.GetByVisitIdAsync(visitId);
                    summary.SurgeryDischarge = discharge;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery discharge for visit {VisitId}", visitId);
                    summary.SurgeryDischarge = null;
                }

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetSurgeryDischargeSummaryByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<DewormingDischargeSummaryResponseDto> GetDewormingDischargeSummaryByVisitIdAsync(Guid visitId)
        {
            try
            {
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                {
                    throw new KeyNotFoundException($"Visit with id {visitId} not found");
                }

                var summary = new DewormingDischargeSummaryResponseDto
                {
                    VisitId = visit.Id,
                    AppointmentId = visit.AppointmentId,
                    PatientId = visit.PatientId,
                    VisitCreatedAt = visit.CreatedAt,
                    VisitUpdatedAt = visit.UpdatedAt,
                    IsDewormingIntakeCompleted = visit.IsDewormingIntakeCompleted,
                    IsDewormingMedicationCompleted = visit.IsDewormingMedicationCompleted,
                    IsDewormingNotesCompleted = visit.IsDewormingNotesCompleted,
                    IsDewormingCheckoutCompleted = visit.IsDewormingCheckoutCompleted
                };

                // Appointment
                try { summary.Appointment = await _appointmentService.GetByIdAsync(visit.AppointmentId); } catch { }
                // Patient
                if (visit.PatientId.HasValue) { try { summary.Patient = await _patientService.GetByIdAsync(visit.PatientId.Value); } catch { } }
                // Client
                if (summary.Appointment?.ClientId.HasValue == true) { try { summary.Client = await _clientService.GetByIdAsync(summary.Appointment.ClientId.Value); } catch { } }
                // Veterinarian
                if (summary.Appointment?.VeterinarianId.HasValue == true) { try { summary.Veterinarian = await _userService.GetByIdAsync(summary.Appointment.VeterinarianId.Value); } catch { } }
                // Clinic
                if (summary.Appointment?.ClinicId.HasValue == true) { try { summary.Clinic = await _clinicService.GetByIdAsync(summary.Appointment.ClinicId.Value); } catch { } }
                // Room
                if (summary.Appointment?.RoomId.HasValue == true) { try { summary.Room = await _roomService.GetByIdAsync(summary.Appointment.RoomId.Value); } catch { } }

                // Always fetch and assign deworming intake
                try
                {
                    summary.DewormingIntake = await _dewormingIntakeService.GetByVisitIdAsync(visitId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming intake for visit {VisitId}", visitId);
                    summary.DewormingIntake = null;
                }

                // Always fetch and assign deworming medication
                try
                {
                    var meds = await _dewormingMedicationService.GetByVisitIdAsync(visitId);
                    summary.DewormingMedication = meds?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming medication for visit {VisitId}", visitId);
                    summary.DewormingMedication = null;
                }

                // Always fetch and assign deworming note
                try
                {
                    var notes = await _dewormingNoteService.GetByVisitIdAsync(visitId);
                    summary.DewormingNote = notes?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming note for visit {VisitId}", visitId);
                    summary.DewormingNote = null;
                }

                // Always fetch and assign deworming checkout
                try
                {
                    var checkouts = await _dewormingCheckoutService.GetByVisitIdAsync(visitId);
                    summary.DewormingCheckout = checkouts?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming checkout for visit {VisitId}", visitId);
                    summary.DewormingCheckout = null;
                }

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDewormingDischargeSummaryByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<VaccinationDischargeSummaryResponseDto> GetVaccinationDischargeSummaryByVisitIdAsync(Guid visitId)
        {
            try
            {
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                {
                    throw new KeyNotFoundException($"Visit with id {visitId} not found");
                }

                var summary = new VaccinationDischargeSummaryResponseDto
                {
                    VisitId = visit.Id,
                    AppointmentId = visit.AppointmentId,
                    PatientId = visit.PatientId,
                    VisitCreatedAt = visit.CreatedAt,
                    VisitUpdatedAt = visit.UpdatedAt,
                    IsVaccinationDetailCompleted = visit.IsVaccinationDetailCompleted,
                    IsVaccinationCompleted = visit.IsVaccinationCompleted
                };

                // Appointment
                try { summary.Appointment = await _appointmentService.GetByIdAsync(visit.AppointmentId); } catch { }
                // Patient
                if (visit.PatientId.HasValue) { try { summary.Patient = await _patientService.GetByIdAsync(visit.PatientId.Value); } catch { } }
                // Client
                if (summary.Appointment?.ClientId.HasValue == true) { try { summary.Client = await _clientService.GetByIdAsync(summary.Appointment.ClientId.Value); } catch { } }
                // Veterinarian
                if (summary.Appointment?.VeterinarianId.HasValue == true) { try { summary.Veterinarian = await _userService.GetByIdAsync(summary.Appointment.VeterinarianId.Value); } catch { } }
                // Clinic
                if (summary.Appointment?.ClinicId.HasValue == true) { try { summary.Clinic = await _clinicService.GetByIdAsync(summary.Appointment.ClinicId.Value); } catch { } }
                // Room
                if (summary.Appointment?.RoomId.HasValue == true) { try { summary.Room = await _roomService.GetByIdAsync(summary.Appointment.RoomId.Value); } catch { } }

                // Always fetch and assign vaccination details with masters
                try
                {
                    var vaccinationDetails = await _vaccinationDetailService.GetByVisitIdAsync(visitId);
                    var vaccinationDetailsWithMasters = new List<VaccinationDetailWithMastersResponseDto>();

                    foreach (var detail in vaccinationDetails)
                    {
                        var detailWithMasters = new VaccinationDetailWithMastersResponseDto
                        {
                            Id = detail.Id,
                            VisitId = detail.VisitId,
                            Notes = detail.Notes,
                            IsCompleted = detail.IsCompleted,
                            CreatedAt = DateTimeOffset.UtcNow, // This should come from the entity
                            UpdatedAt = DateTimeOffset.UtcNow, // This should come from the entity
                            VaccinationMasters = new List<VaccinationMasterWithDetailResponseDto>()
                        };

                        // Use vaccination master details that are already loaded
                        foreach (var master in detail.VaccinationMasterIdsDetails)
                        {
                            try
                            {
                                var masterWithDetail = new VaccinationMasterWithDetailResponseDto
                                {
                                    Id = master.Id,
                                    Species = master.Species,
                                    Disease = master.Disease,
                                    VaccineType = master.VaccineType,
                                    InitialDose = master.InitialDose,
                                    Booster = master.Booster,
                                    RevaccinationInterval = master.RevaccinationInterval,
                                    Notes = master.Notes,
                                    VacCode = master.VacCode,
                                    CreatedAt = master.CreatedAt,
                                    UpdatedAt = master.UpdatedAt
                                };

                                // Fetch vaccination_json from vaccination_detail_masters table
                                try
                                {
                                    var vaccinationJson = await _vaccinationDetailService.GetVaccinationJsonAsync(detail.Id, master.Id);
                                    masterWithDetail.VaccinationJson = vaccinationJson;
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(ex, "Failed to get vaccination_json for detail {DetailId} and master {MasterId}", detail.Id, master.Id);
                                    masterWithDetail.VaccinationJson = null;
                                }

                                detailWithMasters.VaccinationMasters.Add(masterWithDetail);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to process vaccination master {MasterId} for detail {DetailId}", master.Id, detail.Id);
                            }
                        }

                        vaccinationDetailsWithMasters.Add(detailWithMasters);
                    }

                    summary.VaccinationDetails = vaccinationDetailsWithMasters;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get vaccination details for visit {VisitId}", visitId);
                    summary.VaccinationDetails = new List<VaccinationDetailWithMastersResponseDto>();
                }

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetVaccinationDischargeSummaryByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<List<ClientDischargeSummaryResponseDto>> GetClientDischargeSummariesAsync(Guid clientId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var clientSummaries = new List<ClientDischargeSummaryResponseDto>();

                // Get all completed appointments for this client within the date range
                var appointments = await _appointmentService.GetByClientIdWithFiltersAsync(clientId, "completed", fromDate, toDate);
                
                // Sort appointments by date in descending order (most recent first)
                var sortedAppointments = appointments.OrderByDescending(a => a.AppointmentDate).ToList();

                foreach (var appointment in sortedAppointments)
                {
                    try
                    {
                        // Get visit for this appointment
                        var visit = await _visitRepository.GetByAppointmentIdAsync(appointment.Id);
                        if (visit == null)
                        {
                            // Create a summary without visit details
                            var summaryWithoutVisit = new ClientDischargeSummaryResponseDto
                            {
                                AppointmentId = appointment.Id,
                                AppointmentDate = appointment.AppointmentDate,
                                AppointmentType = appointment.AppointmentType?.Name,
                                Status = appointment.Status,
                                Reason = appointment.Reason,
                                Notes = appointment.Notes,
                                PatientId = appointment.PatientId,
                                PatientName = appointment.Patient?.Name,
                                VeterinarianId = appointment.VeterinarianId,
                                VeterinarianName = appointment.Veterinarian != null ? $"{appointment.Veterinarian.FirstName} {appointment.Veterinarian.LastName}" : null,
                                ClinicId = appointment.ClinicId,
                                ClinicName = appointment.Clinic?.Name,
                                RoomId = appointment.RoomId,
                                RoomName = appointment.Room?.Name
                            };
                            clientSummaries.Add(summaryWithoutVisit);
                            continue;
                        }

                        var summary = new ClientDischargeSummaryResponseDto
                        {
                            AppointmentId = appointment.Id,
                            AppointmentDate = appointment.AppointmentDate,
                            AppointmentType = appointment.AppointmentType?.Name,
                            Status = appointment.Status,
                            Reason = appointment.Reason,
                            Notes = appointment.Notes,
                            VisitId = visit.Id,
                            VisitCreatedAt = visit.CreatedAt,
                            VisitUpdatedAt = visit.UpdatedAt,
                            PatientId = appointment.PatientId,
                            PatientName = appointment.Patient?.Name,
                            VeterinarianId = appointment.VeterinarianId,
                            VeterinarianName = appointment.Veterinarian != null ? $"{appointment.Veterinarian.FirstName} {appointment.Veterinarian.LastName}" : null,
                            ClinicId = appointment.ClinicId,
                            ClinicName = appointment.Clinic?.Name,
                            RoomId = appointment.RoomId,
                            RoomName = appointment.Room?.Name,
                            
                            // Visit completion status
                            IsIntakeCompleted = visit.IsIntakeCompleted,
                            IsComplaintsCompleted = visit.IsComplaintsCompleted,
                            IsVitalsCompleted = visit.IsVitalsCompleted,
                            IsPlanCompleted = visit.IsPlanCompleted,
                            IsProceduresCompleted = visit.IsProceduresCompleted,
                            IsPrescriptionCompleted = visit.IsPrescriptionCompleted,
                            IsVaccinationDetailCompleted = visit.IsVaccinationDetailCompleted,
                            
                            // Emergency visit status
                            IsEmergencyTriageCompleted = visit.IsEmergencyTriageCompleted,
                            IsEmergencyVitalCompleted = visit.IsEmergencyVitalCompleted,
                            IsEmergencyProcedureCompleted = visit.IsEmergencyProcedureCompleted,
                            IsEmergencyDischargeCompleted = visit.IsEmergencyDischargeCompleted,
                            
                            // Surgery visit status
                            IsSurgeryPreOpCompleted = visit.IsSurgeryPreOpCompleted,
                            IsSurgeryDetailsCompleted = visit.IsSurgeryDetailsCompleted,
                            IsSurgeryPostOpCompleted = visit.IsSurgeryPostOpCompleted,
                            IsSurgeryDischargeCompleted = visit.IsSurgeryDischargeCompleted,
                            
                            // Deworming visit status
                            IsDewormingIntakeCompleted = visit.IsDewormingIntakeCompleted,
                            IsDewormingMedicationCompleted = visit.IsDewormingMedicationCompleted,
                            IsDewormingNotesCompleted = visit.IsDewormingNotesCompleted,
                            IsDewormingCheckoutCompleted = visit.IsDewormingCheckoutCompleted,
                            
                            // Vaccination visit status
                            IsVaccinationCompleted = visit.IsVaccinationDetailCompleted
                        };

                        // Get visit details based on appointment type
                        var appointmentType = appointment.AppointmentType?.Name?.ToLower();
                        
                        if (appointmentType == "consultation" || appointmentType == "general")
                        {
                            // Get consultation visit details
                            await PopulateConsultationDetails(summary, visit.Id);
                        }
                        else if (appointmentType == "emergency")
                        {
                            // Get emergency visit details
                            await PopulateEmergencyDetails(summary, visit.Id);
                        }
                        else if (appointmentType == "surgery")
                        {
                            // Get surgery visit details
                            await PopulateSurgeryDetails(summary, visit.Id);
                        }
                        else if (appointmentType == "deworming")
                        {
                            // Get deworming visit details
                            await PopulateDewormingDetails(summary, visit.Id);
                        }
                        else if (appointmentType == "vaccination")
                        {
                            // Get vaccination visit details
                            await PopulateVaccinationDetails(summary, visit.Id);
                        }
                        else
                        {
                            // For unknown appointment types, try to get consultation details
                            await PopulateConsultationDetails(summary, visit.Id);
                        }

                        clientSummaries.Add(summary);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get discharge summary for appointment {AppointmentId}", appointment.Id);
                        // Add a basic summary without details
                        var basicSummary = new ClientDischargeSummaryResponseDto
                        {
                            AppointmentId = appointment.Id,
                            AppointmentDate = appointment.AppointmentDate,
                            AppointmentType = appointment.AppointmentType?.Name,
                            Status = appointment.Status,
                            Reason = appointment.Reason,
                            Notes = appointment.Notes,
                            PatientId = appointment.PatientId,
                            PatientName = appointment.Patient?.Name,
                            VeterinarianId = appointment.VeterinarianId,
                            VeterinarianName = appointment.Veterinarian != null ? $"{appointment.Veterinarian.FirstName} {appointment.Veterinarian.LastName}" : null,
                            ClinicId = appointment.ClinicId,
                            ClinicName = appointment.Clinic?.Name,
                            RoomId = appointment.RoomId,
                            RoomName = appointment.Room?.Name
                        };
                        clientSummaries.Add(basicSummary);
                    }
                }

                return clientSummaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetClientDischargeSummariesAsync for client {ClientId}", clientId);
                throw;
            }
        }

        private async Task PopulateConsultationDetails(ClientDischargeSummaryResponseDto summary, Guid visitId)
        {
            try
            {
                // Get intake detail if completed
                if (summary.IsIntakeCompleted == true)
                {
                    try
                    {
                        summary.IntakeDetail = await _intakeDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get intake detail for visit {VisitId}", visitId);
                    }
                }

                // Get complaint detail if completed
                if (summary.IsComplaintsCompleted == true)
                {
                    try
                    {
                        summary.ComplaintDetail = await _complaintDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get complaint detail for visit {VisitId}", visitId);
                    }
                }

                // Get medical history detail
                try
                {
                    if (summary.PatientId.HasValue)
                    {
                        summary.MedicalHistoryDetail = await _medicalHistoryDetailService.GetByPatientIdAsync(summary.PatientId.Value);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get medical history detail for patient {PatientId}", summary.PatientId);
                }

                // Get vital detail if completed
                if (summary.IsVitalsCompleted == true)
                {
                    try
                    {
                        summary.VitalDetail = await _vitalDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get vital detail for visit {VisitId}", visitId);
                    }
                }

                // Get plan detail if completed
                if (summary.IsPlanCompleted == true)
                {
                    try
                    {
                        summary.PlanDetail = await _planDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get plan detail for visit {VisitId}", visitId);
                    }
                }

                // Get procedure detail if completed
                if (summary.IsProceduresCompleted == true)
                {
                    try
                    {
                        summary.ProcedureDetail = await _procedureDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get procedure detail for visit {VisitId}", visitId);
                    }
                }

                // Get prescription detail if completed
                if (summary.IsPrescriptionCompleted == true)
                {
                    try
                    {
                        summary.PrescriptionDetail = await _prescriptionDetailService.GetByVisitIdAsync(visitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get prescription detail for visit {VisitId}", visitId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to populate consultation details for visit {VisitId}", visitId);
            }
        }

        private async Task PopulateEmergencyDetails(ClientDischargeSummaryResponseDto summary, Guid visitId)
        {
            try
            {
                // Get emergency triage
                try
                {
                    var triageList = await _emergencyVisitService.GetByVisitIdAsync(visitId);
                    summary.EmergencyTriage = triageList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency triage for visit {VisitId}", visitId);
                }

                // Get emergency vitals
                try
                {
                    var vitalsList = await _emergencyVitalService.GetByVisitIdAsync(visitId);
                    summary.EmergencyVitals = vitalsList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency vitals for visit {VisitId}", visitId);
                }

                // Get emergency procedures
                try
                {
                    var proceduresList = await _emergencyProcedureService.GetByVisitIdAsync(visitId);
                    summary.EmergencyProcedures = proceduresList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency procedures for visit {VisitId}", visitId);
                }

                // Get emergency discharges
                try
                {
                    var dischargesList = await _emergencyDischargeService.GetAllWithPrescriptionsByVisitIdAsync(visitId);
                    summary.EmergencyDischarges = dischargesList?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get emergency discharges for visit {VisitId}", visitId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to populate emergency details for visit {VisitId}", visitId);
            }
        }

        private async Task PopulateSurgeryDetails(ClientDischargeSummaryResponseDto summary, Guid visitId)
        {
            try
            {
                // Get surgery pre-op
                try
                {
                    summary.SurgeryPreOp = await _surgeryPreOpService.GetByVisitIdAsync(visitId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery pre-op for visit {VisitId}", visitId);
                }

                // Get surgery detail
                try
                {
                    summary.SurgeryDetail = await _surgeryDetailService.GetByVisitIdAsync(visitId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery detail for visit {VisitId}", visitId);
                }

                // Get surgery post-op
                try
                {
                    summary.SurgeryPostOp = await _surgeryPostOpService.GetByVisitIdAsync(visitId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery post-op for visit {VisitId}", visitId);
                }

                // Get surgery discharge
                try
                {
                    summary.SurgeryDischarge = await _surgeryDischargeService.GetByVisitIdAsync(visitId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get surgery discharge for visit {VisitId}", visitId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to populate surgery details for visit {VisitId}", visitId);
            }
        }

        private async Task PopulateDewormingDetails(ClientDischargeSummaryResponseDto summary, Guid visitId)
        {
            try
            {
                // Get deworming intake
                try
                {
                    summary.DewormingIntake = await _dewormingIntakeService.GetByVisitIdAsync(visitId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming intake for visit {VisitId}", visitId);
                }

                // Get deworming medication
                try
                {
                    var meds = await _dewormingMedicationService.GetByVisitIdAsync(visitId);
                    summary.DewormingMedication = meds?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming medication for visit {VisitId}", visitId);
                }

                // Get deworming note
                try
                {
                    var notes = await _dewormingNoteService.GetByVisitIdAsync(visitId);
                    summary.DewormingNote = notes?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming note for visit {VisitId}", visitId);
                }

                // Get deworming checkout
                try
                {
                    var checkouts = await _dewormingCheckoutService.GetByVisitIdAsync(visitId);
                    summary.DewormingCheckout = checkouts?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get deworming checkout for visit {VisitId}", visitId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to populate deworming details for visit {VisitId}", visitId);
            }
        }

        private async Task PopulateVaccinationDetails(ClientDischargeSummaryResponseDto summary, Guid visitId)
        {
            try
            {
                // Get vaccination details with masters
                try
                {
                    var vaccinationDetails = await _vaccinationDetailService.GetByVisitIdAsync(visitId);
                    var vaccinationDetailsWithMasters = new List<VaccinationDetailWithMastersResponseDto>();

                    foreach (var detail in vaccinationDetails)
                    {
                        var detailWithMasters = new VaccinationDetailWithMastersResponseDto
                        {
                            Id = detail.Id,
                            VisitId = detail.VisitId,
                            Notes = detail.Notes,
                            IsCompleted = detail.IsCompleted,
                            CreatedAt = DateTimeOffset.UtcNow, // This should come from the entity
                            UpdatedAt = DateTimeOffset.UtcNow, // This should come from the entity
                            VaccinationMasters = new List<VaccinationMasterWithDetailResponseDto>()
                        };

                        // Use vaccination master details that are already loaded
                        foreach (var master in detail.VaccinationMasterIdsDetails)
                        {
                            try
                            {
                                var masterWithDetail = new VaccinationMasterWithDetailResponseDto
                                {
                                    Id = master.Id,
                                    Species = master.Species,
                                    Disease = master.Disease,
                                    VaccineType = master.VaccineType,
                                    InitialDose = master.InitialDose,
                                    Booster = master.Booster,
                                    RevaccinationInterval = master.RevaccinationInterval,
                                    Notes = master.Notes,
                                    VacCode = master.VacCode,
                                    CreatedAt = master.CreatedAt,
                                    UpdatedAt = master.UpdatedAt
                                };

                                // Fetch vaccination_json from vaccination_detail_masters table
                                try
                                {
                                    var vaccinationJson = await _vaccinationDetailService.GetVaccinationJsonAsync(detail.Id, master.Id);
                                    masterWithDetail.VaccinationJson = vaccinationJson;
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(ex, "Failed to get vaccination_json for detail {DetailId} and master {MasterId}", detail.Id, master.Id);
                                    masterWithDetail.VaccinationJson = null;
                                }

                                detailWithMasters.VaccinationMasters.Add(masterWithDetail);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to process vaccination master {MasterId} for detail {DetailId}", master.Id, detail.Id);
                            }
                        }

                        vaccinationDetailsWithMasters.Add(detailWithMasters);
                    }

                    summary.VaccinationDetails = vaccinationDetailsWithMasters;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get vaccination details for visit {VisitId}", visitId);
                    summary.VaccinationDetails = new List<VaccinationDetailWithMastersResponseDto>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to populate vaccination details for visit {VisitId}", visitId);
            }
        }
    }
} 