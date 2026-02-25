using AutoMapper;
using Application.DTOs;
using Core.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Application.Mappings
{
    public class DashboardMappingProfile : Profile
    {
        public DashboardMappingProfile()
        {
            // Super-admin dashboard: single-query row -> DTOs
            CreateMap<SuperAdminDashboardRow, CompanyDashboardDto>()
                .ForMember(dest => dest.NumberOfAdmins, opt => opt.MapFrom(src => src.AdminCount))
                .ForMember(dest => dest.Clinics, opt => opt.Ignore());

            CreateMap<SuperAdminDashboardRow, ClinicDetailsDto>()
                .ForMember(dest => dest.NumberOfVeterinarians, opt => opt.MapFrom(src => src.VetCount))
                .ForMember(dest => dest.NumberOfPatients, opt => opt.MapFrom(src => src.PatientCount))
                .ForMember(dest => dest.NumberOfClients, opt => opt.MapFrom(src => src.ClientCount))
                .ForMember(dest => dest.NumberOfProducts, opt => opt.MapFrom(src => src.ProductCount))
                .ForMember(dest => dest.NumberOfSuppliers, opt => opt.MapFrom(src => src.SupplierCount));

            CreateMap<SuperAdminDashboardRow, AppointmentCompletionRatiosDto>()
                .ForMember(dest => dest.TotalAppointments, opt => opt.MapFrom(src => src.TotalAppointments))
                .ForMember(dest => dest.CompletedAppointments, opt => opt.MapFrom(src => src.CompletedAppointments))
                .ForMember(dest => dest.CanceledAppointments, opt => opt.MapFrom(src => src.CanceledAppointments))
                .ForMember(dest => dest.CompletionRatio, opt => opt.MapFrom(src => src.TotalAppointments > 0 ? (double)src.CompletedAppointments / src.TotalAppointments : 0d))
                .ForMember(dest => dest.PercentageOfCompleting, opt => opt.MapFrom(src => src.TotalAppointments > 0 ? ((double)src.CompletedAppointments / src.TotalAppointments * 100).ToString("0.##", CultureInfo.InvariantCulture) + "%" : "0%"));

            CreateMap<SuperAdminDashboardRow, ClinicDashboardDto>()
                .ForMember(dest => dest.ClinicName, opt => opt.MapFrom(src => src.ClinicName ?? string.Empty))
                .ForMember(dest => dest.ClinicDetails, opt => opt.MapFrom(src => src))
                .ForMember(dest => dest.AppointmentCompletionRatios, opt => opt.MapFrom(src => src))
                .ForMember(dest => dest.AverageRating, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceProfit, opt => opt.Ignore())
                .ForMember(dest => dest.ProductProfit, opt => opt.Ignore());

            // Map from tuple (WeekStart, WeekEnd, ServiceProfit, ProductProfit) to WeeklyProfitDataDto
            CreateMap<(DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit, decimal ProductProfit), WeeklyProfitDataDto>()
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.WeekStart))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.WeekEnd))
                .ForMember(dest => dest.ServiceProfit, opt => opt.MapFrom(src => src.ServiceProfit))
                .ForMember(dest => dest.ProductProfit, opt => opt.MapFrom(src => src.ProductProfit))
                .ForMember(dest => dest.WeekLabel, opt => opt.MapFrom(src => GetWeekLabel(src.WeekStart)))
                .ForMember(dest => dest.MonthYear, opt => opt.MapFrom(src => src.WeekStart.ToString("MMMM yyyy", CultureInfo.InvariantCulture)));

            // Map Clinic to ClinicWeeklyProfitResponseDto
            CreateMap<Core.Models.Clinic, ClinicWeeklyProfitResponseDto>()
                .ForMember(dest => dest.ClinicId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ClinicName, opt => opt.MapFrom(src => src.Name ?? "Unknown Clinic"))
                .ForMember(dest => dest.WeeklyData, opt => opt.Ignore()); // Will be populated separately

            // Map IEnumerable of tuples to List of WeeklyProfitDataDto
            CreateMap<IEnumerable<(DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit, decimal ProductProfit)>, List<WeeklyProfitDataDto>>()
                .ConvertUsing(src => src.Select(week => new WeeklyProfitDataDto
                {
                    StartDate = week.WeekStart,
                    EndDate = week.WeekEnd,
                    ServiceProfit = week.ServiceProfit,
                    ProductProfit = week.ProductProfit,
                    WeekLabel = GetWeekLabel(week.WeekStart),
                    MonthYear = week.WeekStart.ToString("MMMM yyyy", CultureInfo.InvariantCulture)
                }).ToList());
        }

        private static string GetWeekLabel(DateTime weekStart)
        {
            var firstDayOfMonth = new DateTime(weekStart.Year, weekStart.Month, 1);
            var daysFromMonthStart = (weekStart - firstDayOfMonth).Days;
            var weekNumber = (daysFromMonthStart / 7) + 1;
            
            // Ensure week number doesn't exceed 5 (max weeks in a month)
            if (weekNumber > 5) weekNumber = 5;
            
            return $"Week {weekNumber}";
        }
    }
}
