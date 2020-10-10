const oldCivic = {
  name: 'civic',
  year: 2000,
  broken: true,
};

const oldCamry = {
  name: 'camry',
  year: 2000,
  broken: 1,
};

const printVehicle = (vehicle: { name: string; year: number; broken: boolean }): void => {
  console.log(`Name: ${vehicle.name}`);
  console.log(`Year: ${vehicle.year}`);
  console.log(`Broken? ${vehicle.broken}`);
};

printVehicle(oldCivic);
printVehicle(oldCamry);

interface Vehicle {
  name: string;
  year: number;
  broken: boolean;
}

const printVehicle_v2 = (vehicle: Vehicle): void => {
  console.log(vehicle.name);
};

printVehicle_v2(oldCivic);
printVehicle_v2(oldCamry);

// interfaces can include any type, not only primitives
interface Vehicle_Detailed {
  name: string;
  year: Date;
  broken: boolean;
}

const newCivic = {
  name: 'civic 2020',
  year: new Date(),
  broken: false,
};

const printNewVehicle = (vehicle: Vehicle_Detailed): void => {
  console.log(vehicle);
};

printNewVehicle(oldCivic);
printNewVehicle(newCivic);
