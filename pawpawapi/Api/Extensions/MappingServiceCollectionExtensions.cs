using Application.Mappings;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Extensions
{
    public static class MappingServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationMappings(this IServiceCollection services)
        {
            // AutoMapper - Register all mapping profiles
            // EntityMappingProfile contains most mappings and scans the Application.Mappings assembly
            services.AddAutoMapper(typeof(EntityMappingProfile).Assembly);
            services.AddAutoMapper(typeof(VisitMappingProfile).Assembly);
            services.AddAutoMapper(typeof(DoctorSlotMappingProfile));
            
            // Note: AutoMapper already scans all profiles in Application.Mappings, so SurgeryPreOp mappings are included.
            // Note: AutoMapper already scans all profiles in Application.Mappings, so SurgeryDetail mappings are included.
            
            services.AddAutoMapper(typeof(SurgeryPostOpMappingProfile));
            services.AddAutoMapper(typeof(SurgeryDischargeMappingProfile));
            
            // Note: AutoMapper already scans all profiles in Application.Mappings, so DewormingVisit mappings are included.
            
            services.AddAutoMapper(typeof(DewormingVisitProfile));
            services.AddAutoMapper(typeof(CompanyProfile));
            services.AddAutoMapper(typeof(ExpenseProfile));
            services.AddAutoMapper(typeof(VisitInvoiceProfile));
            services.AddAutoMapper(typeof(PatientFileMappingProfile));
            services.AddAutoMapper(typeof(NotificationMappingProfile));

            return services;
        }
    }
}
