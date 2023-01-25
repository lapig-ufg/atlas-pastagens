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
import { debug } from 'console';

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
  public swipeLayerLeft: DescriptorLayer;
  public swipeLayerRight: DescriptorLayer;
  public swipeValueLeft: string;
  public swipeValueRight: string;
  
  public isMobile: boolean = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

  constructor(
    private googleAnalyticsService: GoogleAnalyticsService,
    public localizationService: LocalizationService,
    private messageService: MessageService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.swipeValueLeft = '';
    this.swipeValueRight = '';

    this.swipeLayerLeft = { idLayer: '', labelLayer: '', selectedType: '', visible: false, types: [] };
    this.swipeLayerRight = { idLayer: '', labelLayer: '', selectedType: '', visible: false, types: [] };
    this.getSwipeLayers();

    this.closeDetailsWindow.subscribe(() => this.clear());
  }

  getSwipeLayers() {
    this.swipeLayers = [];
    this.map.getLayers().forEach(layer => {
      if (layer) {
        if (layer.get('type') === 'layertype') {
          this.swipeLayers.push(layer)
        }
      }
    });
  }

  getSwipeLayers2() {
    this.swipeLayers = [];
    this.descriptor.groups.forEach(group => {
      group.layers.forEach(layers => {
        layers.types.forEach(layer => {
          this.swipeLayers.push(layer);
        });
      })
    });
  }

  getLayer(find): Layer {
    let aux;

    this.map.getLayers().forEach(layer => {
      if(layer.get('key') == find.key) {
        aux = layer;
      }
    });

    return aux;
  }

  changeDate(ev): void {
    console.log(ev);
  }

  search(ev) {
    this.swipeOptions = [];
    this.swipeLayers.forEach(layer => {
      let result = this.normalize(layer.get('label')).includes(this.normalize(ev.query));
      if (result) {
        this.swipeOptions.push({ name: layer.get('label'), key: layer.get('key'), layer: layer });
      }
    });
  }

  search2(ev) {
    this.swipeOptions = [];
    this.swipeLayers.forEach(layer => {
      let result = this.normalize(layer.viewValueType).includes(this.normalize(ev.query));
      if (result) {
        this.swipeOptions.push({ name: layer.viewValueType, key: layer.valueType , layer: layer });
      }
    });
  }

  onSelectedLayerLeft(ev): void {
    this.createSwipe();
    const layer = this.getLayer(ev);
    layer.setVisible(true);
    this.swipe.addLayer(layer, false);
  }

  onSelectedLayerRight(ev): void {
    this.createSwipe();
    const layer = this.getLayer(ev);
    layer.setVisible(true);
    this.swipe.addLayer(layer, true);
  }

  clearLeft(): void {
    this.swipeValueLeft = "";
    this.swipeLayerLeft = { idLayer: '', labelLayer: '', selectedType: '', visible: false, types: [] };
    if(this.swipeValueRight == '') this.clear();
  }

  clearRight(): void {
    this.swipeValueRight = "";
    this.swipeLayerRight = { idLayer: '', labelLayer: '', selectedType: '', visible: false, types: [] };
    if(this.swipeValueLeft == '') this.clear();
  }

  clear(): void {
    this.map.removeControl(this.swipe);
    this.swipe = null;
  }

  createSwipe(): void {
    if(this.swipe != null) return;
    this.swipe = new Swipe();
    this.map.addControl(this.swipe);

    /*let layerType: DescriptorType = layer.get('descriptorLayer');
    layerType.visible = true;
    //this.changeLayerVisibility({ layer: layerType, updateSource: false });
    //this.onSelectLayerSwipe.emit(layerType.valueType);
    this.addLayersToLeftSideSwipe(layer);
    this.googleAnalyticsService.eventEmitter("Activate", "GeoTools", "Swipe");*/
    
    setTimeout(() => {
      this.map.updateSize()
    });
  }

  addLayersToLeftSideSwipe(lay) {
    this.map.getLayers().getArray().forEach(layer => {
      if (layer.get('type') === 'layertype' && layer.get('key') !== lay.get('key') && layer.getVisible()) {
        this.swipe.addLayer(layer, false);
      }
    });
    setTimeout(() => {
      this.map.updateSize()
    });
  }

  normalize(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  validationMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));
  }
}