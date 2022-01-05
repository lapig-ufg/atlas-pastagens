import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { OlMapComponent } from '../ol-map/ol-map.component';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import * as Proj from 'ol/proj';

export const DEFAULT_LAT = -16.6958288;
export const DEFAULT_LON = -16.6958288;
export const DEFAULT_ANCHOR = [0.5, 1];
export const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAyVBMVEUAAADnTDznTDvnTDvnTDvAOCrnTDznSzvnTDvAOCvnTDznTDznTDvnTDzAOCrnTDvnTDvnTDvnTDznTDvAOSrnTDznTDzTQjLSQjPnTDzpTDvnSzvAOCrnTDvAOSvAOCvnSzvnTDzAOCvnSzznTDznTDvnTDy/OCvnTDznTDvnTDznSzvmSzvAOCvnTDzAOCvnTDvmTDvAOCq+OCrpTDzkSzrbRjbWRDTMPi+8NinrTT3EOy3gSDjTQjPPQDLHPS/DOiu5NCjHPC5jSfbDAAAAMHRSTlMAKPgE4hr8CfPy4NzUt7SxlnpaVlRPIhYPLgLt6ebOysXAwLmej4iGgGtpYkpAPCBw95QiAAAB50lEQVQ4y42T13aDMAxAbVb2TrO6927lwQhktf//UZWVQ1sIJLnwwBEXWZYwy1Lh/buG5TXu+rzC9nByDQCCbrg+KdUmLUsgW08IqzUp9rgDf5Ds8CJv1KS3mNL3fbGlOdr1Kh1AtFgs15vke7kQGpDO7pYGtJgfbRSxiXxaf7AjgsFfy1/WPu0r73WpwGiu1Fn78bF9JpWKUBTQzYlNQIK5lDcuQ9wbKeeBiTWz3vgUv44TpS4njJhcKpXEuMzpOCN+VE2FmPA9jbxjSrOf6kdG7FvYmkBJ6aYRV0oVYIusfkZ8xeHpUMna+LeYmlShxkG+Zv8GyohLf6aRzzRj9t+YVgWaX1IO08hQyi9tapxmB3huxJUp8q/EVYzB89wQr0y/FwqrHLqoDWsoLsxQr1iWNxp1iCnlRbt9IdELwfDGcrSMKJbGxLx4LenTFsszFSYehwl6aCZhTNPnO6LdBYOGYBVFqwAfDF27+CQIvLUGrTU9lpyFBw9yeA+sCNsRkJ5WQjg2K+QFcrywEjoCBHVpe3VYGZyk9NQCLxXte/jHvc1K4XXKSNQ520PPtIhcr8f2MXPShNiavTyn4jM7wK0g75YdYgTE6KA465nN9GbsILwhoMHZETx53hM7Brtet9lRDAYFwR80rG+sfAnbpQAAAABJRU5ErkJggg==';
export const DEFAULT_TEXT = '';

@Component({
  selector: 'ol-map-marker',
  templateUrl: './ol-map-marker.component.html',
  styleUrls: ['./ol-map-marker.component.scss']
})
export class OlMapMarkerComponent implements OnInit, OnDestroy {
  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  @Input() anchor: number[] = DEFAULT_ANCHOR;
  @Input() icon: string = DEFAULT_ICON;
  @Input() text: string = DEFAULT_TEXT;

  constructor(private olMap: OlMapComponent) { }

  ngOnInit(): void {
    const marker = new Feature({
      geometry: new Point(Proj.fromLonLat([this.lon, this.lat]))
    });
    const markerText = new Feature({
      geometry: new Point(Proj.fromLonLat([this.lon, this.lat]))
    });

    const icon = new Style({
      image: new Icon({
        anchor: this.anchor,
        src: this.icon,
      })
    });

    const text = new Style({
      text: new Text({
        text: this.text,
        font: 'normal 12px Montserrat',
        offsetY: 20,
        fill: new Fill({color: 'rgb(0,0,0)'}),
        stroke: new Stroke({color: 'rgb(255,255,255)', width: 1})
      })
    });

    marker.setStyle(icon);
    markerText.setStyle(text);

    const vectorSource = new VectorSource({
        features: [marker, markerText]
    });

    const vectorLayer = new VectorLayer({
      properties: {
        key: 'points',
        type: 'vetorial',
      },
      source: vectorSource
    });

    vectorLayer.setZIndex(10);

    if (this.olMap.map) {
      this.olMap.setMarker(vectorLayer);
    } else {
      setTimeout(() => {
        this.ngOnInit();
      }, 10);
    }
  }

  ngOnDestroy() {}

}
