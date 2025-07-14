import AdminOverview from '../components/admin/tabs/AdminOverview';
import AdminClasses from '../components/admin/tabs/AdminClasses';
import AdminShop from '../components/admin/tabs/AdminShop';
import AdminContact from '../components/admin/tabs/AdminContact';
import AdminCalendar from '../components/admin/tabs/AdminCalendar';

export const ADMIN_TABS = [
  { key: 'overview', label: 'סקירה', component: AdminOverview },
  { key: 'calendar', label: 'לוח שנה', component: AdminCalendar },
  { key: 'classes', label: 'שיעורים', component: AdminClasses },
  { key: 'shop', label: 'מוצרים/חנות', component: AdminShop },
  { key: 'contact', label: 'צור קשר', component: AdminContact },
] as const;

export type AdminTabKey = typeof ADMIN_TABS[number]['key']; 