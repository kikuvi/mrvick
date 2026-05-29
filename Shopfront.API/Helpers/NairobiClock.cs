namespace Shopfront.API.Helpers;

public static class NairobiClock
{
    private static readonly TimeZoneInfo Tz = FindTz();

    private static TimeZoneInfo FindTz()
    {
        foreach (var id in new[] { "E. Africa Standard Time", "Africa/Nairobi" })
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch { }
        return TimeZoneInfo.Utc;
    }

    public static DateTime Now =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Tz);

    public static DateOnly Today => DateOnly.FromDateTime(Now);
}
