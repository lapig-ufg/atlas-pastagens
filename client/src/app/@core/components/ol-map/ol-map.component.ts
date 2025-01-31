/**
 * Angular imports.
 */
import { Component, AfterViewInit } from '@angular/core';
import { ElementRef, ChangeDetectorRef } from '@angular/core';

/**
 * OpenLayers imports.
 */
import Map from 'ol/Map';
import View from 'ol/View';
import * as Proj from 'ol/proj';
import { defaults as defaultInteractions } from 'ol/interaction';
import { defaults as defaultControls, FullScreen } from 'ol/control';
import { MousePosition, ScaleLine, Zoom } from 'ol/control';
import { Coordinate, createStringXY } from 'ol/coordinate';
import BaseLayer from 'ol/layer/Base';
import { MapService } from '@core/services/map.service';
import { MapEvent } from 'ol';

export const DEFAULT_HEIGHT = '100vh';
export const DEFAULT_WIDTH = '100%';

export const DEFAULT_LAT = -16.6958288;
export const DEFAULT_LON = -49.4443537;

export const ZOOM_LEVEL = 4.6;

@Component({
  standalone: true,
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements AfterViewInit {
  private layersToFilter: string[] = ['layertype', 'swipe-layer'];

  constructor(
    private mapService: MapService,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    const self = this;

    this.setSize();

    this.mapService.map.setTarget('map')

    this.setControlls();
  }

  private setControlls(): void {
    this.mapService.map.addControl(
      new FullScreen({ source: 'main' })
    );

    this.mapService.map.addControl(
      new ScaleLine({
        units: 'metric',
        bar: true,
        text: true,
        minWidth: 100,
      })
    );

    this.mapService.map.addControl(new Zoom());
  }

  private setOnMoveEvent(): void {
    const self = this;

    this.mapService.map.on('moveend', function (event: MapEvent) {
      self.mapService.map.getLayers().forEach((layer: any) => {
        let descriptorType = layer.getProperties().descriptorType;

        if (descriptorType === null) return;

        if (
          self.layersToFilter.includes(layer.get('type')) &&
          layer.getVisible() === true &&
          typeof descriptorType.download !== 'undefined'
        ) {
          if (typeof descriptorType.download.layerTypeName !== 'undefined') {
            let complexLayer = descriptorType.download.layerTypeName;
            let singleLayer = descriptorType.valueType;

            let soucer = layer.getSource();
            let urls = soucer.urls;
            let urlNow = new URLSearchParams(urls[0].split('?')[1]).get(
              'layers'
            );

            if (self.mapService.isZoomOnLimit() && complexLayer !== urlNow) {
              let newUrl = urls.map((url: any) => {
                return url.replace(singleLayer, complexLayer);
              });
              soucer.setUrls(newUrl);
              soucer.refresh();
            } else if (!self.mapService.isZoomOnLimit() && singleLayer !== urlNow) {
              let newUrl = urls.map((url: any) => {
                return url.replace(complexLayer, singleLayer);
              });
              
              soucer.setUrls(newUrl);
              soucer.refresh();
            }
          }
        }
      });
    });
  }

  private setSize() {
    let mapHTMLElement: HTMLElement =
      this.elementRef.nativeElement.querySelector('#map');

    if (mapHTMLElement) {
      const styles = mapHTMLElement.style;
      styles.height = DEFAULT_HEIGHT;
      styles.width = DEFAULT_WIDTH;
    }
  }

  public updateLayer(): void {}

  public setMarker(vector: any) {
    this.mapService.map.addLayer(vector);
    this.cdRef.detectChanges();
  }

  public setControl(control: any) {
    this.mapService.map.addControl(control);
  }

  private formataCoordenada: (coordinate: Coordinate) => string =
    createStringXY(4);
}
