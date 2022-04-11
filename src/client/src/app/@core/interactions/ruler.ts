import {Feature, Overlay} from 'ol';
import {Draw} from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {getArea, getLength} from 'ol/sphere';
import {Geometry, LineString, Polygon} from 'ol/geom';
import {unByKey} from 'ol/Observable';
import { Ruler } from "../interfaces";
import { DecimalPipe } from '@angular/common';
import {calculateGeodesicArea, formatGeodesicArea} from "./calculateArea";

abstract class RulerControl {

    private measureTooltipElement: Element;

    private measureTooltip: Overlay;

    protected decimalPipe: DecimalPipe;

    // @ts-ignore
    private sketch: Feature;

    protected constructor(protected component: Ruler, private type: string) {
      this.decimalPipe = new DecimalPipe('pt-BR');
    }

    getDraw(): Draw {
        const draw = new Draw({
            source: this.component.getSource(),
            type: this.type,
            style: new Style({
              fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
              }),
              stroke: new Stroke({
                color: '#4d4519',
                width: 2,
              }),
              image: new CircleStyle({
                radius: 7,
                stroke: new Stroke({
                  color: '#4d4519',
                }),
                fill: new Fill({
                  color: '#4d4519',
                }),
              })
            }),
        });

        this.createMeasureTooltip();

        let listener;
        draw.on('drawstart', drawEvent => {
            // set sketch
            this.sketch = drawEvent.feature;

            // @ts-ignore
            listener = this.sketch.getGeometry().on('change', evt => {
                const geom: Geometry = evt.target;
                const output: string = this.format(geom);

                let tooltipCoordinate;
                if (geom instanceof Polygon) {
                    tooltipCoordinate = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof LineString) {
                    tooltipCoordinate = geom.getLastCoordinate();
                }

                this.measureTooltipElement.innerHTML = output;
                this.measureTooltip.setPosition(tooltipCoordinate);
            });
        });

        draw.on('drawend', () => {
            this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
            this.measureTooltip.setOffset([0, -7]);

            this.sketch.setStyle(new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#4d4519',
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 7,
                    stroke: new Stroke({
                      color: '#4d4519',
                    }),
                    fill: new Fill({
                        color: '#4d4519',
                    }),
                })
            }));

            // unset tooltip so that a new one can be created
            // @ts-ignore
            this.measureTooltipElement = null;
            // @ts-ignore
            this.sketch.overlay = this.measureTooltip;
            // @ts-ignore
            this.sketch.ruler = true;

            // unset sketch
            // @ts-ignore
            this.sketch = null;

            unByKey(listener);
            this.component.unselect();
        });

        return draw;
    }

    protected abstract format(geometry: Geometry): string;

    /**
     * Creates a new measure tooltip
     */
    private createMeasureTooltip(): void {
        if (this.measureTooltipElement) {
            // @ts-ignore
          this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
        }

        this.measureTooltipElement = document.createElement('div');
        this.measureTooltipElement.className = 'ol-tooltip';

      // @ts-ignore
      this.measureTooltip = new Overlay({element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      });

        this.component.addOverlay(this.measureTooltip);
    }
}

export class RulerCtrl extends RulerControl {
    constructor(component: Ruler) {
        super(component, 'LineString');
    }

    protected format(geometry: Geometry): string {
        const length = getLength(geometry, {
            projection: this.component.getMap().getView().getProjection()
        });
        let output: string;

        if (length > 1000) {
            output = this.decimalPipe.transform(Math.round((length / 1000) * 100) / 100, '1.2-2')  + ' ' + 'km';
        } else if (length >= 1) {
            output = this.decimalPipe.transform(Math.round(length * 100) / 100, '1.2-2')  + ' ' + 'm';
        } else {
            output = this.decimalPipe.transform( Math.round(length * 10000) / 100, '1.2-2') + ' ' + 'cm';
        }

        return output;
    }
}

export function calculaArea(area: number): string {
  // let output: string;
  // const decimalPipe: DecimalPipe = new DecimalPipe('pt-BR');
  //
  // if (area > 100000) {
  //     output = decimalPipe.transform( Math.round((area / 100000) * 100) / 100, '1.2-2')  + ' ' + 'km<sup>2</sup>';
  // } else if (area >= 10) {
  //     output = decimalPipe.transform( Math.round((area / 10) * 100) / 100, '1.2-2')  + ' ' + 'm<sup>2</sup>';
  // } else {
  //     output = decimalPipe.transform( Math.round(area * 100000) / 100, '1.2-2') + ' ' + 'cm<sup>2</sup>';
  // }
  //
  // output += ' ou ' + decimalPipe.transform( Math.round((area / 100000) * 10000) / 100, '1.2-2') + ' ' + 'ha';

  return formatGeodesicArea(area);
}

export class RulerAreaCtrl extends RulerControl {
    constructor(component: Ruler) {
        super(component, 'Polygon');
    }

    protected format(geometry: Geometry): string {
        // const area = getArea(geometry, {
        //     projection: this.component.getMap().getView().getProjection()
        // });
        // return calculaArea(area);

      const g = geometry.clone()
      const geom = g.transform(this.component.getMap().getView().getProjection(), 'EPSG:4326');

      // @ts-ignore
      const area = calculateGeodesicArea(geom)

      return calculaArea(area);
    }
}
