﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PlaceSearchAPI.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PlaceSearchAPI.Controllers
{
    [Route("api/[controller]")]
    public class FavoritePlaceController : Controller
    {
        private readonly FavoritePlaceContext _context;

        public FavoritePlaceController(FavoritePlaceContext context)
        {
            _context = context;
        }

        // GET api/favoriteplace
        [HttpGet(Name = "GetAll")]
        public IActionResult GetAll()
        {
            var places = _context.FavoritePlaces.ToList<FavoritePlace>();
            return new ObjectResult(places);
        }

        // GET api/favoriteplace/{id}
        [HttpGet("{id}", Name = "Get")]
        public IActionResult GetById(long id)
        {   
            var place = _context.FavoritePlaces.SingleOrDefault(t => t.id == id);
            if (place == null)
            {
                return NotFound();
            }
            return new ObjectResult(place);
        }

        // POST api/favoriteplace
        [HttpPost]
        public IActionResult Create([FromForm] FavoritePlace place)
        {
            if (place == null)
            {
                return BadRequest();
            }

            _context.FavoritePlaces.Add(place);
            _context.SaveChanges();

            return CreatedAtRoute("Get", new { id = place.id }, place);

        }

        // POST api/favoriteplace/{id}>
        [HttpPut("{id}")]
        public IActionResult Update(long id, [FromForm] FavoritePlace place)
        {
            if (place == null || place.id != id)
            {
                return BadRequest();
            }

            var newPlace = _context.FavoritePlaces.FirstOrDefault(t => t.id == id);

            if (newPlace == null)
            {
                return NotFound();
            }

            newPlace.lat = place.lat;
            newPlace.lng = place.lng;
            newPlace.name = place.name;
            newPlace.address = place.address;
            newPlace.icon = place.icon;

            _context.FavoritePlaces.Update(newPlace);
            _context.SaveChanges();
            return new NoContentResult();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(long id)
        {
            var place = _context.FavoritePlaces.FirstOrDefault(t => t.id == id);
            if (place == null)
            {
                return NotFound();
            }

            _context.FavoritePlaces.Remove(place);
            _context.SaveChanges();
            return new NoContentResult();
        }
    }
}
