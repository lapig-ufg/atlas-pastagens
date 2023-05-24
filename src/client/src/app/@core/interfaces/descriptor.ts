export interface DescriptorFilter {
  valueFilter: string;
  viewValueFilter: any;
}

export interface DescriptorMetadata {
  title: string;
  description: string;
}

export interface DescriptorTypeOrigin {
  sourceService: string;
  typeOfTMS: string;
  url?: string;
  epsg?: string;
}

export interface DescriptorMapCardAttributes {
  column: string;
  label: string;
  columnType: string;
  enum?: Array<string>
  dict?:any
}

export interface DescriptorMapCard {
  show: string;
  attributes: DescriptorMapCardAttributes;
}

export interface DescriptorDownload {
  csv: boolean;
  gpkg: boolean;
  layerTypeName: string;
  raster: boolean| string;
  shp: boolean;
  loading?:boolean;
}

export interface DescriptorType {
  alertMessage?: string;
  download: DescriptorDownload;
  filterHandler?: string;
  filterLabel?: string;
  filterSelected?: string;
  filters?: DescriptorFilter[];
  layerLimits?: boolean;
  metadata?: DescriptorMetadata[];
  opacity: number;
  origin: DescriptorTypeOrigin;
  regionFilter?: boolean;
  type: string;
  typeLabel?: string;
  typeLayer: string;
  valueType: string;
  viewValueType: string;
  visible?: boolean;
  wfsMapCard: DescriptorMapCard;
}

export interface DescriptorBaseMap {
  idLayer: string;
  visible: boolean;
  selectedType: string;
  types: DescriptorType[];
  selectedTypeObject?: DescriptorType;
}

export interface DescriptorLimit {
  idLayer: string;
  visible: boolean;
  selectedType: string;
  types: DescriptorType[];
  selectedTypeObject?: DescriptorType;
}

export interface DescriptorGroup {
  idGroup: string;
  labelGroup: string;
  groupExpanded: boolean;
  layers: DescriptorLayer[];
}

export interface DescriptorLayer {
  idLayer: string;
  labelLayer: string;
  visible: boolean;
  selectedType: string;
  types: DescriptorType[];
  selectedTypeObject?: DescriptorType;
}

export interface Descriptor {
  groups: DescriptorGroup[];
  basemaps: DescriptorBaseMap[];
  limits: DescriptorLimit[];
}


