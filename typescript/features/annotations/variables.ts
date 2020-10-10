let apples: number = 5;
apples = 'hello'

let hasName: boolean = true;

let nothingMuch: null = null;

let nothing: undefined = undefined;

let now: Date = new Date();

let colors: string[] = ['red', 'green', 'blue']

class Car = {}

let car: Car = new Car()

// looks like we can use either comma or semicolon to separate properties
let point: {x: number; y: number} = {
	x: 2,
	y: '3',
}

const logNumber: (i: number) => void = (i: number) => {
	console.log(i)
}

// Get rid of type annotations, still works because of type inference
let apples_ti = 5;
apples_ti = 'hello'

let hasName_ti = true;

let nothingMuch_ti = null;

let nothing_ti = undefined;

let now_ti = new Date();

let colors_ti = ['red', 'green', 'blue']

class Car_ti = {}

let car_ti = new Car()

let point_ti = {
	x: 2,
	y: '3',
}

const logNumber_ti = (i) => {
	console.log(i)
}


// When to use annotations
// 1) Function that returns the 'any' type
const json = '{"x": 10, "y": 20}';
const coordinates = JSON.parse(json);

// Solution: add in a type annotations
const coordinates_ta: {x: number; y: number} = JSON.parse(json) 


// 2) Declaration and initialization of a variable on two separate lines
let words = ['red', 'green', 'blue'];
let foundWord;

for (let i = 0; i < words.length; i++) {
	if (words[i] === 'green') {
		foundWord = true
	}
}

// Solution
let foundWord_ta: boolean;

// 3) Variable whose type cannot be inferred correctly
// Iterate through numbers []. If find a number > 0 => store number, else false
let numbers = [-10, -1, 12];
let numberAboveZero: boolean = false

for (let i = 0; i < numbers.length; i++) {
	if (numbers[i] > 0) {
		numberAboveZero = numbers[i]
	}
}

// solution: add Type Annotation to numberAboveZero Declaration
let numberAboveZero_ta: boolean | number = false

