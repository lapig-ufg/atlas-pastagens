import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlMapComponent } from '../components/ol-map/ol-map.component';
import { OlMapMarkerComponent } from './ol-map-marker/ol-map-marker.component';

const COMPONENTS = [
  OlMapComponent,
  OlMapMarkerComponent,
];

@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    OlMapComponent
  ],
  imports: [
    CommonModule
  ]
})
export class OlMapsModule { }
