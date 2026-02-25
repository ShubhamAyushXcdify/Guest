using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Dapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class EmergencyVisitRepository : IEmergencyVisitRepository
    {
        private readonly DapperDbContext _context;
        private readonly ILogger<EmergencyVisitRepository> _logger;

        public EmergencyVisitRepository(DapperDbContext context, ILogger<EmergencyVisitRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<EmergencyTriage?> GetByIdAsync(Guid id)
        {
            try
            {
                const string sql = @"
                    SELECT
                        id AS Id, arrival_time AS ArrivalTime, triage_nurse_doctor AS TriageNurseDoctor,
                        triage_category AS TriageCategory, pain_score AS PainScore, allergies AS Allergies,
                        immediate_intervention_required AS ImmediateInterventionRequired,
                        reason_for_emergency AS ReasonForEmergency, triage_level AS TriageLevel,
                        presenting_complaint AS PresentingComplaint, initial_notes AS InitialNotes,
                        is_complete AS IsComplete, created_at AS CreatedAt, updated_at AS UpdatedAt,
                        visit_id AS VisitId
                    FROM emergency_triage
                    WHERE id = @Id";

                using var conn = await _context.CreateConnectionAsync();
                return await conn.QueryFirstOrDefaultAsync<EmergencyTriage>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for emergency triage {Id}", id);
                throw new InvalidOperationException($"Failed to retrieve emergency triage with id {id}.", ex);
            }
        }

        public async Task<IEnumerable<EmergencyTriage>> GetAllAsync()
        {
            try
            {
                const string sql = @"
                    SELECT
                        id AS Id, arrival_time AS ArrivalTime, triage_nurse_doctor AS TriageNurseDoctor,
                        triage_category AS TriageCategory, pain_score AS PainScore, allergies AS Allergies,
                        immediate_intervention_required AS ImmediateInterventionRequired,
                        reason_for_emergency AS ReasonForEmergency, triage_level AS TriageLevel,
                        presenting_complaint AS PresentingComplaint, initial_notes AS InitialNotes,
                        is_complete AS IsComplete, created_at AS CreatedAt, updated_at AS UpdatedAt,
                        visit_id AS VisitId
                    FROM emergency_triage
                    ORDER BY arrival_time DESC";

                using var conn = await _context.CreateConnectionAsync();
                return await conn.QueryAsync<EmergencyTriage>(sql);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for emergency triages");
                throw new InvalidOperationException("Failed to retrieve emergency triages.", ex);
            }
        }

        public async Task<IEnumerable<EmergencyTriage>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                const string sql = @"
                    SELECT
                        id AS Id, arrival_time AS ArrivalTime, triage_nurse_doctor AS TriageNurseDoctor,
                        triage_category AS TriageCategory, pain_score AS PainScore, allergies AS Allergies,
                        immediate_intervention_required AS ImmediateInterventionRequired,
                        reason_for_emergency AS ReasonForEmergency, triage_level AS TriageLevel,
                        presenting_complaint AS PresentingComplaint, initial_notes AS InitialNotes,
                        is_complete AS IsComplete, created_at AS CreatedAt, updated_at AS UpdatedAt,
                        visit_id AS VisitId
                    FROM emergency_triage
                    WHERE visit_id = @VisitId
                    ORDER BY arrival_time DESC";

                using var conn = await _context.CreateConnectionAsync();
                return await conn.QueryAsync<EmergencyTriage>(sql, new { VisitId = visitId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visitId {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to retrieve emergency triages for visit {visitId}.", ex);
            }
        }

        public async Task AddAsync(EmergencyTriage triage)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                const string sql = @"
                    INSERT INTO emergency_triage (
                        id, arrival_time, triage_nurse_doctor, triage_category, pain_score, allergies,
                        immediate_intervention_required, reason_for_emergency, triage_level,
                        presenting_complaint, initial_notes, is_complete, created_at, updated_at, visit_id
                    ) VALUES (
                        @Id, @ArrivalTime, @TriageNurseDoctor, @TriageCategory, @PainScore, @Allergies,
                        @ImmediateInterventionRequired, @ReasonForEmergency, @TriageLevel,
                        @PresentingComplaint, @InitialNotes, @IsComplete, @CreatedAt, @UpdatedAt, @VisitId
                    )";

                var parameters = new
                {
                    triage.Id,
                    triage.ArrivalTime,
                    triage.TriageNurseDoctor,
                    triage.TriageCategory,
                    triage.PainScore,
                    triage.Allergies,
                    triage.ImmediateInterventionRequired,
                    triage.ReasonForEmergency,
                    triage.TriageLevel,
                    triage.PresentingComplaint,
                    triage.InitialNotes,
                    triage.IsComplete,
                    triage.CreatedAt,
                    triage.UpdatedAt,
                    triage.VisitId
                };

                await conn.ExecuteAsync(sql, parameters, transaction);
                transaction.Commit();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync for emergency triage");
                throw new InvalidOperationException("Failed to create emergency triage.", ex);
            }
        }

        public async Task UpdateAsync(EmergencyTriage triage)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                const string sql = @"
                    UPDATE emergency_triage SET
                        arrival_time = @ArrivalTime,
                        triage_nurse_doctor = @TriageNurseDoctor,
                        triage_category = @TriageCategory,
                        pain_score = @PainScore,
                        allergies = @Allergies,
                        immediate_intervention_required = @ImmediateInterventionRequired,
                        reason_for_emergency = @ReasonForEmergency,
                        triage_level = @TriageLevel,
                        presenting_complaint = @PresentingComplaint,
                        initial_notes = @InitialNotes,
                        is_complete = @IsComplete,
                        updated_at = @UpdatedAt,
                        visit_id = @VisitId
                    WHERE id = @Id";

                var parameters = new
                {
                    triage.Id,
                    triage.ArrivalTime,
                    triage.TriageNurseDoctor,
                    triage.TriageCategory,
                    triage.PainScore,
                    triage.Allergies,
                    triage.ImmediateInterventionRequired,
                    triage.ReasonForEmergency,
                    triage.TriageLevel,
                    triage.PresentingComplaint,
                    triage.InitialNotes,
                    triage.IsComplete,
                    triage.UpdatedAt,
                    triage.VisitId
                };

                var rowsAffected = await conn.ExecuteAsync(sql, parameters, transaction);
                if (rowsAffected == 0)
                    throw new InvalidOperationException($"Emergency triage with id {triage.Id} not found for update.");

                transaction.Commit();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for emergency triage {Id}", triage.Id);
                throw new InvalidOperationException($"Failed to update emergency triage with id {triage.Id}.", ex);
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                const string sql = "DELETE FROM emergency_triage WHERE id = @Id";
                var rowsAffected = await conn.ExecuteAsync(sql, new { Id = id }, transaction);

                if (rowsAffected == 0)
                    throw new InvalidOperationException($"Emergency triage with id {id} not found for deletion.");

                transaction.Commit();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for emergency triage {Id}", id);
                throw new InvalidOperationException($"Failed to delete emergency triage with id {id}.", ex);
            }
        }
    }
} 