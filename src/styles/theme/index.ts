// Ordre de cascade canonique (theme) — D-013.
import type { GlobalStyleObject } from '@pandacss/types';
import { fragments as tabler } from '../tabler';
import { fragments as base } from './base';
import { fragments as link } from './link';
import { fragments as heading } from './heading';
import { fragments as divider } from './divider';
import { fragments as list } from './list';
import { fragments as descriptionList } from './description-list';
import { fragments as table } from './table';
import { fragments as icon } from './icon';
import { fragments as formRange } from './form-range';
import { fragments as form } from './form';
import { fragments as button } from './button';
import { fragments as progress } from './progress';
import { fragments as section } from './section';
import { fragments as container } from './container';
import { fragments as tile } from './tile';
import { fragments as card } from './card';
import { fragments as close } from './close';
import { fragments as spinner } from './spinner';
import { fragments as totop } from './totop';
import { fragments as marker } from './marker';
import { fragments as alert } from './alert';
import { fragments as placeholder } from './placeholder';
import { fragments as badge } from './badge';
import { fragments as label } from './label';
import { fragments as overlay } from './overlay';
import { fragments as article } from './article';
import { fragments as comment } from './comment';
import { fragments as search } from './search';
import { fragments as accordion } from './accordion';
import { fragments as drop } from './drop';
import { fragments as dropbar } from './dropbar';
import { fragments as dropnav } from './dropnav';
import { fragments as modal } from './modal';
import { fragments as slideshow } from './slideshow';
import { fragments as slider } from './slider';
import { fragments as sticky } from './sticky';
import { fragments as offcanvas } from './offcanvas';
import { fragments as switcher } from './switcher';
import { fragments as leader } from './leader';
import { fragments as notification } from './notification';
import { fragments as tooltip } from './tooltip';
import { fragments as sortable } from './sortable';
import { fragments as countdown } from './countdown';
import { fragments as thumbnav } from './thumbnav';
import { fragments as iconnav } from './iconnav';
import { fragments as grid } from './grid';
import { fragments as nav } from './nav';
import { fragments as navbar } from './navbar';
import { fragments as subnav } from './subnav';
import { fragments as breadcrumb } from './breadcrumb';
import { fragments as pagination } from './pagination';
import { fragments as tab } from './tab';
import { fragments as slidenav } from './slidenav';
import { fragments as dotnav } from './dotnav';
import { fragments as dropdown } from './dropdown';
import { fragments as lightbox } from './lightbox';
import { fragments as animation } from './animation';
import { fragments as width } from './width';
import { fragments as height } from './height';
import { fragments as text } from './text';
import { fragments as column } from './column';
import { fragments as cover } from './cover';
import { fragments as background } from './background';
import { fragments as align } from './align';
import { fragments as svg } from './svg';
import { fragments as utility } from './utility';
import { fragments as flex } from './flex';
import { fragments as margin } from './margin';
import { fragments as padding } from './padding';
import { fragments as position } from './position';
import { fragments as transition } from './transition';
import { fragments as visibility } from './visibility';
import { fragments as inverse } from './inverse';
import { fragments as print } from './print';

import { fragments as rootTokens } from '../root-tokens';

export { banner as tablerBanner } from '../tabler';

export const styles: GlobalStyleObject[] = [
    ...rootTokens,
    ...tabler,
    ...base,
    ...link,
    ...heading,
    ...divider,
    ...list,
    ...descriptionList,
    ...table,
    ...icon,
    ...formRange,
    ...form,
    ...button,
    ...progress,
    ...section,
    ...container,
    ...tile,
    ...card,
    ...close,
    ...spinner,
    ...totop,
    ...marker,
    ...alert,
    ...placeholder,
    ...badge,
    ...label,
    ...overlay,
    ...article,
    ...comment,
    ...search,
    ...accordion,
    ...drop,
    ...dropbar,
    ...dropnav,
    ...modal,
    ...slideshow,
    ...slider,
    ...sticky,
    ...offcanvas,
    ...switcher,
    ...leader,
    ...notification,
    ...tooltip,
    ...sortable,
    ...countdown,
    ...thumbnav,
    ...iconnav,
    ...grid,
    ...nav,
    ...navbar,
    ...subnav,
    ...breadcrumb,
    ...pagination,
    ...tab,
    ...slidenav,
    ...dotnav,
    ...dropdown,
    ...lightbox,
    ...animation,
    ...width,
    ...height,
    ...text,
    ...column,
    ...cover,
    ...background,
    ...align,
    ...svg,
    ...utility,
    ...flex,
    ...margin,
    ...padding,
    ...position,
    ...transition,
    ...visibility,
    ...inverse,
    ...print,
];
