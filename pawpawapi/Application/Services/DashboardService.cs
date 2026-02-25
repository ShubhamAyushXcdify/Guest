using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Core.Interfaces;
using System.Globalization;
using Core.Models;
using Core.DTOs;
using AutoMapper;

namespace Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IClinicRepository _clinicRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IProductRepository _productRepository;
        private readonly ISupplierRepository _supplierRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IInventoryService _inventoryService; // Inject IInventoryService
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IDashboardRepository _dashboardRepository;
        private readonly IMapper _mapper;

        public DashboardService(
            IClinicRepository clinicRepository,
            ICompanyRepository companyRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IPatientRepository patientRepository,
            IClientRepository clientRepository,
            IProductRepository productRepository,
            ISupplierRepository supplierRepository,
            IVisitRepository visitRepository,
            IMedicalRecordRepository medicalRecordRepository,
            IInventoryService inventoryService,
            IInventoryRepository inventoryRepository,
            IDashboardRepository dashboardRepository,
            IMapper mapper) // Add IInventoryService and IInventoryRepository to constructor
        {
            _clinicRepository = clinicRepository;
            _companyRepository = companyRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _patientRepository = patientRepository;
            _clientRepository = clientRepository;
            _productRepository = productRepository;
            _supplierRepository = supplierRepository;
            _visitRepository = visitRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _inventoryService = inventoryService; // Assign injected service
            _inventoryRepository = inventoryRepository;
            _dashboardRepository = dashboardRepository;
            _mapper = mapper;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(DateTime? fromDate = null, DateTime? toDate = null, Guid? companyId = null)
        {
            var clinics = await _clinicRepository.GetAllAsync(1, int.MaxValue, false, companyId);

            var result = new DashboardSummaryDto
            {
                Clinics = new List<ClinicDashboardDto>()
            };


            result.TotalPatients = await _dashboardRepository
            .GetPatientCountByCompanyAsync(companyId, fromDate, toDate);

            result.TotalProducts = await _dashboardRepository
                .GetProductCountByCompanyAsync(companyId, fromDate, toDate);

            foreach (var clinic in clinics.Items)
            {
                if (clinic.Id == Guid.Empty)
                    continue;

                // Get all counts using repository methods with SQL queries
                int numberOfVeterinarians = await _dashboardRepository.GetVeterinarianCountByClinicAsync(clinic.Id, fromDate, toDate);
                int numberOfPatients = await _dashboardRepository.GetPatientCountByCompanyAsync(companyId, fromDate, toDate);
                int numberOfClients = await _dashboardRepository.GetClientCountByCompanyAsync(companyId, fromDate, toDate);
                int numberOfProducts = await _dashboardRepository.GetProductCountByCompanyAsync(companyId, fromDate, toDate);
                int numberOfSuppliers = await _dashboardRepository.GetSupplierCountByClinicAsync(clinic.Id, fromDate, toDate);

                // Get appointment statistics using repository method
                var (totalAppointments, completedAppointments, canceledAppointments) = 
                    await _dashboardRepository.GetAppointmentStatisticsByClinicAsync(clinic.Id, fromDate, toDate);
                
                double completionRatio = totalAppointments > 0 ? (double)completedAppointments / totalAppointments : 0;
                string percentageOfCompleting = totalAppointments > 0 ? ((double)completedAppointments / totalAppointments * 100).ToString("0.##", CultureInfo.InvariantCulture) + "%" : "0%";

                // Calculate average rating, service profit, and product profit for this clinic
                var averageRating = await _dashboardRepository.GetAverageRatingByClinicAsync(clinic.Id, fromDate, toDate);
                var serviceProfit = await _dashboardRepository.GetServiceProfitByClinicAsync(clinic.Id, fromDate, toDate);
                var productProfit = await _dashboardRepository.GetProductProfitByClinicAsync(clinic.Id, fromDate, toDate);

                result.Clinics.Add(new ClinicDashboardDto
                {
                    ClinicName = clinic.Name,
                    ClinicDetails = new ClinicDetailsDto
                    {
                        NumberOfVeterinarians = numberOfVeterinarians,
                        NumberOfSuppliers = numberOfSuppliers
                    },
                    AppointmentCompletionRatios = new AppointmentCompletionRatiosDto
                    {
                        TotalAppointments = totalAppointments,
                        CompletedAppointments = completedAppointments,
                        CanceledAppointments = canceledAppointments,
                        CompletionRatio = completionRatio,
                        PercentageOfCompleting = percentageOfCompleting
                    },
                    AverageRating = averageRating,
                    ServiceProfit = serviceProfit,
                    ProductProfit = productProfit
                });
            }

            return result;
        }

        public async Task<SuperAdminDashboardDto> GetSuperAdminDashboardAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var rows = await _dashboardRepository.GetSuperAdminDashboardSingleQueryAsync(fromDate, toDate);
            if (rows.Count == 0)
                return new SuperAdminDashboardDto { Companies = new List<CompanyDashboardDto>() };

            var result = new SuperAdminDashboardDto { Companies = new List<CompanyDashboardDto>() };
            CompanyDashboardDto? currentCompany = null;
            foreach (var row in rows)
            {
                if (currentCompany == null || currentCompany.CompanyId != row.CompanyId)
                {
                    currentCompany = _mapper.Map<CompanyDashboardDto>(row);
                    currentCompany.Clinics = new List<ClinicDashboardDto>();
                    result.Companies.Add(currentCompany);
                }

                if (row.ClinicId.HasValue && !string.IsNullOrEmpty(row.ClinicName))
                {
                    currentCompany!.Clinics.Add(_mapper.Map<ClinicDashboardDto>(row));
                }
            }

            return result;
        }

        public async Task<ClinicAdminDashboardDto> GetClinicAdminDashboardAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            // Get clinic details
            var clinic = await _clinicRepository.GetByIdAsync(clinicId);
            if (clinic == null)
                throw new ArgumentException($"Clinic with ID {clinicId} not found.");

            // Get all counts using repository methods with SQL queries
            int numberOfVeterinarians = await _dashboardRepository.GetVeterinarianCountByClinicAsync(clinicId, fromDate, toDate);
            int numberOfPatients = await _dashboardRepository.GetPatientCountByCompanyAsync(null, fromDate, toDate);
            int numberOfClients = await _dashboardRepository.GetClientCountByCompanyAsync(null, fromDate, toDate);
            int numberOfProducts = await _dashboardRepository.GetProductCountByCompanyAsync(null, fromDate, toDate);
            int numberOfSuppliers = await _dashboardRepository.GetSupplierCountByClinicAsync(clinicId, fromDate, toDate);

            // Client activity within selected duration, scoped to this clinic
            int newClientsAddedCount = await _dashboardRepository.GetNewClientCountByClinicAsync(clinicId, fromDate, toDate);
            int clientsMovedOutCount = await _dashboardRepository.GetMovedOutClientCountByClinicAsync(clinicId, fromDate, toDate);

            // Get appointment statistics using repository method
            var (totalAppointments, completedAppointments, canceledAppointments) = 
                await _dashboardRepository.GetAppointmentStatisticsByClinicAsync(clinicId, fromDate, toDate);
            
            double completionRatio = totalAppointments > 0 ? (double)completedAppointments / totalAppointments : 0;
            string percentageOfCompleting = totalAppointments > 0 ? ((double)completedAppointments / totalAppointments * 100).ToString("0.##", CultureInfo.InvariantCulture) + "%" : "0%";

            // Get Inventory Dashboard data
            var inventoryDashboard = await _inventoryService.GetInventoryDashboardAsync(clinicId, fromDate, toDate);

            // Calculate average rating, service profit, and product profit for the clinic within the date range
            var averageRating = await _dashboardRepository.GetAverageRatingByClinicAsync(clinicId, fromDate, toDate);
            var serviceProfit = await _dashboardRepository.GetServiceProfitByClinicAsync(clinicId, fromDate, toDate);
            var productProfit = await _dashboardRepository.GetProductProfitByClinicAsync(clinicId, fromDate, toDate);

            return new ClinicAdminDashboardDto
            {
                ClinicId = clinicId,
                ClinicName = clinic.Name,
                ClinicDetails = new ClinicDetailsDto
                {
                    NumberOfVeterinarians = numberOfVeterinarians,
                    NumberOfPatients = numberOfPatients,
                    NumberOfClients = numberOfClients,
                    NumberOfProducts = numberOfProducts,
                    NumberOfSuppliers = numberOfSuppliers
                },
                AppointmentCompletionRatios = new AppointmentCompletionRatiosDto
                {
                    TotalAppointments = totalAppointments,
                    CompletedAppointments = completedAppointments,
                    CanceledAppointments = canceledAppointments,
                    CompletionRatio = completionRatio,
                    PercentageOfCompleting = percentageOfCompleting
                },
                FromDate = fromDate,
                ToDate = toDate,
                InventoryDashboard = inventoryDashboard, // Assign inventory dashboard data
                AverageRating = averageRating,
                ServiceProfit = serviceProfit,
                ProductProfit = productProfit,
                NewClientsAddedCount = newClientsAddedCount,
                ClientsMovedOutCount = clientsMovedOutCount
            };
        }

        public async Task<VeterinarianDashboardDto> GetVeterinarianDashboardAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            // Get user details
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new ArgumentException($"User with ID {userId} not found.");

            if (!string.Equals(user.RoleName, "veterinarian", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException($"User with ID {userId} is not a veterinarian.");

            // Get clinic details - use first clinic if user has multiple clinics
            var firstClinic = user.ClinicMappings?.FirstOrDefault();
            var clinic = firstClinic != null ? await _clinicRepository.GetByIdAsync(firstClinic.ClinicId) : null;

            // Get appointments for this veterinarian across all their clinics
            var allAppointments = new List<Core.Models.Appointment>();
            if (user.ClinicMappings?.Any() == true)
            {
                foreach (var clinicMapping in user.ClinicMappings)
                {
                    var (appointments, _) = await _appointmentRepository.GetAllAsync(1, int.MaxValue, clinicMapping.ClinicId, null, null, userId, null, fromDate, toDate);
                    allAppointments.AddRange(appointments);
                }
            }
            var appointmentList = allAppointments;


            // Calculate appointment statistics
            int totalAppointments = appointmentList.Count;
            int completedAppointments = appointmentList.Count(a => string.Equals(a.Status, "completed", StringComparison.OrdinalIgnoreCase));
            int canceledAppointments = appointmentList.Count(a => string.Equals(a.Status, "cancelled", StringComparison.OrdinalIgnoreCase));
            int pendingAppointments = appointmentList.Count(a => string.Equals(a.Status, "pending", StringComparison.OrdinalIgnoreCase));
            double completionRatio = totalAppointments > 0 ? (double)completedAppointments / totalAppointments : 0;
            string completionPercentage = totalAppointments > 0 ? ((double)completedAppointments / totalAppointments * 100).ToString("0.##", CultureInfo.InvariantCulture) + "%" : "0%";

            // Get today's appointments
            var today = DateTime.Today;
            int todayAppointments = appointmentList.Count(a => a.AppointmentDate.Date == today);

            // Get visits for this veterinarian's appointments
            var completedVisits = 0;
            var patientsWithActiveTreatment = 0;
            var patientsRequiringFollowUp = 0;

            foreach (var appointment in appointmentList.Where(a => string.Equals(a.Status, "completed", StringComparison.OrdinalIgnoreCase)))
            {
                var visit = await _visitRepository.GetByAppointmentIdAsync(appointment.Id);
                if (visit != null)
                {
                    completedVisits++;
                    
                    // Check if patient has active treatment (has medical records)
                    var medicalRecordsResult = await _medicalRecordRepository.GetAllAsync(1, int.MaxValue, firstClinic?.ClinicId, appointment.PatientId, appointment.Id, userId);
                    var medicalRecords = medicalRecordsResult.Items;
                    if (medicalRecords.Any())
                    {
                        patientsWithActiveTreatment++;
                    }
                }
            }

            // Get patient statistics using repository method
            int totalPatients = await _dashboardRepository.GetPatientCountByCompanyAsync(null, fromDate, toDate);
            
            // For new patients this month, we need to check if they're in the current month and within date range
            // This is a special case, so we'll calculate it separately
            int newPatientsThisMonth = 0;
            if (fromDate.HasValue && toDate.HasValue)
            {
                var currentMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);
                var monthFromDate = fromDate.Value < currentMonthStart ? currentMonthStart : fromDate.Value;
                var monthToDate = toDate.Value > currentMonthEnd ? currentMonthEnd : toDate.Value;
                
                if (monthFromDate <= monthToDate)
                {
                    newPatientsThisMonth = await _dashboardRepository.GetPatientCountByCompanyAsync(null, monthFromDate, monthToDate);
                }
            }
            else
            {
                var currentMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);
                newPatientsThisMonth = await _dashboardRepository.GetPatientCountByCompanyAsync(null, currentMonthStart, currentMonthEnd);
            }

            // Estimate patients requiring follow-up (patients with appointments in the last 30 days)
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            var recentAppointments = appointmentList.Where(a => a.AppointmentDate >= thirtyDaysAgo).ToList();
            var patientsRequiringFollowUpIds = recentAppointments.Select(a => a.PatientId).Distinct();
            patientsRequiringFollowUp = patientsRequiringFollowUpIds.Count();

            return new VeterinarianDashboardDto
            {
                UserId = userId,
                UserName = $"{user.FirstName} {user.LastName}",
                ClinicName = clinic?.Name ?? "Unknown Clinic",
                ClinicId = firstClinic?.ClinicId,
                VeterinarianDetails = new VeterinarianDetailsDto
                {
                    TotalPatientsAssigned = totalPatients,
                    ActivePatients = patientsWithActiveTreatment,
                    CompletedVisits = completedVisits,
                    PendingAppointments = pendingAppointments,
                    TodayAppointments = todayAppointments
                },
                AppointmentStatistics = new AppointmentStatisticsDto
                {
                    TotalAppointments = totalAppointments,
                    CompletedAppointments = completedAppointments,
                    CanceledAppointments = canceledAppointments,
                    PendingAppointments = pendingAppointments,
                    CompletionRatio = completionRatio,
                    CompletionPercentage = completionPercentage
                },
                PatientStatistics = new PatientStatisticsDto
                {
                    TotalPatients = totalPatients,
                    NewPatientsThisMonth = newPatientsThisMonth,
                    PatientsWithActiveTreatment = patientsWithActiveTreatment,
                    PatientsRequiringFollowUp = patientsRequiringFollowUp
                },
                FromDate = fromDate,
                ToDate = toDate
            };
        }

        public async Task<ReceptionistDashboardDto> GetReceptionistDashboardAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            // Get user details
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new ArgumentException($"User with ID {userId} not found.");

            if (!string.Equals(user.RoleName, "receptionist", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException($"User with ID {userId} is not a receptionist.");

            // Get clinic details - use first clinic if user has multiple clinics
            var firstClinicMapping = user.ClinicMappings?.FirstOrDefault();
            var clinic = firstClinicMapping != null ? await _clinicRepository.GetByIdAsync(firstClinicMapping.ClinicId) : null;

            // Get appointments for this clinic (using first clinic for receptionist)
            var clinicId = firstClinicMapping?.ClinicId;
            var (appointments, _) = await _appointmentRepository.GetAllAsync(1, int.MaxValue, clinicId, null, null, null, null, fromDate, toDate);
            var appointmentList = appointments.ToList();

            // Calculate appointment management statistics
            int totalAppointments = appointmentList.Count;
            int confirmedAppointments = appointmentList.Count(a => string.Equals(a.Status, "confirmed", StringComparison.OrdinalIgnoreCase));
            int pendingConfirmations = appointmentList.Count(a => string.Equals(a.Status, "pending", StringComparison.OrdinalIgnoreCase));
            int cancelledAppointments = appointmentList.Count(a => string.Equals(a.Status, "cancelled", StringComparison.OrdinalIgnoreCase));
            int rescheduledAppointments = appointmentList.Count(a => string.Equals(a.Status, "rescheduled", StringComparison.OrdinalIgnoreCase));
            double confirmationRate = totalAppointments > 0 ? (double)confirmedAppointments / totalAppointments : 0;
            string confirmationPercentage = totalAppointments > 0 ? ((double)confirmedAppointments / totalAppointments * 100).ToString("0.##", CultureInfo.InvariantCulture) + "%" : "0%";

            // Get today's appointments
            var today = DateTime.Today;
            int appointmentsToday = appointmentList.Count(a => a.AppointmentDate.Date == today);

            // Get client statistics using repository method
            int totalClients = await _dashboardRepository.GetClientCountByCompanyAsync(null, fromDate, toDate);
            
            // For new clients this month, calculate separately
            int newClientsThisMonth = 0;
            if (fromDate.HasValue && toDate.HasValue)
            {
                var currentMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);
                var monthFromDate = fromDate.Value < currentMonthStart ? currentMonthStart : fromDate.Value;
                var monthToDate = toDate.Value > currentMonthEnd ? currentMonthEnd : toDate.Value;
                
                if (monthFromDate <= monthToDate)
                {
                    newClientsThisMonth = await _dashboardRepository.GetClientCountByCompanyAsync(null, monthFromDate, monthToDate);
                }
            }
            else
            {
                var currentMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);
                newClientsThisMonth = await _dashboardRepository.GetClientCountByCompanyAsync(null, currentMonthStart, currentMonthEnd);
            }

            // Get active clients and pending registrations using repository methods
            int activeClients = await _dashboardRepository.GetActiveClientCountByCompanyAsync(null, fromDate, toDate);
            int pendingRegistrations = await _dashboardRepository.GetPendingRegistrationCountByCompanyAsync(null, fromDate, toDate);

            // Estimate walk-in patients (appointments without registration)
            var walkInPatients = appointmentList.Count(a => a.IsRegistered == false);

            // Estimate completed check-ins (appointments that are confirmed or completed)
            var completedCheckIns = appointmentList.Count(a => string.Equals(a.Status, "confirmed", StringComparison.OrdinalIgnoreCase) || 
                                                               string.Equals(a.Status, "completed", StringComparison.OrdinalIgnoreCase));

            // Estimate clients with pending payments (this would need payment repository in real implementation)
            var clientsWithPendingPayments = 0; // Placeholder - would need payment data

            // Estimate clients requiring follow-up (clients with recent appointments)
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            var recentAppointments = appointmentList.Where(a => a.AppointmentDate >= thirtyDaysAgo).ToList();
            var clientsRequiringFollowUpIds = recentAppointments.Select(a => a.ClientId).Distinct();
            var clientsRequiringFollowUp = clientsRequiringFollowUpIds.Count();

            return new ReceptionistDashboardDto
            {
                UserId = userId,
                UserName = $"{user.FirstName} {user.LastName}",
                ClinicName = clinic?.Name ?? "Unknown Clinic",
                ClinicId = firstClinicMapping?.ClinicId,
                ReceptionistDetails = new ReceptionistDetailsDto
                {
                    TotalAppointmentsScheduled = totalAppointments,
                    AppointmentsToday = appointmentsToday,
                    WalkInPatients = walkInPatients,
                    PendingRegistrations = pendingRegistrations,
                    CompletedCheckIns = completedCheckIns
                },
                AppointmentManagement = new AppointmentManagementDto
                {
                    TotalAppointments = totalAppointments,
                    ConfirmedAppointments = confirmedAppointments,
                    PendingConfirmations = pendingConfirmations,
                    CancelledAppointments = cancelledAppointments,
                    RescheduledAppointments = rescheduledAppointments,
                    ConfirmationRate = confirmationRate,
                    ConfirmationPercentage = confirmationPercentage
                },
                ClientManagement = new ClientManagementDto
                {
                    TotalClients = totalClients,
                    NewClientsThisMonth = newClientsThisMonth,
                    ActiveClients = activeClients,
                    ClientsWithPendingPayments = clientsWithPendingPayments,
                    ClientsRequiringFollowUp = clientsRequiringFollowUp
                },
                FromDate = fromDate,
                ToDate = toDate
            };
        }

        public async Task<IEnumerable<ExpiringProductsResponseDto>> GetProductsExpiringWithin3MonthsAsync(Guid? clinicId = null)
        {
            // Get inventory items expiring within 3 months
            var inventoryItems = await _inventoryRepository.GetProductsExpiringWithin3MonthsAsync(clinicId);
            var result = new List<ExpiringProductsResponseDto>();

            // Get unique product IDs and clinic IDs
            var productIds = inventoryItems.Where(i => i.ProductId.HasValue).Select(i => i.ProductId!.Value).Distinct().ToList();
            var clinicIds = inventoryItems.Where(i => i.ClinicId.HasValue).Select(i => i.ClinicId!.Value).Distinct().ToList();

            // Load all products and clinics in parallel
            var products = new Dictionary<Guid, Core.Models.Product>();
            var clinics = new Dictionary<Guid, Core.Models.Clinic>();

            foreach (var productId in productIds)
            {
                var product = await _productRepository.GetByIdAsync(productId);
                if (product != null)
                {
                    products[productId] = product;
                }
            }

            foreach (var clinicIdItem in clinicIds)
            {
                var clinic = await _clinicRepository.GetByIdAsync(clinicIdItem);
                if (clinic != null)
                {
                    clinics[clinicIdItem] = clinic;
                }
            }

            // Map inventory items to response DTOs
            foreach (var inventory in inventoryItems)
            {
                var dto = new ExpiringProductsResponseDto
                {
                    InventoryId = inventory.Id,
                    ProductId = inventory.ProductId ?? Guid.Empty,
                    ClinicId = inventory.ClinicId ?? Guid.Empty,
                    ExpirationDate = inventory.ExpirationDate,
                    DateOfManufacture = inventory.DateOfManufacture,
                    QuantityOnHand = inventory.QuantityOnHand,
                    BatchNumber = inventory.BatchNumber,
                    LotNumber = inventory.LotNumber,
                    Location = inventory.Location,
                    UnitCost = inventory.UnitCost,
                    WholesaleCost = inventory.WholesaleCost,
                    RetailPrice = inventory.RetailPrice,
                    ReceivedDate = inventory.ReceivedDate
                };

                // Map product details
                if (inventory.ProductId.HasValue && products.ContainsKey(inventory.ProductId.Value))
                {
                    dto.Product = _mapper.Map<ProductDto>(products[inventory.ProductId.Value]);
                }

                // Map clinic/branch details
                if (inventory.ClinicId.HasValue && clinics.ContainsKey(inventory.ClinicId.Value))
                {
                    dto.Clinic = _mapper.Map<ClinicResponseDto>(clinics[inventory.ClinicId.Value]);
                }

                result.Add(dto);
            }

            return result;
        }

        public async Task<ClinicWeeklyProfitResponseDto> GetClinicWeeklyProfitAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                // Validate clinic exists
                var clinic = await _clinicRepository.GetByIdAsync(clinicId);
                if (clinic == null)
                {
                    throw new KeyNotFoundException($"Clinic with id {clinicId} not found.");
                }

                // Calculate date range
                var (actualFromDate, actualToDate) = CalculateDateRange(fromDate, toDate);

                // Get weekly profit data
                var weeklyData = await _dashboardRepository.GetWeeklyProfitByClinicAsync(clinicId, actualFromDate, actualToDate);

                // Map to response using AutoMapper
                var response = _mapper.Map<ClinicWeeklyProfitResponseDto>(clinic);
                response.WeeklyData = _mapper.Map<List<WeeklyProfitDataDto>>(weeklyData);

                return response;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to get weekly profit for clinic {clinicId}", ex);
            }
        }

        /// <summary>
        /// Calculate date range for weekly profit query
        /// If dates provided, use them; otherwise default to last 6 months from current month
        /// </summary>
        private (DateTime FromDate, DateTime ToDate) CalculateDateRange(DateTime? fromDate, DateTime? toDate)
        {
            if (fromDate.HasValue && toDate.HasValue)
            {
                return (fromDate.Value.Date, toDate.Value.Date);
            }

            // Default to last 6 months from current month
            var today = DateTime.UtcNow.Date;
            var actualToDate = new DateTime(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month));
            var actualFromDate = new DateTime(today.Year, today.Month, 1).AddMonths(-5);

            return (actualFromDate, actualToDate);
        }
    }
}
