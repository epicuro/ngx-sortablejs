import { NgModule } from '@angular/core';
import { GLOBALS } from './globals';
import { SortablejsDirective } from './sortablejs.directive';
import { SortablejsService } from './sortablejs.service';
import * as i0 from "@angular/core";
export class SortablejsModule {
    static forRoot(globalOptions) {
        return {
            ngModule: SortablejsModule,
            providers: [
                { provide: GLOBALS, useValue: globalOptions },
                SortablejsService,
            ],
        };
    }
    /** @nocollapse */ static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    /** @nocollapse */ static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.0.9", ngImport: i0, type: SortablejsModule, declarations: [SortablejsDirective], exports: [SortablejsDirective] });
    /** @nocollapse */ static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [SortablejsDirective],
                    exports: [SortablejsDirective],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGFibGVqcy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc29ydGFibGVqcy9zcmMvbGliL3NvcnRhYmxlanMubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBc0IsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFM0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7O0FBTXpELE1BQU0sT0FBTyxnQkFBZ0I7SUFFcEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFzQjtRQUMxQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLGdCQUFnQjtZQUMxQixTQUFTLEVBQUU7Z0JBQ1QsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7Z0JBQzNDLGlCQUFpQjthQUNsQjtTQUNGLENBQUM7SUFDSixDQUFDOzBIQVZVLGdCQUFnQjsySEFBaEIsZ0JBQWdCLGlCQUhaLG1CQUFtQixhQUN4QixtQkFBbUI7MkhBRWxCLGdCQUFnQjs7MkZBQWhCLGdCQUFnQjtrQkFKNUIsUUFBUTttQkFBQztvQkFDUixZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztvQkFDbkMsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUM7aUJBQy9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0dMT0JBTFN9IGZyb20gJy4vZ2xvYmFscyc7XG5pbXBvcnQge1NvcnRhYmxlanNEaXJlY3RpdmV9IGZyb20gJy4vc29ydGFibGVqcy5kaXJlY3RpdmUnO1xuaW1wb3J0IHtPcHRpb25zfSBmcm9tICdzb3J0YWJsZWpzJztcbmltcG9ydCB7IFNvcnRhYmxlanNTZXJ2aWNlIH0gZnJvbSAnLi9zb3J0YWJsZWpzLnNlcnZpY2UnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtTb3J0YWJsZWpzRGlyZWN0aXZlXSxcbiAgZXhwb3J0czogW1NvcnRhYmxlanNEaXJlY3RpdmVdLFxufSlcbmV4cG9ydCBjbGFzcyBTb3J0YWJsZWpzTW9kdWxlIHtcblxuICBwdWJsaWMgc3RhdGljIGZvclJvb3QoZ2xvYmFsT3B0aW9uczogT3B0aW9ucyk6IE1vZHVsZVdpdGhQcm92aWRlcnM8U29ydGFibGVqc01vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogU29ydGFibGVqc01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7cHJvdmlkZTogR0xPQkFMUywgdXNlVmFsdWU6IGdsb2JhbE9wdGlvbnN9LFxuICAgICAgICBTb3J0YWJsZWpzU2VydmljZSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=