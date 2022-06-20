
    import LatLon from 'geodesy/latlon-spherical.js';

   
    export  function getDistance(origin,dest){
        const p1 = new LatLon(origin.lat, origin.lng);
        const p2 = new LatLon(dest.lat, dest.lng);
        const distance = p1.distanceTo(p2);
        return distance
    }