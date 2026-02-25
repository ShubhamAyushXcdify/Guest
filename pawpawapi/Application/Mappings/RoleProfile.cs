using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class RoleProfile : Profile
    {
        public RoleProfile()
        {
            CreateMap<CreateRoleDto, Role>();
            CreateMap<UpdateRoleDto, Role>().ForMember(d => d.Id, o => o.Ignore());
            CreateMap<Role, RoleDto>();
        }
    }
}
