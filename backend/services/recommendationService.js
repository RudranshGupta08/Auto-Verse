import Car from "../models/car.js";

export async function recommendCars(filters = {}) {

  const query = {};

  if (filters.bodyType) {
    query.bodyType =
      new RegExp(filters.bodyType, "i");
  }

  if (filters.maxPrice) {
    query.minPrice = {
      $lte: filters.maxPrice
    };
  }

  if (filters.fuelType) {
    query.fuelType = {
      $in: [filters.fuelType]
    };
  }

  return await Car.find(query)
    .sort({ rating: -1 })
    .limit(5);
}