import { Component, OnInit, Input } from '@angular/core';
import { Descriptor, DescriptorLayer } from 'src/app/@core/interfaces';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { ActivatedRoute} from "@angular/router";
import { MessageService} from 'primeng/api';
import { LayerSwipe } from 'src/app/@core/interfaces/swipe';
import { Observable } from 'rxjs';
import Swipe from 'ol-ext/control/Swipe';
import Layer from 'ol/layer/Layer';
import Map from 'ol/Map';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.scss']
})
export class SwipeComponent implements OnInit {
  
  @Input() closeDetailsWindow: Observable<void>;
  @Input() controlOptions: boolean;
  @Input() descriptor: Descriptor;
  @Input() map: Map;

  public swipe: Swipe;
  public swipeOptions: LayerSwipe[];
  public swipeLayers: any[];

  public leftLayer: any;
  public rightLayer: any;

  public mapLayers: any;
  
  public isMobile: boolean = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

  constructor(
    private googleAnalyticsService: GoogleAnalyticsService,
    public localizationService: LocalizationService,
    private messageService: MessageService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.leftLayer = {name: '', layer: null, visible: false, side: false};
    this.rightLayer = {name: '', layer: null, visible: false, side: true};

    this.closeDetailsWindow.subscribe(() => this.onClear());

    this.saveLayersVisibility();
    this.getSwipeLayers();
  }

  onSelectedLayer(ev, side): void {
    this.createSwipe();

    side.layer = this.getLayer(ev);
    side.visible = true;

    side.layer.setVisible(true);

    this.swipe.addLayer(side.layer, side.side);
  }

  onClearLayer(side): void {
    side.layer.setVisible(false);
    side.visible = false;
    side.name = "";

    if(this.rightLayer.visible === this.leftLayer.visible) this.onClear();
  }

  onClear(): void {
    this.recoverLayersVisibility();
    this.map.removeControl(this.swipe);
    this.swipe = null;
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

  getOptions(ev) {
    this.swipeOptions = [];
    this.swipeLayers.forEach(layer => {
      let result = this.normalize(layer.viewValueType).includes(this.normalize(ev.query));
      if (result) {
        this.swipeOptions.push({ name: layer.viewValueType, key: layer.valueType , layer: layer });
      }
    });
  }

  getLayer(find): Layer {
    let layer;

    this.map.getLayers().forEach(element => {
      if(element.get('key') == find.key) {
        layer = element;
      }
    });

    return layer;
  }

  createSwipe(): void {
    if(this.swipe != null) return;
    this.swipe = new Swipe();
    this.map.addControl(this.swipe);

    this.turnOffLayersVisibility();

    //this.googleAnalyticsService.eventEmitter("Activate", "GeoTools", "Swipe");
    
    setTimeout(() => {
      this.map.updateSize()
    });
  }

  saveLayersVisibility(): void {
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
          }
        }
      });
    });
  }

  turnOffLayersVisibility(): void {
    this.map.getLayers().forEach(layer => {
      if(layer.get('type') === 'layertype') {
        layer.setVisible(false);
      }
    });
  }

  changeDate(ev): void {
    console.log(ev);
  }

  normalize(value): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  validationMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));
  }
}