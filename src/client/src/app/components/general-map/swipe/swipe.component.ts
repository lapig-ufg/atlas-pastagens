import { Component, OnInit, Input } from '@angular/core';
import Map from 'ol/Map';
import { MessageService} from 'primeng/api';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import {ActivatedRoute} from "@angular/router";
import { Descriptor } from 'src/app/@core/interfaces';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.scss']
})
export class SwipeComponent implements OnInit {
  
  @Input() descriptor: Descriptor;


  public isMobile: boolean = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

  constructor(
    private googleAnalyticsService: GoogleAnalyticsService,
    public localizationService: LocalizationService,
    private messageService: MessageService,
    public route: ActivatedRoute,
  ) {
    
  }

  ngOnInit(): void {
    console.log('descriptor', this.descriptor)
  }

    /*static instance() {
        if(MySwipe._instance == null) {
            MySwipe._instance = new MySwipe(map, controlOptions);
        }

        return MySwipe._instance;
    }

    public addLayerToLeftSide(lay) {
        this.olMap.getLayers().getArray().forEach(layer => {
            if (layer.get('type') === 'layertype' && layer.get('key') !== lay.get('key') && layer.getVisible()) {
              this.swipeControl.addLayer(layer, false);
            }
        });
    }

    public addLayerToRightSide() {

    }

    onSwipe() {
        this.getSwipeLayers();
        this.controlOptions = true;
        this.mapControls.swipe = !this.mapControls.swipe
        //this.googleAnalyticsService.eventEmitter("Activate", "GeoTools", "Swipe");
      }

    getSwipeLayers() {
        this.swipeLayers = [];
        this.olMap.getLayers().forEach(layer => {
          if (layer) {
            if (layer.get('type') === 'layertype') {
              this.swipeLayers.push(layer)
            }
          }
        });
      }
    
    onClearSwipe() {
       this.valueSwipe = "";
       this.swipeLayer = { idLayer: '', labelLayer: '', selectedType: '', visible: false, types: [] };
       this.removeSwipe()
    }
    
    onSwipeSelectedLayer(ev) {
       this.swipeLayer.selectedTypeObject = ev.layer.get('descriptorLayer');
       this.swipeLayer.visible = true;
       this.addSwipe(ev.layer);
    }

    addSwipe(layer) {
        this.swipeControl = new Swipe();
        let layerType: DescriptorType = layer.get('descriptorLayer');
        layerType.visible = true;
        //this.changeLayerVisibility({ layer: layerType, updateSource: false });
        //this.onSelectLayerSwipe.emit(layerType.valueType);
        this.addLayersToLeftSideSwipe(layer);
        this.swipeControl.addLayer(layer, true);
        this.olMap.addControl(this.swipeControl);
        setTimeout(() => {
          this.olMap.updateSize()
        });
      }
    
      removeSwipe() {
        this.olMap.removeControl(this.swipeControl);
      }
    
      addLayersToLeftSideSwipe(lay) {
        setTimeout(() => {
          this.olMap.updateSize()
        });
      }*/

  validationMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));
  }
}
