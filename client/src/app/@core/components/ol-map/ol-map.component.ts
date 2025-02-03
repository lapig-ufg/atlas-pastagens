/**
 * Angular imports.
 */
import { Component, AfterViewInit } from '@angular/core';
import { ElementRef } from '@angular/core';

/**
 * OpenLayers imports.
 */
import { FullScreen } from 'ol/control';
import { ScaleLine, Zoom } from 'ol/control';
import { MapService } from '@core/services/map.service';

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
  constructor(
    private mapService: MapService,
    private elementRef: ElementRef,
  ) {}

  ngAfterViewInit(): void {
    this.setSize();

    // Primeiro resetar o tager para quando aplicado o 'map' ele reconhecer a alteração.
    this.mapService.map.setTarget('')
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

  private setSize() {
    let mapHTMLElement: HTMLElement =
      this.elementRef.nativeElement.querySelector('#map');

    if (mapHTMLElement) {
      const styles = mapHTMLElement.style;
      styles.height = DEFAULT_HEIGHT;
      styles.width = DEFAULT_WIDTH;
    }
  }

  public setControl(control: any) {
    this.mapService.map.addControl(control);
  }
}
