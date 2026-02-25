using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;
using System.Data;

namespace Infrastructure.Repositories
{
    public class VaccinationDetailRepository : IVaccinationDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VaccinationDetailRepository> _logger;

        public VaccinationDetailRepository(DapperDbContext dbContext, ILogger<VaccinationDetailRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<VaccinationDetail> CreateAsync(VaccinationDetail detail)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Insert main record
                const string sql = @"
                    INSERT INTO vaccination_details (id, visit_id, notes, is_completed, created_at, updated_at)
                    VALUES (@Id, @VisitId, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt)
                    RETURNING *;";

                var created = await connection.QuerySingleAsync<VaccinationDetail>(sql, detail, transaction);

                // Insert vaccination master mappings if any
                if (detail.VaccinationMasters?.Any() == true)
                {
                    const string mappingSql = @"
                        INSERT INTO vaccination_detail_masters (vaccination_detail_id, vaccination_master_id)
                        VALUES (@VaccinationDetailId, @VaccinationMasterId);";

                    foreach (var master in detail.VaccinationMasters)
                    {
                        await connection.ExecuteAsync(mappingSql, new
                        {
                            VaccinationDetailId = created.Id,
                            VaccinationMasterId = master.Id
                        }, transaction);
                    }
                }

                transaction.Commit();
                return await GetByIdAsync(created.Id) ?? created;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<IEnumerable<VaccinationDetail>> CreateManyAsync(IEnumerable<VaccinationDetail> details)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                var result = new List<VaccinationDetail>();
                foreach (var detail in details)
                {
                    var created = await CreateAsync(detail);
                    result.Add(created);
                }

                transaction.Commit();
                return result;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<VaccinationDetail?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT 
                    vd.*,
                    vm.*
                FROM vaccination_details vd
                LEFT JOIN vaccination_detail_masters vdm ON vd.id = vdm.vaccination_detail_id
                LEFT JOIN vaccination_master vm ON vdm.vaccination_master_id = vm.id
                WHERE vd.id = @Id;";

            using var connection = _dbContext.GetConnection();
            var result = await connection.QueryAsync<VaccinationDetail, VaccinationMaster, VaccinationDetail>(
                sql,
                (detail, master) =>
                {
                    if (master != null)
                    {
                        detail.VaccinationMasters.Add(master);
                    }
                    return detail;
                },
                new { Id = id },
                splitOn: "Id"
            );

            return result.GroupBy(d => d.Id).Select(g =>
            {
                var detail = g.First();
                detail.VaccinationMasters = g.Select(d => d.VaccinationMasters.FirstOrDefault())
                    .Where(m => m != null)
                    .ToList();
                return detail;
            }).FirstOrDefault();
        }

        public async Task<IEnumerable<VaccinationDetail>> GetByVisitIdAsync(Guid visitId)
        {
            const string sql = @"
                SELECT 
                    vd.*,
                    vm.*
                FROM vaccination_details vd
                LEFT JOIN vaccination_detail_masters vdm ON vd.id = vdm.vaccination_detail_id
                LEFT JOIN vaccination_master vm ON vdm.vaccination_master_id = vm.id
                WHERE vd.visit_id = @VisitId;";

            using var connection = _dbContext.GetConnection();
            var result = await connection.QueryAsync<VaccinationDetail, VaccinationMaster, VaccinationDetail>(
                sql,
                (detail, master) =>
                {
                    if (master != null)
                    {
                        detail.VaccinationMasters.Add(master);
                    }
                    return detail;
                },
                new { VisitId = visitId },
                splitOn: "Id"
            );

            return result.GroupBy(d => d.Id).Select(g =>
            {
                var detail = g.First();
                detail.VaccinationMasters = g.Select(d => d.VaccinationMasters.FirstOrDefault())
                    .Where(m => m != null)
                    .ToList();
                return detail;
            });
        }

        public async Task<VaccinationDetail> UpdateAsync(VaccinationDetail detail)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Update main record
                const string sql = @"
                    UPDATE vaccination_details 
                    SET notes = @Notes,
                        is_completed = @IsCompleted,
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING *;";

                var updated = await connection.QuerySingleAsync<VaccinationDetail>(sql, detail, transaction);

                // Fetch existing mappings and their vaccination_json
                var existingMappings = (await connection.QueryAsync<(Guid VaccinationMasterId, string? VaccinationJson)>(
                    "SELECT vaccination_master_id, vaccination_json FROM vaccination_detail_masters WHERE vaccination_detail_id = @Id;",
                    new { detail.Id }, transaction
                )).ToDictionary(x => x.VaccinationMasterId, x => x.VaccinationJson);

                // Remove all existing mappings
                await connection.ExecuteAsync(
                    "DELETE FROM vaccination_detail_masters WHERE vaccination_detail_id = @Id;",
                    new { detail.Id },
                    transaction
                );

                // Insert new mappings if any, preserving vaccination_json if present
                if (detail.VaccinationMasters?.Any() == true)
                {
                    const string mappingSql = @"
                        INSERT INTO vaccination_detail_masters (vaccination_detail_id, vaccination_master_id, vaccination_json)
                        VALUES (@VaccinationDetailId, @VaccinationMasterId, @VaccinationJson);";

                    foreach (var master in detail.VaccinationMasters)
                    {
                        existingMappings.TryGetValue(master.Id, out var vaccinationJson);
                        await connection.ExecuteAsync(mappingSql, new
                        {
                            VaccinationDetailId = updated.Id,
                            VaccinationMasterId = master.Id,
                            VaccinationJson = vaccinationJson // will be null for new pairs
                        }, transaction);
                    }
                }

                transaction.Commit();
                return await GetByIdAsync(updated.Id) ?? updated;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM vaccination_details WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            var affected = await connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }

        public async Task<bool> UpdateVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId, string vaccinationJson)
        {
            try
            {
                const string sql = @"UPDATE vaccination_detail_masters SET vaccination_json = @VaccinationJson WHERE vaccination_detail_id = @VaccinationDetailId AND vaccination_master_id = @VaccinationMasterId;";
                using var connection = _dbContext.GetConnection();
                var affected = await connection.ExecuteAsync(sql, new { VaccinationDetailId = vaccinationDetailId, VaccinationMasterId = vaccinationMasterId, VaccinationJson = vaccinationJson });
                return affected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vaccination_json for detail {VaccinationDetailId} and master {VaccinationMasterId}", vaccinationDetailId, vaccinationMasterId);
                return false;
            }
        }

        public async Task<string?> GetVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId)
        {
            const string sql = @"SELECT vaccination_json FROM vaccination_detail_masters WHERE vaccination_detail_id = @VaccinationDetailId AND vaccination_master_id = @VaccinationMasterId;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<string>(sql, new { VaccinationDetailId = vaccinationDetailId, VaccinationMasterId = vaccinationMasterId });
        }
    }
} 