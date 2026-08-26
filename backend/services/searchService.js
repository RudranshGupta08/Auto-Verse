import Car from "../models/car.js";

export async function searchCars(filters = {}) {
  return await Car.find(filters).limit(10);
}

export async function getCarDetails(name) {

  return await Car.findOne({
    $or: [
      { model: new RegExp(name, "i") },
      { brand: new RegExp(name, "i") }
    ]
  });
}