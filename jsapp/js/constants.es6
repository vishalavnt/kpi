import {
  t,
} from './utils';

const update_states = {
  UNSAVED_CHANGES: -1,
  UP_TO_DATE: true,
  PENDING_UPDATE: false,
};

const AVAILABLE_FORM_STYLES = [
  {value: '', label: gettext('Default - single page')},
  {value: 'theme-grid', label: gettext('Grid theme')},
  {value: 'pages', label: gettext('Multiple pages')},
  {value: 'theme-grid pages', label: gettext('Grid theme + Multiple pages')},
];

export default {
  AVAILABLE_FORM_STYLES: AVAILABLE_FORM_STYLES,
  update_states: update_states,
};
