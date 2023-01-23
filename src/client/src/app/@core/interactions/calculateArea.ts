declare const require: any;
const GeographicLib = require('geographiclib');
import {Polygon} from 'ol/geom';
import { DecimalPipe } from '@angular/common';
import { environment } from "../../../environments/environment";
export type Position = number[];

/**
 * Definição do elipsoide da projeção EPSG:4674 - SIRGAS 2000
 * GEOGCS["SIRGAS 2000",
 *   DATUM["Sistema_de_Referencia_Geocentrico_para_las_AmericaS_2000",
 *       SPHEROID["GRS 1980",6378137,298.257222101,
 *           AUTHORITY["EPSG","7019"]],
 *       TOWGS84[0,0,0,0,0,0,0],
 *       AUTHORITY["EPSG","6674"]],
 *   PRIMEM["Greenwich",0,
 *      AUTHORITY["EPSG","8901"]],
 *   UNIT["degree",0.0174532925199433,
 *       AUTHORITY["EPSG","9122"]],
 *   AUTHORITY["EPSG","4674"]]
 */
const geod = new GeographicLib.Geodesic.Geodesic(6378137, 1/298.257222101);


/**
 * @name calculateGeodesicArea
 *
 * Calcula a area geodésica de um polígono.
 *
 * @author Tharles de Sousa Andrade
 * Source: https://geographiclib.sourceforge.io/1.52/js/tutorial-3-examples.html
 * @param polygon
 * @returns number - Area em m^2
 */
export function calculateGeodesicArea(polygon: Polygon) {
    const coords = polygon.getCoordinates();
    const coordinates: Position[] = coords[0];

    let poly = geod.Polygon(false)

    for (let i = 0; i < coordinates.length; ++i){
        poly.AddPoint(coordinates[i][1], coordinates[i][0]);
    }

    poly = poly.Compute(false, true);

    return Math.abs(poly.area);
}

export function formatGeodesicArea(area: number, onlyHa: boolean = false): string {
    let output;
    const decimalPipe: DecimalPipe = new DecimalPipe('pt-BR');
  
    if(onlyHa){
        output = decimalPipe.transform( (area / 10000), '1.2-2') + ' ' + 'ha ';
        
    }else{
        if (area > 1000000) {
            output = decimalPipe.transform( (area / 1000000), '1.2-2') + ' ' + 'km<sup>2</sup>';
        } else if (area >= 10) {
            output = decimalPipe.transform( area, '1.2-2')+ ' ' + 'm<sup>2</sup>';
        } else {
            output = decimalPipe.transform( (area * 10000), '1.2-2') + ' ' + 'cm<sup>2</sup>';
        }
        output += ' ou ' +  decimalPipe.transform( (area / 10000), '1.2-2') + ' ' + 'ha';
    }


    return output;
}



