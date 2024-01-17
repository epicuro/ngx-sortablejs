import { Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, Renderer2, } from '@angular/core';
import Sortable from 'sortablejs';
import { GLOBALS } from './globals';
import { SortablejsBindings } from './sortablejs-bindings';
import { SortablejsService } from './sortablejs.service';
import * as i0 from "@angular/core";
import * as i1 from "./sortablejs.service";
const getIndexesFromEvent = (event) => {
    if (event.hasOwnProperty('newDraggableIndex') && event.hasOwnProperty('oldDraggableIndex')) {
        return {
            new: event.newDraggableIndex,
            old: event.oldDraggableIndex,
        };
    }
    else {
        return {
            new: event.newIndex,
            old: event.oldIndex,
        };
    }
};
export class SortablejsDirective {
    globalConfig;
    service;
    element;
    zone;
    renderer;
    sortablejs; // array or a FormArray
    sortablejsContainer;
    sortablejsOptions;
    sortablejsCloneFunction;
    sortableInstance;
    sortablejsInit = new EventEmitter();
    constructor(globalConfig, service, element, zone, renderer) {
        this.globalConfig = globalConfig;
        this.service = service;
        this.element = element;
        this.zone = zone;
        this.renderer = renderer;
    }
    ngOnInit() {
        if (Sortable && Sortable.create) { // Sortable does not exist in angular universal (SSR)
            this.create();
        }
    }
    ngOnChanges(changes) {
        const optionsChange = changes.sortablejsOptions;
        if (optionsChange && !optionsChange.isFirstChange()) {
            const previousOptions = optionsChange.previousValue;
            const currentOptions = optionsChange.currentValue;
            Object.keys(currentOptions).forEach(optionName => {
                if (currentOptions[optionName] !== previousOptions[optionName]) {
                    // use low-level option setter
                    this.sortableInstance.option(optionName, this.options[optionName]);
                }
            });
        }
    }
    ngOnDestroy() {
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }
    }
    create() {
        const container = this.sortablejsContainer ? this.element.nativeElement.querySelector(this.sortablejsContainer) : this.element.nativeElement;
        setTimeout(() => {
            this.sortableInstance = Sortable.create(container, this.options);
            this.sortablejsInit.emit(this.sortableInstance);
        }, 0);
    }
    getBindings() {
        if (!this.sortablejs) {
            return new SortablejsBindings([]);
        }
        else if (this.sortablejs instanceof SortablejsBindings) {
            return this.sortablejs;
        }
        else {
            return new SortablejsBindings([this.sortablejs]);
        }
    }
    get options() {
        return { ...this.optionsWithoutEvents, ...this.overridenOptions };
    }
    get optionsWithoutEvents() {
        return { ...(this.globalConfig || {}), ...(this.sortablejsOptions || {}) };
    }
    proxyEvent(eventName, ...params) {
        this.zone.run(() => {
            if (this.optionsWithoutEvents && this.optionsWithoutEvents[eventName]) {
                this.optionsWithoutEvents[eventName](...params);
            }
        });
    }
    get isCloning() {
        return this.sortableInstance.options.group.checkPull(this.sortableInstance, this.sortableInstance) === 'clone';
    }
    clone(item) {
        // by default pass the item through, no cloning performed
        return (this.sortablejsCloneFunction || (subitem => subitem))(item);
    }
    get overridenOptions() {
        // always intercept standard events but act only in case items are set (bindingEnabled)
        // allows to forget about tracking this.items changes
        return {
            onAdd: (event) => {
                this.service.transfer = (items) => {
                    this.getBindings().injectIntoEvery(event.newIndex, items);
                    this.proxyEvent('onAdd', event);
                };
                this.proxyEvent('onAddOriginal', event);
            },
            onRemove: (event) => {
                const bindings = this.getBindings();
                if (bindings.provided) {
                    if (this.isCloning) {
                        this.service.transfer(bindings.getFromEvery(event.oldIndex).map(item => this.clone(item)));
                        // great thanks to https://github.com/tauu
                        // event.item is the original item from the source list which is moved to the target list
                        // event.clone is a clone of the original item and will be added to source list
                        // If bindings are provided, adding the item dom element to the target list causes artifacts
                        // as it interferes with the rendering performed by the angular template.
                        // Therefore we remove it immediately and also move the original item back to the source list.
                        // (event handler may be attached to the original item and not its clone, therefore keeping
                        // the original dom node, circumvents side effects )
                        this.renderer.removeChild(event.item.parentNode, event.item);
                        this.renderer.insertBefore(event.clone.parentNode, event.item, event.clone);
                        this.renderer.removeChild(event.clone.parentNode, event.clone);
                    }
                    else {
                        this.service.transfer(bindings.extractFromEvery(event.oldIndex));
                    }
                    this.service.transfer = null;
                }
                this.proxyEvent('onRemove', event);
            },
            onUpdate: (event) => {
                const bindings = this.getBindings();
                const indexes = getIndexesFromEvent(event);
                bindings.injectIntoEvery(indexes.new, bindings.extractFromEvery(indexes.old));
                this.proxyEvent('onUpdate', event);
            },
        };
    }
    /** @nocollapse */ static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsDirective, deps: [{ token: GLOBALS, optional: true }, { token: i1.SortablejsService }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive });
    /** @nocollapse */ static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.9", type: SortablejsDirective, selector: "[sortablejs]", inputs: { sortablejs: "sortablejs", sortablejsContainer: "sortablejsContainer", sortablejsOptions: "sortablejsOptions", sortablejsCloneFunction: "sortablejsCloneFunction" }, outputs: { sortablejsInit: "sortablejsInit" }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[sortablejs]',
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [GLOBALS]
                }] }, { type: i1.SortablejsService }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.Renderer2 }], propDecorators: { sortablejs: [{
                type: Input
            }], sortablejsContainer: [{
                type: Input
            }], sortablejsOptions: [{
                type: Input
            }], sortablejsCloneFunction: [{
                type: Input
            }], sortablejsInit: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGFibGVqcy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc29ydGFibGVqcy9zcmMvbGliL3NvcnRhYmxlanMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFJTixRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsR0FHVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLFFBQW1CLE1BQU0sWUFBWSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDekQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7OztBQUl2RCxNQUFNLG1CQUFtQixHQUFHLENBQUMsS0FBb0IsRUFBRSxFQUFFO0lBQ25ELElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsRUFBRTtRQUMxRixPQUFPO1lBQ0wsR0FBRyxFQUFFLEtBQUssQ0FBQyxpQkFBaUI7WUFDNUIsR0FBRyxFQUFFLEtBQUssQ0FBQyxpQkFBaUI7U0FDN0IsQ0FBQztLQUNIO1NBQU07UUFDTCxPQUFPO1lBQ0wsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQ25CLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUNwQixDQUFDO0tBQ0g7QUFDSCxDQUFDLENBQUM7QUFLRixNQUFNLE9BQU8sbUJBQW1CO0lBbUJTO0lBQzdCO0lBQ0E7SUFDQTtJQUNBO0lBcEJWLFVBQVUsQ0FBZSxDQUFDLHVCQUF1QjtJQUdqRCxtQkFBbUIsQ0FBUztJQUc1QixpQkFBaUIsQ0FBVTtJQUczQix1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O2dCQUVELElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxRQUFRLEVBQUUsQ0FBQyxLQUFvQixFQUFFLEVBQUU7Z0JBQ2pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEMsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRTNDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQzswSEFsSlUsbUJBQW1CLGtCQW1CUixPQUFPOzhHQW5CbEIsbUJBQW1COzsyRkFBbkIsbUJBQW1CO2tCQUgvQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs7MEJBb0JJLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsT0FBTzsrSUFoQjdCLFVBQVU7c0JBRFQsS0FBSztnQkFJTixtQkFBbUI7c0JBRGxCLEtBQUs7Z0JBSU4saUJBQWlCO3NCQURoQixLQUFLO2dCQUlOLHVCQUF1QjtzQkFEdEIsS0FBSztnQkFLSSxjQUFjO3NCQUF2QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2UsXG4gIFNpbXBsZUNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IFNvcnRhYmxlLCB7T3B0aW9uc30gZnJvbSAnc29ydGFibGVqcyc7XG5pbXBvcnQge0dMT0JBTFN9IGZyb20gJy4vZ2xvYmFscyc7XG5pbXBvcnQge1NvcnRhYmxlanNCaW5kaW5nc30gZnJvbSAnLi9zb3J0YWJsZWpzLWJpbmRpbmdzJztcbmltcG9ydCB7U29ydGFibGVqc1NlcnZpY2V9IGZyb20gJy4vc29ydGFibGVqcy5zZXJ2aWNlJztcblxuZXhwb3J0IHR5cGUgU29ydGFibGVEYXRhID0gYW55IHwgYW55W107XG5cbmNvbnN0IGdldEluZGV4ZXNGcm9tRXZlbnQgPSAoZXZlbnQ6IFNvcnRhYmxlRXZlbnQpID0+IHtcbiAgaWYgKGV2ZW50Lmhhc093blByb3BlcnR5KCduZXdEcmFnZ2FibGVJbmRleCcpICYmIGV2ZW50Lmhhc093blByb3BlcnR5KCdvbGREcmFnZ2FibGVJbmRleCcpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5ldzogZXZlbnQubmV3RHJhZ2dhYmxlSW5kZXgsXG4gICAgICBvbGQ6IGV2ZW50Lm9sZERyYWdnYWJsZUluZGV4LFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5ldzogZXZlbnQubmV3SW5kZXgsXG4gICAgICBvbGQ6IGV2ZW50Lm9sZEluZGV4LFxuICAgIH07XG4gIH1cbn07XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tzb3J0YWJsZWpzXScsXG59KVxuZXhwb3J0IGNsYXNzIFNvcnRhYmxlanNEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcblxuICBASW5wdXQoKVxuICBzb3J0YWJsZWpzOiBTb3J0YWJsZURhdGE7IC8vIGFycmF5IG9yIGEgRm9ybUFycmF5XG5cbiAgQElucHV0KClcbiAgc29ydGFibGVqc0NvbnRhaW5lcjogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIHNvcnRhYmxlanNPcHRpb25zOiBPcHRpb25zO1xuXG4gIEBJbnB1dCgpXG4gIHNvcnRhYmxlanNDbG9uZUZ1bmN0aW9uOiAoaXRlbTogYW55KSA9PiBhbnk7XG5cbiAgcHJpdmF0ZSBzb3J0YWJsZUluc3RhbmNlOiBhbnk7XG5cbiAgQE91dHB1dCgpIHNvcnRhYmxlanNJbml0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoR0xPQkFMUykgcHJpdmF0ZSBnbG9iYWxDb25maWc6IE9wdGlvbnMsXG4gICAgcHJpdmF0ZSBzZXJ2aWNlOiBTb3J0YWJsZWpzU2VydmljZSxcbiAgICBwcml2YXRlIGVsZW1lbnQ6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICApIHtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChTb3J0YWJsZSAmJiBTb3J0YWJsZS5jcmVhdGUpIHsgLy8gU29ydGFibGUgZG9lcyBub3QgZXhpc3QgaW4gYW5ndWxhciB1bml2ZXJzYWwgKFNTUilcbiAgICAgIHRoaXMuY3JlYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IG9wdGlvbnNDaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXMuc29ydGFibGVqc09wdGlvbnM7XG5cbiAgICBpZiAob3B0aW9uc0NoYW5nZSAmJiAhb3B0aW9uc0NoYW5nZS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzT3B0aW9uczogT3B0aW9ucyA9IG9wdGlvbnNDaGFuZ2UucHJldmlvdXNWYWx1ZTtcbiAgICAgIGNvbnN0IGN1cnJlbnRPcHRpb25zOiBPcHRpb25zID0gb3B0aW9uc0NoYW5nZS5jdXJyZW50VmFsdWU7XG5cbiAgICAgIE9iamVjdC5rZXlzKGN1cnJlbnRPcHRpb25zKS5mb3JFYWNoKG9wdGlvbk5hbWUgPT4ge1xuICAgICAgICBpZiAoY3VycmVudE9wdGlvbnNbb3B0aW9uTmFtZV0gIT09IHByZXZpb3VzT3B0aW9uc1tvcHRpb25OYW1lXSkge1xuICAgICAgICAgIC8vIHVzZSBsb3ctbGV2ZWwgb3B0aW9uIHNldHRlclxuICAgICAgICAgIHRoaXMuc29ydGFibGVJbnN0YW5jZS5vcHRpb24ob3B0aW9uTmFtZSwgdGhpcy5vcHRpb25zW29wdGlvbk5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuc29ydGFibGVJbnN0YW5jZSkge1xuICAgICAgdGhpcy5zb3J0YWJsZUluc3RhbmNlLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZSgpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLnNvcnRhYmxlanNDb250YWluZXIgPyB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc29ydGFibGVqc0NvbnRhaW5lcikgOiB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zb3J0YWJsZUluc3RhbmNlID0gU29ydGFibGUuY3JlYXRlKGNvbnRhaW5lciwgdGhpcy5vcHRpb25zKTtcbiAgICAgIHRoaXMuc29ydGFibGVqc0luaXQuZW1pdCh0aGlzLnNvcnRhYmxlSW5zdGFuY2UpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRCaW5kaW5ncygpOiBTb3J0YWJsZWpzQmluZGluZ3Mge1xuICAgIGlmICghdGhpcy5zb3J0YWJsZWpzKSB7XG4gICAgICByZXR1cm4gbmV3IFNvcnRhYmxlanNCaW5kaW5ncyhbXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNvcnRhYmxlanMgaW5zdGFuY2VvZiBTb3J0YWJsZWpzQmluZGluZ3MpIHtcbiAgICAgIHJldHVybiB0aGlzLnNvcnRhYmxlanM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgU29ydGFibGVqc0JpbmRpbmdzKFt0aGlzLnNvcnRhYmxlanNdKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCBvcHRpb25zKCkge1xuICAgIHJldHVybiB7Li4udGhpcy5vcHRpb25zV2l0aG91dEV2ZW50cywgLi4udGhpcy5vdmVycmlkZW5PcHRpb25zfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IG9wdGlvbnNXaXRob3V0RXZlbnRzKCkge1xuICAgIHJldHVybiB7Li4uKHRoaXMuZ2xvYmFsQ29uZmlnIHx8IHt9KSwgLi4uKHRoaXMuc29ydGFibGVqc09wdGlvbnMgfHwge30pfTtcbiAgfVxuXG4gIHByaXZhdGUgcHJveHlFdmVudChldmVudE5hbWU6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIHRoaXMuem9uZS5ydW4oKCkgPT4geyAvLyByZS1lbnRlcmluZyB6b25lLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL1NvcnRhYmxlSlMvYW5ndWxhci1zb3J0YWJsZWpzL2lzc3Vlcy8xMTAjaXNzdWVjb21tZW50LTQwODg3NDYwMFxuICAgICAgaWYgKHRoaXMub3B0aW9uc1dpdGhvdXRFdmVudHMgJiYgdGhpcy5vcHRpb25zV2l0aG91dEV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgIHRoaXMub3B0aW9uc1dpdGhvdXRFdmVudHNbZXZlbnROYW1lXSguLi5wYXJhbXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgaXNDbG9uaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnNvcnRhYmxlSW5zdGFuY2Uub3B0aW9ucy5ncm91cC5jaGVja1B1bGwodGhpcy5zb3J0YWJsZUluc3RhbmNlLCB0aGlzLnNvcnRhYmxlSW5zdGFuY2UpID09PSAnY2xvbmUnO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9uZTxUPihpdGVtOiBUKTogVCB7XG4gICAgLy8gYnkgZGVmYXVsdCBwYXNzIHRoZSBpdGVtIHRocm91Z2gsIG5vIGNsb25pbmcgcGVyZm9ybWVkXG4gICAgcmV0dXJuICh0aGlzLnNvcnRhYmxlanNDbG9uZUZ1bmN0aW9uIHx8IChzdWJpdGVtID0+IHN1Yml0ZW0pKShpdGVtKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IG92ZXJyaWRlbk9wdGlvbnMoKTogT3B0aW9ucyB7XG4gICAgLy8gYWx3YXlzIGludGVyY2VwdCBzdGFuZGFyZCBldmVudHMgYnV0IGFjdCBvbmx5IGluIGNhc2UgaXRlbXMgYXJlIHNldCAoYmluZGluZ0VuYWJsZWQpXG4gICAgLy8gYWxsb3dzIHRvIGZvcmdldCBhYm91dCB0cmFja2luZyB0aGlzLml0ZW1zIGNoYW5nZXNcbiAgICByZXR1cm4ge1xuICAgICAgb25BZGQ6IChldmVudDogU29ydGFibGVFdmVudCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2UudHJhbnNmZXIgPSAoaXRlbXM6IGFueVtdKSA9PiB7XG4gICAgICAgICAgdGhpcy5nZXRCaW5kaW5ncygpLmluamVjdEludG9FdmVyeShldmVudC5uZXdJbmRleCwgaXRlbXMpO1xuICAgICAgICAgIHRoaXMucHJveHlFdmVudCgnb25BZGQnLCBldmVudCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wcm94eUV2ZW50KCdvbkFkZE9yaWdpbmFsJywgZXZlbnQpO1xuICAgICAgfSxcbiAgICAgIG9uUmVtb3ZlOiAoZXZlbnQ6IFNvcnRhYmxlRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZ3MgPSB0aGlzLmdldEJpbmRpbmdzKCk7XG5cbiAgICAgICAgaWYgKGJpbmRpbmdzLnByb3ZpZGVkKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNDbG9uaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnNlcnZpY2UudHJhbnNmZXIoYmluZGluZ3MuZ2V0RnJvbUV2ZXJ5KGV2ZW50Lm9sZEluZGV4KS5tYXAoaXRlbSA9PiB0aGlzLmNsb25lKGl0ZW0pKSk7XG5cbiAgICAgICAgICAgIC8vIGdyZWF0IHRoYW5rcyB0byBodHRwczovL2dpdGh1Yi5jb20vdGF1dVxuICAgICAgICAgICAgLy8gZXZlbnQuaXRlbSBpcyB0aGUgb3JpZ2luYWwgaXRlbSBmcm9tIHRoZSBzb3VyY2UgbGlzdCB3aGljaCBpcyBtb3ZlZCB0byB0aGUgdGFyZ2V0IGxpc3RcbiAgICAgICAgICAgIC8vIGV2ZW50LmNsb25lIGlzIGEgY2xvbmUgb2YgdGhlIG9yaWdpbmFsIGl0ZW0gYW5kIHdpbGwgYmUgYWRkZWQgdG8gc291cmNlIGxpc3RcbiAgICAgICAgICAgIC8vIElmIGJpbmRpbmdzIGFyZSBwcm92aWRlZCwgYWRkaW5nIHRoZSBpdGVtIGRvbSBlbGVtZW50IHRvIHRoZSB0YXJnZXQgbGlzdCBjYXVzZXMgYXJ0aWZhY3RzXG4gICAgICAgICAgICAvLyBhcyBpdCBpbnRlcmZlcmVzIHdpdGggdGhlIHJlbmRlcmluZyBwZXJmb3JtZWQgYnkgdGhlIGFuZ3VsYXIgdGVtcGxhdGUuXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUgd2UgcmVtb3ZlIGl0IGltbWVkaWF0ZWx5IGFuZCBhbHNvIG1vdmUgdGhlIG9yaWdpbmFsIGl0ZW0gYmFjayB0byB0aGUgc291cmNlIGxpc3QuXG4gICAgICAgICAgICAvLyAoZXZlbnQgaGFuZGxlciBtYXkgYmUgYXR0YWNoZWQgdG8gdGhlIG9yaWdpbmFsIGl0ZW0gYW5kIG5vdCBpdHMgY2xvbmUsIHRoZXJlZm9yZSBrZWVwaW5nXG4gICAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgZG9tIG5vZGUsIGNpcmN1bXZlbnRzIHNpZGUgZWZmZWN0cyApXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNoaWxkKGV2ZW50Lml0ZW0ucGFyZW50Tm9kZSwgZXZlbnQuaXRlbSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmluc2VydEJlZm9yZShldmVudC5jbG9uZS5wYXJlbnROb2RlLCBldmVudC5pdGVtLCBldmVudC5jbG9uZSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNoaWxkKGV2ZW50LmNsb25lLnBhcmVudE5vZGUsIGV2ZW50LmNsb25lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlLnRyYW5zZmVyKGJpbmRpbmdzLmV4dHJhY3RGcm9tRXZlcnkoZXZlbnQub2xkSW5kZXgpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnNlcnZpY2UudHJhbnNmZXIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm94eUV2ZW50KCdvblJlbW92ZScsIGV2ZW50KTtcbiAgICAgIH0sXG4gICAgICBvblVwZGF0ZTogKGV2ZW50OiBTb3J0YWJsZUV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdzID0gdGhpcy5nZXRCaW5kaW5ncygpO1xuICAgICAgICBjb25zdCBpbmRleGVzID0gZ2V0SW5kZXhlc0Zyb21FdmVudChldmVudCk7XG5cbiAgICAgICAgYmluZGluZ3MuaW5qZWN0SW50b0V2ZXJ5KGluZGV4ZXMubmV3LCBiaW5kaW5ncy5leHRyYWN0RnJvbUV2ZXJ5KGluZGV4ZXMub2xkKSk7XG4gICAgICAgIHRoaXMucHJveHlFdmVudCgnb25VcGRhdGUnLCBldmVudCk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxufVxuXG5pbnRlcmZhY2UgU29ydGFibGVFdmVudCB7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG4gIG9sZERyYWdnYWJsZUluZGV4PzogbnVtYmVyO1xuICBuZXdEcmFnZ2FibGVJbmRleD86IG51bWJlcjtcbiAgaXRlbTogSFRNTEVsZW1lbnQ7XG4gIGNsb25lOiBIVE1MRWxlbWVudDtcbn1cbiJdfQ==