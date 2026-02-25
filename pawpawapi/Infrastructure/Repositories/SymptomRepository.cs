using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class SymptomRepository : ISymptomRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<SymptomRepository> _logger;

        public SymptomRepository(DapperDbContext dbContext, ILogger<SymptomRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Symptom> CreateAsync(Symptom symptom)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    symptom.Id = Guid.NewGuid();
                    symptom.CreatedAt = DateTimeOffset.UtcNow;
                    symptom.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        symptom.Id,
                        symptom.Name,
                        symptom.Notes,
                        symptom.IsComman,
                        symptom.Breed,
                        symptom.CreatedAt,
                        symptom.UpdatedAt
                    };

                    var query = @"
                                INSERT INTO symptoms 
                                (id, name, notes, iscomman, breed, created_at, updated_at) 
                                VALUES 
                                (@Id, @Name, @Notes, @IsComman, @Breed, @CreatedAt, @UpdatedAt) 
                                RETURNING 
                                    id AS Id,
                                    name AS Name,
                                    notes AS Notes,
                                    iscomman AS IsComman,
                                    breed AS Breed,
                                    created_at AS CreatedAt,
                                    updated_at AS UpdatedAt;";

                    var createdSymptom = await connection.QuerySingleAsync<Symptom>(query, parameters, transaction);
                    transaction.Commit();
                    return createdSymptom;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create symptom", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create symptom", ex);
            }
        }

        public async Task<IEnumerable<Symptom>> GetAllAsync()
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    iscomman AS IsComman,
    breed AS Breed,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM symptoms;";

                var symptoms = await connection.QueryAsync<Symptom>(query);
                return symptoms;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get symptoms", ex);
            }
        }

        public async Task<IEnumerable<Symptom>> GetByBreedAsync(string? breed)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    iscomman AS IsComman,
    breed AS Breed,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM symptoms
WHERE 
    @Breed IS NULL
    OR (breed = @Breed)
    OR (iscomman = true);";

                var symptoms = await connection.QueryAsync<Symptom>(query, new { Breed = breed });
                return symptoms;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByBreedAsync for breed {Breed}", breed);
                throw new InvalidOperationException($"Failed to get symptoms for breed {breed}", ex);
            }
        }

        public async Task<Symptom> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    iscomman AS IsComman,
    breed AS Breed,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM symptoms 
WHERE id = @Id;";

                var symptom = await connection.QuerySingleOrDefaultAsync<Symptom>(query, new { Id = id });
                return symptom;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for symptom {SymptomId}", id);
                throw new InvalidOperationException($"Failed to get symptom with id {id}", ex);
            }
        }

        public async Task<Symptom> UpdateAsync(Symptom symptom)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    symptom.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        symptom.Id,
                        symptom.Name,
                        symptom.Notes,
                        symptom.IsComman,
                        symptom.Breed,
                        symptom.UpdatedAt
                    };

                    var query = @"
UPDATE symptoms
SET 
    name = @Name,
    notes = @Notes,
    iscomman = @IsComman,
    breed = @Breed,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING 
    id AS Id,
    name AS Name,
    notes AS Notes,
    iscomman AS IsComman,
    breed AS Breed,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedSymptom = await connection.QuerySingleAsync<Symptom>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedSymptom;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for symptom {SymptomId}", symptom.Id);
                    throw new InvalidOperationException($"Failed to update symptom with id {symptom.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for symptom {SymptomId}", symptom.Id);
                throw new InvalidOperationException($"Failed to update symptom with id {symptom.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM symptoms WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for symptom {SymptomId}", id);
                throw new InvalidOperationException($"Failed to delete symptom with id {id}", ex);
            }
        }
    }
} 