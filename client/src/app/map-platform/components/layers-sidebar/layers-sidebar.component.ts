import { Component, OnDestroy } from '@angular/core';

/**
 * Services imports.
 */
import { DescriptorService, DownloadService } from '../../../@core/services';
import { Subscription } from 'rxjs';

/**
 * Interface imports.
 */
import { Descriptor, DescriptorLayer, DescriptorMetadata, DescriptorType } from '@core/interfaces';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { AccordionTabCloseEvent, AccordionTabOpenEvent } from 'primeng/accordion';
import { SliderChangeEvent } from 'primeng/slider';
import { MessageService } from 'primeng/api';
import { LocalizationService } from '@core/internationalization/localization.service';

@Component({
  selector: 'app-layers-sidebar',
  templateUrl: './layers-sidebar.component.html',
  styleUrls: ['./layers-sidebar.component.scss'],
  providers: [MessageService]
})
class LayersSidebarComponent implements OnDestroy {
  private static _accordionTabExpanded: number[] = [0];

  public descriptor: Descriptor | null = null;

  public descriptorSubscription: Subscription = new Subscription();

  public downloadFormats: Array<string> = ['shp', 'gpkg', 'csv', 'raster'];
  public downloadFormatsLabels: object = {
    'shp': 'SHP',
    'gpkg': 'GPKG',
    'csv': 'CSV',
    'raster': 'TIFF'
  };

  public selectedLayerToggle: boolean = false;
  public selectedLayerTitle: string = '';
  public selectedLayerMetadata: Array<DescriptorMetadata> = [];

  constructor(private descriptorService: DescriptorService, private downloadService: DownloadService, private messageService: MessageService, private localizationService: LocalizationService) {
    this.descriptorSubscription.add(
      this.descriptorService
        .getDescriptor()
        .subscribe((descriptor: Descriptor | null) => {
          this.descriptor = descriptor;
        })
    );
  }

  ngOnDestroy(): void {
    this.descriptorSubscription.unsubscribe();
  }

  get accordionTabExpanded() {
    return LayersSidebarComponent._accordionTabExpanded;
  }

  public onAccordionTabOpen(event: AccordionTabOpenEvent): void {
    LayersSidebarComponent._accordionTabExpanded.push(event.index);
  }

  public onAccordionTabClose(event: AccordionTabCloseEvent): void {
    LayersSidebarComponent._accordionTabExpanded =  LayersSidebarComponent._accordionTabExpanded.filter(element => element !== event.index);
  }

  public onChangeVisibility(idLayer: string, event: any): void {
    this.descriptorService.updateLayerVisibility(idLayer, event.checked);
  }

  public onChangeType(idLayer: string, event: DropdownChangeEvent): void {
    this.descriptorService.updateLayerType(idLayer, event.value)
  }

  public onChangeFilter(idLayer: string, event: DropdownChangeEvent): void {
    this.descriptorService.updateLayerFilter(idLayer, event.value);
  }

  public onChangeTransparency(idLayer: string, event: SliderChangeEvent): void{
    this.descriptorService.updateLayerTransparency(idLayer, 100 - event.value!)
  }

  public onDownload(fileFormat: string, type: DescriptorType): void {
    this.downloadService.downloadGeoFile(type, fileFormat).subscribe(response => {
      if (response.status === 'success') return;

      this.messageService.add({
        life: 2000,
        severity: 'error',
        summary: this.localizationService.translate('left_sidebar.layer.down_error_title'),
        detail: response.message
      })
    });
  }

  public checkButton(rates: any): boolean {
    return false;
  }

  public showMetadata(layer: DescriptorLayer): void {
    this.selectedLayerToggle = true;
    this.selectedLayerTitle = layer.selectedTypeObject!.metadata![0].description;
    this.selectedLayerMetadata = layer.selectedTypeObject!.metadata!.slice(1);
  }
}

export { LayersSidebarComponent };
