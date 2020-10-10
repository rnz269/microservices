
// representing with an object
const drink = {
	color: 'brown',
	carbonated: true,
	sugar: 40
}

// let's convert to a tuple
// issue -> TypeScript assumes this is an array, and allows order swapping
const pepsi = ['brown', true, 40]
pepsi[0] = 40
pepsi[2] = 'brown'

// added type annotation is what makes this array a tuple
// changing order throws error -> index 0 must be string 
const coke: [string, boolean, number] = ['brown', true, 45]
coke[0] = 10

// type alias: define a brand new type we can use anywhere in application
type Drink = [string, boolean, number]
const fanta: Drink = ['orange', true, 35]