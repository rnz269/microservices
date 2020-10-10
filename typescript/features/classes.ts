// long syntax for instantiating fields
/*
class Vehicle {	
	color: string = 'red'

	constructor (color) {
		this.color = color
	}


	protected honk(): void {
		console.log('beep!')
	}
}
*/

// shortcut syntax -- need public modifier for constructor arguments
class Vehicle {
  constructor(protected color) {}

  protected honk(): void {
    console.log('beep!');
  }
}

const vehicle = new Vehicle('blue');
console.log(vehicle.color);

class Car extends Vehicle {
  private drive(): void {
    console.log('woooo');
  }
  public startDrivingProcess(): void {
    this.drive();
    this.honk();
  }
}

const car = new Car('red');
console.log(car.color);

// constructor for a derived class must contain a super call
class Van extends Vehicle {
  constructor(public wheels: number, color: string) {
    super(color);
  }

  private drive(): void {
    console.log('phewm');
  }
  startDrivingProcess(): void {
    this.drive();
    this.honk();
  }
}

const van = new Van(4, 'blue');
van.startDrivingProcess();
