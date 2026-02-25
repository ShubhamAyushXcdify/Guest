using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Swagger
{
    /// <summary>
    /// Replaces multipart/form-data schema with an explicit inline schema that includes a "file" property (type: binary)
    /// so Swagger UI reliably shows a file upload control alongside the form fields.
    /// </summary>
    public class CompanyFileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var hasFileParameter = context.ApiDescription.ActionDescriptor.Parameters
                .Any(p => p.ParameterType == typeof(IFormFile));

            if (!hasFileParameter)
                return;

            operation.RequestBody ??= new OpenApiRequestBody();

            // Replace multipart content with an explicit schema so Swagger UI shows file picker + form fields.
            // Using inline properties (no $ref/allOf) ensures Swagger UI renders file input correctly.
            var multipartSchema = new OpenApiSchema
            {
                Type = "object",
                Properties = new Dictionary<string, OpenApiSchema>
                {
                    ["name"] = new OpenApiSchema { Type = "string", Description = "Company name" },
                    ["description"] = new OpenApiSchema { Type = "string", Description = "Company description" },
                    ["logoUrl"] = new OpenApiSchema { Type = "string", Description = "Logo URL (or leave empty and use file upload)" },
                    ["registrationNumber"] = new OpenApiSchema { Type = "string", Description = "Registration number" },
                    ["email"] = new OpenApiSchema { Type = "string", Format = "email", Description = "Email" },
                    ["phone"] = new OpenApiSchema { Type = "string", Description = "Phone" },
                    ["domainName"] = new OpenApiSchema { Type = "string", Description = "Domain name" },
                    ["address"] = new OpenApiSchema { Type = "string", Description = "Address as JSON, e.g. {\"street\":\"\",\"city\":\"\",\"state\":\"\",\"postalCode\":\"\",\"country\":\"\"}" },
                    ["privacyPolicy"] = new OpenApiSchema { Type = "string", Description = "Privacy policy" },
                    ["termsOfUse"] = new OpenApiSchema { Type = "string", Description = "Terms of use" },
                    ["status"] = new OpenApiSchema { Type = "string", Description = "Status (e.g. active)" },
                    ["file"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary",
                        Description = "Optional file upload. Stored under FileUpload:UploadPath/uploads; path saved in LogoUrl."
                    }
                }
            };

            var multipartContent = new OpenApiMediaType { Schema = multipartSchema };
            operation.RequestBody.Content["multipart/form-data"] = multipartContent;
        }
    }
}
