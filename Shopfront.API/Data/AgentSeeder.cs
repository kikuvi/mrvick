using Microsoft.EntityFrameworkCore;
using Shopfront.API.Models;

namespace Shopfront.API.Data;

public static class AgentSeeder
{
    public static async Task SeedAsync(ShopfrontDbContext db)
    {
        if (await db.Agents.AnyAsync()) return;

        var agents = new List<Agent>
        {
            new() { Bureau = "NYERI",                  PhysicalLocation = "Sun Guest House & Hotel, 1st flr, Opp Central Hotel, Kanisa Road", Staff = "Mr. John Muguri",          Contact = "0780962620/0729458868",   TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "MOMBASA/Likoni",          PhysicalLocation = "Kilindini Plaza, Moi Avenue, 2nd floor",                            Staff = "Mr. Nesphory Kitatu",       Contact = "720809741",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "MERU",                    PhysicalLocation = "Solco Investments, Moi Avenue, 2nd floor",                          Staff = "Mr. Joshua Kwanda",         Contact = "720900257",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Embu",                    PhysicalLocation = "KCB building, 1st floor",                                           Staff = "Mr. Eric Njeru",            Contact = "726406131",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Machakos",                PhysicalLocation = "Next to CBM Bank, Kitaga, ground floor B3",                         Staff = "Ms. Margdaline Mbevo",      Contact = "790317515",               TeamLeader = "Mr. Patrick Kimani", TeamLeaderContact = "728668182", Company = "Standard" },
            new() { Bureau = "Voi",                     PhysicalLocation = "Voi town; next to KCB and opp bus stn",                             Staff = "Mr. Vincent Omwera",        Contact = "714921891",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "Ukunda",                  PhysicalLocation = "Ukunda near total station",                                         Staff = "Mr. Jotham Odere",          Contact = "0704912405/0752144097",   TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "Kilifi",                  PhysicalLocation = "Alaagaf shade opposite NIC Bank",                                   Staff = "Mr. Jonathan Mark Sikaro",  Contact = "710327690",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "Wote",                    PhysicalLocation = "Next to post office, CBD",                                          Staff = "Mr. Isaac Musyoki",         Contact = "715488604",               TeamLeader = "Mr. Patrick Kimani", TeamLeaderContact = "728668182", Company = "Standard" },
            new() { Bureau = "Changamwe",               PhysicalLocation = "Changamwe stage, next to fly over",                                 Staff = "Mr. Michael Okotoi",        Contact = "717700982",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "Nanyuki",                 PhysicalLocation = "Kishan towers opp. Standard chartered",                             Staff = "Mr. John Maina",            Contact = "729024102",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Kerugoya",                PhysicalLocation = "At Total petro station",                                            Staff = "Mr. Dickson Gichukia",      Contact = "791858191",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Karatina",                PhysicalLocation = "At express hotel next to muthokinju",                               Staff = "Mr. Robert Kihu",           Contact = "722126775",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Muranga",                 PhysicalLocation = "Next KCB bank",                                                     Staff = "Mr. Elvis Luvavo",          Contact = "716149702",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Chuka",                   PhysicalLocation = "Next to Mutegi Murango house",                                      Staff = "Ms. Lucy Kaaree",           Contact = "721721321",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Kitui",                   PhysicalLocation = "Opp main stage Kitui",                                              Staff = "Mr. Paul Kilenga",          Contact = "727510236",               TeamLeader = "Mr. Patrick Kimani", TeamLeaderContact = "728668182", Company = "Standard" },
            new() { Bureau = "Malindi",                 PhysicalLocation = "Opp Barclays bank, next to poster",                                 Staff = "Mr. Mwalimu Nyule",         Contact = "708319571",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "Nyali/Bamburi/Kisauni",   PhysicalLocation = "Leisure Mahutini, along new Malindi road",                          Staff = "Mr. Lucas Ogola",           Contact = "729725198",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
            new() { Bureau = "Maua",                    PhysicalLocation = "At Solution SACCO",                                                 Staff = "Ms. Truphena Mukiria",      Contact = "714332130",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Mwingi",                  PhysicalLocation = "Next to main stage",                                                Staff = "Mr. James Kivunzi",         Contact = "727861878",               TeamLeader = "Mr. Patrick Kimani", TeamLeaderContact = "728668182", Company = "Standard" },
            new() { Bureau = "Nkubu",                   PhysicalLocation = "Nkubu main stage",                                                  Staff = "Mr. Edward Mbae",           Contact = "714723737",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Isiolo",                  PhysicalLocation = "KCB Bank Isiolo",                                                   Staff = "Mr. Ephod Munoru",          Contact = "738848889",               TeamLeader = "Mr. Brian Litala",   TeamLeaderContact = "701568901", Company = "Standard" },
            new() { Bureau = "Garissa",                 PhysicalLocation = "Main Stage/CBD",                                                    Staff = "Mr. Solomon Owuor",         Contact = "113768419",               TeamLeader = "Mr. Patrick Kimani", TeamLeaderContact = "728668182", Company = "Standard" },
            new() { Bureau = "Watamu",                  PhysicalLocation = "NO PHYSICAL OFFICE",                                                Staff = "Mr. John Mwangi Mkubwa",    Contact = "711403775",               TeamLeader = "Mr. Ken Munene",     TeamLeaderContact = "725902185", Company = "Standard" },
        };

        foreach (var agent in agents)
            agent.Id = Guid.NewGuid();

        db.Agents.AddRange(agents);
        await db.SaveChangesAsync();

        Console.WriteLine($"Seeded {agents.Count} agents.");
    }
}
