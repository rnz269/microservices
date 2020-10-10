const add = (a: number, b: number): number => {
	return a + b;
}


// example: why we won't use type inference for function return values
// subtract return value inferred as number
const subtract = (a: number, b: number) => {
	return a - b;
}

// subtract_v2 return value inferred as void
const subtract_v2 = (a: number, b: number) => {
	a - b;
}

// special type: void
// when we aren't returning a value, or the value is null or undefined
const logger = (message: string): void => {
	console.log(message)
}

// special type: never
// when we expect with certainty to never reach end of function
const throwError = (message:string): never => {
	throw new Error(message)
}

