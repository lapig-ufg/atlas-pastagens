abstract class DescriptorLayer {
    private key: string;
    private urls: string[];

    constructor(key: string, urls: string[]) {
        this.key = key;
        this.urls = urls;
    }

    abstract parseUrls(): string[];
}

export class DescriptorLayerXYZ extends DescriptorLayer {
    public parseUrls() {
        return [];
    }
}

export class DescriptorLayerWMTS extends DescriptorLayer {
    public parseUrls() {
        return [];
    }
}