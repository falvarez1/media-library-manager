namespace backend.Models.Dto;

public class FolderTreeNodeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public List<FolderTreeNodeDto> Children { get; set; } = new List<FolderTreeNodeDto>();

    // Optional: Add media item count if needed for UI
    // public int MediaItemCount { get; set; }
}