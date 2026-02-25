using Application.Interfaces;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Extensions
{
    public static class ServiceServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Core Services
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<IAppointmentService, AppointmentService>();
            services.AddScoped<IAppointmentTypeService, AppointmentTypeService>();
            services.AddScoped<IPatientService, PatientService>();
            services.AddScoped<IClinicService, ClinicService>();
            services.AddScoped<IInventoryService, InventoryService>();
            services.AddScoped<IVisitInvoiceService, VisitInvoiceService>();
            services.AddScoped<IMedicalRecordService, MedicalRecordService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
            services.AddScoped<IRoomService, RoomService>();
            services.AddScoped<ISupplierService, SupplierService>();
            services.AddScoped<IExpenseService, ExpenseService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IUserClinicService, UserClinicService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<IRatingService, RatingService>();
            services.AddScoped<ICertificateTypeService, CertificateTypeService>();
            services.AddScoped<IIntakeDetailService, IntakeDetailService>();
            services.AddScoped<IVisitService, VisitService>();
            services.AddScoped<ISymptomService, SymptomService>();
            services.AddScoped<IComplaintDetailService, ComplaintDetailService>();
            services.AddScoped<IProcedureService, ProcedureService>();
            services.AddScoped<IProcedureDetailService, ProcedureDetailService>();
            services.AddScoped<IProcedureDocumentDetailsService, ProcedureDocumentDetailsService>();
            services.AddScoped<IVitalDetailService, VitalDetailService>();
            services.AddScoped<IPrescriptionDetailService, PrescriptionDetailService>();
            services.AddScoped<IPlanService, PlanService>();
            services.AddScoped<IClientRegistrationService, ClientRegistrationService>();
            services.AddScoped<IPlanDetailService, PlanDetailService>();
            services.AddScoped<IMedicalHistoryDetailService, MedicalHistoryDetailService>();
            services.AddScoped<IRoomSlotBookingService, RoomSlotBookingService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ISmsService, SmsService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IVaccinationMasterService, VaccinationMasterService>();
            services.AddScoped<IVaccinationDetailService, VaccinationDetailService>();
            services.AddScoped<IEmergencyVisitService, EmergencyVisitService>();
            services.AddScoped<IEmergencyVitalService, EmergencyVitalService>();
            services.AddScoped<IEmergencyProcedureService, EmergencyProcedureService>();
            services.AddScoped<IEmergencyDischargeService, EmergencyDischargeService>();
            services.AddScoped<IEmergencyPrescriptionService, EmergencyPrescriptionService>();
            services.AddScoped<ISurgeryPreOpService, SurgeryPreOpService>();
            services.AddScoped<ISurgeryDetailService, SurgeryDetailService>();
            services.AddScoped<ISurgeryPostOpService, SurgeryPostOpService>();
            services.AddScoped<ISurgeryDischargeService, SurgeryDischargeService>();
            services.AddScoped<IDewormingIntakeService, DewormingIntakeService>();
            services.AddScoped<IDewormingMedicationService, DewormingMedicationService>();
            services.AddScoped<IDewormingNoteService, DewormingNoteService>();
            services.AddScoped<IDewormingCheckoutService, DewormingCheckoutService>();
            services.AddScoped<IDischargeSummaryService, DischargeSummaryService>();
            services.AddScoped<ICertificateService, CertificateService>();
            services.AddScoped<ICompanyService, CompanyService>();
            services.AddScoped<IScreenService, ScreenService>();
            services.AddScoped<IVaccinationReminderService, VaccinationReminderService>();
            services.AddScoped<IEmergencyDischargeReminderService, EmergencyDischargeReminderService>();
            services.AddScoped<ISurgeryDischargeReminderService, SurgeryDischargeReminderService>();
            services.AddScoped<IDewormingReminderService, DewormingReminderService>();
            services.AddScoped<IPatientFileService, PatientFileService>();
            services.AddScoped<IPatientReportService, PatientReportService>();
            services.AddScoped<IConversationService, ConversationService>();
            services.AddScoped<INotificationService, Api.Services.NotificationService>();
            services.AddScoped<INotificationPersistenceService, NotificationPersistenceService>();

            // Additional Services
            services.AddScoped<IDoctorSlotService, DoctorSlotService>();
            services.AddScoped<BarcodeService>();

            return services;
        }
    }
}
