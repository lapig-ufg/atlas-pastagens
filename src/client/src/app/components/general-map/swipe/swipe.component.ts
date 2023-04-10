import { Component, OnInit, Input, Output } from '@angular/core';
import { Descriptor, DescriptorLayer, DescriptorType } from 'src/app/@core/interfaces';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { ActivatedRoute} from "@angular/router";
import { MessageService} from 'primeng/api';
import { LayerSwipe } from 'src/app/@core/interfaces/swipe';
import { Observable } from 'rxjs';
import Swipe from 'ol-ext/control/Swipe';
import Map from 'ol/Map';
import { EventEmitter } from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { GeneralMapComponent } from '../general-map.component';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.scss']
})
export class SwipeComponent implements OnInit {
  
  @Output() handleLayersLegend: EventEmitter<any> = new EventEmitter();

  @Input() closeDetailsWindow: Observable<void>;

  @Input() map: Map;
  @Input() descriptor: Descriptor;

  public swipe: Swipe;
  public swipeOptions: LayerSwipe[];
  public swipeLayers: any[];

  public leftLayer: any;
  public rightLayer: any;

  public mapLayers: any;
  
  public lLayer =  new TileLayer({
      properties: {
        key: 'left',
        type: 'swipe-layer',
        descriptorLayer: null,
        visible: true,
      },
      source: new XYZ({
        wrapX: false,
        url: ''
      }),
      visible: true
    });

  public rLayer = new TileLayer({
      properties: {
        key: 'right',
        type: 'swipe-layer',
        descriptorLayer: null,
        visible: true,
      },
      source: new XYZ({
        wrapX: false,
        url: ''
      }),
      visible: true
    });

  public isMobile: boolean = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

  constructor(
    public googleAnalyticsService: GoogleAnalyticsService,
    public localizationService: LocalizationService,
    public messageService: MessageService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.closeDetailsWindow.subscribe(() => this.onClear());

    this.leftLayer = {layer: this.lLayer, key: 'left', visible: false, side: false};
    this.rightLayer = {layer: this.rLayer, key: 'right', visible: false, side: true};

    this.map.addLayer(this.lLayer);
    this.map.addLayer(this.rLayer);

    this.getSwipeLayers();
  }

  onSelectedLayer(ev, side): void {
    // ev: layer selecionada pelo usuáiro.
    // side: layer.

    this.createSwipe();

    side.layer.values_.descriptorLayer = this.getDescripor(ev.key);
    side.layer.getSource().setUrls(GeneralMapComponent.parseUrls(ev.layer));

    side.visible = true;

    side.layer.setVisible(true);
    this.swipe.addLayer(side.layer, side.side);

    this.handleLayersLegend.emit({valueType: ev.key, visible: side.visible});
  }

  onClearLayer(side: any): void {
    side.layer.setVisible(false);
    side.visible = false;
    side.name = "";

    this.handleLayersLegend.emit({valueType: side.key, visible: side.visible});
    if(this.rightLayer.visible === this.leftLayer.visible) this.onClear();
  }

  onClear(): void {
    this.recoverLayersVisibility();
    this.map.removeControl(this.swipe);
    this.swipe = null;

    this.leftLayer.layer.setVisible(false);
    this.rightLayer.layer.setVisible(false);
  }

  getSwipeLayers() {
    this.swipeLayers = [];
    this.descriptor.groups.forEach(group => {
      group.layers.forEach(layers => {
        layers.types.forEach(layer => {
          this.swipeLayers.push(layer);
        });
      })
    });
  }

  getSuggestions(ev) {
    this.swipeOptions = [];
    this.swipeLayers.forEach(layer => {
      let result = this.normalize(layer.viewValueType).includes(this.normalize(ev.query));
      if (result) {
        this.swipeOptions.push({ name: layer.viewValueType, key: layer.valueType , layer: layer });
      }
    });
  }

  getDescripor(key: string): DescriptorType {
    let descriptorType: DescriptorType;

    this.descriptor.groups.forEach(group => {
      group.layers.forEach(layer => {
        if(layer.selectedType == key) {
          descriptorType = Object.assign(Object.create(Object.getPrototypeOf(layer.selectedTypeObject!)), layer.selectedTypeObject!);
        }
      });
    });

    return descriptorType!;
  }

  createSwipe(): void {
    if(this.swipe != null) return;

    this.saveMapCurrentState();

    this.swipe = new Swipe();
    this.map.addControl(this.swipe);

    this.resetMap();
    
    this.map.updateSize();

    this.googleAnalyticsService.eventEmitter("Activate", "GeoTools", "Swipe");
  }

  changeDate(ev: string, side: any): void {
    side.layer.getSource().setUrls(GeneralMapComponent.parseUrls(side.layer.get('descriptorLayer')));
    side.layer.getSource().refresh();
  }

  saveMapCurrentState(): void {
    this.mapLayers = [];

    this.map.getLayers().forEach(layer => {
        if (layer.get('type') === 'layertype') {
          this.mapLayers.push({key: layer.get('key'), visibility: layer.getVisible()});
        }
    });
  }

  recoverLayersVisibility(): void {
    this.mapLayers.forEach(element => {
      this.map.getLayers().forEach(layer => {
        if(layer.get('type') === 'layertype') {
          if(layer. get('key') === element.key) {
            layer.setVisible(element.visibility);
            this.handleLayersLegend.emit({valueType: layer.get('key'), visible: layer.get('visible')});
          }
        }
      });
    });
  }

  resetMap(): void {
    this.map.getLayers().forEach(layer => {
      if(layer.get('type') === 'layertype') {
        layer.setVisible(false);
        this.handleLayersLegend.emit({valueType: layer.get('key'), visible: layer.get('visible')});
      }
    });
  }

  normalize(value): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  validationMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));
  }
}