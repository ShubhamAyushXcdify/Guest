using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class VaccinationMasterRepository : IVaccinationMasterRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VaccinationMasterRepository> _logger;

        public VaccinationMasterRepository(DapperDbContext dbContext, ILogger<VaccinationMasterRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<VaccinationMaster> CreateAsync(VaccinationMaster vaccinationMaster)
        {
            const string sql = @"INSERT INTO vaccination_master (id, species, is_core, disease, vaccine_type, initial_dose, booster, revaccination_interval, notes, vac_code, created_at, updated_at)
                VALUES (@Id, @Species, @IsCore, @Disease, @VaccineType, @InitialDose, @Booster, @RevaccinationInterval, @Notes, @VacCode, @CreatedAt, @UpdatedAt) RETURNING *;";
            using var connection = _dbContext.GetConnection();
            return await connection.QuerySingleAsync<VaccinationMaster>(sql, vaccinationMaster);
        }

        public async Task<VaccinationMaster?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM vaccination_master WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<VaccinationMaster>(sql, new { Id = id });
        }

        public async Task<IEnumerable<VaccinationMaster>> GetAllAsync(string? species = null, bool? isCore = null)
        {
            var where = new List<string>();
            var parameters = new DynamicParameters();
            if (!string.IsNullOrWhiteSpace(species)) { where.Add("species = @Species"); parameters.Add("Species", species); }
            if (isCore.HasValue) { where.Add("is_core = @IsCore"); parameters.Add("IsCore", isCore.Value); }
            var sql = "SELECT * FROM vaccination_master" + (where.Count > 0 ? " WHERE " + string.Join(" AND ", where) : "");
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<VaccinationMaster>(sql, parameters);
        }

        public async Task<VaccinationMaster> UpdateAsync(VaccinationMaster vaccinationMaster)
        {
            const string sql = @"UPDATE vaccination_master SET species = @Species, is_core = @IsCore, disease = @Disease, vaccine_type = @VaccineType, initial_dose = @InitialDose, booster = @Booster, revaccination_interval = @RevaccinationInterval, notes = @Notes, vac_code = @VacCode, updated_at = @UpdatedAt WHERE id = @Id RETURNING *;";
            using var connection = _dbContext.GetConnection();
            return await connection.QuerySingleAsync<VaccinationMaster>(sql, vaccinationMaster);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM vaccination_master WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            var affected = await connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }
    }
} 