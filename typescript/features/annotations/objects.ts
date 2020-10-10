/* Recall */

// how would we destructure forecast using es2015 while including type annotation?
const logWeather = (forecast: { date: Date; weather: string }): void => {
	console.log(forecast.date);
	console.log(forecast.weather);
};

/* NEW */
const profile = {
	name: "alex",
	age: 20,
	coords: {
		lat: 0,
		lng: 15,
	},
	setAge(age: number): void {
		this.age = age;
	},
};

// if we wanted to use type annotation for destructure property
// wrong: const { age }: number = profile
// right
const { age }: { age: number } = profile;
// takeaway: even if just destructuring single property from object, still must use
// {} for type annotation

// let's destructure our latitude and longitude as well
const {
	coords: { lat, lng },
}: { coords: { lat: number; lng: number } } = profile;
