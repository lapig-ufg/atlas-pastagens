import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import OlMap from 'ol/Map';
import { MapEvent, View } from 'ol';
import * as Proj from 'ol/proj';
import { defaults as defaultInteractions, Interaction } from 'ol/interaction';
import { Control, defaults as defaultControls } from 'ol/control';
import BaseLayer from 'ol/layer/Base';
import { Types } from 'ol/MapEventType';

const ZOOM_LIMIT: number = 9;
const ZOOM_DEFAULT: number = 4.6;

const DEFAULT_LAT = -16.6958288;
const DEFAULT_LON = -49.4443537;

export { MapService, ZOOM_LIMIT }

@Injectable({
  providedIn: 'root',
})
class MapService {
  private highResolution: boolean = false;

  private _map: OlMap = new OlMap({
    view: new View({
      center: Proj.fromLonLat([DEFAULT_LON, DEFAULT_LAT]),
      zoom: ZOOM_DEFAULT,
    }),
    interactions: defaultInteractions({
      altShiftDragRotate: false,
      pinchRotate: false,
    }),
    controls: defaultControls({ attribution: false, zoom: false }).extend([]),
  });

  private _activeLayers: Array<BaseLayer> = [];

  private $activeLayers = new BehaviorSubject<Array<BaseLayer>>(this._activeLayers);

  constructor() {
    this.setEvents();
  }

  get map() { return this._map; }

  get layers() { return this._map.getLayers().getArray(); }

  public getActiveLayers(): Observable<BaseLayer[]> {
    return this.$activeLayers;
  }

  public addLayer(layer: BaseLayer): void {
    this._map.addLayer(layer);
  }

  public addLayers(layers: Array<BaseLayer>): void {
    layers.forEach((layer) => {
      this._map.addLayer(layer);
    })
  }

  public removeLayer(layer: BaseLayer | null): void {
    if (layer === null) return;
    
    this._map.removeLayer(layer);
  }

  public clean(): void {
    let layersToRemove: BaseLayer[] = []

    this.layers.forEach((baseLayer: BaseLayer) => {
      if (baseLayer.get('type') !== 'layertype') return;

      layersToRemove.push(baseLayer);
    })

    layersToRemove.forEach((layer) => {
      this._map.removeLayer(layer);
    })
  }

  public addControl(control: Control): void {
    this._map.addControl(control);
  }

  public addEvent(event: Types | any, listener: (event: MapEvent) => unknown): void {
    this._map.on(event, listener);
  }

  public addInteraction(interaction: Interaction) {
    this._map.addInteraction(interaction);
  }

  public removeInteraction(interaction: Interaction) {
    this._map.removeInteraction(interaction);
  }

  public removeControl(control: Control): void {
    this._map.removeControl(control);
  }

  public updateLayerVisibility(key: string, value: boolean): void {
    let baseLayer = this.layers.find((baseLayer: BaseLayer) => baseLayer.get('key') === key);

    baseLayer?.setVisible(value);
  }

  public updateLayerOpacity(key: string, value: number): void {
    let baseLayer = this.layers.find((baseLayer: BaseLayer) => baseLayer.get('key') === key);

    baseLayer?.setOpacity(value);
  }

  public updateLayerSource(key: string, value: string[]): void {
    let baseLayer = this.layers.find((baseLayer: BaseLayer) => baseLayer.get('key') === key);

    baseLayer?.get('source').setUrls(value);
    baseLayer?.get('source').refresh();
  }

  public updateLayerZIndex(key: string, value: number): void {
    let baseLayer = this.layers.find((baseLayer: BaseLayer) => baseLayer.get('key') === key);

    baseLayer?.setZIndex(value);
  }

  public resetZoom(): void {
    this.map.getView().setZoom(ZOOM_DEFAULT);
  }

  public isZoomOnLimit(): boolean {
    return !(this._map.getView().getZoom()! > ZOOM_LIMIT);
  }

  private setEvents(): void {
    let self = this;

    this._map.on('loadstart', function () {
      self._map.getTargetElement().classList.add('spinner');
    });
    
    this._map.on('loadend', function () {
      self._map.getTargetElement().classList.remove('spinner');
    });
  }
}

interface LayerStorage {

}