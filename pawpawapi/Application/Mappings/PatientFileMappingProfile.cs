using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    /// <summary>
    /// AutoMapper profile for PatientFile and PatientFileAttachment mappings
    /// </summary>
    public class PatientFileMappingProfile : Profile
    {
        public PatientFileMappingProfile()
        {
            // PatientFile mappings
            CreateMap<PatientFile, PatientFileResponseDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => 
                    src.Creator != null ? $"{src.Creator.FirstName} {src.Creator.LastName}" : string.Empty))
                .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => src.Attachments));

            CreateMap<CreatePatientFileRequestDto, PatientFile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Patient, opt => opt.Ignore())
                .ForMember(dest => dest.Creator, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore());

            CreateMap<UpdatePatientFileRequestDto, PatientFile>()
                .ForMember(dest => dest.PatientId, opt => opt.Ignore()) // Don't allow changing patient ID
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // Don't allow changing created by
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Patient, opt => opt.Ignore())
                .ForMember(dest => dest.Creator, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore());

            // PatientFileAttachment mappings
            CreateMap<PatientFileAttachment, PatientFileAttachmentResponseDto>();

            CreateMap<PatientFileAttachment, CreatePatientFileAttachmentDto>()
                .ForMember(dest => dest.FileData, opt => opt.Ignore());

            CreateMap<CreatePatientFileAttachmentDto, PatientFileAttachment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PatientFileId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.PatientFile, opt => opt.Ignore());
        }
    }
}

