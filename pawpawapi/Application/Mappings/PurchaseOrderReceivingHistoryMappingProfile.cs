using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class PurchaseOrderReceivingHistoryMappingProfile : Profile
    {
        public PurchaseOrderReceivingHistoryMappingProfile()
        {
            // Map from PurchaseOrderReceivingHistory model to PurchaseOrderReceivingHistoryResponseDto
            CreateMap<PurchaseOrderReceivingHistory, PurchaseOrderReceivingHistoryResponseDto>()
                .ForMember(dest => dest.QuantityInHand, opt => opt.MapFrom(src => src.QuantityOnHand))
                .ForMember(dest => dest.BarcodeNumber, opt => opt.MapFrom(src => src.BarcodeNumber));
        }
    }
} 