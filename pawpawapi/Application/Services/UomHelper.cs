using System;

namespace Application.Services
{
    public static class UomHelper
    {
        public static class UomTypes
        {
            public const string Each = "EA";
            public const string Strip = "STRIP";
            public const string Bottle = "BOTTLE";
            public const string Box = "BOX";
            public const string Milliliter = "ML";
            public const string Liter = "L";
            public const string Gram = "G";
            public const string Kilogram = "KG";
        }

        /// <summary>
        /// Converts quantity from purchase UOM to EA (Each) units for inventory tracking
        /// </summary>
        public static decimal ConvertToEa(int quantity, string uom, int? unitsPerPackage)
        {
            if (string.IsNullOrEmpty(uom) || uom.ToUpper() == UomTypes.Each)
                return quantity;

            if (!unitsPerPackage.HasValue || unitsPerPackage.Value <= 0)
                throw new ArgumentException($"Units per package is required for UOM: {uom}");

            return quantity * unitsPerPackage.Value;
        }

        /// <summary>
        /// Converts quantity from EA units to display UOM
        /// </summary>
        public static decimal ConvertFromEa(decimal eaQuantity, string uom, int? unitsPerPackage)
        {
            if (string.IsNullOrEmpty(uom) || uom.ToUpper() == UomTypes.Each)
                return eaQuantity;

            if (!unitsPerPackage.HasValue || unitsPerPackage.Value <= 0)
                throw new ArgumentException($"Units per package is required for UOM: {uom}");

            return eaQuantity / unitsPerPackage.Value;
        }

        /// <summary>
        /// Validates UOM and units per package combination
        /// </summary>
        public static bool IsValidUomCombination(string uom, int? unitsPerPackage)
        {
            if (string.IsNullOrEmpty(uom))
                return true;

            if (uom.ToUpper() == UomTypes.Each)
                return true;

            return unitsPerPackage.HasValue && unitsPerPackage.Value > 0;
        }

        /// <summary>
        /// Gets the display text for UOM
        /// </summary>
        public static string GetUomDisplayText(string uom)
        {
            return uom?.ToUpper() switch
            {
                UomTypes.Each => "Each",
                UomTypes.Strip => "Strip",
                UomTypes.Bottle => "Bottle",
                UomTypes.Box => "Box",
                UomTypes.Milliliter => "mL",
                UomTypes.Liter => "L",
                UomTypes.Gram => "g",
                UomTypes.Kilogram => "kg",
                _ => uom ?? "EA"
            };
        }
    }
} 