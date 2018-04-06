using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PlaceSearchAPI.Models
{
    public class FavoritePlaceContext : DbContext
    {
        public FavoritePlaceContext(DbContextOptions<FavoritePlaceContext> options)
           : base(options)
        {
        }

        public DbSet<FavoritePlace> FavoritePlaces { get; set; }
    }
}
