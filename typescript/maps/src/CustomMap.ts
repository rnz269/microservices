// Instructions to every other class on how they can be an argument to 'createMarker'
interface Mappable {
  location: {
    lat: number;
    lng: number;
  };
}

interface Infoable {
  location: {
    lat: number;
    lng: number;
  };
  content: string;
}

export class CustomMap {
  // single property of type (google.maps.Map instance)
  private googleMap: google.maps.Map;

  // public addMarker(mappable: Mappable): void {
  //   new google.maps.Marker({ map: this.googleMap, position: mappable.location });
  // }

  public addMarker(infoable: Infoable): void {
    var marker = new google.maps.Marker({ map: this.googleMap, position: infoable.location });
    marker.addListener(
      'click',
      function () {
        const infoWindow = new google.maps.InfoWindow({ content: 'testing' });
        infoWindow.open(this.googleMap, marker);
      }.bind(this),
    );
  }

  // public addInfoWindow(infoable: Infoable): void {
  //   new google.maps.InfoWindow({ content: infoable.content, position: infoable.location });
  // }

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
}
