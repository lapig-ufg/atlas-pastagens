import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { OlMapComponent } from "../ol-map/ol-map.component";
import TileLayer from "ol/layer/Tile";

@Component({
  selector: 'ol-layer',
  templateUrl: './ol-layer.component.html',
  styleUrls: ['./ol-layer.component.scss']
})
export class OlLayerComponent implements OnInit {
  @Input() layer: any = {};
  constructor(private olMap: OlMapComponent, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.olMap.map) {
      // @ts-ignore
      // this.olMap.addLayer(this.layer);
      let hasLayer = false;
      this.olMap.map.getLayers().forEach(layer => {
        if(layer.get('key') === this.layer.get('key')){
          hasLayer = true;
        }
      });

      if(hasLayer){
        // Do nothing
      } else {
        this.olMap.addLayer(this.layer);
      }

    } else {
      setTimeout(() => {
        this.ngOnInit();
      }, 10);
    }
    this.cdRef.detectChanges();
  }
}
