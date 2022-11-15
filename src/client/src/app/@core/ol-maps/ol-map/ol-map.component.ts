import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ElementRef,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultInteractions } from 'ol/interaction';
import * as Proj from 'ol/proj';
import {
  defaults as defaultControls,
  Control, MousePosition
} from 'ol/control';
import { log2 } from "ol/math";

export const DEFAULT_HEIGHT = '500px';
export const DEFAULT_WIDTH = '500px';

export const DEFAULT_LAT = -34.603490361131385;
export const DEFAULT_LON = -58.382037891217465;

@Component({
  selector: 'ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss']
})
export class OlMapComponent implements OnInit, AfterViewInit {

  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  @Input() loading: boolean = false;
  @Input() zoom: number;
  @Input() width: string | number = DEFAULT_WIDTH;
  @Input() height: string | number = DEFAULT_HEIGHT;
  @Output() onReady = new EventEmitter<any>();

  public target: string = 'map-' + Math.random().toString(36).substring(2);
  map: Map;

  private mapEl: HTMLElement;
  public : boolean;

  constructor(private elementRef: ElementRef, private cdRef: ChangeDetectorRef) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    const self = this;
    this.mapEl = this.elementRef.nativeElement.querySelector('#' + this.target);
    this.setSize();
    this.map = new Map({
      target: this.target,
      view: new View({
        center: Proj.fromLonLat([this.lon, this.lat]),
        zoom: this.zoom
      }),
      interactions: defaultInteractions({ altShiftDragRotate: false, pinchRotate: false }),
      controls: defaultControls({ attribution: false, zoom: false }).extend([]),
    });

    setTimeout(() => {
      this.onReady.emit(this.map);
    });

    this.map.on('postrender', function () {
      self.loading = false;
    });

    this.cdRef.detectChanges();
  }

  private setSize() {
    if (this.mapEl) {
      const styles = this.mapEl.style;
      styles.height = coerceCssPixelValue(this.height) || DEFAULT_HEIGHT;
      styles.width = coerceCssPixelValue(this.width) || DEFAULT_WIDTH;
    }
  }

  public addLayer(layer) {
    this.map.addLayer(layer);
    this.cdRef.detectChanges();
  }

  public setMarker(vector) {
    this.map.addLayer(vector);
    this.cdRef.detectChanges();
  }
  public setControl(control: any) {
    this.map.addControl(control);
  }

}

const cssUnitsPattern = /([A-Za-z%]+)$/;

function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}
