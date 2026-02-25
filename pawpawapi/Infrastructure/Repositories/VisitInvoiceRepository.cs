using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class VisitInvoiceRepository : IVisitInvoiceRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VisitInvoiceRepository> _logger;

        public VisitInvoiceRepository(DapperDbContext dbContext, ILogger<VisitInvoiceRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<VisitInvoice?> GetByIdAsync(Guid id)
        {
            const string sql = @"SELECT * FROM visit_invoices WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<VisitInvoice>(sql, new { Id = id });
        }

        public async Task<VisitInvoice?> GetByVisitIdAsync(Guid visitId, Guid? clinicId = null)
        {
            var sql = @"SELECT * FROM visit_invoices WHERE visit_id = @VisitId";
            if (clinicId.HasValue)
            {
                sql += " AND clinic_id = @ClinicId";
            }
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<VisitInvoice>(sql, new { VisitId = visitId, ClinicId = clinicId });
        }

        public async Task<IEnumerable<VisitInvoice>> GetAllAsync(int pageNumber, int pageSize, Guid? visitId = null, Guid? clinicId = null)
        {
            var conditions = new List<string>();
            if (visitId.HasValue)
            {
                conditions.Add("visit_id = @VisitId");
            }
            if (clinicId.HasValue)
            {
                conditions.Add("clinic_id = @ClinicId");
            }
            var where = conditions.Count > 0 ? $"WHERE {string.Join(" AND ", conditions)}" : string.Empty;
            var sql = $@"SELECT * FROM visit_invoices {where} ORDER BY created_at DESC OFFSET @Offset LIMIT @Limit";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<VisitInvoice>(sql, new { VisitId = visitId, ClinicId = clinicId, Offset = (pageNumber - 1) * pageSize, Limit = pageSize });
        }

        public async Task<IEnumerable<VisitInvoice>> GetByFiltersAsync(int pageNumber, int pageSize, Guid? patientId = null, string? status = null, string? paymentMethod = null, DateTimeOffset? createdAtFrom = null, DateTimeOffset? createdAtTo = null, Guid? clinicId = null)
        {
            var conditions = new List<string>();
            if (patientId.HasValue)
            {
                conditions.Add("patient_id = @PatientId");
            }
            if (!string.IsNullOrWhiteSpace(status))
            {
                conditions.Add("status = @Status");
            }
            if (!string.IsNullOrWhiteSpace(paymentMethod))
            {
                conditions.Add("payment_method = @PaymentMethod");
            }
            if (createdAtFrom.HasValue)
            {
                conditions.Add("created_at >= @CreatedAtFrom");
            }
            if (createdAtTo.HasValue)
            {
                conditions.Add("created_at <= @CreatedAtTo");
            }
            if (clinicId.HasValue)
            {
                conditions.Add("clinic_id = @ClinicId");
            }
            var where = conditions.Count > 0 ? $"WHERE {string.Join(" AND ", conditions)}" : string.Empty;
            var sql = $@"SELECT * FROM visit_invoices {where} ORDER BY created_at DESC OFFSET @Offset LIMIT @Limit";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<VisitInvoice>(sql, new { PatientId = patientId, Status = status, PaymentMethod = paymentMethod, CreatedAtFrom = createdAtFrom, CreatedAtTo = createdAtTo, ClinicId = clinicId, Offset = (pageNumber - 1) * pageSize, Limit = pageSize });
        }

        public async Task<Guid> CreateAsync(VisitInvoice visitInvoice)
        {
            const string sql = @"
                INSERT INTO visit_invoices (
                    id, visit_id, client_id, patient_id, invoice_number, items_total, consultation_fee,
                    consultation_discount_percentage, consultation_discount, consultation_fee_after_discount,
                    overall_product_discount, overall_product_discount_percentage, notes, total, status, payment_method, clinic_id, created_at, updated_at
                ) VALUES (
                    @Id, @VisitId, @ClientId, @PatientId, @InvoiceNumber, @ItemsTotal, @ConsultationFee,
                    @ConsultationDiscountPercentage, @ConsultationDiscount, @ConsultationFeeAfterDiscount,
                    @OverallProductDiscount, @OverallProductDiscountPercentage, @Notes, @Total, @Status, @PaymentMethod, @ClinicId, NOW(), NOW()
                );";
            using var connection = _dbContext.GetConnection();
            var id = visitInvoice.Id == Guid.Empty ? Guid.NewGuid() : visitInvoice.Id;
            visitInvoice.Id = id;
            await connection.ExecuteAsync(sql, visitInvoice);
            return id;
        }

        public async Task<bool> UpdateAsync(VisitInvoice visitInvoice)
        {
            const string sql = @"
                UPDATE visit_invoices SET 
                    invoice_number = @InvoiceNumber,
                    items_total = @ItemsTotal,
                    consultation_fee = @ConsultationFee,
                    consultation_discount_percentage = @ConsultationDiscountPercentage,
                    consultation_discount = @ConsultationDiscount,
                    consultation_fee_after_discount = @ConsultationFeeAfterDiscount,
                    overall_product_discount = @OverallProductDiscount,
                    overall_product_discount_percentage = @OverallProductDiscountPercentage,
                    notes = @Notes,
                    total = @Total,
                    status = @Status,
                    payment_method = @PaymentMethod,
                    clinic_id = @ClinicId,
                    updated_at = NOW()
                WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            var rows = await connection.ExecuteAsync(sql, visitInvoice);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            const string sql = @"DELETE FROM visit_invoices WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }

        public async Task<IEnumerable<VisitInvoiceProduct>> GetProductsByInvoiceIdAsync(Guid visitInvoiceId)
        {
            const string sql = @"SELECT * FROM visit_invoice_products WHERE visit_invoice_id = @VisitInvoiceId ORDER BY created_at";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<VisitInvoiceProduct>(sql, new { VisitInvoiceId = visitInvoiceId });
        }

        public async Task AddProductsAsync(Guid visitInvoiceId, IEnumerable<VisitInvoiceProduct> products)
        {
            if (products == null || !products.Any()) return;
            const string sql = @"INSERT INTO visit_invoice_products (id, visit_invoice_id, purchase_order_receiving_history_id, quantity, is_given, discount, discount_percentage, created_at, updated_at)
VALUES (@Id, @VisitInvoiceId, @PurchaseOrderReceivingHistoryId, @Quantity, @IsGiven, @Discount, @DiscountPercentage, NOW(), NOW());";
            using var connection = _dbContext.GetConnection();
            foreach (var p in products)
            {
                var id = p.Id == Guid.Empty ? Guid.NewGuid() : p.Id;
                p.Id = id;
                p.VisitInvoiceId = visitInvoiceId;
                await connection.ExecuteAsync(sql, new
                {
                    p.Id,
                    VisitInvoiceId = visitInvoiceId,
                    p.PurchaseOrderReceivingHistoryId,
                    p.Quantity,
                    IsGiven = p.IsGiven,
                    p.Discount,
                    p.DiscountPercentage
                });
            }
        }

        public async Task DeleteProductsByInvoiceIdAsync(Guid visitInvoiceId)
        {
            const string sql = @"DELETE FROM visit_invoice_products WHERE visit_invoice_id = @VisitInvoiceId";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { VisitInvoiceId = visitInvoiceId });
        }
    }
}
