/**
 * Angular imports.
 */
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';


/**
 * Components imports.
 */
import { MainComponent } from './components/main/main.component';
import { ComponentsRoutingModule } from './components-routing.module';
import { LayersSidebarComponent } from './components/layers-sidebar/layers-sidebar.component';
import { DrawAreaComponent } from './components/general-map/draw_area/draw_area.component';
import { SwipeToolComponent } from './components/general-map/swipe-tool/swipe-tool.component';
import { DialogMessageComponent } from '@core/components/dialog-message/dialog-message.component';
import { OlMapComponent } from '@core/components/ol-map/ol-map.component';
import { GeneralMapComponent } from './components/general-map/general-map.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { GoogleAnalyticsService } from '../@core/services';

/**
 * PrimeNg imports.
 */
import { SliderModule } from 'primeng/slider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ImageModule } from 'primeng/image';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';

/**
 * NGX imports.
 */
import { DragScrollComponent } from 'ngx-drag-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { OptionsSidebarComponent } from './components/options-sidebar/options-sidebar.component';
import { StatisticsSidebarComponent } from './components/statistics-sidebar/statistics-sidebar.component';
import { AreaSidebarComponent } from './components/area-sidebar/area-sidebar.component';
import { LoadingSpinnerComponent } from '../@core/components/loading_spinner/loading_spinner.component';
import { UserInfoComponent } from '../@core/components/user-info-dialog/user-info-dialog.component';
import { FilterComponent } from './components/general-map/filter/filter.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    MainComponent,
    LayersSidebarComponent,
    StatisticsSidebarComponent,
    OptionsSidebarComponent,
    AreaSidebarComponent,
    GeneralMapComponent,
    FileUploadComponent,
    SwipeToolComponent,
    FilterComponent,
    DrawAreaComponent
  ],
  imports: [
    OlMapComponent,
    DialogMessageComponent,
    UserInfoComponent,
    SliderModule,
    LoadingSpinnerComponent,
    ProgressSpinnerModule,
    MatButtonToggleModule,
    SelectButtonModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressBarModule,
    FileUploadModule,
    CommonModule,
    SidebarModule,
    TabMenuModule,
    TabViewModule,
    FormsModule,
    InputSwitchModule,
    InputTextModule,
    AutoCompleteModule,
    CardModule,
    DragScrollComponent,
    ComponentsRoutingModule,
    CheckboxModule,
    ButtonModule,
    ChartModule,
    DropdownModule,
    TranslateModule,
    TooltipModule,
    AccordionModule,
    ScrollPanelModule,
    InputNumberModule,
    ImageModule,
    MenuModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    DialogModule,
    DragDropModule,
    HttpClientModule,
    RippleModule,
    TableModule,
    GalleriaModule,
    ComponentsRoutingModule,
  ],
  exports: [],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    DatePipe,
    DecimalPipe,
    GoogleAnalyticsService,
  ],
})
export class ComponentsModule {}
