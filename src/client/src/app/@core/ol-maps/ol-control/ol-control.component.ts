import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { OlMapComponent } from '../ol-map/ol-map.component';
import {
  defaults as defaultControls,
  FullScreen,
  MousePosition,
  OverviewMap,
  ScaleLine,
  ZoomSlider,
  ZoomToExtent,
  Zoom,
  Attribution,
  Control
} from 'ol/control';

@Component({
  selector: 'ol-control',
  templateUrl: './ol-control.component.html',
  styleUrls: ['./ol-control.component.scss']
})
export class OlControlComponent implements OnInit, OnDestroy {
  @Input() control = '';
  @Input() options: any = {};

  chooseControl: Control;

  constructor(private olMap: OlMapComponent) { }

  ngOnInit(): void {
    switch (this.control.toLocaleLowerCase()) {
      case 'fullscreen':
        this.chooseControl = new FullScreen(this.options);
        break;
      case 'mouseposition':
        this.chooseControl = new MousePosition(this.options);
        break;
      case 'overviewmap':
        this.chooseControl = new OverviewMap(this.options);
        break;
      case 'scaleline':
        this.chooseControl = new ScaleLine(this.options);
        break;
      case 'zoomslider':
        this.chooseControl = new ZoomSlider(this.options);
        break;
      case 'zoomtoextend':
        this.chooseControl = new ZoomToExtent(this.options);
        break;
      case 'attribution':
        this.chooseControl = new Attribution(this.options);
        break;
      default:
        this.chooseControl = new Zoom(this.options);
        break;
    }

    if (this.olMap.map) {
      this.olMap.setControl(this.chooseControl);
    } else {
      setTimeout(() => {
        this.ngOnInit();
      }, 10);
    }
  }

  ngOnDestroy() {}

}
