import Car from "../models/car.js";

export async function compareCars(
  firstCar,
  secondCar
) {

  const car1 = await Car.findOne({
    model: new RegExp(firstCar, "i")
  });

  const car2 = await Car.findOne({
    model: new RegExp(secondCar, "i")
  });

  return {
    car1,
    car2
  };
}