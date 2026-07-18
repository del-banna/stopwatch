import { createElement, createSwitchElement } from "./dom-utils.js";

export const materialDesign = {
    className: "material-symbols-outlined",
    icons: {
        drag: 'drag_indicator',
        play: 'play_arrow',
        reset: 'history',
        pause: 'pause',
        delete: 'delete',
        add: 'add_circle',
        delete_all: 'delete_sweep',
        pause_all: 'pause_circle',
        resume_all: 'play_circle',
        reset_all: 'history',
        download: 'download',
        upload: 'upload_file',
        link: 'link',
        copy: 'content_copy',
        paste: 'content_paste',
        copy_all: 'copy_all',
        copy_link: 'share'
    }
};

export function createMaterialIcon(text, { attributes = null, classList = [], parent = null, id = null, tag = "div", shadow = true } = {}) {
    let icon = createElement(tag, { attributes, classList: [materialDesign.className, ...classList], parent, id });
    icon.innerText = text;
    return icon;
}

export const ia = 'ia',
    iaa = 'iaa',
    iax = 'iax',
    green = 'green',
    yellow = 'yellow',
    blue = 'blue',
    red = 'red',
    left = "left",
    middle = 'middle',
    right = 'right',
    ia_common1 = [iaa, iax],
    ia_common2 = [ia, iax];


// Background sprite
createElement("div", { id: "bgSprite", classList: ['bg-sprite'], parent: document.body });

// Container of list, controls, etc.
export const wrapper = createElement("div", { id: "wrapper", classList: ['container'], parent: document.body });

createElement("hr", { parent: wrapper });

export const controlBar = createElement("div", { id: "controls", classList: ['flex', 'v-margin-5'], parent: wrapper });

const inboundControlMenu = createElement("div", { parent: controlBar, id: "add", classList: ['left', 'vc-container'] });
export const createNewStopwatchButton = createMaterialIcon(materialDesign.icons.add, { id: "createNew", classList: ia_common1, parent: inboundControlMenu });
export const pasteButton = createMaterialIcon(materialDesign.icons.paste, { id: "paste", classList: ia_common1, parent: inboundControlMenu });
export const uploadButton = createMaterialIcon(materialDesign.icons.upload, { id: 'import', classList: ia_common1, parent: inboundControlMenu });

const collectionControlMenu = createElement("div", { parent: controlBar, id: "collectiveControl", classList: ['middle', 'vc-container'] });
export const resetAllButton = createMaterialIcon(materialDesign.icons.reset_all, { id: 'resetAll', classList: [...ia_common2, yellow], parent: collectionControlMenu });
export const resumeAllButton = createMaterialIcon(materialDesign.icons.resume_all, { id: 'resumeAll', classList: [...ia_common2, green], parent: collectionControlMenu });
export const pauseAllButton = createMaterialIcon(materialDesign.icons.pause_all, { id: 'pauseAll', classList: [...ia_common2, blue], parent: collectionControlMenu });
export const deleteAllButton = createMaterialIcon(materialDesign.icons.delete_all, { id: 'deleteAll', classList: [...ia_common2, red], parent: collectionControlMenu });

const outboundControlMenu = createElement("div", { parent: controlBar, id: "export", classList: ['right', 'vc-container'] });
export const linkButton = createMaterialIcon(materialDesign.icons.link, { id: "link", classList: ia_common1, parent: outboundControlMenu });
export const copyAllButton = createMaterialIcon(materialDesign.icons.copy_all, { id: "copyAll", classList: ia_common1, parent: outboundControlMenu });
export const copyLinkButton = createMaterialIcon(materialDesign.icons.copy_link, { id: "copyLink", classList: ia_common1, parent: outboundControlMenu });
export const downloadAllButton = createMaterialIcon(materialDesign.icons.download, { id: "export", classList: ia_common1, parent: outboundControlMenu });


const settingsBar = createElement("div", { id: "settings", classList: ['flex', 'v-margin-5'], parent: wrapper });
const settingsMenu = createElement("div", { id: "settings", classList: ['middle', 'vc-container'], parent: settingsBar });
export const concurrencySwitch = createSwitchElement({ id: "concurrencySwitch", label: "Concurrency", classList: ia_common1, parent: settingsMenu });
concurrencySwitch.labelElement.hidden = true; // Feature not yet implemented
export const dynamicURLSwitch = createSwitchElement({ id: "dynamicLinkSwitch", label: "Dynamic URL", classList: ia_common1, parent: settingsMenu });


createElement("hr", { parent: wrapper });

export const listElement = createElement("ul", { id: "list", classList: ['container'], parent: wrapper });
