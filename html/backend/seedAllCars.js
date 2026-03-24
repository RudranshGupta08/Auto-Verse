import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "./models/car.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {

        console.log("🚀 Connected to DB");

        const cars = [

            
            // =========================
            // 🔷 TATA SUVs
            // =========================
            {
                brand: "Tata",
                model: "Punch",
                type: "SUV",
                priceRange: "₹6L - ₹10L",
                engineOptions: ["1.2L"],
                mileage: "20 kmpl",
                fuelType: ["Petrol", "CNG"],
                transmission: ["Manual", "AMT"],
                seatingCapacity: 5,
                images: ["punch/punch1.jpg"]
            },
            {
                brand: "Tata",
                model: "Nexon",
                type: "SUV",
                priceRange: "₹8L - ₹15L",
                engineOptions: ["1.2 Turbo", "1.5 Diesel"],
                mileage: "17-23 kmpl",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "AMT"],
                seatingCapacity: 5,
                images: ["nexon/nexon1.jpg"]
            },
            {
                brand: "Tata",
                model: "Nexon EV",
                type: "SUV",
                priceRange: "₹15L - ₹20L",
                engineOptions: ["Electric"],
                mileage: "325-465 km",
                fuelType: ["Electric"],
                transmission: ["Auto"],
                seatingCapacity: 5,
                images: ["nexonEV/nexonEV1.jpg"]
            },
            {
                brand: "Tata",
                model: "Harrier",
                type: "SUV",
                priceRange: "₹15L - ₹25L",
                engineOptions: ["2.0 Diesel"],
                mileage: "16 kmpl",
                fuelType: ["Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 5,
                images: ["harrier/harrier1.jpg"]
            },
            {
                brand: "Tata",
                model: "Safari",
                type: "SUV",
                priceRange: "₹16L - ₹26L",
                engineOptions: ["2.0 Diesel"],
                mileage: "16 kmpl",
                fuelType: ["Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 6,
                images: ["safari/safari1.jpg"]
            },
            {
                brand: "Tata",
                model: "Curvv",
                type: "SUV",
                priceRange: "₹10L - ₹19L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "18-23 kmpl",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "DCT"],
                seatingCapacity: 5,
                images: ["curvv/curvv1.jpg"]
            },

            // =========================
            // 🔷 HYUNDAI SUVs
            // =========================
            {
                brand: "Hyundai",
                model: "Exter",
                type: "SUV",
                priceRange: "₹6L - ₹10L",
                engineOptions: ["1.2L"],
                mileage: "19 kmpl",
                fuelType: ["Petrol", "CNG"],
                transmission: ["Manual", "AMT"],
                seatingCapacity: 5,
                images: ["exter/exter1.jpg"]
            },
            {
                brand: "Hyundai",
                model: "Venue",
                type: "SUV",
                priceRange: "₹8L - ₹13L",
                engineOptions: ["1.2", "1.0 Turbo"],
                mileage: "18-23 kmpl",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "DCT"],
                seatingCapacity: 5,
                images: ["venue/venue1.jpg"]
            },
            {
                brand: "Hyundai",
                model: "Creta",
                type: "SUV",
                priceRange: "₹11L - ₹20L",
                engineOptions: ["1.5 Petrol", "1.5 Diesel"],
                mileage: "17-21 kmpl",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "CVT"],
                seatingCapacity: 5,
                images: ["creta/creta1.jpg"]
            },
            {
                brand: "Hyundai",
                model: "Alcazar",
                type: "SUV",
                priceRange: "₹17L - ₹22L",
                engineOptions: ["1.5 Turbo", "Diesel"],
                mileage: "18 kmpl",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 6,
                images: ["alcazar/alcazar1.jpg"]
            },
            {
                brand: "Hyundai",
                model: "Tucson",
                type: "SUV",
                priceRange: "₹29L - ₹36L",
                engineOptions: ["2.0"],
                mileage: "18 kmpl",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Auto"],
                seatingCapacity: 5,
                images: ["tucson/tucson1.jpg"]
            },

            // =========================
            // 🔷 MAHINDRA SUVs
            // =========================
            {
                brand: "Mahindra",
                model: "Bolero",
                type: "SUV",
                priceRange: "₹9L - ₹11L",
                engineOptions: ["1.5 Diesel"],
                mileage: "16",
                fuelType: ["Diesel"],
                transmission: ["Manual"],
                seatingCapacity: 7,
                images: ["bolero/bolero1.jpg"]
            },
            {
                brand: "Mahindra",
                model: "Thar",
                type: "SUV",
                priceRange: "₹11L - ₹17L",
                engineOptions: ["2.0 Petrol", "2.2 Diesel"],
                mileage: "15",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 4,
                images: ["thar/thar1.jpg"]
            },
            {
                brand: "Mahindra",
                model: "Scorpio N",
                type: "SUV",
                priceRange: "₹13L - ₹24L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "16",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 7,
                images: ["scorpio/scorpio1.jpg"]
            },
            {
                brand: "Mahindra",
                model: "XUV300",
                type: "SUV",
                priceRange: "₹8L - ₹14L",
                engineOptions: ["Turbo", "Diesel"],
                mileage: "20",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "AMT"],
                seatingCapacity: 5,
                images: ["xuv300/xuv3001.jpg"]
            },
            {
                brand: "Mahindra",
                model: "XUV700",
                type: "SUV",
                priceRange: "₹14L - ₹26L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "17",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 7,
                images: ["xuv700/xuv7001.jpg"]
            },

            // =========================
            // 🔷 KIA SUVs
            // =========================
            {
                brand: "Kia",
                model: "Sonet",
                type: "SUV",
                priceRange: "₹8L - ₹14L",
                engineOptions: ["1.2", "Turbo"],
                mileage: "18-24",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "DCT"],
                seatingCapacity: 5,
                images: ["sonet/sonet1.jpg"]
            },
            {
                brand: "Kia",
                model: "Seltos",
                type: "SUV",
                priceRange: "₹11L - ₹20L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "17-20",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "CVT"],
                seatingCapacity: 5,
                images: ["seltos/seltos1.jpg"]
            },
            {
                brand: "Kia",
                model: "Carens",
                type: "SUV",
                priceRange: "₹10L - ₹18L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "16-20",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 6,
                images: ["carens/carens1.jpg"]
            },

            // =========================
            // 🔷 TOYOTA SUVs
            // =========================
            {
                brand: "Toyota",
                model: "Hyryder",
                type: "SUV",
                priceRange: "₹11L - ₹20L",
                engineOptions: ["Hybrid"],
                mileage: "27",
                fuelType: ["Petrol"],
                transmission: ["Manual", "eCVT"],
                seatingCapacity: 5,
                images: ["hyryder/hyryder1.jpg"]
            },
            {
                brand: "Toyota",
                model: "Fortuner",
                type: "SUV",
                priceRange: "₹33L - ₹50L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "10-14",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 7,
                images: ["fortuner/fortuner1.jpg"]
            },
            {
                brand: "Toyota",
                model: "Legender",
                type: "SUV",
                priceRange: "₹43L - ₹48L",
                engineOptions: ["Diesel"],
                mileage: "14",
                fuelType: ["Diesel"],
                transmission: ["Auto"],
                seatingCapacity: 7,
                images: ["legender/legender1.jpg"]
            },

            // =========================
            // 🔷 FORD SUVs
            // =========================
            {
                brand: "Ford",
                model: "EcoSport",
                type: "SUV",
                priceRange: "₹8L - ₹12L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "16-21",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 5,
                images: ["ecosport/ecosport1.jpg"]
            },
            {
                brand: "Ford",
                model: "Endeavour",
                type: "SUV",
                priceRange: "₹30L - ₹40L",
                engineOptions: ["Diesel"],
                mileage: "12",
                fuelType: ["Diesel"],
                transmission: ["Auto"],
                seatingCapacity: 7,
                images: ["endeavour/endeavour1.jpg"]
            },

            // =========================
            // 🔷 JEEP SUVs
            // =========================
            {
                brand: "Jeep",
                model: "Compass",
                type: "SUV",
                priceRange: "₹20L - ₹32L",
                engineOptions: ["Petrol", "Diesel"],
                mileage: "15",
                fuelType: ["Petrol", "Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 5,
                images: ["compass/compass1.jpg"]
            },
            {
                brand: "Jeep",
                model: "Meridian",
                type: "SUV",
                priceRange: "₹33L - ₹38L",
                engineOptions: ["Diesel"],
                mileage: "16",
                fuelType: ["Diesel"],
                transmission: ["Manual", "Auto"],
                seatingCapacity: 7,
                images: ["meridian/meridian1.jpg"]
            },
            {
                brand: "Jeep",
                model: "Wrangler",
                type: "SUV",
                priceRange: "₹60L - ₹65L",
                engineOptions: ["Petrol"],
                mileage: "11",
                fuelType: ["Petrol"],
                transmission: ["Auto"],
                seatingCapacity: 5,
                images: ["wrangler/wrangler1.jpg"]
            },
            {
                brand: "Jeep",
                model: "Grand Cherokee",
                type: "SUV",
                priceRange: "₹80L - ₹90L",
                engineOptions: ["Petrol"],
                mileage: "10",
                fuelType: ["Petrol"],
                transmission: ["Auto"],
                seatingCapacity: 5,
                images: ["grandcherokee/grandcherokee1.jpg"]
            },

            // =========================
            // 🔷 HONDA SUVs
            // =========================
            {
                brand: "Honda",
                model: "WR-V",
                type: "SUV",
                priceRange: "₹9L - ₹12L",
                engineOptions: ["Petrol"],
                mileage: "16",
                fuelType: ["Petrol"],
                transmission: ["Manual"],
                seatingCapacity: 5,
                images: ["wrv/wrv1.jpg"]
            },
            {
                brand: "Honda",
                model: "Elevate",
                type: "SUV",
                priceRange: "₹11L - ₹16L",
                engineOptions: ["Petrol"],
                mileage: "16",
                fuelType: ["Petrol"],
                transmission: ["Manual", "CVT"],
                seatingCapacity: 5,
                images: ["elevate/elevate1.jpg"]
            },
            {
                brand: "Honda",
                model: "CR-V",
                type: "SUV",
                priceRange: "₹28L - ₹32L",
                engineOptions: ["Petrol"],
                mileage: "14",
                fuelType: ["Petrol"],
                transmission: ["Auto"],
                seatingCapacity: 5,
                images: ["crv/crv1.jpg"]
            },

            // =========================
            // 🔶 MARUTI SUZUKI SEDANS
            // =========================

            // Dzire (NEW GEN)
            {
                brand: "Maruti Suzuki",
                model: "Dzire",
                type: "Sedan",
                priceRange: "₹6.8L - ₹10L",
                engineOptions: ["1.2L Petrol"],
                mileage: "22-24 kmpl",
                fuelType: ["Petrol", "CNG"],
                transmission: ["Manual", "AMT"],
                seatingCapacity: 5,
                images: ["dzire/dzire-1.jpg"]
            },

            // Dzire Tour (Commercial)
            {
                brand: "Maruti Suzuki",
                model: "Dzire Tour",
                type: "Sedan",
                priceRange: "₹6.5L - ₹7.5L",
                engineOptions: ["1.2L Petrol"],
                mileage: "23-25 kmpl",
                fuelType: ["Petrol", "CNG"],
                transmission: ["Manual"],
                seatingCapacity: 5,
                images: ["dzire-tour/dzire-tour-1.jpg"]
            },

            // Ciaz (Premium Sedan)
            {
                brand: "Maruti Suzuki",
                model: "Ciaz",
                type: "Sedan",
                priceRange: "₹9.4L - ₹12.5L",
                engineOptions: ["1.5L Petrol"],
                mileage: "20-21 kmpl",
                fuelType: ["Petrol"],
                transmission: ["Manual", "Automatic"],
                seatingCapacity: 5,
                images: ["ciaz/ciaz-1.jpg"]
            },

            // Ciaz Smart Hybrid
            {
                brand: "Maruti Suzuki",
                model: "Ciaz Smart Hybrid",
                type: "Sedan",
                priceRange: "₹10L - ₹12.5L",
                engineOptions: ["1.5L Petrol Hybrid"],
                mileage: "20-21 kmpl",
                fuelType: ["Petrol"],
                transmission: ["Manual", "Automatic"],
                seatingCapacity: 5,
                images: ["ciaz/ciaz-hybrid-1.jpg"]
            }
        ];

        for (const car of cars) {
            const exists = await Car.findOne({ model: car.model });

            if (!exists) {
                await Car.create(car);
                console.log(`✅ Added: ${car.model}`);
            } else {
                console.log(`⚠️ Skipped: ${car.model}`);
            }
        }

        console.log("🎉 ALL CARS INSERTED");
        process.exit();

    })
    .catch(err => console.log(err));