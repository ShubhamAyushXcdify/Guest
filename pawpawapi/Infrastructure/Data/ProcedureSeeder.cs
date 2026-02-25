using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class ProcedureSeeder
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ProcedureSeeder> _logger;

        public ProcedureSeeder(DapperDbContext dbContext, ILogger<ProcedureSeeder> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var procedures = new List<(string Name, string Description, string Type, string ProcCode)>
            {
                // Preventive Care
                ("Flea/Tick Control", "Topical or oral preventives for ectoparasites", "Preventive Care", "PREFLE003"),
                ("Spaying/Neutering", "Surgical sterilization to prevent reproduction", "Preventive Care", "PRESPA004"),
                ("Dental Cleaning", "Scaling and polishing to prevent dental disease", "Preventive Care", "PREDEN005"),
                ("Microchipping", "Permanent identification tag implanted under the skin", "Preventive Care", "PREMIC006"),
                ("Nail Trimming", "Routine grooming for paw health and comfort", "Preventive Care", "PRENAI007"),
                ("Anal Gland Expression", "Manual release of anal glands to prevent impaction", "Preventive Care", "PREANA008"),
                // Diagnostic Procedures
                ("Blood Tests", "Includes CBC and biochemistry to screen for diseases", "Diagnostic", "DIABLO001"),
                ("Urinalysis", "Detects urinary tract infections, diabetes, kidney disease", "Diagnostic", "DIAURI002"),
                ("Fecal Exam", "Checks for intestinal parasites", "Diagnostic", "DIAFEC003"),
                ("X-rays (Radiographs)", "Imaging of bones, lungs, and abdominal organs", "Diagnostic", "DIAXRA004"),
                ("Ultrasound", "Non-invasive imaging of internal organs", "Diagnostic", "DIAULT005"),
                ("Allergy Testing", "Tests for environmental or food allergens", "Diagnostic", "DIAALL006"),
                ("Skin Scraping", "Used to detect mites or fungal infections", "Diagnostic", "DIASKI007"),
                ("Electrocardiogram (ECG/EKG)", "Measures electrical activity of the heart", "Diagnostic", "DIAELE008"),
                ("Blood Pressure Measurement", "Used to assess cardiovascular or kidney health", "Diagnostic", "DIABLO009"),
                ("Ophthalmic Exam", "Eye examination including pressure testing", "Diagnostic", "DIAOPH010"),
                ("Fine Needle Aspiration (FNA)", "Sampling of masses for cytological examination", "Diagnostic", "DIAFIN011"),
                // Surgical Procedures
                ("Spay (Ovariohysterectomy)", "Removal of ovaries and uterus", "Surgical Procedures", "SURSPA001"),
                ("Neuter (Castration)", "Removal of testicles", "Surgical Procedures", "SURNEU002"),
                ("Mass/Lump Removal", "Excision of benign or malignant growths", "Surgical Procedures", "SURMAS003"),
                ("Dental Extractions", "Removal of damaged or diseased teeth", "Surgical Procedures", "SURDEN004"),
                ("Wound Repair", "Suturing and treatment of cuts or injuries", "Surgical Procedures", "SURWOU005"),
                ("Orthopedic Surgery", "Fracture repair, ACL, hip dysplasia, and joint surgeries", "Surgical Procedures", "SURORT006"),
                ("Eye Surgery", "Procedures like entropion correction or cherry eye repair", "Surgical Procedures", "SUREYE007"),
                ("Bladder Stone Removal", "Surgical removal of uroliths via cystotomy", "Surgical Procedures", "SURBLA008"),
                ("Foreign Body Removal", "Extraction of ingested or embedded foreign objects", "Surgical Procedures", "SURFOR009"),
                ("Ear Surgery", "Including hematoma drainage or ear canal resection", "Surgical Procedures", "SUREAR010"),
                // Therapeutic and Chronic Care
                ("IV Fluid Therapy", "Hydration and electrolyte support", "Therapeutic and Chronic Care", "THEIVF001"),
                ("Medicated Baths", "Used to treat skin infections or allergies", "Therapeutic and Chronic Care", "THEMED002"),
                ("Laser Therapy", "Reduces pain and promotes healing", "Therapeutic and Chronic Care", "THELAS003"),
                ("Acupuncture/Physiotherapy", "Alternative therapy for mobility and pain", "Therapeutic and Chronic Care", "THEACU004"),
                ("Weight Management Plans", "Customized diet and activity plans", "Therapeutic and Chronic Care", "THEWEI005"),
                ("Diabetes Monitoring", "Insulin therapy and glucose testing", "Therapeutic and Chronic Care", "THEDIA006"),
                ("Arthritis Management", "Pain relief, supplements, and physical therapy", "Therapeutic and Chronic Care", "THEART007"),
                ("Chemotherapy", "Cancer treatment protocol", "Therapeutic and Chronic Care", "THECHE008"),
                ("Allergy Desensitization", "Allergy shots or oral therapy to reduce sensitivity", "Therapeutic and Chronic Care", "THEALL009"),
                // Travel and Legal
                ("Rabies Titer Test (RNATT)", "Required for travel to rabies-free countries", "Travel and Legal", "TRArab001"),
                ("Health Certificate Issuance", "Legal document for domestic or international travel", "Travel and Legal", "TRAHEA002"),
                ("Export Quarantine Procedures", "Pre-travel protocols for international shipping", "Travel and Legal", "TRAEXP003"),
                ("Breed Certification / DNA Testing", "Used for breed identification or genetic analysis", "Travel and Legal", "TRABRE004")
            };

            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                foreach (var (name, description, type, procCode) in procedures)
                {
                    // Check if procedure already exists
                    var exists = await connection.ExecuteScalarAsync<bool>(
                        "SELECT EXISTS (SELECT 1 FROM procedures WHERE name = @Name)", new { Name = name });
                    if (!exists)
                    {
                        var now = DateTimeOffset.UtcNow;
                        
                        await connection.ExecuteAsync(
                            @"INSERT INTO procedures (id, name, notes, type, proc_code, created_at, updated_at) VALUES (@Id, @Name, @Notes, @Type, @ProcCode, @CreatedAt, @UpdatedAt)",
                            new
                            {
                                Id = Guid.NewGuid(),
                                Name = name,
                                Notes = description,
                                Type = type,
                                ProcCode = procCode,
                                CreatedAt = now,
                                UpdatedAt = now
                            });
                    }
                }
                _logger.LogInformation("Procedure seeding completed.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during procedure seeding.");
                throw;
            }
        }
    }
} 