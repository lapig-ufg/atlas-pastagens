import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: string): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter((item) => {
      return this.normalize(item.title).includes(this.normalize(filter))
        || this.normalize(item.abstract).includes(this.normalize(filter))
        || this.normalize(item.authors).includes(this.normalize(filter));
    });
  }
  normalize(value: any): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
