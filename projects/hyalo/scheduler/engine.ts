
import { Calendar,type CalendarOptions } from '@fullcalendar/core';
import dayGrid from '@fullcalendar/daygrid';
import timeGrid from '@fullcalendar/timegrid';
import list from '@fullcalendar/list';
import interaction from '@fullcalendar/interaction';
import luxon from '@fullcalendar/luxon3';
export const plugins = [dayGrid, timeGrid, list, interaction, luxon];
export function createCalendar(element:HTMLElement,options:CalendarOptions):Calendar{return new Calendar(element,{...options,plugins:[...plugins,...(options.plugins??[])]});}
