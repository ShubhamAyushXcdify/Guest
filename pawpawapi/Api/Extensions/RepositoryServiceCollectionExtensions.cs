using Core.Interfaces;
using Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Extensions
{
    public static class RepositoryServiceCollectionExtensions
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            // Core Repositories
            services.AddScoped<IClientRepository, ClientRepository>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            services.AddScoped<IAppointmentTypeRepository, AppointmentTypeRepository>();
            services.AddScoped<IPatientRepository, PatientRepository>();
            services.AddScoped<IClinicRepository, ClinicRepository>();
            services.AddScoped<IInventoryRepository, InventoryRepository>();
            services.AddScoped<IVisitInvoiceRepository, VisitInvoiceRepository>();
            services.AddScoped<IPurchaseOrderReceivingHistoryRepository, PurchaseOrderReceivingHistoryRepository>();
            services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
            services.AddScoped<IPurchaseOrderItemRepository, PurchaseOrderItemRepository>();
            services.AddScoped<IRoomRepository, RoomRepository>();
            services.AddScoped<ISupplierRepository, SupplierRepository>();
            services.AddScoped<IClientRegistrationRepository, ClientRegistrationRepository>();
            services.AddScoped<IExpenseRepository, ExpenseRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserClinicRepository, UserClinicRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IRatingRepository, RatingRepository>();
            services.AddScoped<ICertificateTypeRepository, CertificateTypeRepository>();
            services.AddScoped<IIntakeDetailRepository, IntakeDetailRepository>();
            services.AddScoped<IVisitRepository, VisitRepository>();
            services.AddScoped<ISymptomRepository, SymptomRepository>();
            services.AddScoped<IComplaintDetailRepository, ComplaintDetailRepository>();
            services.AddScoped<IProcedureRepository, ProcedureRepository>();
            services.AddScoped<IProcedureDetailRepository, ProcedureDetailRepository>();
            services.AddScoped<IProcedureDocumentDetailsRepository, ProcedureDocumentDetailsRepository>();
            services.AddScoped<IVitalDetailRepository, VitalDetailRepository>();
            services.AddScoped<IPrescriptionDetailRepository, PrescriptionDetailRepository>();
            services.AddScoped<IPlanRepository, PlanRepository>();
            services.AddScoped<IPlanDetailRepository, PlanDetailRepository>();
            services.AddScoped<IMedicalHistoryDetailRepository, MedicalHistoryDetailRepository>();
            services.AddScoped<IRoomSlotBookingRepository, RoomSlotBookingRepository>();
            services.AddScoped<IPasswordResetOtpRepository, PasswordResetOtpRepository>();
            services.AddScoped<IClientDeletionOtpRepository, ClientDeletionOtpRepository>();
            services.AddScoped<IVaccinationMasterRepository, VaccinationMasterRepository>();
            services.AddScoped<IVaccinationDetailRepository, VaccinationDetailRepository>();
            services.AddScoped<IEmergencyVisitRepository, EmergencyVisitRepository>();
            services.AddScoped<IEmergencyVitalRepository, EmergencyVitalRepository>();
            services.AddScoped<IEmergencyProcedureRepository, EmergencyProcedureRepository>();
            services.AddScoped<IEmergencyDischargeRepository, EmergencyDischargeRepository>();
            services.AddScoped<IEmergencyPrescriptionRepository, EmergencyPrescriptionRepository>();
            services.AddScoped<ISurgeryPreOpRepository, SurgeryPreOpRepository>();
            services.AddScoped<ISurgeryDetailRepository, SurgeryDetailRepository>();
            services.AddScoped<ISurgeryPostOpRepository, SurgeryPostOpRepository>();
            services.AddScoped<ISurgeryDischargeRepository, SurgeryDischargeRepository>();
            services.AddScoped<IDewormingIntakeRepository, DewormingIntakeRepository>();
            services.AddScoped<IDewormingMedicationRepository, DewormingMedicationRepository>();
            services.AddScoped<IDewormingNoteRepository, DewormingNoteRepository>();
            services.AddScoped<IDewormingCheckoutRepository, DewormingCheckoutRepository>();
            services.AddScoped<ICertificateRepository, CertificateRepository>();
            services.AddScoped<ICompanyRepository, CompanyRepository>();
            services.AddScoped<IScreenRepository, ScreenRepository>();
            services.AddScoped<IScreenAccessRepository, ScreenAccessRepository>();
            services.AddScoped<IVaccinationReminderRepository, VaccinationReminderRepository>();
            services.AddScoped<IEmergencyDischargeReminderRepository, EmergencyDischargeReminderRepository>();
            services.AddScoped<ISurgeryDischargeReminderRepository, SurgeryDischargeReminderRepository>();
            services.AddScoped<IDewormingReminderRepository, DewormingReminderRepository>();
            services.AddScoped<IPatientFileRepository, PatientFileRepository>();
            services.AddScoped<IPatientReportRepository, PatientReportRepository>();
            services.AddScoped<IConversationRepository, ConversationRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();

            // DoctorSlot Repository
            services.AddScoped<IDoctorSlotRepository, DoctorSlotRepository>();

            // Dashboard Repository
            services.AddScoped<IDashboardRepository, DashboardRepository>();

            return services;
        }
    }
}

