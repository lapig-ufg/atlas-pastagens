/**
 * Angular imports.
 */
import { Component } from '@angular/core';

/**
 * Core imports.
 */
import { LocalizationService } from '@core/internationalization/localization.service';

/**
 * Interfaces imports.
 */
import { Descriptor, DescriptorLayer } from '@core/interfaces';
import { DescriptorType } from '@core/interfaces';

/**
 * Services imports.
 */
import { DescriptorService } from '../../../@core/services';
import { Subscription } from 'rxjs';

import { InputSwitchOnChangeEvent } from 'primeng/inputswitch';
import {AccordionTabCloseEvent, AccordionTabOpenEvent} from 'primeng/accordion';
import { MapService } from '@core/services/map.service';

const bmapKeys: string[] = ['mapbox', 'mapbox-dark', 'google', 'google-hybrid'];

@Component({
  selector: 'app-options-sidebar',
  templateUrl: './options-sidebar.component.html',
  styleUrls: ['./options-sidebar.component.scss'],
})
class OptionsSidebarComponent {
  private static _accordionTabExpanded: number[] = [0];

  private descriptorSubscription: Subscription = new Subscription();

  public limits: any = [];
  public bmaps: any = [];
  public options = [
    {
      key: 'graticule',
      checked: false,
      onChange: (checked: boolean) => this.onChangeGraticule(checked)
    },
  ];

  constructor(
    private mapService: MapService,
    private descriptorService: DescriptorService,
    public localizationService: LocalizationService
  ) {
    this.descriptorSubscription.add(
      descriptorService.getDescriptor().subscribe({
        next: (descriptor: Descriptor | null) => {
          if (descriptor === null) return;

          this.setLimits(descriptor);
          this.setBasemaps(descriptor);

          this.descriptorSubscription.unsubscribe();
        },
        error: (error: any) => {
          console.error('Error while descriptor subscription. ', error);
        },
      })
    );
  }

  get accordionTabExpanded() {
    return OptionsSidebarComponent._accordionTabExpanded;
  }

  public onAccordionTabOpen(event: AccordionTabOpenEvent): void {
    OptionsSidebarComponent._accordionTabExpanded.push(event.index);
  }

  public onAccordionTabClose(event: AccordionTabCloseEvent): void {
    OptionsSidebarComponent._accordionTabExpanded =
      OptionsSidebarComponent._accordionTabExpanded.filter(
        (element) => element !== event.index
      );
  }

  /**
   * Define o conjunto de limites a partir do descriptor.
   * @param descriptor
   */
  private setLimits(descriptor: Descriptor): void {
    if (this.limits.length != 0) return;

    descriptor.limits.forEach((limit: DescriptorLayer) => {
      limit.types.forEach((type: DescriptorType) => {
        this.limits.push({
          key: type.valueType,
          label: type.viewValueType,
          checked: type.visible,
        });
      });
    });
  }

  /**
   * Define o conjunto de basemaps a partir do descriptor.
   * @param descriptor
   */
  private setBasemaps(descriptor: Descriptor): void {
    if (this.bmaps.length != 0) return;

    descriptor.basemaps.forEach((bmap: DescriptorLayer) => {
      bmap.types.forEach((type: DescriptorType) => {
        if (bmapKeys.includes(type.valueType)) {
          this.bmaps.push({
            key: type.valueType,
            label: type.viewValueType,
            checked: type.visible,
          });
        }
      });
    });
  }

  /**
   * Atualiza o atributo [checked] do elemento representado pela key para true,
   * enquanto atualiza os outros elementos para false, na lista de limits.
   * @param key
   * @param event
   */
  public onChangeLimit(limit: any, event: InputSwitchOnChangeEvent): void {
    this.limits.forEach((element: any) => {
      if (element.key === limit.key) return;

      element.checked = false;
    });

    this.descriptorService.updateLimitVisibility(limit.key, event.checked);
  }

  /**
   * Atualiza o atributo [checked] do elemento representado pela key para true,
   * enquanto atualiza os outros elementos para false, na lista de bmaps.
   * @param bmap
   * @param event
   */
  public onChangeBmap(bmap: any, event: InputSwitchOnChangeEvent): void {
    this.bmaps.forEach((element: any) => {
      if (element.key === bmap.key) return;

      element.checked = false;
    });

    this.descriptorService.updateBasemapVisibility(bmap.key, bmap.checked);
  }

  /**
   * Atualiza o atributo [checked] do elemento representado pela key para true,
   * enquanto atualiza os outros elementos para false, na lista de options.
   * @param key
   * @param event
   */
  public onChangeOption(key: string, event: InputSwitchOnChangeEvent): void {
    this.options.forEach((option: any) => {
      if (option.key === key) {
        option.onChange(event.checked);
      }

      option.checked = false;
    });

    //this.mapService.updateGraticule(this.options.checked)
  }

  public onChangeGraticule(checked: boolean) {
    this.mapService.updateGraticule(checked);
  }
}

export { OptionsSidebarComponent };
