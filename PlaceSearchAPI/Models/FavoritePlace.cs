using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PlaceSearchAPI.Models
{
    public class FavoritePlace
    {
        public long id { get; set; }
        public string lat { get; set; }
        public string lng { get; set; }
        public string name { get; set; }
        public string address { get; set; }
    }
}
