import * as i0 from '@angular/core';
import { InjectionToken, Injectable, EventEmitter, Directive, Optional, Inject, Input, Output, NgModule } from '@angular/core';
import Sortable from 'sortablejs';

const GLOBALS = new InjectionToken('Global config for sortablejs');

class SortablejsBinding {
    target;
    constructor(target) {
        this.target = target;
    }
    insert(index, item) {
        if (this.isFormArray) {
            this.target.insert(index, item);
        }
        else {
            this.target.splice(index, 0, item);
        }
    }
    get(index) {
        return this.isFormArray ? this.target.at(index) : this.target[index];
    }
    remove(index) {
        let item;
        if (this.isFormArray) {
            item = this.target.at(index);
            this.target.removeAt(index);
        }
        else {
            item = this.target.splice(index, 1)[0];
        }
        return item;
    }
    // we need this to identify that the target is a FormArray
    // we don't want to have a dependency on @angular/forms just for that
    get isFormArray() {
        // just checking for random FormArray methods not available on a standard array
        return !!this.target.at && !!this.target.insert && !!this.target.reset;
    }
}

class SortablejsBindings {
    bindings;
    constructor(bindingTargets) {
        this.bindings = bindingTargets.map(target => new SortablejsBinding(target));
    }
    injectIntoEvery(index, items) {
        this.bindings.forEach((b, i) => b.insert(index, items[i]));
    }
    getFromEvery(index) {
        return this.bindings.map(b => b.get(index));
    }
    extractFromEvery(index) {
        return this.bindings.map(b => b.remove(index));
    }
    get provided() {
        return !!this.bindings.length;
    }
}

class SortablejsService {
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
class SortablejsDirective {
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
    /** @nocollapse */ static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.9", ngImport: i0, type: SortablejsDirective, deps: [{ token: GLOBALS, optional: true }, { token: SortablejsService }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive });
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
                }] }, { type: SortablejsService }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.Renderer2 }], propDecorators: { sortablejs: [{
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

class SortablejsModule {
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

/**
 * Generated bundle index. Do not edit.
 */

export { SortablejsDirective, SortablejsModule };
//# sourceMappingURL=ngx-sortablejs.mjs.map
