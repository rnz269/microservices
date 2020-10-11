// Instructions to every other class on how they can be an argument to 'createMarker'
export interface Mappable {
  location: {
    lat: number;
    lng: number;
  };
  markerContent(): string;
}

export class CustomMap {
  // single property of type (google.maps.Map instance)
  private googleMap: google.maps.Map;

  // constructs a map
  constructor(divId: string) {
    this.googleMap = new google.maps.Map(document.getElementById(divId), {
      zoom: 1,
      // center accepts interface LatLngLiteral, which is an obj. w/ numeric fields lat, lng
      center: {
        lat: 0,
        lng: 0,
      },
    });
  }

  // adds marker to the map
  public addMarker(mappable: Mappable): void {
    const marker = new google.maps.Marker({ map: this.googleMap, position: mappable.location });
    marker.addListener(
      'click',
      function () {
        const infoWindow = new google.maps.InfoWindow({ content: mappable.markerContent() });
        infoWindow.open(this.googleMap, marker);
      }.bind(this),
    );
  }
}
