import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class SortablejsService {
    // original library calls the events in unnatural order
    // first the item is added, then removed from the previous array
    // this is a temporary event to work this around
    // as long as only one sortable takes place at a certain time
    // this is enough to have a single `global` event
    transfer;
    /** @nocollapse */ static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    /** @nocollapse */ static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsService, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGFibGVqcy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXNvcnRhYmxlanMvc3JjL2xpYi9zb3J0YWJsZWpzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFHM0MsTUFBTSxPQUFPLGlCQUFpQjtJQUU1Qix1REFBdUQ7SUFDdkQsZ0VBQWdFO0lBQ2hFLGdEQUFnRDtJQUNoRCw2REFBNkQ7SUFDN0QsaURBQWlEO0lBQ2pELFFBQVEsQ0FBeUI7MEhBUHRCLGlCQUFpQjs4SEFBakIsaUJBQWlCOzsyRkFBakIsaUJBQWlCO2tCQUQ3QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU29ydGFibGVqc1NlcnZpY2Uge1xuXG4gIC8vIG9yaWdpbmFsIGxpYnJhcnkgY2FsbHMgdGhlIGV2ZW50cyBpbiB1bm5hdHVyYWwgb3JkZXJcbiAgLy8gZmlyc3QgdGhlIGl0ZW0gaXMgYWRkZWQsIHRoZW4gcmVtb3ZlZCBmcm9tIHRoZSBwcmV2aW91cyBhcnJheVxuICAvLyB0aGlzIGlzIGEgdGVtcG9yYXJ5IGV2ZW50IHRvIHdvcmsgdGhpcyBhcm91bmRcbiAgLy8gYXMgbG9uZyBhcyBvbmx5IG9uZSBzb3J0YWJsZSB0YWtlcyBwbGFjZSBhdCBhIGNlcnRhaW4gdGltZVxuICAvLyB0aGlzIGlzIGVub3VnaCB0byBoYXZlIGEgc2luZ2xlIGBnbG9iYWxgIGV2ZW50XG4gIHRyYW5zZmVyOiAoaXRlbXM6IGFueVtdKSA9PiB2b2lkO1xuXG59XG4iXX0=