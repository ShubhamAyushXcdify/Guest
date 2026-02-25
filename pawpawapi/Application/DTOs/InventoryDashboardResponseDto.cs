public class InventoryDashboardResponseDto
{
    public int TotalItems { get; set; }
    public int LowStockItemsCount { get; set; }
    public int ExpiringSoonItems { get; set; }
    public int PendingPurchaseOrders { get; set; }
    public List<LowStockItemDto> LowStockItems { get; set; } = new();
    public int NumberOfMedicalSupplies { get; set; }
    public int NumberOfAntibiotics { get; set; }
    public int NumberOfPainManagement { get; set; }
    public int NumberOfVaccines { get; set; }
    public int NumberOfSupplements { get; set; }
    public int NumberOfEquipment { get; set; }
    public int NumberOfFood { get; set; }
    public int NumberOfOther { get; set; }
}

public class LowStockItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; }
    public int Threshold { get; set; }
    public int CurrentItemUnits { get; set; }
}

public class ProductCategory
{
    public string Name { get; set; }
    public int Count { get; set; }
}
