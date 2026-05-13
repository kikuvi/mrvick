using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private static readonly string[] AllowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    private readonly IWebHostEnvironment _env;

    public UploadsController(IWebHostEnvironment env) => _env = env;

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        if (!AllowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Only JPEG, PNG, WebP and GIF images are allowed." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "File exceeds the 10 MB limit." });

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var url = $"/uploads/{fileName}";
        return Ok(new { url });
    }
}
