using AutoMapper;
using Core.Models;
using Application.DTOs;
using System.Linq;
using System;
using Core.DTOs;

namespace Application.Mappings
{
    public class EntityMappingProfile : Profile
    {
        public EntityMappingProfile()
        {
            // Client mappings moved to ClientProfile
            CreateMap<Client, UserResponseDto>().ReverseMap();

            // Patient
            CreateMap<Patient, PatientResponseDto>().ReverseMap();
            CreateMap<CreatePatientRequestDto, Patient>();
            CreateMap<UpdatePatientRequestDto, Patient>();

            // Clinic mappings moved to ClinicProfile

            // Inventory
            CreateMap<Inventory, InventoryResponseDto>().ReverseMap();
            CreateMap<CreateInventoryRequestDto, Inventory>();
            CreateMap<UpdateInventoryRequestDto, Inventory>();



            // MedicalRecord
            CreateMap<MedicalRecord, MedicalRecordResponseDto>().ReverseMap();
            CreateMap<CreateMedicalRecordRequestDto, MedicalRecord>();
            CreateMap<UpdateMedicalRecordRequestDto, MedicalRecord>();



            // Product
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.BrandName));
            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.BrandName));
            CreateMap<CreateProductRequestDto, Product>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.BrandName));
            CreateMap<UpdateProductRequestDto, Product>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.BrandName));
            
            // ProductDto mapping for embedded use
            CreateMap<ProductResponseDto, ProductDto>();
            CreateMap<ProductUsageHistoryRow, ProductUsageHistoryItemDto>();

            // PurchaseOrder
            CreateMap<PurchaseOrder, PurchaseOrderResponseDto>().ReverseMap();
            CreateMap<CreatePurchaseOrderRequestDto, PurchaseOrder>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.OrderNumber, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdatePurchaseOrderRequestDto, PurchaseOrder>()
                .ForMember(dest => dest.OrderNumber, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // PurchaseOrderItem
            CreateMap<PurchaseOrderItem, PurchaseOrderItemResponseDto>().ReverseMap();
            CreateMap<CreatePurchaseOrderItemRequestDto, PurchaseOrderItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.QuantityReceived, opt => opt.Ignore())
                .ForMember(dest => dest.LotNumber, opt => opt.Ignore())
                .ForMember(dest => dest.BatchNumber, opt => opt.Ignore())
                .ForMember(dest => dest.ExpirationDate, opt => opt.Ignore())
                .ForMember(dest => dest.DateOfManufacture, opt => opt.Ignore())
                .ForMember(dest => dest.ActualDeliveryDate, opt => opt.Ignore())
                .ForMember(dest => dest.ReceivedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdatePurchaseOrderItemRequestDto, PurchaseOrderItem>()
                .ForMember(dest => dest.QuantityReceived, opt => opt.Ignore())
                .ForMember(dest => dest.LotNumber, opt => opt.Ignore())
                .ForMember(dest => dest.BatchNumber, opt => opt.Ignore())
                .ForMember(dest => dest.ExpirationDate, opt => opt.Ignore())
                .ForMember(dest => dest.DateOfManufacture, opt => opt.Ignore())
                .ForMember(dest => dest.ActualDeliveryDate, opt => opt.Ignore())
                .ForMember(dest => dest.ReceivedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Room
            CreateMap<Room, RoomResponseDto>().ReverseMap();
            CreateMap<CreateRoomRequestDto, Room>();
            CreateMap<UpdateRoomRequestDto, Room>();



            // Supplier
            CreateMap<Supplier, SupplierResponseDto>().ReverseMap();
            CreateMap<Supplier, SupplierDto>().ReverseMap();
            CreateMap<CreateSupplierRequestDto, Supplier>();
            CreateMap<UpdateSupplierRequestDto, Supplier>();
            CreateMap<SupplierFilterDto, SupplierFilterCoreDto>();

            // User
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Clinics, opt => opt.MapFrom(src =>
                    src.ClinicMappings != null ? src.ClinicMappings.Select(cm => new Application.DTOs.UserClinicDto
                    {
                        ClinicId = cm.ClinicId,
                        ClinicName = cm.ClinicName
                    }).ToList() : null));

            CreateMap<CreateUserRequestDto, User>()
                .ForMember(dest => dest.ClinicMappings, opt => opt.Ignore());

            CreateMap<UpdateUserRequestDto, User>()
                .ForMember(dest => dest.ClinicMappings, opt => opt.Ignore());

            // UserClinicMapping
            CreateMap<UserClinicMapping, Application.DTOs.UserClinicDto>()
                .ForMember(dest => dest.ClinicId, opt => opt.MapFrom(src => src.ClinicId))
                .ForMember(dest => dest.ClinicName, opt => opt.MapFrom(src => src.ClinicName));

            // UserClinic
            CreateMap<UserClinic, UserClinicResponseDto>().ReverseMap();
            CreateMap<CreateUserClinicRequestDto, UserClinic>();
            CreateMap<UpdateUserClinicRequestDto, UserClinic>();



            // Rating
            CreateMap<Rating, RatingDto>()
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.RatingValue));
            CreateMap<RatingDto, Rating>()
                .ForMember(dest => dest.RatingValue, opt => opt.MapFrom(src => src.Rating));
            CreateMap<CreateRatingDto, Rating>()
                .ForMember(dest => dest.RatingValue, opt => opt.MapFrom(src => src.Rating));
            CreateMap<UpdateRatingDto, Rating>()
                .ForMember(dest => dest.RatingValue, opt => opt.MapFrom(src => src.Rating ?? 0));

            // CertificateType
            CreateMap<CertificateType, CertificateTypeDto>().ReverseMap();
            CreateMap<CreateCertificateTypeDto, CertificateType>();
            CreateMap<UpdateCertificateTypeDto, CertificateType>();

            // ComplaintDetail mappings moved to ComplaintDetailProfile
            CreateMap<Symptom, SymptomDto>();

            // Procedure Detail mappings
            CreateMap<ProcedureDetail, ProcedureDetailResponseDto>().ReverseMap();
            CreateMap<CreateProcedureDetailRequestDto, ProcedureDetail>();
            CreateMap<UpdateProcedureDetailRequestDto, ProcedureDetail>();

            // Procedure Document Details mappings
            CreateMap<ProcedureDetailMapping, ProcedureDocumentDetailsResponseDto>().ReverseMap();
            CreateMap<CreateProcedureDocumentDetailsRequestDto, ProcedureDetailMapping>();
            CreateMap<UpdateProcedureDocumentDetailsRequestDto, ProcedureDetailMapping>();

            CreateMap<VitalDetail, VitalDetailResponseDto>();
            CreateMap<CreateVitalDetailRequestDto, VitalDetail>();
            CreateMap<UpdateVitalDetailRequestDto, VitalDetail>();

            // PlanDetail
            CreateMap<PlanDetail, PlanDetailResponseDto>()
                .ForMember(dest => dest.FollowUpDate, opt => opt.MapFrom(src => src.FollowUpDate)).ReverseMap();
            CreateMap<CreatePlanDetailRequestDto, PlanDetail>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.FollowUpDate, opt => opt.MapFrom(src => src.FollowUpDate));
            CreateMap<UpdatePlanDetailRequestDto, PlanDetail>();

            // Plan
            CreateMap<Plan, PlanDto>().ReverseMap();

            CreateMap<PrescriptionDetail, PrescriptionDetailResponseDto>().ReverseMap();
            CreateMap<CreatePrescriptionDetailRequestDto, PrescriptionDetail>();
            CreateMap<UpdatePrescriptionDetailRequestDto, PrescriptionDetail>();
            CreateMap<PrescriptionDetail, PrescriptionDetailResponseDto>();
            CreateMap<PrescriptionProductMapping, PrescriptionProductMappingDto>();

            // MedicalHistoryDetail
            CreateMap<MedicalHistoryDetail, MedicalHistoryDetailResponseDto>().ReverseMap();
            CreateMap<CreateMedicalHistoryDetailRequestDto, MedicalHistoryDetail>();
            CreateMap<UpdateMedicalHistoryDetailRequestDto, MedicalHistoryDetail>();



            // Client Registration mappings moved to ClientRegistrationProfile

            // Procedure
            CreateMap<Procedure, ProcedureResponseDto>().ReverseMap();
            CreateMap<Procedure, ProcedureDto>().ReverseMap();
            CreateMap<CreateProcedureRequestDto, Procedure>();
            CreateMap<UpdateProcedureRequestDto, Procedure>();

            CreateMap<EmergencyTriage, EmergencyTriageResponseDto>()
                .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src => src.IsComplete));
            CreateMap<EmergencyTriageResponseDto, EmergencyTriage>()
                .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src => src.IsComplete));


            // New Create and Update DTO mappings for Emergency Triage
            CreateMap<CreateEmergencyTriageRequestDto, EmergencyTriage>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src => src.IsComplete));

            CreateMap<UpdateEmergencyTriageRequestDto, EmergencyTriage>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src => src.IsComplete));

            // Emergency Vital mappings
            CreateMap<EmergencyVital, EmergencyVitalResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));



            // New Create and Update DTO mappings for Emergency Vital
            CreateMap<CreateEmergencyVitalRequestDto, EmergencyVital>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            CreateMap<UpdateEmergencyVitalRequestDto, EmergencyVital>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            // Emergency Procedure mappings
            CreateMap<EmergencyProcedure, EmergencyProcedureResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));



            // New Create and Update DTO mappings for Emergency Procedure
            CreateMap<CreateEmergencyProcedureRequestDto, EmergencyProcedure>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            CreateMap<UpdateEmergencyProcedureRequestDto, EmergencyProcedure>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            // Emergency Discharge mappings
            CreateMap<EmergencyDischarge, EmergencyDischargeResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.FollowupDate, opt => opt.MapFrom(src => src.FollowupDate));



            // New Create and Update DTO mappings for Emergency Discharge
            CreateMap<CreateEmergencyDischargeRequestDto, EmergencyDischarge>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.FollowupDate, opt => opt.MapFrom(src => src.FollowupDate))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            CreateMap<UpdateEmergencyDischargeRequestDto, EmergencyDischarge>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.FollowupDate, opt => opt.MapFrom(src => src.FollowupDate))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            // Emergency Prescription mappings
            CreateMap<EmergencyPrescription, EmergencyPrescriptionResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.EmergencyDischargeId, opt => opt.MapFrom(src => src.EmergencyDischargeId))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));



            // New Create and Update DTO mappings for Emergency Prescription
            CreateMap<CreateEmergencyPrescriptionRequestDto, EmergencyPrescription>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.EmergencyDischargeId, opt => opt.Ignore()) // Will be set by service
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

            CreateMap<UpdateEmergencyPrescriptionRequestDto, EmergencyPrescription>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.EmergencyDischargeId, opt => opt.MapFrom(src => src.EmergencyDischargeId))
                .ForMember(dest => dest.VisitId, opt => opt.MapFrom(src => src.VisitId))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));

         
            CreateMap<EmergencyDischargeWithPrescriptionsRequestDto, EmergencyDischarge>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Id is set in service
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Set in service
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Set in service
                .ForMember(dest => dest.FollowupDate, opt => opt.MapFrom(src => src.FollowupDate))
                .ForMember(dest => dest.ReviewedWithClient, opt => opt.MapFrom(src => src.ReviewedWithClient ?? false))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted ?? false));

            // SurgeryPreOp
            CreateMap<SurgeryPreOp, SurgeryPreOpResponseDto>().ReverseMap();
            CreateMap<CreateSurgeryPreOpRequestDto, SurgeryPreOp>();
            CreateMap<UpdateSurgeryPreOpRequestDto, SurgeryPreOp>();

            // SurgeryDetail
            CreateMap<SurgeryDetail, SurgeryDetailResponseDto>().ReverseMap();
            CreateMap<CreateSurgeryDetailRequestDto, SurgeryDetail>();
            CreateMap<UpdateSurgeryDetailRequestDto, SurgeryDetail>();

            // DewormingIntake
            CreateMap<DewormingIntake, DewormingIntakeResponseDto>().ReverseMap();
            CreateMap<CreateDewormingIntakeRequestDto, DewormingIntake>();
            CreateMap<UpdateDewormingIntakeRequestDto, DewormingIntake>();
        }
    }
}
